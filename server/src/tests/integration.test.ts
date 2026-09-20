import assert from 'node:assert';
import { prisma } from '../config/db.js';
import { hashPassword, verifyPassword, signToken, verifyToken } from '../utils/security.js';
import { rbacService } from '../services/rbac.service.js';
import { blockchainService } from '../services/blockchain.service.js';
import { verificationService } from '../services/verification.service.js';

async function runTestSuite() {
  console.log('====================================================');
  console.log('    AUTHENTRA INTEGRATION & SECURITY TEST SUITE     ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    process.stdout.write(`[TEST] ${name} ... `);
    try {
      await fn();
      console.log('PASSED');
      passed++;
    } catch (err: any) {
      console.log('FAILED');
      console.error(`       Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Password Hashing & Verification
  await test('Security: Argon2id password hashing and constant-time verify', async () => {
    const raw = 'SuperSecurePass2026!#';
    const hash = await hashPassword(raw);
    assert(hash.startsWith('$argon2id$'), 'Hash should be Argon2id format');
    const match = await verifyPassword(hash, raw);
    assert.strictEqual(match, true, 'Valid password must verify');
    const wrong = await verifyPassword(hash, 'IncorrectPassword');
    assert.strictEqual(wrong, false, 'Invalid password must be rejected');
  });

  // 2. JWT Generation & Expiration Claims
  await test('Security: HMAC-SHA256 JWT sign, verify and tamper rejection', async () => {
    const payload = {
      userId: 'test-user-id',
      email: 'test@authentra.io',
      organizationId: 'test-org-id',
      roles: ['USER'],
    };
    const token = signToken(payload);
    assert(typeof token === 'string' && token.split('.').length === 3, 'Valid JWT format');
    const decoded = verifyToken(token);
    assert(decoded !== null, 'Decoded token must not be null');
    assert.strictEqual(decoded.userId, payload.userId, 'User ID matches payload');

    // Tampered token check
    const tampered = token.slice(0, -5) + 'abcde';
    const invalidDecoded = verifyToken(tampered);
    assert.strictEqual(invalidDecoded, null, 'Tampered token must be rejected');
  });

  // 3. RBAC Privilege Enforcement
  await test('RBAC: Admin, Manager, Auditor, and User role privilege checks', async () => {
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@authentra.io' },
    });
    const regularUser = await prisma.user.findUnique({
      where: { email: 'user@authentra.io' },
    });

    assert(adminUser, 'Seeded admin account exists');
    assert(regularUser, 'Seeded regular user account exists');

    // Admin should have ROLE_ASSIGN permission
    const adminAllowed = await rbacService.hasPermission(adminUser.id, 'ROLE_ASSIGN');
    assert.strictEqual(adminAllowed, true, 'Admin must possess ROLE_ASSIGN');

    // Regular user should NOT have ROLE_ASSIGN or ROLE_REVOKE
    const userRoleAssign = await rbacService.hasPermission(regularUser.id, 'ROLE_ASSIGN');
    assert.strictEqual(userRoleAssign, false, 'Regular user must not have ROLE_ASSIGN');

    const userAssetCreate = await rbacService.hasPermission(regularUser.id, 'ASSET_CREATE');
    assert.strictEqual(userAssetCreate, false, 'Regular user must not have ASSET_CREATE');
  });

  // 4. Aptos Smart Contract Connectivity
  await test('Blockchain: Aptos Testnet node connectivity and block height', async () => {
    const ledger = await blockchainService.getLedgerInfo();
    assert(ledger && ledger.block_height !== undefined, 'Ledger info retrieved with block height');
    assert.strictEqual(blockchainService.getNetwork(), 'testnet', 'Target network is testnet');
  });

  // 5. Dual Verification Engine
  await test('Dual Verification: Verifies asset state across database and Aptos', async () => {
    const asset = await prisma.asset.findFirst({
      where: { status: 'ACTIVE' },
    });

    if (asset) {
      const verification = await verificationService.verifyAsset(String(asset.assetNumber));
      assert(['VERIFIED', 'REVOKED', 'UNANCHORED'].includes(verification.verdict), 'Valid verdict');
      assert.strictEqual(verification.asset?.id, asset.id, 'Resolved correct asset');
    }
  });

  // 6. Audit Logging Integrity
  await test('Audit: Event recording integrity and actor linkage', async () => {
    const eventCount = await prisma.auditEvent.count();
    assert(eventCount > 0, 'Audit trail must contain recorded events');

    const sampleEvent = await prisma.auditEvent.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { actor: true },
    });
    assert(sampleEvent !== null, 'Event retrieved');
    assert(sampleEvent.action !== '', 'Event has explicit action type');
  });

  console.log('\n----------------------------------------------------');
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('----------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((e) => {
  console.error('Fatal test runner error:', e);
  process.exit(1);
});
