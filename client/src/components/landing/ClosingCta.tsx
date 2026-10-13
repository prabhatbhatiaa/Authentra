import { ArrowRight } from 'lucide-react';
import { Reveal } from '../ui/Reveal';

interface ClosingCtaProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export function ClosingCta({ onOpenAuth }: ClosingCtaProps) {
  return (
    <section
      data-scene="sphere"
      data-x="0"
      data-y="0"
      data-scale="0.95"
      data-opacity="0.45"
      data-rx="0.3"
      className="relative flex min-h-[100svh] flex-col items-center justify-center border-t border-line/10 py-24 text-center"
    >
      <Reveal className="gutter">
        <p className="meta mb-8">(06) Begin</p>
        <h2 className="font-serif text-display-xl text-fg">
          Start proving
          <br />
          what you hold.
        </h2>
        <p className="mx-auto mt-8 max-w-md text-[17px] leading-relaxed text-fg-muted">
          Create an organization in seconds. Your DID and Aptos wallet binding are derived automatically.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-2 sm:flex-row">
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
