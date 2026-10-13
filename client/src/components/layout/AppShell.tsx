import React from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { UserProfile } from '../../types/auth.types';
import { Logo } from '../ui/Logo';
import { ThemeToggle } from '../ui/ThemeToggle';
import { UserMenu, initialsOf } from './UserMenu';
import { NavItem, TabId } from './nav';
import { cn } from '../../lib/cn';

export interface HealthData {
  status: string;
  service: string;
  version: string;
  environment: string;
  database?: {
    connected: boolean;
    provider: string;
    counts: {
      organizations: number;
      users: number;
      assets: number;
    };
  };
  timestamp: string;
}

interface AppShellProps {
  user: UserProfile;
  navItems: NavItem[];
  currentTab: TabId;
  onNavigate: (tab: TabId) => void;
  onLogout: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  health: HealthData | null;
  loadingHealth: boolean;
  children: React.ReactNode;
}

function SystemStatus({ health, loading }: { health: HealthData | null; loading: boolean }) {
  const online = !!health?.database?.connected;
  return (
    <span className="meta flex items-center gap-2">
      <span className={cn('h-1.5 w-1.5 rounded-full', loading ? 'bg-fg-subtle' : online ? 'bg-ok' : 'bg-warn')} />
      {loading ? 'Checking systems' : online ? 'All systems operational' : 'Database offline'}
    </span>
  );
}

/**
 * Console layout: a fixed full-height sidebar on desktop, and a compact top
 * bar plus bottom tab bar on smaller screens. Content always runs edge to
 * edge with the shared gutter — no centred max-width column.
 */
export function AppShell({
  user,
  navItems,
  currentTab,
  onNavigate,
  onLogout,
  isDark,
  onToggleTheme,
  health,
  loadingHealth,
  children,
}: AppShellProps) {
  const activeLabel = navItems.find((n) => n.id === currentTab)?.label ?? 'Overview';
  const displayName = user.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : user.email;

  return (
    <div className="min-h-screen lg:pl-[248px]">
      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-line/[0.08] bg-canvas lg:flex">
        <div className="flex h-14 items-center border-b border-line/[0.08] px-5">
          <Logo onClick={() => onNavigate('dashboard')} />
        </div>

        <div className="border-b border-line/[0.08] px-5 py-4">
          <div className="meta mb-1">Organization</div>
          <div className="truncate text-sm font-medium text-fg">{user.organization?.name ?? 'Workspace'}</div>
          <div className="meta truncate">{user.organization?.slug}</div>
        </div>

        <nav aria-label="Primary" className="flex-1 space-y-0.5 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex h-9 w-full items-center gap-3 rounded-md px-3 text-sm transition-colors duration-150',
                  active ? 'text-fg' : 'text-fg-muted hover:bg-fg/[0.03] hover:text-fg'
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-md bg-fg/[0.07]"
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
                <Icon className="relative h-4 w-4" />
                <span className="relative">{item.label}</span>
                {active && <span className="relative ml-auto h-1.5 w-1.5 rounded-full bg-accent" />}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-line/[0.08] p-3">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-fg text-[11px] font-semibold text-canvas">
              {initialsOf(user)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-fg">{displayName}</div>
              <div className="meta truncate">{user.roles.join(' · ')}</div>
            </div>
            <button type="button" onClick={onLogout} className="btn-icon h-8 w-8 border-transparent" title="Sign out" aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-line/[0.08] bg-canvas/85 backdrop-blur-md">
        <div className="gutter flex h-14 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="lg:hidden">
              <Logo onClick={() => onNavigate('dashboard')} />
            </div>
            <div className="hidden min-w-0 items-center gap-2 text-sm lg:flex">
              <span className="truncate text-fg-subtle">{user.organization?.name ?? 'Workspace'}</span>
              <span className="text-fg-subtle/60">/</span>
              <span className="text-fg">{activeLabel}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block">
              <SystemStatus health={health} loading={loadingHealth} />
            </div>
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
            <div className="lg:hidden">
              <UserMenu user={user} onLogout={onLogout} />
            </div>
          </div>
        </div>
      </header>

      {/* ── Page content ────────────────────────────────────── */}
      <main className="gutter flex min-h-[calc(100vh-3.5rem)] flex-col pb-28 pt-8 lg:pb-12 lg:pt-10">{children}</main>

      {/* ── Mobile / tablet bottom tab bar ──────────────────── */}
      <nav
        aria-label="Primary"
        className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-line/[0.08] bg-canvas/95 backdrop-blur-md lg:hidden"
      >
        <ul className="flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = currentTab === item.id;
            return (
              <li key={item.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex w-full flex-col items-center gap-1 pb-1.5 pt-2.5 text-[10.5px] transition-colors duration-150',
                    active ? 'text-fg' : 'text-fg-subtle'
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="tab-active"
                      className="absolute inset-x-4 top-0 h-px bg-fg"
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    />
                  )}
                  <Icon className="h-[18px] w-[18px]" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
