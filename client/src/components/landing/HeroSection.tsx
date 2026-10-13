import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  blockHeight: string | null;
  onOpenAuth: (mode: 'login' | 'register') => void;
  onNavigate: (id: string) => void;
}

const ease = [0.16, 1, 0.3, 1] as const;
const lines = ['Custody', 'you can', 'prove.'];

export function HeroSection({ blockHeight, onOpenAuth, onNavigate }: HeroSectionProps) {
  const facts = [
    { k: 'Network', v: 'Aptos Testnet' },
    { k: 'Ledger height', v: blockHeight ?? 'Syncing…' },
    { k: 'Identity standard', v: 'W3C DID v1.0' },
  ];

  return (
    <section
      data-scene="sphere"
      data-x="0.5"
      data-y="0.16"
      data-scale="0.74"
      data-rx="0.32"
      data-mobile-opacity="0.9"
      className="relative flex min-h-[100svh] flex-col pt-16"
    >
      {/* Top meta row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="gutter flex items-center justify-between py-5"
      >
        <span className="meta">Identity · Access · Custody · Audit</span>
        <span className="meta hidden items-center gap-2 sm:flex">
          <span className="live-dot" /> Live on Aptos
        </span>
      </motion.div>

      {/* Headline anchored bottom-left; the 3D object occupies the right half */}
      <div className="gutter flex flex-1 items-end pb-8 pt-24 sm:pt-32 md:pt-16 lg:pb-12">
        <h1 className="font-serif text-[clamp(3.5rem,min(9.5vw,16vh),10.5rem)] leading-[0.88] tracking-[-0.035em] text-fg text-left">
          {lines.map((line, i) => (
            <span key={line} className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
              <motion.span
                className={i === 2 ? 'block italic' : 'block'}
                initial={{ y: '102%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, ease, delay: 0.15 + i * 0.07 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
      </div>

      {/* Bottom rail */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.45 }}
        className="grid grid-cols-2 border-t border-line/10 lg:grid-cols-12"
      >
        <div className="gutter col-span-2 space-y-5 py-6 lg:col-span-6 lg:py-7">
          <p className="max-w-xl text-[17px] leading-relaxed text-fg-muted">
            Authentra binds decentralized identities, role-based access and digital-asset lifecycles to the Aptos
            ledger — so every issuance, transfer and revocation can be verified by anyone, forever.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => onOpenAuth('register')} className="btn-primary btn-lg">
              Open the console <ArrowRight className="arrow h-4 w-4" />
            </button>
            <button type="button" onClick={() => onNavigate('verify')} className="btn-secondary btn-lg">
              Verify an asset
            </button>
          </div>
        </div>
        {facts.map((f, i) => (
          <div
            key={f.k}
            className={`gutter flex flex-col justify-between gap-6 border-t border-line/10 py-6 lg:col-span-2 lg:border-l lg:border-t-0 lg:py-7 ${
              i === 2 ? 'col-span-2 lg:col-span-2' : i === 1 ? 'border-l' : ''
            }`}
          >
            <span className="meta">{f.k}</span>
            <span className="font-serif text-[28px] leading-none tabular text-fg">{f.v}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
