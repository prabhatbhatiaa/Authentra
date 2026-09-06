import { PrismaClient, UserStatus, IdentityStatus, VerificationStatus } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Authentra database seed...');

  // 1. Clean existing seed data in reverse dependency order
  await prisma.auditEvent.deleteMany();
  await prisma.blockchainTransaction.deleteMany();
  await prisma.assetOwnership.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.identity.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  console.log('🧹 Cleaned existing records.');

  // 2. Create Default Permissions
  const permissionsData = [
    // Identity permissions
    { name: 'IDENTITY_CREATE', category: 'IDENTITY', description: 'Can register new Authentra digital identities' },
    { name: 'IDENTITY_READ', category: 'IDENTITY', description: 'Can view user identities and DID specifications' },
    // RBAC permissions
    { name: 'ROLE_ASSIGN', category: 'RBAC', description: 'Can assign roles to users within organization' },
    { name: 'ROLE_REVOKE', category: 'RBAC', description: 'Can revoke roles from users' },
    // Asset lifecycle permissions
    { name: 'ASSET_CREATE', category: 'ASSET', description: 'Can draft new digital assets' },
    { name: 'ASSET_READ', category: 'ASSET', description: 'Can view digital assets and metadata' },
    { name: 'ASSET_MINT', category: 'ASSET', description: 'Can anchor and mint digital assets on Aptos blockchain' },
    { name: 'ASSET_ASSIGN', category: 'ASSET', description: 'Can assign asset ownership to an identity' },
    { name: 'ASSET_TRANSFER', category: 'ASSET', description: 'Can transfer digital asset ownership' },
    { name: 'ASSET_REVOKE', category: 'ASSET', description: 'Can revoke or invalidate digital assets' },
    // Audit & Verification permissions
    { name: 'AUDIT_READ', category: 'AUDIT', description: 'Can query the system and blockchain audit trail' },
    { name: 'VERIFICATION_READ', category: 'VERIFICATION', description: 'Can execute on-chain cryptographic asset verification' },
  ];

  const createdPermissions = new Map<string, string>();
  for (const perm of permissionsData) {
    const created = await prisma.permission.create({
      data: perm,
    });
    createdPermissions.set(perm.name, created.id);
  }
  console.log(`✅ Created ${createdPermissions.size} permissions.`);

  // 3. Create Root Organization
  const testOrg = await prisma.organization.create({
    data: {
      name: 'Authentra Enterprise Corp',
      slug: 'authentra-enterprise',
      description: 'Primary root organization for security operations and digital asset governance',
    },
  });
  console.log(`✅ Created Organization: ${testOrg.name}`);

  // 4. Create Standard Roles
  const rolesDef = [
    {
      name: 'ADMIN',
      description: 'Full administrative access across all organization assets, roles, and audits',
      isSystem: true,
      permissions: Array.from(createdPermissions.keys()), // All permissions
    },
    {
      name: 'MANAGER',
      description: 'Asset lifecycle management and role assignments',
      isSystem: true,
      permissions: [
        'IDENTITY_READ',
        'ROLE_ASSIGN',
        'ASSET_CREATE',
        'ASSET_READ',
        'ASSET_MINT',
        'ASSET_ASSIGN',
        'ASSET_TRANSFER',
        'VERIFICATION_READ',
      ],
    },
    {
      name: 'AUDITOR',
      description: 'Read-only access to audit trail, assets, and verification',
      isSystem: true,
      permissions: ['IDENTITY_READ', 'ASSET_READ', 'AUDIT_READ', 'VERIFICATION_READ'],
    },
    {
      name: 'USER',
      description: 'Standard user with asset reading and personal verification capabilities',
      isSystem: true,
      permissions: ['IDENTITY_READ', 'ASSET_READ', 'VERIFICATION_READ'],
    },
  ];

  const createdRoles = new Map<string, string>();
  for (const r of rolesDef) {
    const roleRecord = await prisma.role.create({
      data: {
        name: r.name,
        description: r.description,
        isSystem: r.isSystem,
        organizationId: testOrg.id,
      },
    });
    createdRoles.set(r.name, roleRecord.id);

    // Link permissions
    for (const permName of r.permissions) {
      const permId = createdPermissions.get(permName);
      if (permId) {
        await prisma.rolePermission.create({
          data: {
            roleId: roleRecord.id,
            permissionId: permId,
          },
        });
      }
    }
  }
  console.log(`✅ Created ${createdRoles.size} roles and configured permission maps.`);

  // 5. Seed Users & Identities
  // Secure password hashing with Argon2
  const defaultPasswordHash = await argon2.hash('Admin@Authentra2026!');
  const userPasswordHash = await argon2.hash('User@Authentra2026!');

  // Seed Admin User
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@authentra.io',
      passwordHash: defaultPasswordHash,
      firstName: 'Chief',
      lastName: 'Security Officer',
      status: UserStatus.ACTIVE,
      organizationId: testOrg.id,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: createdRoles.get('ADMIN')!,
    },
  });

  const adminIdentity = await prisma.identity.create({
    data: {
      did: `did:authentra:${adminUser.id.substring(0, 16)}`,
      walletAddress: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      status: IdentityStatus.ACTIVE,
      verificationStatus: VerificationStatus.VERIFIED,
      userId: adminUser.id,
    },
  });

  // Seed Manager User
  const managerUser = await prisma.user.create({
    data: {
      email: 'manager@authentra.io',
      passwordHash: defaultPasswordHash,
      firstName: 'Asset',
      lastName: 'Manager',
      status: UserStatus.ACTIVE,
      organizationId: testOrg.id,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: managerUser.id,
      roleId: createdRoles.get('MANAGER')!,
    },
  });

  await prisma.identity.create({
    data: {
      did: `did:authentra:${managerUser.id.substring(0, 16)}`,
      walletAddress: '0x2234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      status: IdentityStatus.ACTIVE,
      verificationStatus: VerificationStatus.VERIFIED,
      userId: managerUser.id,
    },
  });

  // Seed Standard User
  const standardUser = await prisma.user.create({
    data: {
      email: 'user@authentra.io',
      passwordHash: userPasswordHash,
      firstName: 'Standard',
      lastName: 'Employee',
      status: UserStatus.ACTIVE,
      organizationId: testOrg.id,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: standardUser.id,
      roleId: createdRoles.get('USER')!,
    },
  });

  const standardIdentity = await prisma.identity.create({
    data: {
      did: `did:authentra:${standardUser.id.substring(0, 16)}`,
      walletAddress: '0x3234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      status: IdentityStatus.ACTIVE,
      verificationStatus: VerificationStatus.VERIFIED,
      userId: standardUser.id,
    },
  });

  console.log('✅ Created Admin, Manager, and Standard User accounts with DID identities.');

  // 6. Create Initial Sample Digital Asset & Ownership Record
  const sampleAsset = await prisma.asset.create({
    data: {
      name: 'Enterprise Security Master Certificate',
      description: 'Root cryptographic access authorization asset issued by Authentra Governance',
      assetType: 'CERTIFICATE',
      status: 'ACTIVE',
      organizationId: testOrg.id,
      currentOwnerId: adminIdentity.id,
      metadata: {
        securityLevel: 'TIER_1',
        complianceStandard: 'ISO-27001',
        algorithm: 'Ed25519',
      },
    },
  });

  await prisma.assetOwnership.create({
    data: {
      assetId: sampleAsset.id,
      identityId: adminIdentity.id,
      status: 'ACTIVE',
      notes: 'Initial asset genesis assignment to Administrator',
    },
  });

  // 7. Create Genesis Audit Event
  await prisma.auditEvent.create({
    data: {
      action: 'SYSTEM_INITIALIZATION',
      entity: 'ORGANIZATION',
      entityId: testOrg.id,
      actorId: adminUser.id,
      metadata: {
        event: 'Genesis organization, roles, and admin identity seeded.',
      },
    },
  });

  console.log('✅ Seed completed successfully! 🎉');
  console.log('\nDefault credentials:');
  console.log('---------------------------------------------------------');
  console.log('Admin:   admin@authentra.io   / Admin@Authentra2026!');
  console.log('Manager: manager@authentra.io / Admin@Authentra2026!');
  console.log('User:    user@authentra.io    / User@Authentra2026!');
  console.log('---------------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
