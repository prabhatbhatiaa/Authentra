import crypto from 'crypto';
import { Account } from '@aptos-labs/ts-sdk';

/**
 * Derives a deterministic or cryptographically generated Aptos wallet address and DID.
 * Follows W3C standard: did:authentra:aptos:<address>
 */
export function generateCryptographicIdentity(providedWalletAddress?: string): {
  did: string;
  walletAddress: string;
} {
  let address: string;

  if (providedWalletAddress && /^0x[a-fA-F0-9]{64}$/.test(providedWalletAddress)) {
    address = providedWalletAddress.toLowerCase();
  } else {
    // Generate a fresh Ed25519 Aptos account
    const account = Account.generate();
    address = account.accountAddress.toString().toLowerCase();
  }

  // Construct W3C DID string
  const did = `did:authentra:aptos:${address}`;

  return {
    did,
    walletAddress: address,
  };
}

/**
 * Formats a DID for user display
 */
export function formatDidForDisplay(did: string): string {
  if (!did) return '';
  if (did.length <= 24) return did;
  return `${did.substring(0, 20)}...${did.substring(did.length - 6)}`;
}
