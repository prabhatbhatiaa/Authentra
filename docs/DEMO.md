# Authentra Golden Path End-to-End Demo Script

This document details the end-to-end operational verification workflow for demonstrating the Authentra platform.

---

## Prerequisites

1. Ensure the monorepo dev servers are active:
   ```bash
   npm run dev
   ```
2. Navigate to: `http://localhost:5173`

---

## Step-by-Step Golden Path Flow

### Step 1: Admin Login
* On the login screen, click **"Admin"** under Quick Login with Seed Accounts (or enter `admin@authentra.io` / `Admin@Authentra2026!`).
* Click **"Authenticate Session"**.
* The application verifies the Argon2id hash and issues a signed JWT session.

### Step 2: Review Cryptographic Identity
* Click **IDENTITY (/identity)** in the top navigation bar.
* Verify the derived W3C Decentralized Identifier:
  `did:authentra:aptos:0x65dffe...`
* Inspect the deterministic DID Document and Aptos wallet binding.

### Step 3: Admin Governance & RBAC Enforcement
* Click **ADMIN (/admin)** in the navigation.
* Review the **User Directory**, **Roles**, and **Permissions** matrix.
* Notice that attempting to alter your own privileges is blocked by server-side business rules.

### Step 4: Asset Lifecycle & Aptos On-Chain Mint
* Click **ASSETS (/assets)** in the navigation.
* Click **"+ Create Asset"**:
  * Name: `Executive Cryptographic Clearance #501`
  * Type: `SECURITY_TOKEN`
  * Description: `High-assurance cryptographic asset demo`
* Click **"Create Asset"** — status becomes `DRAFT`.
* Click **"Mint (Aptos)"** on the new asset:
  * The server signs and broadcasts an entry function call to the Aptos smart contract on Testnet.
  * Once confirmed on-chain, the status transitions to `MINTED`.

### Step 5: Assign & Transfer Asset
* On the minted asset, click **"Assign"**:
  * Select a target identity and enter notes.
  * Status transitions to `ACTIVE`.
* Click **"Transfer"**:
  * Enter a new custodian DID.
  * The ownership chain records an append-only interval (`validFrom` -> `validTo`).
* Click the **History** icon on the asset to view the verifiable custody trail.

### Step 6: Public Dual Verification
* Click **VERIFY (/verify)** in the navigation.
* Search for the asset by asset number (e.g. `101` or your newly created asset number).
* The dual verification engine queries:
  1. PostgreSQL database metadata.
  2. Live Aptos blockchain smart contract state.
  3. SHA-256 metadata hash integrity.
* View the verdict: `VERIFIED` with direct links to the transaction on the Aptos Testnet Explorer.

### Step 7: Immutable Audit Trail
* Click **AUDIT (/audit)** in the navigation.
* View the tamper-evident journal recording all login actions, asset minting, assignments, and transfers with actor attribution.
* Click **"Inspect"** on any record to view network IP, user agent, and full JSON audit payload.

### Step 8: Test Restricted Privilege Access
* Click the sign-out icon in the top right.
* Log in as the regular user: click **"User"** (`user@authentra.io` / `User@Authentra2026!`).
* Notice the **ADMIN (/admin)** tab is completely hidden.
* If a direct API call is attempted to `/api/admin/roles/assign`, the server responds with:
  ```json
  {
    "success": false,
    "error": {
      "code": "FORBIDDEN",
      "message": "Access denied. Required permission: ROLE_ASSIGN"
    }
  }
  ```
