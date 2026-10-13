import React from 'react';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-line/[0.12] px-6 py-14 text-center sm:py-16">
      <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-lg border border-line/10 bg-fg/[0.04] text-fg-muted">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="font-serif text-2xl tracking-[-0.01em] text-fg">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-fg-muted">{description}</p>
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="btn-primary btn-sm mt-6 px-5 py-2">
          {actionLabel}
        </button>
      )}
    </div>
  );
};
