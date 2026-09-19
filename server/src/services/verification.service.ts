import crypto from 'crypto';
import { prisma } from '../config/db.js';
import { blockchainService } from './blockchain.service.js';

export type VerificationVerdict = 
  | 'VERIFIED'
  | 'REVOKED'
  | 'MISMATCH'
  | 'BLOCKCHAIN_UNAVAILABLE'
  | 'NOT_FOUND'
  | 'UNANCHORED';

export interface VerificationCheckItem {
  name: string;
  passed: boolean;
  message: string;
  expected?: string | number | boolean;
  actual?: string | number | boolean;
}

export interface VerificationResult {
  verdict: VerificationVerdict;
  verdictMessage: string;
  verifiedAt: string;
  asset: {
    id: string;
    assetNumber: number;
    name: string;
    description: string | null;
    assetType: string;
    status: string;
    organization: {
      name: string;
      slug: string;
    };
    currentOwner: {
      did: string;
      walletAddress: string;
      name: string;
      verificationStatus: string;
    } | null;
    createdAt: string;
    updatedAt: string;
    metadata: Record<string, any> | null;
  } | null;
  integrity: {
    computedMetadataHash: string;
    matchesOnChain: boolean | null;
  };
  blockchain: {
    network: string;
    moduleAddress: string;
    connected: boolean;
    onChainRecord: any | null;
    onChainHistoryCount: number;
    transactions: Array<{
      txHash: string;
      txType: string;
      status: string;
      blockHeight: string | null;
      gasUsed: string | null;
      senderAddress: string;
      submittedAt: string;
    }>;
  };
  ownershipHistory: Array<{
    intervalNumber: number;
    status: string;
    custodianName: string;
    custodianDid: string;
    custodianWallet: string;
    validFrom: string;
    validTo: string | null;
    notes: string | null;
  }>;
  checks: VerificationCheckItem[];
}

