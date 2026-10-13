import { Reveal } from '../ui/Reveal';
import { SectionLabel } from './SectionLabel';

const steps = [
  {
    n: 'A',
    title: 'Ingest',
    body: 'Sessions, identities and asset records land in PostgreSQL through Prisma — indexed, tenant-scoped and fast enough for live dashboards.',
    spec: 'PostgreSQL · Prisma · Zod',
  },
  {
    n: 'B',
    title: 'Reconcile',
    body: 'Each asset’s metadata is reduced to a deterministic SHA-256 digest: the fingerprint both layers must agree on.',
    spec: 'SHA-256 digest',
  },
  {
    n: 'C',
    title: 'Anchor',
    body: 'Move modules for identity, access and assets commit the transition to Aptos, where it can never be quietly rewritten.',
    spec: 'identity.move · access.move · asset.move',
  },
];

export function ArchitectureSection() {
  return (
    <section id="architecture" data-scene="layers" data-x="0.5" data-y="0" data-scale="0.82" data-rx="0.62" className="relative">
      <SectionLabel index="02" label="Architecture" />
      <div className="gutter grid grid-cols-12 gap-y-14 py-20 lg:min-h-[120vh] lg:py-28">
        <div className="col-span-12 lg:col-span-5">
          <Reveal>
            <h2 className="font-serif text-display-lg text-fg">Two engines. One verifiable truth.</h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-fg-muted">
              Applications read from a relational core at database speed. Aptos Move bytecode guarantees that what
              was recorded is exactly what happened.
            </p>
          </Reveal>

          <ol className="mt-14 border-t border-line/10">
            {steps.map((s, i) => (
              <Reveal as="li" key={s.n} delay={i * 0.06} className="grid grid-cols-[2.5rem_1fr] border-b border-line/10 py-6">
                <span className="meta pt-1.5">{s.n}</span>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium tracking-[-0.01em] text-fg">{s.title}</h3>
                  <p className="text-[15px] leading-relaxed text-fg-muted">{s.body}</p>
                  <p className="meta pt-1 text-fg">{s.spec}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
