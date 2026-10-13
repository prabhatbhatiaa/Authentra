import { cn } from '../../lib/cn';

interface LogoProps {
  className?: string;
  withWordmark?: boolean;
  onClick?: () => void;
}

/** Authentra mark: a seal ring around a signal point — an identity anchored to a ledger. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn('h-6 w-6', className)}>
      <circle cx="12" cy="12" r="9.25" className="stroke-fg" strokeWidth="1.75" />
      <circle cx="12" cy="12" r="3" className="fill-accent" />
    </svg>
  );
}

export function Logo({ className, withWordmark = true, onClick }: LogoProps) {
  const content = (
    <>
      <LogoMark className="h-[22px] w-[22px]" />
      {withWordmark && <span className="text-[16px] font-semibold tracking-[-0.03em] text-fg">Authentra</span>}
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} aria-label="Authentra home" className={cn('flex items-center gap-2', className)}>
        {content}
      </button>
    );
  }
  return <div className={cn('flex items-center gap-2', className)}>{content}</div>;
}
