import React, { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  size?: 'sm' | 'md' | 'lg';
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Hide the default header (for fully custom content such as the auth card). */
  bare?: boolean;
  children: React.ReactNode;
}

const sizes = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
};

/**
 * Solid-surface dialog. Renders into a portal so page transforms never trap it,
 * closes on Escape / backdrop click, locks body scroll, and becomes a
 * bottom sheet on small screens.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  size = 'md',
  footer,
  className,
  bodyClassName,
  bare,
  children,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  useBodyScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const previouslyFocused = document.activeElement as HTMLElement | null;
    // Focus the panel so keyboard users land inside the dialog.
    const t = window.setTimeout(() => panelRef.current?.focus({ preventScroll: true }), 30);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-line/10 bg-surface shadow-[0_24px_80px_-20px_rgba(0,0,0,0.6)] outline-none sm:max-h-[86vh] sm:rounded-2xl',
              sizes[size],
              className
            )}
          >
            {/* Grab handle for the mobile sheet */}
            <div className="mx-auto mt-2.5 h-1 w-9 shrink-0 rounded-full bg-fg/15 sm:hidden" />

            {!bare && (title || Icon) && (
              <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-5 sm:px-7 sm:pt-7">
                <div className="flex min-w-0 items-start gap-3.5">
                  {Icon && (
                    <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line/10 text-fg-muted">
                      <Icon className="h-4 w-4" />
                    </span>
                  )}
                  <div className="min-w-0 space-y-1">
                    {title && (
                      <h2 id={titleId} className="font-serif text-[30px] leading-none tracking-[-0.015em] text-fg">
                        {title}
                      </h2>
                    )}
                    {description && <p className="text-sm leading-relaxed text-fg-muted">{description}</p>}
                  </div>
                </div>
                <button type="button" onClick={onClose} className="btn-icon -mr-1 -mt-1" aria-label="Close dialog">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {bare && (
              <button
                type="button"
                onClick={onClose}
                className="btn-icon absolute right-4 top-4 z-10"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            <div data-lenis-prevent className={cn('flex-1 overflow-y-auto', !bare && 'px-6 pb-6 pt-4 sm:px-7', bodyClassName)}>
              {children}
            </div>

            {footer && (
              <div className="flex flex-col-reverse gap-2.5 border-t border-line/[0.07] px-6 py-4 pb-safe sm:flex-row sm:justify-end sm:px-7 sm:pb-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
