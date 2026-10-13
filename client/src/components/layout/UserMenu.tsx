import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, ChevronDown, LogOut } from 'lucide-react';
import { UserProfile } from '../../types/auth.types';
import { Badge } from '../ui/Badge';
import { cn } from '../../lib/cn';

interface UserMenuProps {
  user: UserProfile;
  onLogout: () => void;
}

export function initialsOf(user: UserProfile): string {
  const first = user.firstName?.[0] ?? user.email[0];
  const last = user.lastName?.[0] ?? '';
  return `${first}${last}`.toUpperCase();
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const displayName = user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.email;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          'flex h-9 items-center gap-1.5 rounded-lg pl-1 pr-2 transition-colors duration-150 hover:bg-fg/[0.05]',
          open && 'bg-fg/[0.05]'
        )}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-fg text-[11px] font-semibold text-canvas">
          {initialsOf(user)}
        </span>
        <ChevronDown className={cn('h-3.5 w-3.5 text-fg-subtle transition-transform duration-200', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-72 overflow-hidden rounded-xl border border-line/10 bg-surface shadow-[0_16px_48px_-12px_rgba(0,0,0,0.5)]"
          >
            <div className="space-y-3 p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fg text-sm font-semibold text-canvas">
                  {initialsOf(user)}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-fg">{displayName}</div>
                  <div className="truncate text-xs text-fg-muted">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-fg-muted">
                <Building2 className="h-3.5 w-3.5 shrink-0 text-fg-subtle" />
                <span className="truncate">{user.organization?.name ?? 'Organization'}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {user.roles.map((role) => (
                  <Badge key={role}>
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="border-t border-line/[0.07] p-2">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-fg-muted transition-colors hover:bg-fg/[0.05] hover:text-fg"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
