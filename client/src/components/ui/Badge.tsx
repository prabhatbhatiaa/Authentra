import React from 'react';
import { cn } from '../../lib/cn';

export type Tone = 'neutral' | 'ok' | 'warn' | 'bad' | 'info' | 'accent';

const toneText: Record<Tone, string> = {
  neutral: 'text-fg-muted',
  ok: 'text-ok',
  warn: 'text-warn',
  bad: 'text-bad',
  info: 'text-info',
  accent: 'text-accent',
};

const toneDot: Record<Tone, string> = {
  neutral: 'bg-fg-subtle',
  ok: 'bg-ok',
  warn: 'bg-warn',
  bad: 'bg-bad',
  info: 'bg-info',
  accent: 'bg-accent',
};

interface BadgeProps {
  tone?: Tone;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Quiet status label: hairline outline, tinted text, optional square dot. */
export function Badge({ tone = 'neutral', dot, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center gap-1.5 whitespace-nowrap rounded-md border border-line/10 px-2 font-mono text-[11px]',
        toneText[tone],
        className
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-[1px]', toneDot[tone])} />}
      {children}
    </span>
  );
}

/** Tone for an asset lifecycle status. */
export function assetStatusTone(status: string): Tone {
  switch (status) {
    case 'ACTIVE':
      return 'ok';
    case 'MINTED':
      return 'info';
    case 'ASSIGNED':
    case 'TRANSFERRED':
      return 'accent';
    case 'REVOKED':
      return 'bad';
    default:
      return 'neutral';
  }
}

/** Tone for an audit / activity action string such as `ASSET_REVOKED`. */
export function actionTone(action: string): Tone {
  if (action.includes('REVOKE') || action.includes('DELETE') || action.includes('FAILED')) return 'bad';
  if (action.includes('MINT') || action.includes('CREATED') || action.includes('LOGIN')) return 'ok';
  if (action.includes('ASSIGN') || action.includes('TRANSFER')) return 'info';
  return 'neutral';
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={assetStatusTone(status)} dot>
      {status}
    </Badge>
  );
}

export function ActionBadge({ action }: { action: string }) {
  return <Badge tone={actionTone(action)}>{action}</Badge>;
}
