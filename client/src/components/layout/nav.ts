import { Boxes, CheckCheck, FileText, Fingerprint, LayoutDashboard, Shield, type LucideIcon } from 'lucide-react';

export type TabId = 'dashboard' | 'identity' | 'assets' | 'verify' | 'audit' | 'admin';

export interface NavItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
}

export const TAB_IDS: TabId[] = ['dashboard', 'identity', 'assets', 'verify', 'audit', 'admin'];

export function isTabId(value: string): value is TabId {
  return (TAB_IDS as string[]).includes(value);
}

export function getNavItems(canAdminister: boolean): NavItem[] {
  return [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'identity', label: 'Identity', icon: Fingerprint },
    { id: 'assets', label: 'Assets', icon: Boxes },
    { id: 'verify', label: 'Verify', icon: CheckCheck },
    { id: 'audit', label: 'Audit', icon: FileText },
    ...(canAdminister ? [{ id: 'admin' as const, label: 'Admin', icon: Shield }] : []),
  ];
}
