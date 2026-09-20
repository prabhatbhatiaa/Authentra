# Authentra System Architecture

## 1. Executive Summary

Authentra is an enterprise-grade digital asset lifecycle, cryptographic identity, role-based access control (RBAC), and immutable audit platform anchored on **PostgreSQL (Neon)** and the **Aptos Blockchain (Testnet)**.

```
+-------------------------------------------------------------------------------+
|                            React 18 SPA (Vite)                                |
|  - Modern enterprise UI                                                       |
|  - Real-time Verification Engine, Asset Lifecycle Manager, Audit Explorer     |
+-------------------------------------------------------------------------------+
                                      |
                            REST API (JSON / HTTPS)
                                      |
+-------------------------------------------------------------------------------+
|                        Express / Node.js API Gateway                          |
|  - Helmet HTTP Security Headers, Dual-Tier Rate Limiting, Strict CORS         |
|  - Zod Request Validators & Centralized Error Handlers                        |
|  - Argon2id Password Hashing & HMAC-SHA256 JWT Session Management             |
|  - Server-Enforced RBAC Middleware (Organization-scoped multi-tenancy)        |
+-------------------------------------------------------------------------------+
                    |                                           |
                    v                                           v
+---------------------------------------+   +-----------------------------------+
|         PostgreSQL (Neon)             |   |       Aptos Blockchain            |
|  - Prisma 6 ORM                       |   |  - Move Smart Contracts           |
|  - Normalized 10-table schema         |   |    - identity.move                |
|  - Append-only audit logs             |   |    - access.move                  |
|  - Ownership intervals (validFrom/To) |   |    - asset.move                   |
|  - SHA-256 metadata digest anchors    |   |  - Aptos TS-SDK RPC integration   |
+---------------------------------------+   +-----------------------------------+
```

---

## 2. Core Architectural Subsystems

### 2.1 Cryptographic Identity Subsystem
* Every user belongs to an `Organization` security boundary.
* Identities derive deterministic W3C Decentralized Identifiers:
  ```text
  did:authentra:aptos:0x<aptos_account_address>
  ```
* Registered on-chain via `authentra::identity::register_identity()` on Aptos.

### 2.2 Server-Enforced RBAC Engine
* Dynamic permission resolution directly from PostgreSQL.
* 12 system permissions mapped across 4 standard roles:
  * **ADMIN**: Full management across users, roles, assets, audit, and on-chain sync.
  * **MANAGER**: Operational asset management and custody assignments.
  * **AUDITOR**: Read-only oversight across all audit logs and verification states.
  * **USER**: Restricted view of assigned credentials and personal assets.
* Middleware enforces authorization server-side (`authorize('ASSET_CREATE')`), rejecting unauthorized actors with HTTP 403 Forbidden.
* Strict prohibition against self-privilege escalation.

### 2.3 Digital Asset Lifecycle Engine
* Non-destructive state machine tracking asset custody:
  ```text
  CREATE (Draft) -> MINT (Aptos) -> ASSIGN (Active) -> TRANSFER (Active) -> REVOKE (Revoked)
  ```
* Every ownership transition creates an append-only `AssetOwnership` interval:
  * `validFrom`: Start timestamp of custody.
  * `validTo`: Null for the active owner; stamped with transition timestamp when transferred.

### 2.4 Dual Verification Engine
* Independent verification that cross-references:
  1. Off-chain PostgreSQL database records and current owner relations.
  2. Live Aptos smart contract state queried directly via Move view functions (`authentra::asset::get_asset`).
  3. SHA-256 deterministic digest comparison between local metadata and on-chain hash.
* Verdict classifications:
  * `VERIFIED`: Database, Aptos ledger, and cryptographic hash are identical.
  * `REVOKED`: Asset was permanently revoked on-chain or off-chain.
  * `MISMATCH`: Discrepancy detected between database state and on-chain state.
  * `UNANCHORED`: Draft asset exists only in off-chain database prior to minting.
  * `NOT_FOUND`: Identifier does not exist.

### 2.5 Immutable Audit & Event Indexing
* All operations produce structured, immutable `AuditEvent` records.
* Links actors, actions, organization IDs, network IPs, and blockchain transaction hashes.
* Includes on-demand indexer syncing confirmed on-chain Aptos transactions into the PostgreSQL audit journal with strict idempotency.
