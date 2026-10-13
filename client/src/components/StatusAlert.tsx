import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Loader2, X } from 'lucide-react';
import { cn } from '../lib/cn';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'pending';

interface StatusAlertProps {
  type: AlertType;
  title?: string;
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

const styles: Record<AlertType, { wrap: string; icon: React.ReactNode; title: string }> = {
  success: {
    wrap: 'border-ok/20 bg-ok/[0.07]',
    title: 'text-ok',
    icon: <CheckCircle2 className="h-4 w-4 text-ok" />,
  },
  error: {
    wrap: 'border-bad/20 bg-bad/[0.07]',
    title: 'text-bad',
    icon: <AlertCircle className="h-4 w-4 text-bad" />,
  },
  warning: {
    wrap: 'border-warn/25 bg-warn/[0.07]',
    title: 'text-warn',
    icon: <AlertTriangle className="h-4 w-4 text-warn" />,
  },
  info: {
    wrap: 'border-info/20 bg-info/[0.07]',
    title: 'text-info',
    icon: <Info className="h-4 w-4 text-info" />,
  },
  pending: {
    wrap: 'border-line/10 bg-fg/[0.04]',
    title: 'text-fg',
    icon: <Loader2 className="h-4 w-4 animate-spin text-accent" />,
  },
};

export const StatusAlert: React.FC<StatusAlertProps> = ({ type, title, message, onDismiss, onRetry }) => {
  const current = styles[type];

  return (
    <motion.div
      role={type === 'error' ? 'alert' : 'status'}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex items-start justify-between gap-3 rounded-lg border px-4 py-3.5',
        current.wrap
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="mt-0.5 shrink-0">{current.icon}</span>
        <div className="min-w-0 space-y-0.5">
          {title && <div className={cn('text-sm font-semibold', current.title)}>{title}</div>}
          <div className="break-words text-[13px] leading-relaxed text-fg-muted">{message}</div>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {onRetry && (
          <button type="button" onClick={onRetry} className="btn-ghost btn-sm px-3 py-1">
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex h-7 w-7 items-center justify-center rounded-full text-fg-subtle transition-colors hover:bg-fg/[0.06] hover:text-fg"
            aria-label="Dismiss"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
