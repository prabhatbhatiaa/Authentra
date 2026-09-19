import {
  Aptos,
  AptosConfig,
  Network,
  Account,
  Ed25519PrivateKey,
  InputViewFunctionData,
  CommittedTransactionResponse,
  UserTransactionResponse,
} from '@aptos-labs/ts-sdk';
import { config } from '../config/index';

export interface BlockchainSubmissionResult {
  success: boolean;
  txHash: string;
  version?: string;
  gasUsed?: bigint;
  vmStatus?: string;
  blockHeight?: bigint;
}

export interface OnChainIdentity {
  did: string;
  walletAddress: string;
  status: number;
  isVerified: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface OnChainAsset {
  name: string;
  assetType: string;
  metadataHash: string;
  currentOwner: string;
  status: number;
  mintedAt: number;
  updatedAt: number;
}

export interface OnChainOwnershipRecord {
  owner: string;
  fromTimestamp: number;
  toTimestamp: number;
  transferReason: string;
}

export class BlockchainService {
  private aptos: Aptos;
  private adminAccount: Account | null = null;
  private moduleAddress: string;
  private network: Network;

  constructor() {
    this.network = (config.blockchain.network.toLowerCase() as Network) || Network.TESTNET;
    const aptosConfig = new AptosConfig({
      network: this.network,
      fullnode: config.blockchain.nodeUrl,
      indexer: config.blockchain.indexerUrl,
    });

    this.aptos = new Aptos(aptosConfig);
    this.moduleAddress = config.blockchain.moduleAddress || '';

    // Initialize admin signer if valid private key is configured
    if (config.blockchain.privateKey && config.blockchain.privateKey.length >= 64) {
      try {
        const rawKey = config.blockchain.privateKey.startsWith('0x')
          ? config.blockchain.privateKey.slice(2)
          : config.blockchain.privateKey;
        const privateKey = new Ed25519PrivateKey(rawKey);
        this.adminAccount = Account.fromPrivateKey({ privateKey });
      } catch (err) {
        // Fallback: will require account generation or key configuration
        this.adminAccount = null;
      }
    }
  }

  /**
   * Check if the blockchain client is ready with an admin signer
   */
  public isSignerConfigured(): boolean {
    return this.adminAccount !== null && !!this.moduleAddress;
  }

  /**
   * Get the connected Aptos network name
   */
  public getNetwork(): string {
    return this.network;
  }

  /**
   * Get module address
   */
  public getModuleAddress(): string {
    return this.moduleAddress;
  }

  /**
   * Get ledger info to check blockchain connectivity
   */
  public async getLedgerInfo() {
    return await this.aptos.getLedgerInfo();
  }

  /**
   * Get account balance in Octas (1 APT = 10^8 Octas)
   */
  public async getAccountBalance(accountAddress: string): Promise<number> {
    try {
      const balance = await this.aptos.getAccountAPTAmount({
        accountAddress,
      });
      return balance;
    } catch {
      return 0;
    }
  }

  /**
   * Retrieve transaction details by transaction hash
   */
  public async getTransaction(txHash: string): Promise<CommittedTransactionResponse | null> {
    try {
      const tx = await this.aptos.getTransactionByHash({
        transactionHash: txHash,
      });
      return tx as CommittedTransactionResponse;
    } catch {
      return null;
    }
  }

  /**
   * Fetch recent transactions submitted by an account on Aptos
   */
  public async getAccountTransactions(accountAddress: string, limit: number = 25): Promise<any[]> {
    try {
      const txs = await this.aptos.getAccountTransactions({
        accountAddress,
      });
      return Array.isArray(txs) ? txs.slice(0, limit) : [];
    } catch {
      return [];
    }
  }


