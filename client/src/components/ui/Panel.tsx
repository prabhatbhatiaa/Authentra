import React from 'react';
import { cn } from '../../lib/cn';

interface PanelProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  title?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  padded?: boolean;
  bodyClassName?: string;
}

/** Solid content card with an optional titled header row. */
export function Panel({
  title,
  icon: Icon,
  action,
  padded = true,
  className,
  bodyClassName,
  children,
  ...rest
}: PanelProps) {
  return (
    <section className={cn('card overflow-hidden', className)} {...rest}>
      {(title || action) && (
        <div className="flex h-12 items-center justify-between gap-3 border-b border-line/[0.07] px-5">
          <div className="flex min-w-0 items-center gap-2">
            {Icon && <Icon className="h-4 w-4 shrink-0 text-fg-subtle" />}
            <h2 className="truncate text-sm font-medium text-fg">{title}</h2>
          </div>
          {action}
        </div>
      )}
      <div className={cn(padded && 'p-5', bodyClassName)}>{children}</div>
    </section>
  );
}
