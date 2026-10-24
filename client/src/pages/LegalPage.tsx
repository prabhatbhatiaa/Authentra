import { useState } from 'react';
import {
  CheckCircle2,
  Database,
  Server,
} from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { Footer } from '../components/landing/Footer';
import { cn } from '../lib/cn';

export type LegalDocId = 'privacy' | 'terms' | 'security' | 'compliance';

interface LegalDocSection {
  id: string;
  cleanTitle: string;
}

interface LegalDocMeta {
  id: LegalDocId;
  displayTitle: string;
  shortLabel: string;
  category: string;
  summary: string;
  effectiveDate: string;
  lastAudited: string;
  version: string;
  docHash: string;
  sections: LegalDocSection[];
}

export const LEGAL_DOCS: Record<LegalDocId, LegalDocMeta> = {
  privacy: {
    id: 'privacy',
    displayTitle: 'Privacy Policy',
    shortLabel: 'Privacy Policy',
    category: 'Privacy & Cryptographic Data Custody',
    summary:
      'How Authentra protects your organization’s data — zero-knowledge cryptographic processing, decoupled W3C Decentralized Identifiers (DIDs), client-side telemetry isolation, and GDPR/CCPA immutable ledger reconciliation.',
    effectiveDate: '13 October 2026',
    lastAudited: '28 September 2026',
    version: 'v2.4.0',
    docHash: '0x8f2c31e9a4d70b5c18e3fa9128d54129e64c8b724589d816a1378e90f23b7a12',
    sections: [
      { id: 'p1', cleanTitle: 'Executive Privacy Mandate & Zero-Trust Doctrine' },
      { id: 'p2', cleanTitle: 'Dual-Layer Storage Architecture (Off-Chain vs. On-Chain)' },
      { id: 'p3', cleanTitle: 'W3C DID Specification & Pseudonymous Key Rings' },
      { id: 'p4', cleanTitle: 'Non-Existent Personal Data Monetization Guarantee' },
      { id: 'p5', cleanTitle: 'GDPR Article 17, CCPA & Immutable Ledger Realities' },
      { id: 'p6', cleanTitle: 'Cryptographic Salt Derivation & Key Lifetime' },
      { id: 'p7', cleanTitle: 'Subprocessors & Infrastructure Provenance' },
      { id: 'p8', cleanTitle: 'Data Protection Officer (DPO) & Inquiries' },
    ],
  },
  terms: {
    id: 'terms',
    displayTitle: 'Terms of Service',
    shortLabel: 'Terms of Service',
    category: 'Protocol Governance & Custody Agreement',
    summary:
      'Legally binding terms governing institutional custody, linear non-destructive state machines, cryptographic signature attribution, and Aptos Move smart contract interactions.',
    effectiveDate: '13 October 2026',
    lastAudited: '28 September 2026',
    version: 'v2.1.0',
    docHash: '0x14e82b7c90af41d2e5b88c71639d04217fa83e9b10c5384729e41b9d0728c310',
    sections: [
      { id: 't1', cleanTitle: 'Parties & Binding Institutional Engagement' },
      { id: 't2', cleanTitle: 'Deterministic State Machine & Lifecycle Invariance' },
      { id: 't3', cleanTitle: 'Sole Custodial Responsibility for Cryptographic Secrets' },
      { id: 't4', cleanTitle: 'Server-Side Anti-Escalation & Role Boundaries' },
      { id: 't5', cleanTitle: 'Intellectual Property & Move Module Bytecode Rights' },
      { id: 't6', cleanTitle: 'Layer-1 Blockchain Throughput & Consensus Disclaimers' },
      { id: 't7', cleanTitle: 'Limitation of Liability & Institutional Indemnification' },
      { id: 't8', cleanTitle: 'Governing Law & Dispute Resolution' },
    ],
  },
  security: {
    id: 'security',
    displayTitle: 'Security Architecture',
    shortLabel: 'Security Architecture',
    category: 'System Architecture & Threat Model',
    summary:
      'Technical breakdown of Authentra’s defense-in-depth model, dual-consensus verification engine, memory-hard RFC 9106 Argon2id key derivation, and Move VM resource safety.',
    effectiveDate: '13 October 2026',
    lastAudited: '28 September 2026',
    version: 'v3.0.0',
    docHash: '0x59a37e1b4028cf8931481d9f07a56c4290138db8127ef635b71904a28f110c78',
    sections: [
      { id: 's1', cleanTitle: 'Defense-in-Depth Cryptographic Overview' },
      { id: 's2', cleanTitle: 'Dual-Engine Consensus Verification Mechanics' },
      { id: 's3', cleanTitle: 'RFC 9106 Argon2id Parameterization & Constant-Time Logic' },
      { id: 's4', cleanTitle: 'Aptos Move VM Formal Verification & Linear Resources' },
      { id: 's5', cleanTitle: 'SHA-256 Metadata Anchor Merkle Derivations' },
      { id: 's6', cleanTitle: 'Continuous Interval Ownership Validation' },
      { id: 's7', cleanTitle: 'Penetration Testing & Vulnerability Disclosure' },
    ],
  },
  compliance: {
    id: 'compliance',
    displayTitle: 'Compliance & Standards',
    shortLabel: 'Compliance & Standards',
    category: 'Regulatory Standards & Audit Governance',
    summary:
      'Institutional alignment with SOC 2 Type II trust principles, ISO/IEC 27001 control matrices, FIPS 180-4 cryptographic digest standards, and immutable audit journal exports.',
    effectiveDate: '13 October 2026',
    lastAudited: '28 September 2026',
    version: 'v1.8.0',
    docHash: '0x9d04217fa83e9b10c5384729e41b9d0728c31014e82b7c90af41d2e5b88c7163',
    sections: [
      { id: 'c1', cleanTitle: 'Standards Overview & Audit Charter' },
      { id: 'c2', cleanTitle: 'SOC 2 Type II Trust Services Criteria Mapping' },
      { id: 'c3', cleanTitle: 'W3C DID Core 1.0 Specification Conformance' },
      { id: 'c4', cleanTitle: 'FIPS 180-4 & NIST Cryptographic Alignment' },
      { id: 'c5', cleanTitle: 'Immutable Audit Journaling & Cryptographic Export' },
      { id: 'c6', cleanTitle: 'Third-Party Attestation & Continuous Assurance' },
    ],
  },
};

