import React from 'react';
import { cn } from '../../lib/cn';

interface PageHeaderProps {
  /** Short context line above the title, e.g. "Identity". */
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}

/** Console page header: serif title, muted description, actions on the right. */
export function PageHeader({ eyebrow, title, description, actions, meta, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        'flex animate-fade-in flex-col gap-5 border-b border-line/[0.08] pb-6 lg:flex-row lg:items-end lg:justify-between',
        className
      )}
    >
      <div className="min-w-0 space-y-2.5">
        {eyebrow && <div className="meta flex items-center gap-2">{eyebrow}</div>}
        <h1 className="font-serif text-display-md text-fg">{title}</h1>
        {description && <p className="max-w-2xl text-[15px] leading-relaxed text-fg-muted">{description}</p>}
        {meta && <div className="flex flex-wrap items-center gap-2 pt-1">{meta}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