  /**
   * Submit an entry function transaction signed by admin
   */
  public async executeEntryFunction(
    moduleName: string,
    functionName: string,
    functionArguments: any[]
  ): Promise<BlockchainSubmissionResult> {
    if (!this.adminAccount) {
      throw new Error('BlockchainService: Admin signer account is not configured with a valid private key.');
    }
    if (!this.moduleAddress) {
      throw new Error('BlockchainService: Module address is not configured in environment.');
    }

    try {
      const transaction = await this.aptos.transaction.build.simple({
        sender: this.adminAccount.accountAddress,
        data: {
          function: `${this.moduleAddress}::${moduleName}::${functionName}`,
          functionArguments,
        },
      });

      const pendingTx = await this.aptos.signAndSubmitTransaction({
        signer: this.adminAccount,
        transaction,
      });

      const committedTx = (await this.aptos.waitForTransaction({
        transactionHash: pendingTx.hash,
      })) as UserTransactionResponse;

      return {
        success: committedTx.success,
        txHash: committedTx.hash,
        version: committedTx.version,
        gasUsed: committedTx.gas_used ? BigInt(committedTx.gas_used) : undefined,
        vmStatus: committedTx.vm_status,
      };
    } catch (err: any) {
      throw new Error(`Aptos transaction execution failed [${moduleName}::${functionName}]: ${err.message || err}`);
    }
  }

  /**
   * Read on-chain view function
   */
  public async readViewFunction<T = any>(payload: InputViewFunctionData): Promise<T> {
    try {
      const result = await this.aptos.view({ payload });
      return result as unknown as T;
    } catch (err: any) {
      throw new Error(`Aptos view call failed [${payload.function}]: ${err.message || err}`);
    }
  }

  // --- Specialized On-Chain Read Methods ---

  /**
   * Read on-chain identity record
   */
  public async getOnChainIdentity(walletAddress: string): Promise<OnChainIdentity | null> {
    if (!this.moduleAddress) return null;

    try {
      const res = await this.readViewFunction<[string, string, number, boolean, string, string]>({
        function: `${this.moduleAddress}::identity::get_identity`,
        functionArguments: [walletAddress],
      });

      if (!res || res.length < 6) return null;

      return {
        did: res[0],
        walletAddress: res[1],
        status: Number(res[2]),
        isVerified: Boolean(res[3]),
        createdAt: Number(res[4]),
        updatedAt: Number(res[5]),
      };
    } catch {
      return null;
    }
  }

  /**
   * Read on-chain asset record
   */
  public async getOnChainAsset(assetId: string): Promise<OnChainAsset | null> {
    if (!this.moduleAddress) return null;

    try {
      const res = await this.readViewFunction<[string, string, string, string, number, string, string]>({
        function: `${this.moduleAddress}::asset::get_asset`,
        functionArguments: [assetId],
      });

      if (!res || res.length < 7) return null;

      return {
        name: res[0],
        assetType: res[1],
        metadataHash: res[2],
        currentOwner: res[3],
        status: Number(res[4]),
        mintedAt: Number(res[5]),
        updatedAt: Number(res[6]),
      };
    } catch {
      return null;
    }
  }

  /**
   * Read on-chain ownership history for an asset
   */
  public async getOnChainOwnershipHistory(assetId: string): Promise<OnChainOwnershipRecord[]> {
    if (!this.moduleAddress) return [];

    try {
      const countRes = await this.readViewFunction<[string]>({
        function: `${this.moduleAddress}::asset::get_ownership_history_count`,
        functionArguments: [assetId],
      });

      const count = Number(countRes[0]);
      const history: OnChainOwnershipRecord[] = [];

      for (let i = 0; i < count; i++) {
        const recordRes = await this.readViewFunction<[string, string, string, string]>({
          function: `${this.moduleAddress}::asset::get_ownership_record`,
          functionArguments: [assetId, i],
        });

        history.push({
          owner: recordRes[0],
          fromTimestamp: Number(recordRes[1]),
          toTimestamp: Number(recordRes[2]),
          transferReason: recordRes[3],
        });
      }

      return history;
    } catch {
      return [];
    }
  }
}

export const blockchainService = new BlockchainService();
