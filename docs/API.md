# Authentra REST API Specification

Base URL: `http://localhost:5000/api`

---

## 1. Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Create new account, organization, and derive Aptos DID |
| `POST` | `/api/auth/login` | Public | Authenticate with Argon2id and receive JWT |
| `GET` | `/api/auth/me` | Bearer JWT | Get current authenticated user profile, permissions, and DID |
| `POST` | `/api/auth/logout` | Bearer JWT | Invalidate session and log audit event |

---

## 2. Identity Management (`/api/identity`)

| Method | Endpoint | Auth / Permission | Description |
|---|---|---|---|
| `GET` | `/api/identity/me` | `IDENTITY_READ` | Get full identity profile and Aptos address |
| `GET` | `/api/identity/did/:did` | Public / Read | Resolve W3C DID document and verification keys |
| `PATCH` | `/api/identity/:id/verify` | `IDENTITY_VERIFY` | Update verification status (`VERIFIED`, `SUSPENDED`) |

---

## 3. Digital Asset Management (`/api/assets`)

| Method | Endpoint | Auth / Permission | Description |
|---|---|---|---|
| `POST` | `/api/assets` | `ASSET_CREATE` | Create draft asset in PostgreSQL |
| `GET` | `/api/assets` | `ASSET_READ` | List assets for authenticated organization |
| `GET` | `/api/assets/:id` | `ASSET_READ` | Get single asset details and current custodian |
| `POST` | `/api/assets/:id/mint` | `ASSET_CREATE` | Mint asset on Aptos blockchain |
| `POST` | `/api/assets/:id/assign` | `ASSET_TRANSFER` | Assign initial custody to an identity |
| `POST` | `/api/assets/:id/transfer` | `ASSET_TRANSFER` | Transfer custody to new identity (updates interval) |
| `POST` | `/api/assets/:id/revoke` | `ASSET_REVOKE` | Permanently revoke asset |
| `GET` | `/api/assets/:id/history` | `ASSET_READ` | Retrieve chronological ownership chain |

---

## 4. Multi-Source Verification (`/api/verification`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/verification/verify/:identifier` | Public / Any | Dual-verify asset state (PostgreSQL vs. Aptos) |

---

## 5. Audit & Indexing (`/api/audit`, `/api/blockchain`)

| Method | Endpoint | Auth / Permission | Description |
|---|---|---|---|
| `GET` | `/api/audit` | `AUDIT_READ` | Query paginated audit events with filters |
| `GET` | `/api/audit/actions` | `AUDIT_READ` | List available audit action types and entities |
| `POST` | `/api/blockchain/sync` | `ADMIN` / `ROLE_ASSIGN` | Trigger blockchain transaction ingestion |
| `GET` | `/api/blockchain/sync/status` | `ADMIN` / `ROLE_ASSIGN` | Check event indexer synchronization status |

---

## 6. Administration & Governance (`/api/admin`)

| Method | Endpoint | Auth / Permission | Description |
|---|---|---|---|
| `GET` | `/api/admin/users` | `ROLE_ASSIGN` | View all users and role assignments |
| `GET` | `/api/admin/roles` | `ROLE_ASSIGN` | View defined roles and permission counts |
| `GET` | `/api/admin/permissions`| `ROLE_ASSIGN` | View system permission catalog |
| `POST` | `/api/admin/roles/assign` | `ROLE_ASSIGN` | Assign role to user (self-assignment blocked) |
| `POST` | `/api/admin/roles/revoke` | `ROLE_REVOKE` | Revoke role from user |
| `PATCH` | `/api/admin/users/:userId/status` | `ROLE_ASSIGN` | Suspend or activate user account |
