# Security Architecture & Hardening Guide

## 1. Overview

Authentra is designed with defense-in-depth across the web application layer, database persistence engine, and the decentralized Aptos blockchain layer.

```
+-------------------------------------------------------------+
|                      Client Layer                           |
|  - React 18, Vite, TypeScript                               |
|  - No private keys stored client-side                       |
|  - JWT Bearer stored in protected storage                   |
+-------------------------------------------------------------+
                              |
                     HTTPS / TLS 1.3
                              |
+-------------------------------------------------------------+
|                     API Gateway Layer                       |
|  - Helmet HTTP Security Headers                             |
|  - Strict CORS with origin restrictions                     |
|  - Dual-tier Rate Limiting (Global + Auth endpoints)        |
|  - Request Body Parsing bounded to 1MB                      |
|  - Zod Input Sanitization & Schema Validation               |
+-------------------------------------------------------------+
                              |
+-------------------------------------------------------------+
|               Authentication & RBAC Layer                   |
|  - Argon2id Memory-Hard Password Hashing                    |
|  - HMAC-SHA256 Signed JWTs with exp claims                  |
|  - Server-Enforced RBAC Middleware (authorize)              |
|  - Prohibition of self-privilege escalation                 |
+-------------------------------------------------------------+
               |                              |
               v                              v
+-----------------------------+  +----------------------------+
|     PostgreSQL / Neon       |  |       Aptos Blockchain     |
| - Parameterized queries     |  | - Smart contract auth      |
| - Strict foreign keys       |  | - On-chain signer checks   |
| - Tenant organization scope |  | - Sovereign capability     |
| - Immutable audit journal   |  | - Zero client secrets      |
+-----------------------------+  +----------------------------+
```

---

## 2. Authentication Security

* **Argon2id Hashing**: Passwords are never stored in plaintext or weak hashes (MD5, SHA, bcrypt). Authentra uses Argon2id with:
  * Memory cost: 65,536 KB (64 MB)
  * Time cost: 3 iterations
  * High resistance to GPU and ASIC brute-force attacks
* **Session Tokens**:
  * Signed via HMAC-SHA256 using server-held `JWT_SECRET`.
  * Expiration time enforced (`JWT_EXPIRES_IN=7d`).
  * Verified server-side on every protected endpoint.
* **Rate Limiting**:
  * Global limiter: 100 requests per 15 minutes per IP.
  * Credential limiter: 15 attempts per 15 minutes on `/api/auth/login` and `/api/auth/register`.

---

## 3. Authorization & Multi-Tenancy

* **Server-Side Enforcement**: The frontend UI merely provides visual feedback. Every sensitive action is validated server-side by checking the user's role against permissions stored in PostgreSQL.
* **Prohibition of Self-Privilege Modification**:
  * Users cannot assign roles to themselves.
  * Users cannot alter their own status or permissions.
* **Tenant Isolation**:
  * All database queries scope resources by `organizationId`.
  * Users cannot read, mint, or transfer digital assets belonging to another organization.

---

## 4. API & Input Hardening

* **Helmet Security Headers**:
  * `Content-Security-Policy`
  * `X-Frame-Options: SAMEORIGIN` (prevents clickjacking)
  * `X-Content-Type-Options: nosniff` (prevents MIME-type sniffing)
  * `Strict-Transport-Security` (forces HTTPS)
* **CORS**: Restricted exclusively to configured `CLIENT_URL`.
* **Zod Validation**: Rejects malformed bodies, non-hex wallet addresses, and injections before controllers execute.
* **Centralized Error Handling**: Detailed error stack traces are suppressed in production mode to avoid information disclosure.

---

## 5. Database Security

* **ORM Parameterization**: All SQL queries use Prisma's parameterized engine, eliminating SQL injection.
* **Referential Integrity**: Strict foreign key constraints with explicit delete rules (`Cascade` on transient records, `SetNull` on audit linkages).
* **Append-Only Auditing**: The `AuditEvent` table captures all user logins, logouts, asset state changes, and role assignments with immutable timestamps and IP recording.

---

## 6. Blockchain Security

* **Private Key Protection**:
  * Module admin private keys are stored only in server environment variables (`.env`).
  * Never committed to git, never sent to the browser, and never logged in stdout or error responses.
* **Move Smart Contract Authorization**:
  * The Aptos contracts (`identity.move`, `access.move`, `asset.move`) enforce their own signer assertions (`assert!(signer::address_of(admin) == @authentra, ...)`).
  * The smart contract does not trust backend API assertions blindly.
