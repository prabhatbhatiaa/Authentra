import { Reveal } from '../ui/Reveal';
import { SectionLabel } from './SectionLabel';
import { cn } from '../../lib/cn';

const capabilities = [
  {
    title: 'Self-sovereign identity',
    body: 'Decentralized identifiers derived from Aptos Ed25519 accounts, each with a machine-readable DID document anyone can resolve.',
    specs: ['W3C DID v1.0', 'Public resolver', 'Verification states'],
  },
  {
    title: 'Server-enforced RBAC',
    body: 'Admin, Manager, Auditor and User roles map to twelve permissions. Every route checks them; self-escalation is blocked.',
    specs: ['12 permissions', '4 system roles', 'HTTP 403 by default'],
  },
  {
    title: 'Linear custody',
    body: 'Ownership is a chain of timestamped intervals. Transfers seal the previous one instead of overwriting it.',
    specs: ['validFrom / validTo', 'Non-destructive', 'Move-anchored'],
  },
  {
    title: 'Dual verification',
    body: 'The database, the ledger and the digest must agree before any asset is declared verified — and the result says which check failed.',
    specs: ['VERIFIED · MISMATCH', 'UNANCHORED · REVOKED', 'Public endpoint'],
  },
  {
    title: 'Forensic audit trail',
    body: 'Logins, role changes, transfers and contract calls are journaled with actor and transaction hash, and on-chain events are indexed back idempotently.',
    specs: ['Append-only', 'Aptos indexer', 'Filterable'],
  },
  {
    title: 'Hardened by default',
    body: 'Argon2id password hashing, HMAC-SHA256 sessions, Helmet headers, Zod validation and dual-tier rate limiting, with strict tenant isolation.',
    specs: ['RFC 9106', 'Rate limited', 'Multi-tenant'],
  },
];

export function CapabilitiesSection() {
  return (
    <section id="capabilities" data-scene="lattice" data-x="0" data-y="0" data-scale="1.15" data-opacity="0.2" data-rx="0.6" className="relative">
      <SectionLabel index="04" label="Platform" />
      <div className="gutter grid grid-cols-12 gap-y-4 pb-10 pt-14 lg:pt-20">
        <Reveal className="col-span-12 lg:col-span-8">
          <h2 className="font-serif text-display-lg text-fg">Everything an institution needs to prove custody.</h2>
        </Reveal>
      </div>
      <div className="grid grid-cols-1 border-t border-line/10 md:grid-cols-2 xl:grid-cols-3">
        {capabilities.map((c, i) => (
          <Reveal
            key={c.title}
            delay={(i % 3) * 0.05}
            className={cn(
              'group gutter flex min-h-[260px] flex-col justify-between gap-8 border-b border-line/10 bg-canvas/80 py-6 transition-colors duration-300 hover:bg-surface',
              // Vertical hairlines: 2 columns on tablet, 3 on desktop.
              i % 2 === 1 && 'md:max-xl:border-l',
              i % 3 !== 0 && 'xl:border-l'
            )}
          >
            <div className="flex items-start justify-between">
              <span className="meta">0{i + 1}</span>
              <span className="h-1.5 w-1.5 bg-fg/20 transition-colors duration-300 group-hover:bg-accent" />
            </div>
            <div className="space-y-4">
              <h3 className="text-xl font-medium tracking-[-0.015em] text-fg">{c.title}</h3>
              <p className="max-w-md text-[15px] leading-relaxed text-fg-muted">{c.body}</p>
              <ul className="flex flex-wrap gap-x-5 gap-y-1 pt-2">
                {c.specs.map((s) => (
                  <li key={s} className="meta">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
