import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Loader2, X } from 'lucide-react';

export type AlertType = 'success' | 'error' | 'warning' | 'info' | 'pending';

interface StatusAlertProps {
  type: AlertType;
  title?: string;
  message: string;
  onDismiss?: () => void;
  onRetry?: () => void;
}

export const StatusAlert: React.FC<StatusAlertProps> = ({
  type,
  title,
  message,
  onDismiss,
  onRetry,
}) => {
  const styles: Record<AlertType, { border: string; bg: string; text: string; icon: React.ReactNode }> = {
    success: {
      border: 'border-emerald-500/25',
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      icon: <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />,
    },
    error: {
      border: 'border-rose-500/25',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      icon: <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />,
    },
    warning: {
      border: 'border-amber-500/25',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      icon: <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />,
    },
    info: {
      border: 'border-sky-500/25',
      bg: 'bg-sky-500/10',
      text: 'text-sky-400',
      icon: <AlertCircle className="w-4 h-4 shrink-0 text-sky-400" />,
    },
    pending: {
      border: 'border-slate-700',
      bg: 'bg-slate-900',
      text: 'text-slate-300',
      icon: <Loader2 className="w-4 h-4 shrink-0 text-emerald-400 animate-spin" />,
    },
  };

  const current = styles[type];

  return (
    <div
      className={`p-3.5 rounded-xl border ${current.border} ${current.bg} flex items-start justify-between gap-3 text-xs transition-all`}
    >
      <div className="flex items-start gap-2.5">
        {current.icon}
        <div className="space-y-0.5">
          {title && <div className={`font-semibold ${current.text}`}>{title}</div>}
          <div className="text-slate-300 leading-relaxed font-mono text-[11px]">{message}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-mono border border-slate-700 transition-colors"
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
