import { Reveal } from '../ui/Reveal';

const primitives = [
  {
    n: '01',
    title: 'Identity',
    body: 'Every user receives a W3C Decentralized Identifier derived from an Aptos account.',
    detail: 'did:authentra:aptos',
  },
  {
    n: '02',
    title: 'Access',
    body: 'Twelve permissions across four roles, enforced on every request — server-side.',
    detail: 'RBAC · anti-escalation',
  },
  {
    n: '03',
    title: 'Custody',
    body: 'Assets move through a non-destructive state machine with append-only ownership intervals.',
    detail: 'Draft → Revoked',
  },
  {
    n: '04',
    title: 'Audit',
    body: 'Every action is journaled with actor, timestamp and the Aptos transaction that anchors it.',
    detail: 'Append-only ledger',
  },
];

/** The four primitives, as a full-width hairline grid directly under the hero. */
export function PrimitivesStrip() {
  return (
    <section id="protocol" className="relative grid grid-cols-1 border-t border-line/10 sm:grid-cols-2 lg:grid-cols-4">
      {primitives.map((p, i) => (
        <Reveal
          key={p.n}
          delay={i * 0.05}
          className={`gutter flex min-h-[260px] flex-col justify-between gap-10 border-line/10 bg-canvas/70 py-7 transition-colors duration-300 hover:bg-fg/[0.03] ${
            i > 0 ? 'border-t sm:border-t-0' : ''
          } ${i % 2 === 1 ? 'sm:border-l' : ''} ${i >= 2 ? 'sm:border-t lg:border-t-0' : ''} ${i > 0 ? 'lg:border-l' : ''}`}
        >
          <span className="meta">{p.n}</span>
          <div className="space-y-3">
            <h3 className="font-serif text-[40px] leading-none text-fg">{p.title}</h3>
            <p className="max-w-xs text-[15px] leading-relaxed text-fg-muted">{p.body}</p>
            <p className="meta pt-1 text-fg">{p.detail}</p>
          </div>
        </Reveal>
      ))}
    </section>
  );
}
