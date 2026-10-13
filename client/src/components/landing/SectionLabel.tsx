import { cn } from '../../lib/cn';

/** Editorial section marker: `(02)  Architecture` on a full-width hairline. */
export function SectionLabel({ index, label, className }: { index: string; label: string; className?: string }) {
  return (
    <div className={cn('gutter flex items-center justify-between border-t border-line/10 py-4', className)}>
      <span className="meta">({index})</span>
      <span className="meta">{label}</span>
    </div>
  );
}
