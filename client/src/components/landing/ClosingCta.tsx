import { ArrowRight } from 'lucide-react';
import { Reveal } from '../ui/Reveal';

interface ClosingCtaProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export function ClosingCta({ onOpenAuth }: ClosingCtaProps) {
  return (
    <section
      data-scene="vault"
      data-x="0"
      data-y="0"
      data-scale="1.05"
      data-opacity="0.58"
      data-mobile-opacity="0.28"
      data-rx="0.32"
      data-spin="0.04"
      className="relative flex min-h-[85svh] flex-col items-center justify-center border-t border-line/10 py-16 text-center"
    >
      <Reveal className="gutter relative">
        {/* Soft feathered blur halo so centered text stays crisp over the 3D vault */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-6 -inset-y-10 -z-10 bg-canvas/65 backdrop-blur-md"
          style={{
            maskImage: 'radial-gradient(ellipse at center, black 32%, transparent 74%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 32%, transparent 74%)',
          }}
        />
        <p className="meta mb-6">(06) Begin</p>
        <h2 className="font-serif text-display-xl text-fg">
          Start proving
          <br />
          what you hold.
        </h2>
        <p className="mx-auto mt-6 max-w-md text-[16px] leading-relaxed text-fg-muted">
          Create an organization in seconds. Your DID and Aptos wallet binding are derived automatically.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
          <button type="button" onClick={() => onOpenAuth('register')} className="btn-primary btn-lg">
            Create a workspace <ArrowRight className="arrow h-4 w-4" />
          </button>
          <button type="button" onClick={() => onOpenAuth('login')} className="btn-secondary btn-lg bg-canvas/60">
            Sign in
          </button>
        </div>
      </Reveal>
    </section>
  );
}