const LEGAL_DOC_LIST: LegalDocMeta[] = Object.values(LEGAL_DOCS);

interface LegalPageProps {
  initialDoc?: LegalDocId;
  onGoHome: () => void;
  onGoToDashboard?: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export function LegalPage({
  initialDoc = 'privacy',
  onGoHome,
  onGoToDashboard,
  isDark,
  onToggleTheme,
  onOpenAuth,
}: LegalPageProps) {
  const [activeDocId, setActiveDocId] = useState<LegalDocId>(initialDoc);
  const [copiedHash, setCopiedHash] = useState(false);

  const currentDoc = LEGAL_DOCS[activeDocId] ?? LEGAL_DOCS.privacy;
  const otherDocs = LEGAL_DOC_LIST.filter((d) => d.id !== activeDocId);

  const navigateToDoc = (docId: LegalDocId) => {
    setActiveDocId(docId);
    window.location.hash = `#/${docId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(currentDoc.docHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="min-h-screen bg-canvas text-fg selection:bg-accent/20">
      {/* ── Fixed Header ───────────────────────────────────────────── */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-line/[0.08] bg-canvas/80 backdrop-blur-md transition-[background-color,border-color] duration-300">
        <div className="mx-auto flex h-16 sm:h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <div className="flex items-center gap-6">
            <Logo onClick={onGoHome} />
          </div>

          {/* Desktop Center Document Switcher */}
          <nav aria-label="Legal documents" className="hidden md:flex items-center gap-1 rounded-full border border-line/[0.08] bg-surface/50 p-1">
            {LEGAL_DOC_LIST.map((doc) => {
              const active = activeDocId === doc.id;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => navigateToDoc(doc.id)}
                  className={cn(
                    'rounded-full px-3.5 py-1 text-[13px] font-medium transition-all',
                    active
                      ? 'bg-fg text-canvas font-semibold shadow-xs'
                      : 'text-fg-muted hover:text-fg'
                  )}
                >
                  {doc.shortLabel}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} className="border-transparent" />
            {onGoToDashboard ? (
              <button
                type="button"
                onClick={onGoToDashboard}
                className="btn-primary btn-sm rounded-full"
              >
                Open Console
              </button>
            ) : onOpenAuth ? (
              <button
                type="button"
                onClick={() => onOpenAuth('login')}
                className="btn-primary btn-sm rounded-full"
              >
                Launch Console
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {/* ── Main Legal Container ──────────────────────────────────── */}
      <main className="relative pb-24 pt-32 sm:pt-40">
        {/* Subtle ambient atmospheric top glow (inspired by somentm) */}
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-[900px] -translate-x-1/2 opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(ellipse at top, rgba(255, 77, 46, 0.12), transparent 60%)' }}
        />

        <div className="mx-auto max-w-7xl px-6 lg:px-10 relative z-10">
          {/* Document Masthead */}
          <header className="max-w-3xl">
            {/* Mobile document switcher */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2 md:hidden">
              {LEGAL_DOC_LIST.map((doc) => (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => navigateToDoc(doc.id)}
                  className={cn(
                    'shrink-0 rounded-full border px-3.5 py-1 text-xs font-medium transition-all',
                    activeDocId === doc.id
                      ? 'border-fg bg-fg text-canvas font-semibold'
                      : 'border-line/[0.08] bg-surface text-fg-muted'
                  )}
                >
                  {doc.shortLabel}
                </button>
              ))}
            </div>

            <h1 className="font-title text-balance text-[2.6rem] font-medium leading-[0.95] tracking-tight sm:text-[3.6rem] text-fg">
              {currentDoc.displayTitle}
            </h1>

            <p className="mt-5 text-[13.5px] text-fg-subtle">
              Current version {currentDoc.version} · effective from{' '}
              <time className="text-fg font-medium">{currentDoc.effectiveDate}</time> · Audited{' '}
              <time className="text-ok font-medium">{currentDoc.lastAudited}</time>
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[11px] text-fg-subtle">
              <span className="rounded-md border border-line/[0.08] bg-surface/70 px-2.5 py-1">
                <span>SHA-256 Digest: </span>
                <span className="text-accent">{currentDoc.docHash.slice(0, 16)}…{currentDoc.docHash.slice(-8)}</span>
              </span>
              <button
                type="button"
                onClick={handleCopyHash}
                className="rounded-md border border-line/[0.08] bg-surface/70 px-2.5 py-1 text-fg-muted hover:text-fg hover:border-line/20 transition-colors inline-flex items-center gap-1"
              >
                {copiedHash && <CheckCircle2 className="h-3 w-3 text-ok" />}
                <span>{copiedHash ? 'Hash Copied' : 'Copy Hash'}</span>
              </button>
            </div>

            <p className="mt-6 text-[1.05rem] leading-relaxed text-fg-muted">
              {currentDoc.summary}
            </p>
          </header>

          {/* 2-Column Document Layout: Sticky Sidebar + Article Sections */}
          <div className="mt-14 grid gap-14 lg:grid-cols-[220px_1fr] lg:gap-24">
            {/* Sticky Left Navigation */}
            <nav aria-label="Contents" className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-fg-subtle">
                Contents
              </p>
              <ol className="mt-4 space-y-2.5 border-l border-line/[0.08]">
                {currentDoc.sections.map((sec, idx) => (
                  <li key={sec.id}>
                    <a
                      href={`#${sec.id}`}
                      className="-ml-px flex gap-3 border-l border-transparent pl-4 text-[13.5px] leading-snug text-fg-muted transition-colors hover:border-fg/40 hover:text-fg"
                    >
                      <span className="w-7 shrink-0 font-mono text-[11px] text-fg-subtle">
                        {idx + 1}
                      </span>
                      <span>{sec.cleanTitle}</span>
                    </a>
                  </li>
                ))}
              </ol>

              {/* Quick links to alternate frameworks */}
              <div className="mt-8 border-t border-line/[0.08] pt-6 text-[13px] text-fg-subtle">
                See also{' '}
                {otherDocs.map((doc, i) => (
                  <span key={doc.id}>
                    <button
                      type="button"
                      onClick={() => navigateToDoc(doc.id)}
                      className="text-fg underline-offset-4 hover:underline"
                    >
                      {doc.shortLabel}
                    </button>
                    {i < otherDocs.length - 1 ? ' · ' : ''}
                  </span>
                ))}
              </div>
            </nav>

            {/* Right Column: Article Body */}
            <article className="max-w-3xl">
              {activeDocId === 'privacy' && <DetailedPrivacyContent />}
              {activeDocId === 'terms' && <DetailedTermsContent />}
              {activeDocId === 'security' && <DetailedSecurityContent />}
              {activeDocId === 'compliance' && <DetailedComplianceContent />}
            </article>
          </div>
        </div>

        {/* ── Giant Architectural Watermark (somentm inspired) ─────────── */}
        <div className="relative mt-24 mb-6 flex justify-center select-none overflow-hidden" aria-hidden="true">
          <span
            className="select-none px-[0.08em] font-sans text-[13vw] font-black leading-[1.1] tracking-tight text-transparent opacity-15 dark:opacity-20"
            style={{
              backgroundImage:
                'radial-gradient(circle at center, currentColor 0 1px, transparent 1.6px), linear-gradient(to bottom, currentColor, transparent)',
              backgroundSize: '7px 7px, 100% 100%',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
            }}
          >
            AUTHENTRA
          </span>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <Footer />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DETAILED PRIVACY POLICY SECTIONS
   ───────────────────────────────────────────────────────────────────────────── */
