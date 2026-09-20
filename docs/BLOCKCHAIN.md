# Aptos Blockchain Architecture & Deployment Guide

This document defines the Aptos Move smart contract integration, configuration, and security models for **Authentra**.

---

## 1. Network Configuration

Authentra connects directly to Aptos Testnet nodes using `@aptos-labs/ts-sdk`.

| Parameter | Testnet Default | Production Configuration |
|---|---|---|
| **Network** | `testnet` | `mainnet` |
| **Node Fullnode URL** | `https://fullnode.testnet.aptoslabs.com/v1` | Custom high-throughput RPC / Aptos Mainnet |
| **Indexer GraphQL URL** | `https://api.testnet.aptoslabs.com/v1/graphql` | Aptos Indexer Mainnet |
| **Module Address** | Configured via `APTOS_MODULE_ADDRESS` in `.env` | Deployed enterprise contract address |

---

## 2. Core Move Modules

All Move smart contracts are located in [`contracts/authentra/sources/`](file:///C:/Users/Prabhat/Desktop/Main/Projects/Authentra/contracts/authentra/sources/):

### A. Identity Module (`authentra::identity`)
- Stores on-chain identity records (`IdentityRecord`) mapping W3C DIDs to Aptos wallet addresses.
- Enforces decentralized identity verification and status lifecycle (`ACTIVE`, `SUSPENDED`, `REVOKED`).
- Emits native events: `IdentityCreated`, `IdentityStatusUpdated`, `IdentityVerificationUpdated`.

### B. Access Control Module (`authentra::access`)
- On-chain role-based authorization store (`AccessStore`).
- Prevents unauthorized contract interactions by checking caller signers against on-chain role capabilities (`access::is_manager_or_admin`).
- Independently enforces **Self-Privilege Modification Prohibition** (`E_CANNOT_SELF_MODIFY`).
- Emits native events: `RoleAssigned`, `RoleRevoked`.

### C. Digital Asset Module (`authentra::asset`)
- Manages enterprise digital asset records (`AssetRecord`) and immutable interval-based ownership histories (`OwnershipRecord`).
- Functions: `mint_asset`, `assign_asset`, `transfer_asset`, `revoke_asset`.
- Preserves continuous custody timestamps (`from_timestamp` to `to_timestamp`).
- Emits native events: `AssetMinted`, `AssetAssigned`, `AssetTransferred`, `AssetRevoked`.

---

## 3. Backend Integration (`BlockchainService`)

Located at [`server/src/services/blockchain.service.ts`](file:///C:/Users/Prabhat/Desktop/Main/Projects/Authentra/server/src/services/blockchain.service.ts):
- **Transaction Submission**: `executeEntryFunction` constructs, signs, submits, and waits for transaction confirmation.
- **View Functions**: `readViewFunction` executes read-only queries against Aptos view functions.
- **On-Chain Queries**:
  - `getOnChainIdentity(walletAddress)`
  - `getOnChainAsset(assetId)`
  - `getOnChainOwnershipHistory(assetId)`
  - `getTransaction(txHash)`
  - `getAccountBalance(address)`

---

## 4. Security & Key Management

> [!IMPORTANT]
> - Private keys are stored strictly in server-side environment variables (`APTOS_PRIVATE_KEY`) and are never exposed to frontend clients, Git repositories, log files, or API responses.
> - Client interactions authenticate with the Authentra API via JWT + server RBAC; the backend acts as a trusted relayer/coordinator or verifies client signatures.

---

## 5. Active Testnet Configuration & Account

The project has been configured with an active Aptos Testnet administrative keypair in [`.env`](file:///C:/Users/Prabhat/Desktop/Main/Projects/Authentra/.env) and [`contracts/authentra/Move.toml`](file:///C:/Users/Prabhat/Desktop/Main/Projects/Authentra/contracts/authentra/Move.toml):

- **Network**: Aptos Testnet (`testnet`)
- **Fullnode RPC**: `https://fullnode.testnet.aptoslabs.com/v1`
- **Indexer URL**: `https://api.testnet.aptoslabs.com/v1/graphql`
- **Module & Admin Address**:
  ```text
  0x65dffe834fd05edb3dc925a90690e423b1ed550155e9ea20143cccce45c5ed7a
  ```
- **Aptos Explorer URL**:
  `https://explorer.aptoslabs.com/account/0x65dffe834fd05edb3dc925a90690e423b1ed550155e9ea20143cccce45c5ed7a?network=testnet`

### Funding with Free Testnet APT (Faucet)
To fund this admin account with gas for on-chain contract interactions:
1. Navigate to: **[https://aptos.dev/network/faucet](https://aptos.dev/network/faucet)**
2. Enter your account address:
   ```text
   0x65dffe834fd05edb3dc925a90690e423b1ed550155e9ea20143cccce45c5ed7a
   ```
3. Click **Fund Account** to receive testnet APT.
4. Verify the balance anytime via Authentra's API:
   `GET http://localhost:5000/api/blockchain/account/0x65dffe834fd05edb3dc925a90690e423b1ed550155e9ea20143cccce45c5ed7a`

