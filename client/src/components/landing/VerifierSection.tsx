import { InteractiveVerifierPreview } from '../InteractiveVerifierPreview';
import { Reveal } from '../ui/Reveal';
import { SectionLabel } from './SectionLabel';

const checks = [
  'Resolves the asset and its custodian in PostgreSQL',
  'Reads the anchored resource from the Aptos Move module',
  'Recomputes the SHA-256 metadata digest',
  'Walks every ownership interval in order',
];

export function VerifierSection() {
  return (
    <section id="verify" data-scene="none" className="relative bg-canvas">
      <SectionLabel index="05" label="Verify" />
      <div className="gutter grid grid-cols-12 gap-x-8 gap-y-10 py-14 lg:py-20">
        <div className="col-span-12 lg:col-span-4">
          <Reveal>
            <h2 className="font-serif text-display-lg text-fg">Don’t trust. Verify.</h2>
          </Reveal>
          <Reveal delay={0.05}>
            <p className="mt-4 max-w-sm text-[16px] leading-relaxed text-fg-muted">
              This is the real, public verification endpoint. No account required.
            </p>
          </Reveal>
          <ul className="mt-8 border-t border-line/10">
            {checks.map((c, i) => (
              <li key={c} className="grid grid-cols-[2.5rem_1fr] border-b border-line/10 py-3 text-[14px] text-fg-muted">
                <span className="meta pt-0.5">0{i + 1}</span>
                {c}
              </li>
            ))}
          </ul>
        </div>
        <Reveal delay={0.08} className="col-span-12 lg:col-span-8">
          <InteractiveVerifierPreview />
        </Reveal>
      </div>
    </section>
  );
}
