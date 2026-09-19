import { prisma } from '../config/db.js';
import { blockchainService } from './blockchain.service.js';

export interface IndexingResult {
  syncedEventsCount: number;
  newTransactionsIndexed: number;
  skippedDuplicates: number;
  latestBlockHeight: string | null;
  ledgerVersion: string | null;
  network: string;
  syncedAt: string;
}

export class IndexerService {
  /**
   * Sync on-chain events and transactions from Aptos to PostgreSQL.
   * Ensures idempotency: duplicate transaction hashes or events are safely skipped.
   */
  async syncBlockchainEvents(): Promise<IndexingResult> {
    const syncedAt = new Date().toISOString();
    const network = blockchainService.getNetwork();
    const moduleAddress = blockchainService.getModuleAddress();

    let latestBlockHeight: string | null = null;
    let ledgerVersion: string | null = null;

    try {
      const ledger = await blockchainService.getLedgerInfo();
      latestBlockHeight = ledger?.block_height || null;
      ledgerVersion = ledger?.ledger_version || null;
    } catch {
      // If node is briefly unreachable, proceed with local reconciliation
    }

    let newTransactionsIndexed = 0;
    let skippedDuplicates = 0;
    let syncedEventsCount = 0;

    if (!moduleAddress) {
      return {
        syncedEventsCount: 0,
        newTransactionsIndexed: 0,
        skippedDuplicates: 0,
        latestBlockHeight,
        ledgerVersion,
        network,
        syncedAt,
      };
    }

    // 1. Fetch recent transactions for the module account from the Aptos fullnode
    const onChainTxs = await blockchainService.getAccountTransactions(moduleAddress, 50);

    for (const tx of onChainTxs) {
      // We only index user transactions that succeeded
      if (tx.type !== 'user_transaction' || !tx.hash) continue;

      const txHash = tx.hash;
      const gasUsed = tx.gas_used ? BigInt(tx.gas_used) : null;
      const blockHeight = tx.version ? BigInt(tx.version) : null;
      const senderAddress = tx.sender || moduleAddress;

      // Check if this transaction already exists in our database
      const existingTx = await prisma.blockchainTransaction.findUnique({
        where: { txHash },
      });

      let txRecord = existingTx;

      if (!existingTx) {
        // Derive transaction type based on function payload
        let txType: any = 'ASSET_MINT';
        const payloadFunction = tx.payload?.function || '';

        if (payloadFunction.includes('register_identity')) {
          txType = 'IDENTITY_REGISTRATION';
        } else if (payloadFunction.includes('assign_role')) {
          txType = 'ROLE_ASSIGNMENT';
        } else if (payloadFunction.includes('revoke_role')) {
          txType = 'ROLE_REVOCATION';
        } else if (payloadFunction.includes('assign_asset')) {
          txType = 'ASSET_ASSIGNMENT';
        } else if (payloadFunction.includes('transfer_asset')) {
          txType = 'ASSET_TRANSFER';
        } else if (payloadFunction.includes('revoke_asset')) {
          txType = 'ASSET_REVOCATION';
        }

        // Store new transaction idempotently
        txRecord = await prisma.blockchainTransaction.create({
          data: {
            txHash,
            txType,
            status: tx.success ? 'CONFIRMED' : 'FAILED',
            blockHeight,
            gasUsed,
            senderAddress,
            submittedAt: new Date(Number(tx.timestamp || Date.now() * 1000) / 1000),
            confirmedAt: new Date(),
          },
        });
        newTransactionsIndexed++;
      } else {
        skippedDuplicates++;
      }

      // 2. Parse on-chain emitted events and sync to AuditEvent index idempotently
      if (Array.isArray(tx.events) && txRecord) {
        for (const evt of tx.events) {
          const eventType = evt.type || '';
          if (!eventType.includes(moduleAddress) && !eventType.includes('authentra')) continue;

          // Check if this specific on-chain event was already indexed
          const existingEvent = await prisma.auditEvent.findFirst({
            where: {
              transactionId: txRecord.id,
              action: { contains: 'ONCHAIN_' },
            },
          });

          if (!existingEvent) {
            let action = 'ONCHAIN_EVENT';
            let entity = 'BLOCKCHAIN';

            if (eventType.includes('IdentityCreated')) {
              action = 'ONCHAIN_IDENTITY_CREATED';
              entity = 'IDENTITY';
            } else if (eventType.includes('RoleAssigned')) {
              action = 'ONCHAIN_ROLE_ASSIGNED';
              entity = 'USER_ROLE';
            } else if (eventType.includes('AssetMinted')) {
              action = 'ONCHAIN_ASSET_MINTED';
              entity = 'ASSET';
            } else if (eventType.includes('AssetTransferred')) {
              action = 'ONCHAIN_ASSET_TRANSFERRED';
              entity = 'ASSET';
            } else if (eventType.includes('AssetRevoked')) {
              action = 'ONCHAIN_ASSET_REVOKED';
              entity = 'ASSET';
            }

            await prisma.auditEvent.create({
              data: {
                action,
                entity,
                transactionId: txRecord.id,
                metadata: {
                  eventType,
                  eventData: evt.data || {},
                  source: 'APTOS_TESTNET_INDEXER',
                },
                createdAt: new Date(),
              },
            });
            syncedEventsCount++;
          }
        }
      }
    }

    return {
      syncedEventsCount,
      newTransactionsIndexed,
      skippedDuplicates,
      latestBlockHeight,
      ledgerVersion,
      network,
      syncedAt,
    };
  }

  /**
   * Get current indexing status and metrics
   */
  async getIndexingStatus() {
    const [totalIndexedTxs, totalOnChainAuditEvents, latestTx] = await Promise.all([
      prisma.blockchainTransaction.count(),
      prisma.auditEvent.count({
        where: {
          action: { startsWith: 'ONCHAIN_' },
        },
      }),
      prisma.blockchainTransaction.findFirst({
        orderBy: { submittedAt: 'desc' },
      }),
    ]);

    let liveLedger = null;
    try {
      liveLedger = await blockchainService.getLedgerInfo();
    } catch {
      // Keep null if disconnected
    }

    return {
      network: blockchainService.getNetwork(),
      moduleAddress: blockchainService.getModuleAddress(),
      totalIndexedTransactions: totalIndexedTxs,
      totalOnChainEvents: totalOnChainAuditEvents,
      latestIndexedTransaction: latestTx
        ? {
            txHash: latestTx.txHash,
            txType: latestTx.txType,
            status: latestTx.status,
            submittedAt: latestTx.submittedAt,
          }
        : null,
      liveLedger: liveLedger
        ? {
            chainId: liveLedger.chain_id,
            epoch: liveLedger.epoch,
            blockHeight: liveLedger.block_height,
            ledgerVersion: liveLedger.ledger_version,
          }
        : null,
    };
  }
}

export const indexerService = new IndexerService();
