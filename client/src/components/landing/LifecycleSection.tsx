import { useEffect, useRef, useState } from 'react';
import { SectionLabel } from './SectionLabel';
import { cn } from '../../lib/cn';

const stages = [
  {
    key: 'DRAFT',
    title: 'Draft',
    body: 'Created off-chain with metadata, type and organization. Nothing is public yet.',
    api: 'POST /api/assets',
    chain: 'off-chain',
  },
  {
    key: 'MINTED',
    title: 'Minted',
    body: 'The metadata digest is anchored to Aptos. From here, the asset’s existence is publicly provable.',
    api: 'POST /api/assets/:id/mint',
    chain: 'asset::mint_asset',
  },
  {
    key: 'ACTIVE',
    title: 'Assigned',
    body: 'Custody is granted to a verified DID, opening the first ownership interval.',
    api: 'POST /api/assets/:id/assign',
    chain: 'asset::assign_asset',
  },
  {
    key: 'TRANSFERRED',
    title: 'Transferred',
    body: 'The current interval is sealed and a new one opens for the recipient. History is never overwritten.',
    api: 'POST /api/assets/:id/transfer',
    chain: 'asset::transfer_asset',
  },
  {
    key: 'REVOKED',
    title: 'Revoked',
    body: 'Terminal. Decommissioned on-chain — every verifier will report it as revoked.',
    api: 'POST /api/assets/:id/revoke',
    chain: 'asset::revoke_asset',
  },
];

/** Scroll-driven state machine: the row nearest the viewport centre is active. */
export function LifecycleSection() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.idx));
        }
      },
      { rootMargin: '-45% 0px -45% 0px' }
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="lifecycle" data-scene="helix" data-x="-0.5" data-y="0" data-scale="0.8" data-rx="0.18" className="relative">
      <SectionLabel index="03" label="Lifecycle" />
      <div className="gutter grid grid-cols-12 gap-y-12 py-20 lg:py-28">
        <div className="col-span-12 lg:col-span-6 lg:col-start-7">
          <h2 className="font-serif text-display-lg text-fg">Every state, on the record.</h2>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-fg-muted">
            Each transition is an API call, a Move function and an audit entry — in that order, every time.
          </p>

          <ol className="mt-14 border-t border-line/10">
            {stages.map((s, i) => (
              <li
                key={s.key}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                data-idx={i}
                className={cn(
                  'grid grid-cols-[2.5rem_1fr] border-b border-line/10 py-7 transition-opacity duration-500 ease-out',
                  active === i ? 'opacity-100' : 'opacity-35'
                )}
              >
                <span className="meta pt-2.5">0{i + 1}</span>
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-serif text-[40px] leading-none text-fg">{s.title}</h3>
                    <span className={cn('meta transition-colors', active === i && 'text-accent')}>{s.key}</span>
                  </div>
                  <p className="max-w-lg text-[15px] leading-relaxed text-fg-muted">{s.body}</p>
                  <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1">
                    <span className="meta text-fg">{s.api}</span>
                    <span className="meta">{s.chain}</span>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