function DetailedPrivacyContent() {
  return (
    <div>
      <section id="p1" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">1</span>
          <span>Executive Privacy Mandate & Zero-Trust Doctrine</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Authentra Foundation Labs LLC (&ldquo;Authentra,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) establishes this Enterprise Privacy Policy to govern all access to the Authentra digital asset custody platform, application programming interfaces (APIs), smart contracts, and verification endpoints.
          </p>
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Our protocol adheres to an absolute <strong className="font-semibold text-fg">zero-trust data minimization standard</strong>. Traditional enterprise SaaS systems operate as surveillance vectors, aggregating customer behavior, user profiling data, and telemetry. In stark contrast, Authentra is engineered so that custody operations, identity binding, and state transitions are mathematically proven through cryptographic digests rather than unencrypted personal records.
          </p>
        </div>
      </section>

      <section id="p2" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">2</span>
          <span>Dual-Layer Storage Architecture (Off-Chain vs. On-Chain)</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            To maintain rigorous data confidentiality while benefiting from blockchain immutability, Authentra segregates information across two distinct technological tiers:
          </p>
          <div className="overflow-x-auto rounded-xl border border-line/[0.08] bg-surface my-4">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-line/[0.08] text-fg-subtle bg-fg/[0.02]">
                  <th className="p-3.5">Data Category</th>
                  <th className="p-3.5">Storage Substrate</th>
                  <th className="p-3.5">Visibility Scope</th>
                  <th className="p-3.5">Retention Protocol</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/[0.06]">
                <tr>
                  <td className="p-3.5 font-semibold text-fg">Account Credentials</td>
                  <td className="p-3.5">PostgreSQL (Isolated Tenant)</td>
                  <td className="p-3.5">Confidential (Argon2id Hash Only)</td>
                  <td className="p-3.5">Purged on Tenant Deletion</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-fg">Identity & Wallet Bindings</td>
                  <td className="p-3.5">W3C DID Document & Aptos Ledger</td>
                  <td className="p-3.5">Public Pseudonymous DID Key</td>
                  <td className="p-3.5">Permanent Ledger Anchor</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-fg">Asset Metadata Details</td>
                  <td className="p-3.5">Encrypted Relational Store</td>
                  <td className="p-3.5">Restricted to Authorized RBAC Roles</td>
                  <td className="p-3.5">Tenant Managed Lifecycle</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-fg">Asset Integrity Anchor</td>
                  <td className="p-3.5">Aptos Move Smart Contract State</td>
                  <td className="p-3.5">Public (SHA-256 Digest Only)</td>
                  <td className="p-3.5">Immutable Blockchain State</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-semibold text-fg">Audit Journal Entries</td>
                  <td className="p-3.5">Append-Only Cryptographic Log</td>
                  <td className="p-3.5">Organization Auditors & Admins</td>
                  <td className="p-3.5">Append-Only Immutability</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-fg-subtle font-mono">
            Note: Raw PII, plaintext passwords, and private signing keys are strictly forbidden from on-chain storage by Move module validation assertions.
          </p>
        </div>
      </section>

      <section id="p3" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">3</span>
          <span>W3C DID Specification & Pseudonymous Key Rings</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Each Authentra account automatically derives a W3C Decentralized Identifier (<code className="font-mono text-xs text-fg bg-fg/[0.04] px-1.5 py-0.5 rounded">did:authentra:aptos:0x...</code>) from the user’s cryptographic Ed25519 public key. This identifier functions as an institutional pseudonym:
          </p>
          <ul className="space-y-2.5 list-disc pl-5">
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30">
              <strong className="font-semibold text-fg">Zero Third-Party Federation:</strong> We do not rely on centralized identity brokers, social authentication, or tracking beacons.
            </li>
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30">
              <strong className="font-semibold text-fg">Self-Sovereign Signature Authority:</strong> All custody transfers and state validations are signed using public key infrastructure natively verifiable by any node on the Aptos network.
            </li>
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30">
              <strong className="font-semibold text-fg">Cryptographic Public Resolvability:</strong> The DID Document exposes only standard verification methods and public keys conforming to W3C DID Core 1.0 recommendations.
            </li>
          </ul>
        </div>
      </section>

      <section id="p4" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">4</span>
          <span>Non-Existent Personal Data Monetization Guarantee</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Authentra never engages in data monetization. Specifically:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30">We never sell, rent, or trade institutional asset registries or identity maps.</li>
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30">We never inject behavioral analytics, ad tracking pixels, or cross-site tracking scripts.</li>
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30">We never train public machine learning models on private custody inventories or proprietary asset descriptions.</li>
          </ul>
        </div>
      </section>

      <section id="p5" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">5</span>
          <span>GDPR Article 17, CCPA & Immutable Ledger Realities</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            We explicitly address the intersection of decentralized technology and privacy regulations (including European GDPR Articles 15-22 and California CCPA/CPRA):
          </p>
          <p className="text-[15px] leading-[1.75] text-fg/80">
            When an organization requests account termination and data erasure (&ldquo;Right to be Forgotten&rdquo;), Authentra irrevocably purges all relational database entries, including user emails, names, hashed passwords, and unencrypted asset records.
          </p>
          <p className="text-[15px] leading-[1.75] text-fg/80">
            However, because the Aptos blockchain is a mathematically decentralized, append-only ledger, previously committed SHA-256 state anchors and transaction signatures cannot be removed or altered by any entity. Because these anchors consist solely of one-way mathematical digests with no personal identifiers, they do not constitute personal data under prevailing regulatory interpretations.
          </p>
        </div>
      </section>

      <section id="p6" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">6</span>
          <span>Cryptographic Salt Derivation & Key Lifetime</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Passwords submitted for session authentication are never stored in plaintext. They are processed using Argon2id with unique, cryptographically random 16-byte salts. Session tokens are issued as HMAC-SHA256 authenticated JSON Web Tokens with finite expiration windows, enforced client and server side.
          </p>
        </div>
      </section>

      <section id="p7" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">7</span>
          <span>Subprocessors & Infrastructure Provenance</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Authentra relies on a minimal, verified subprocessor stack audited for security and data compliance:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30"><strong className="font-semibold text-fg">Neon Inc.:</strong> Serverless PostgreSQL hosting with SOC 2 Type II certification, automated encryption-at-rest (AES-256), and dedicated tenant schema boundaries.</li>
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30"><strong className="font-semibold text-fg">Aptos Labs / Decentralized Validators:</strong> Public testnet and mainnet consensus network executing Move bytecode verifications.</li>
          </ul>
        </div>
      </section>

      <section id="p8" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">8</span>
          <span>Data Protection Officer (DPO) & Inquiries</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            For regulatory inquiries, compliance certifications, or Data Subject Access Requests (DSAR), please contact our Data Protection Office at <code className="font-mono text-xs text-fg bg-fg/[0.04] px-1.5 py-0.5 rounded">dpo@authentra.network</code>.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DETAILED TERMS OF SERVICE SECTIONS
   ───────────────────────────────────────────────────────────────────────────── */
function DetailedTermsContent() {
  return (
    <div>
      <section id="t1" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">1</span>
          <span>Parties & Binding Institutional Engagement</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            These Enterprise Terms of Service (&ldquo;Agreement&rdquo;) constitute an enforceable contract between Authentra Foundation Labs LLC and the enterprise or legal entity on whose behalf the workspace is registered (&ldquo;Customer,&rdquo; &ldquo;Organization,&rdquo; or &ldquo;You&rdquo;).
          </p>
          <p className="text-[15px] leading-[1.75] text-fg/80">
            By creating an organization workspace, initiating API transactions, or executing Move contract function calls, you represent that you possess the requisite corporate authority to bind your institution to these terms.
          </p>
        </div>
      </section>

      <section id="t2" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">2</span>
          <span>Deterministic State Machine & Lifecycle Invariance</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Customer acknowledges that Authentra enforces a <strong className="font-semibold text-fg">non-destructive, linear asset lifecycle</strong>:
          </p>
          <div className="rounded-xl border border-line/[0.08] bg-surface p-4 font-mono text-xs text-center space-x-2 text-fg my-3">
            <span className="text-fg-subtle">DRAFT</span>
            <span>→</span>
            <span className="text-accent">MINTED</span>
            <span>→</span>
            <span className="text-ok">ACTIVE (ASSIGNED)</span>
            <span>→</span>
            <span className="text-fg-muted">TRANSFERRED</span>
            <span>→</span>
            <span className="text-warn">REVOKED</span>
          </div>
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Once an asset is anchored on-chain, its ownership intervals are strictly append-only. Customer agrees not to attempt programmatic workarounds to delete historical custody records or falsify past custody assignments.
          </p>
        </div>
      </section>

      <section id="t3" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">3</span>
          <span>Sole Custodial Responsibility for Cryptographic Secrets</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Authentra operates non-custodially with respect to private signing keys. Customer retains exclusive control over, and responsibility for:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30">The safeguarding of private keys associated with bound Aptos wallet addresses.</li>
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30">All actions, transfers, and revocations validated by Customer’s cryptographic signatures.</li>
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30">Ensuring adequate key management procedures, hardware security modules (HSM), or multi-signature controls.</li>
          </ul>
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Under no circumstances does Authentra possess the capability to recover lost private keys or reverse transactions signed by Customer credentials.
          </p>
        </div>
      </section>

      <section id="t4" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">4</span>
          <span>Server-Side Anti-Escalation & Role Boundaries</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Customer accounts are subject to multi-tier Role-Based Access Control (RBAC): Admin, Manager, Auditor, and User. The protocol enforces server-side anti-escalation policies:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30">Administrators may not elevate their own permissions or bypass separation of duties.</li>
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30">Auditors possess read-only immutable access to event journals and cryptographic proofs.</li>
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30">Attempts to inject unauthorized privilege updates will trigger automated account suspension and security audit journaling.</li>
          </ul>
        </div>
      </section>

      <section id="t5" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">5</span>
          <span>Intellectual Property & Move Module Bytecode Rights</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Authentra retains all rights, title, and interest in and to the protocol codebase, user interface, brand assets, and proprietary smart contract implementations. Customer retains full ownership of all private metadata, asset registrations, and commercial property tracked through the platform.
          </p>
        </div>
      </section>

      <section id="t6" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">6</span>
          <span>Layer-1 Blockchain Throughput & Consensus Disclaimers</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            While Authentra’s relational API layer targets high-availability benchmarks (99.9% uptime SLA for enterprise plans), blockchain anchoring relies on the public, decentralized Aptos blockchain network. Authentra shall not be held liable for:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30">Fluctuations in Layer-1 gas fees or network execution costs.</li>
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30">Delays in transaction finality resulting from global blockchain network congestion.</li>
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30">Hard forks, validator pauses, or consensus interruptions on the underlying public Aptos network.</li>
          </ul>
        </div>
      </section>

      <section id="t7" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">7</span>
          <span>Limitation of Liability & Institutional Indemnification</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            To the maximum extent permitted by applicable law, neither Authentra nor its affiliates shall be liable for indirect, incidental, punitive, or consequential damages resulting from lost cryptographic keys, customer configuration errors, or unauthorized account access. Total cumulative liability under this Agreement is strictly limited to fees paid by Customer to Authentra in the twelve (12) months preceding the incident.
          </p>
        </div>
      </section>

      <section id="t8" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">8</span>
          <span>Governing Law & Dispute Resolution</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            This Agreement shall be governed by and construed in accordance with the laws of the State of Delaware, without regard to its conflict of law principles. Any dispute arising hereunder shall be resolved through confidential binding arbitration administered by the American Arbitration Association (AAA).
          </p>
        </div>
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DETAILED SECURITY ARCHITECTURE SECTIONS
   ───────────────────────────────────────────────────────────────────────────── */
function DetailedSecurityContent() {
  return (
    <div>
      <section id="s1" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">1</span>
          <span>Defense-in-Depth Cryptographic Overview</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Authentra’s security model is designed to withstand advanced persistent threats, nation-state side-channel attacks, and insider compromise. The architecture rejects the perimeter-defense assumption, operating on the principle that every subsystem must verify every state change independently.
          </p>
        </div>
      </section>

      <section id="s2" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">2</span>
          <span>Dual-Engine Consensus Verification Mechanics</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Our proprietary dual-consensus verification engine reconciles two fundamentally divergent computational paradigms before certifying digital asset veracity:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 font-mono text-xs">
            <div className="rounded-xl border border-line/[0.08] bg-surface p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-fg">
                <Database className="h-4 w-4 text-accent" />
                <span>RELATIONAL METADATA ENGINE</span>
              </div>
              <p className="text-fg-muted leading-relaxed">
                Provides millisecond indexing, rich JSON schema validation, multi-tenant isolation, and continuous ownership interval tracking.
              </p>
            </div>
            <div className="rounded-xl border border-line/[0.08] bg-surface p-4 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-fg">
                <Server className="h-4 w-4 text-accent" />
                <span>APTOS MOVE CONSENSUS ANCHOR</span>
              </div>
              <p className="text-fg-muted leading-relaxed">
                Provides bytecode-level resource linearity, immutable sequence anchoring, and Byzantine fault-tolerant ledger finality.
              </p>
            </div>
          </div>
          <p className="text-[15px] leading-[1.75] text-fg/80">
            During a verification pass (accessible via <code className="font-mono text-xs text-fg bg-fg/[0.04] px-1.5 py-0.5 rounded">/api/verification/verify/:id</code>), Authentra hashes the off-chain metadata, queries the Move module resource on Aptos, and calculates cryptographic equivalence. A verdict of <strong className="text-ok font-semibold">VERIFIED</strong> is emitted only if on-chain and off-chain states match with 100% mathematical fidelity.
          </p>
        </div>
      </section>

      <section id="s3" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">3</span>
          <span>RFC 9106 Argon2id Parameterization & Constant-Time Logic</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Authentra employs memory-hard Argon2id hashing for password authentication. Configured parameters deliberately exceed standard OWASP guidelines to render GPU/ASIC brute-force clusters economically unviable:
          </p>
          <div className="rounded-xl border border-line/[0.08] bg-surface p-4 font-mono text-xs space-y-1 text-fg my-3">
            <div>Argon2id.Type: Argon2id (RFC 9106 Section 3.2)</div>
            <div>MemoryCost: 65,536 KB (64 MB per hash evaluation)</div>
            <div>TimeCost: 3 iterations</div>
            <div>Parallelism: 1 thread per execution</div>
            <div>SaltLength: 16 cryptographically secure random bytes</div>
            <div>KeyLength: 32 bytes (256-bit derived output)</div>
          </div>
          <p className="text-[15px] leading-[1.75] text-fg/80">
            All password verifications utilize constant-time buffer comparisons (<code className="font-mono text-xs text-fg bg-fg/[0.04] px-1.5 py-0.5 rounded">crypto.timingSafeEqual</code>) to prevent timing-based side-channel analysis.
          </p>
        </div>
      </section>

      <section id="s4" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">4</span>
          <span>Aptos Move VM Formal Verification & Linear Resources</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Unlike legacy EVM contracts that are susceptible to reentrancy vulnerabilities and integer overflows, our smart contracts are written in Move. Move treats digital assets as first-class resources:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30"><strong className="font-semibold text-fg">Linear Type System:</strong> An asset resource can never be duplicated, copied, or accidentally dropped; it must be moved explicitly through validated protocol functions.</li>
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30"><strong className="font-semibold text-fg">Bytecode Verifier:</strong> Every Move bytecode module undergoes compile-time and deploy-time static analysis by the Aptos bytecode verifier, preventing memory corruption.</li>
          </ul>
        </div>
      </section>

      <section id="s5" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">5</span>
          <span>SHA-256 Metadata Anchor Merkle Derivations</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Digital asset records are anchored on-chain using standard FIPS 180-4 SHA-256 hashes of deterministic JSON metadata strings. Changing a single character in the asset name, specification, or custody interval recalculates a completely distinct root hash, triggering immediate state mismatch alerts.
          </p>
        </div>
      </section>

      <section id="s6" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">6</span>
          <span>Continuous Interval Ownership Validation</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Custody history is modeled as a chain of temporal intervals: <code className="font-mono text-xs text-fg bg-fg/[0.04] px-1.5 py-0.5 rounded">[validFrom, validTo]</code>. The protocol enforces that no two custody intervals for the same asset can overlap in time, eliminating dual-custodian disputes.
          </p>
        </div>
      </section>

      <section id="s7" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">7</span>
          <span>Penetration Testing & Vulnerability Disclosure</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            We operate a coordinated vulnerability disclosure program. White-hat security researchers may submit vulnerability proofs to <code className="font-mono text-xs text-fg bg-fg/[0.04] px-1.5 py-0.5 rounded">security@authentra.network</code> using our published PGP public key.
          </p>
        </div>
      </section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   DETAILED COMPLIANCE & STANDARDS SECTIONS
   ───────────────────────────────────────────────────────────────────────────── */
function DetailedComplianceContent() {
  return (
    <div>
      <section id="c1" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">1</span>
          <span>Standards Overview & Audit Charter</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Authentra provides enterprise asset issuers and custody institutions with an auditable technological framework meeting the requirements of financial regulators, sovereign identity standard bodies, and enterprise procurement boards.
          </p>
        </div>
      </section>

      <section id="c2" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">2</span>
          <span>SOC 2 Type II Trust Services Criteria Mapping</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            The architecture aligns with AICPA Trust Services Criteria:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 font-mono text-xs">
            <div className="rounded-xl border border-line/[0.08] bg-surface p-4 space-y-1.5">
              <div className="font-semibold text-fg">SECURITY (CC6)</div>
              <p className="text-fg-muted leading-relaxed">
                RBAC access enforcement, MFA token support, Argon2id storage, and network isolation at the API gateway layer.
              </p>
            </div>
            <div className="rounded-xl border border-line/[0.08] bg-surface p-4 space-y-1.5">
              <div className="font-semibold text-fg">AVAILABILITY (A1)</div>
              <p className="text-fg-muted leading-relaxed">
                Multi-region serverless relational replication combined with decentralized blockchain consensus failover.
              </p>
            </div>
            <div className="rounded-xl border border-line/[0.08] bg-surface p-4 space-y-1.5">
              <div className="font-semibold text-fg">PROCESSING INTEGRITY (PI1)</div>
              <p className="text-fg-muted leading-relaxed">
                Dual-consensus verification ensuring transactions are accurately authorized, hashed, and anchored without tampering.
              </p>
            </div>
            <div className="rounded-xl border border-line/[0.08] bg-surface p-4 space-y-1.5">
              <div className="font-semibold text-fg">CONFIDENTIALITY (C1)</div>
              <p className="text-fg-muted leading-relaxed">
                Tenant-isolated PostgreSQL schemas with zero plaintext storage of credentials or proprietary asset metadata on public ledgers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="c3" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">3</span>
          <span>W3C DID Core 1.0 Specification Conformance</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Authentra implements the W3C Decentralized Identifiers (DIDs) v1.0 standard (<code className="font-mono text-xs text-fg bg-fg/[0.04] px-1.5 py-0.5 rounded">did:authentra:aptos:&lt;account_address&gt;</code>). The implementation conforms to:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30">Deterministic Universal DID Resolution algorithms.</li>
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30">Standard verification methods: <code className="font-mono text-xs text-fg bg-fg/[0.04] px-1.5 py-0.5 rounded">Ed25519VerificationKey2020</code>.</li>
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30">W3C-compliant DID Document JSON-LD representations.</li>
          </ul>
        </div>
      </section>

      <section id="c4" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">4</span>
          <span>FIPS 180-4 & NIST Cryptographic Alignment</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            All cryptographic digests and signatures utilize approved algorithms:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30"><strong className="font-semibold text-fg">FIPS 180-4 Secure Hash Standard:</strong> SHA-256 for all metadata roots and hash pointers.</li>
            <li className="text-[15px] leading-[1.75] text-fg/80 marker:text-fg/30"><strong className="font-semibold text-fg">FIPS 186-4 Digital Signature Standard:</strong> Ed25519 (Edwards-curve Digital Signature Algorithm) for transaction signing.</li>
          </ul>
        </div>
      </section>

      <section id="c5" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">5</span>
          <span>Immutable Audit Journaling & Cryptographic Export</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            The protocol maintains a comprehensive audit journal tracking all user logins, role modifications, asset creations, transfers, and revocations. Each entry includes:
          </p>
          <div className="rounded-xl border border-line/[0.08] bg-surface p-4 font-mono text-xs space-y-1 text-fg my-3">
            <div>• Event UUID & ISO 8601 UTC Timestamp</div>
            <div>• Actor User ID, Email, & W3C DID</div>
            <div>• Action Type (e.g., ASSET_CREATE, CUSTODY_ASSIGN, ROLE_REVOKE)</div>
            <div>• Context Organization ID & Target Resource Payload</div>
            <div>• Aptos On-Chain Transaction Hash & Ledger Block Height</div>
          </div>
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Designated Compliance Officers and Institutional Auditors can export these records in structured JSON/CSV formats for regulatory filings.
          </p>
        </div>
      </section>

      <section id="c6" className="scroll-mt-28 border-t border-line/[0.08] py-10 first:border-t-0 first:pt-2">
        <h2 className="flex items-baseline gap-4 font-title text-[1.6rem] font-medium leading-tight tracking-tight text-fg">
          <span className="w-9 shrink-0 font-mono text-[13px] text-fg-subtle">6</span>
          <span>Third-Party Attestation & Continuous Assurance</span>
        </h2>
        <div className="mt-5 space-y-4 pl-0 sm:pl-[52px]">
          <p className="text-[15px] leading-[1.75] text-fg/80">
            Authentra engages independent cybersecurity auditing firms to conduct annual penetration tests and formal Move contract verifications. Audit reports are made available to enterprise customers under Mutual Non-Disclosure Agreement (MNDA).
          </p>
        </div>
      </section>
    </div>
  );
}