export class VerificationService {
  /**
   * Universal Verification Engine:
   * Accepts assetId (UUID or string) or assetNumber (e.g. 101, AST-101, #101)
   */
  async verifyAsset(identifier: string): Promise<VerificationResult> {
    const verifiedAt = new Date().toISOString();
    const cleanId = identifier.trim();

    // 1. Resolve Asset from PostgreSQL
    let asset = null;
    const isNum = /^\d+$/.test(cleanId) || /^#\d+$/.test(cleanId) || /^AST-\d+$/i.test(cleanId);
    if (isNum) {
      const num = parseInt(cleanId.replace(/[^\d]/g, ''), 10);
      asset = await prisma.asset.findFirst({
        where: { assetNumber: num },
        include: {
          organization: true,
          currentOwner: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true } },
            },
          },
          ownerships: {
            include: {
              identity: {
                include: {
                  user: { select: { firstName: true, lastName: true } },
                },
              },
            },
            orderBy: { validFrom: 'desc' },
          },
          transactions: {
            orderBy: { submittedAt: 'desc' },
          },
        },
      });
    }

    if (!asset) {
      // Try by UUID or Exact Name match
      asset = await prisma.asset.findFirst({
        where: {
          OR: [
            { id: cleanId },
            { name: { equals: cleanId, mode: 'insensitive' } },
          ],
        },
        include: {
          organization: true,
          currentOwner: {
            include: {
              user: { select: { firstName: true, lastName: true, email: true } },
            },
          },
          ownerships: {
            include: {
              identity: {
                include: {
                  user: { select: { firstName: true, lastName: true } },
                },
              },
            },
            orderBy: { validFrom: 'desc' },
          },
          transactions: {
            orderBy: { submittedAt: 'desc' },
          },
        },
      });
    }

    // Handle NOT_FOUND
    if (!asset) {
      return {
        verdict: 'NOT_FOUND',
        verdictMessage: `Digital asset identified by '${identifier}' does not exist in the Authentra registry.`,
        verifiedAt,
        asset: null,
        integrity: {
          computedMetadataHash: '',
          matchesOnChain: null,
        },
        blockchain: {
          network: blockchainService.getNetwork(),
          moduleAddress: blockchainService.getModuleAddress(),
          connected: false,
          onChainRecord: null,
          onChainHistoryCount: 0,
          transactions: [],
        },
        ownershipHistory: [],
        checks: [
          {
            name: 'Registry Lookup',
            passed: false,
            message: `Asset '${identifier}' was not found in the cryptographic registry.`,
          },
        ],
      };
    }

    // 2. Compute local cryptographic metadata hash
    const metadataString = JSON.stringify(asset.metadata || {});
    const computedHash = crypto.createHash('sha256').update(metadataString).digest('hex');

    // 3. Query Aptos on-chain state
    let onChainAsset = null;
    let onChainHistory: any[] = [];
    let blockchainConnected = false;

    try {
      const ledger = await blockchainService.getLedgerInfo();
      blockchainConnected = !!ledger;
      if (blockchainConnected) {
        onChainAsset = await blockchainService.getOnChainAsset(asset.id);
        if (onChainAsset) {
          onChainHistory = await blockchainService.getOnChainOwnershipHistory(asset.id);
        }
      }
    } catch {
      blockchainConnected = false;
    }

    // 4. Run Rigorous Verification Checks
    const checks: VerificationCheckItem[] = [];

    // Check A: Database Record & Status
    checks.push({
      name: 'Cryptographic Registry Record',
      passed: true,
      message: `Found valid record for #${asset.assetNumber} [${asset.name}]`,
    });

    const isRevoked = asset.status === 'REVOKED';
    checks.push({
      name: 'Asset Lifecycle Status',
      passed: !isRevoked,
      message: isRevoked
        ? 'Asset status is REVOKED. All cryptographic authorizations are nullified.'
        : `Asset is in valid ${asset.status} state.`,
      actual: asset.status,
    });

    // Check B: Ownership Continuity
    const hasActiveOwner = !!asset.currentOwner;
    checks.push({
      name: 'Custodian Binding',
      passed: hasActiveOwner,
      message: hasActiveOwner
        ? `Bound to verified DID: ${asset.currentOwner?.did}`
        : 'Asset has no registered owner or custodian.',
    });

    // Check C: Ownership Interval Continuity
    const openIntervals = asset.ownerships.filter((o) => o.validTo === null);
    const intervalsConsistent = isRevoked ? openIntervals.length === 0 : openIntervals.length <= 1;
    checks.push({
      name: 'Ownership Interval Integrity',
      passed: intervalsConsistent,
      message: intervalsConsistent
        ? `Ownership intervals are continuous and consistent (${asset.ownerships.length} interval(s)).`
        : `Anomaly detected: Found ${openIntervals.length} unclosed ownership intervals.`,
    });

    // Check D: Blockchain State Verification
    let metadataMatched = false;
    let ownerMatched = false;

    if (!blockchainConnected) {
      checks.push({
        name: 'Aptos Blockchain Connection',
        passed: false,
        message: 'Aptos Testnet fullnode could not be reached for on-chain state verification.',
      });
    } else if (!onChainAsset) {
      checks.push({
        name: 'On-Chain Smart Contract Anchor',
        passed: false,
        message: 'Asset has not been anchored to the Aptos smart contract yet or was recorded off-chain only.',
      });
    } else {
      // Compare Metadata Hash
      metadataMatched = onChainAsset.metadataHash === computedHash;
      checks.push({
        name: 'Cryptographic Metadata Hash',
        passed: metadataMatched,
        message: metadataMatched
          ? 'On-chain SHA-256 metadata hash matches local payload perfectly.'
          : 'Metadata hash mismatch between local database and Aptos blockchain state.',
        expected: onChainAsset.metadataHash,
        actual: computedHash,
      });

      // Compare Owner Wallet Address
      const currentWallet = asset.currentOwner?.walletAddress?.toLowerCase();
      const onChainOwner = onChainAsset.currentOwner?.toLowerCase();
      ownerMatched = !!currentWallet && !!onChainOwner && currentWallet === onChainOwner;

      checks.push({
        name: 'On-Chain Custodian Match',
        passed: ownerMatched,
        message: ownerMatched
          ? `On-chain current owner address matches local custodian: ${onChainOwner}`
          : `Owner mismatch: DB has ${currentWallet || 'none'}, Aptos has ${onChainOwner}`,
        expected: onChainOwner,
        actual: currentWallet,
      });
    }

    // 5. Determine Overall Verdict
    let verdict: VerificationVerdict = 'VERIFIED';
    let verdictMessage = 'Asset metadata, ownership intervals, and cryptographic proof verified successfully.';

    if (isRevoked) {
      verdict = 'REVOKED';
      verdictMessage = 'This asset was explicitly REVOKED. It is no longer valid or authorized.';
    } else if (!blockchainConnected && asset.transactions.length > 0) {
      verdict = 'BLOCKCHAIN_UNAVAILABLE';
      verdictMessage = 'Database records are intact, but Aptos node was unavailable to independently confirm state.';
    } else if (onChainAsset && (!metadataMatched || !ownerMatched)) {
      verdict = 'MISMATCH';
      verdictMessage = 'State discrepancy detected between relational metadata and Aptos blockchain anchor.';
    } else if (!onChainAsset) {
      verdict = 'UNANCHORED';
      verdictMessage = 'Asset is validated in database registry but not yet anchored on-chain.';
    }

    // Format serialized response
    return {
      verdict,
      verdictMessage,
      verifiedAt,
      asset: {
        id: asset.id,
        assetNumber: asset.assetNumber,
        name: asset.name,
        description: asset.description,
        assetType: asset.assetType,
        status: asset.status,
        organization: {
          name: asset.organization.name,
          slug: asset.organization.slug,
        },
        currentOwner: asset.currentOwner
          ? {
              did: asset.currentOwner.did,
              walletAddress: asset.currentOwner.walletAddress,
              name: asset.currentOwner.user
                ? `${asset.currentOwner.user.firstName} ${asset.currentOwner.user.lastName}`
                : 'Enterprise Custodian',
              verificationStatus: asset.currentOwner.verificationStatus,
            }
          : null,
        createdAt: asset.createdAt.toISOString(),
        updatedAt: asset.updatedAt.toISOString(),
        metadata: (asset.metadata as Record<string, any>) || {},
      },
      integrity: {
        computedMetadataHash: computedHash,
        matchesOnChain: onChainAsset ? metadataMatched : null,
      },
      blockchain: {
        network: blockchainService.getNetwork(),
        moduleAddress: blockchainService.getModuleAddress(),
        connected: blockchainConnected,
        onChainRecord: onChainAsset,
        onChainHistoryCount: onChainHistory.length,
        transactions: asset.transactions.map((tx) => ({
          txHash: tx.txHash,
          txType: tx.txType,
          status: tx.status,
          blockHeight: tx.blockHeight ? tx.blockHeight.toString() : null,
          gasUsed: tx.gasUsed ? tx.gasUsed.toString() : null,
          senderAddress: tx.senderAddress,
          submittedAt: tx.submittedAt.toISOString(),
        })),
      },
      ownershipHistory: asset.ownerships.map((o, idx) => ({
        intervalNumber: asset.ownerships.length - idx,
        status: o.status,
        custodianName: o.identity.user
          ? `${o.identity.user.firstName} ${o.identity.user.lastName}`
          : 'Cryptographic DID',
        custodianDid: o.identity.did,
        custodianWallet: o.identity.walletAddress,
        validFrom: o.validFrom.toISOString(),
        validTo: o.validTo ? o.validTo.toISOString() : null,
        notes: o.notes,
      })),
      checks,
    };
  }
}

export const verificationService = new VerificationService();
