import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ExternalLink, Plus, RefreshCw } from 'lucide-react';
import { UserProfile } from '../types/auth.types';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { StatusAlert } from '../components/StatusAlert';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { ActionBadge } from '../components/ui/Badge';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { CopyButton } from '../components/ui/CopyButton';
import { TabId } from '../components/layout/nav';
import { formatRelative, greeting, truncateMiddle } from '../lib/format';
import { cn } from '../lib/cn';

interface DashboardData {
  identity: {
    totalUsers: number;
    activeIdentities: number;
    verifiedIdentities: number;
  };
  assets: {
    total: number;
    draft: number;
    minted: number;
    active: number;
    transferred: number;
    revoked: number;
  };
  blockchain: {
    network: string;
    moduleAddress: string;
    connected: boolean;
    blockHeight: string | null;
    epoch: string | null;
    totalTransactions: number;
  };
  recentTransactions: Array<{
    txHash: string;
    txType: string;
    status: string;
    blockHeight: string | null;
    submittedAt: string;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    entity: string;
    actorName: string;
    actorEmail: string;
    createdAt: string;
  }>;
}

interface DashboardPageProps {
  user: UserProfile;
  canAdminister?: boolean;
  onNavigate: (tab: TabId) => void;
}

const lifecycleSegments = [
  { key: 'draft', label: 'Draft', className: 'bg-fg/25' },
  { key: 'minted', label: 'Minted', className: 'bg-info' },
  { key: 'active', label: 'Active', className: 'bg-ok' },
  { key: 'transferred', label: 'Transferred', className: 'bg-accent' },
  { key: 'revoked', label: 'Revoked', className: 'bg-bad' },
] as const;

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, canAdminister = false, onNavigate }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem('authentra_token');

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard/metrics', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.error?.message || 'Failed to load executive metrics.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error loading dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const firstName = user.firstName || user.email.split('@')[0];
  const assetTotal = data?.assets.total ?? 0;

  const kpis: Array<{ label: string; value: number | null | undefined; sub: React.ReactNode }> = [
    {
      label: 'Assets under custody',
      value: data?.assets.total,
      sub: `${data?.assets.active ?? 0} active · ${data?.assets.revoked ?? 0} revoked`,
    },
    {
      label: 'Identities',
      value: data?.identity.totalUsers,
      sub: `${data?.identity.verifiedIdentities ?? 0} verified DIDs`,
    },
    {
      label: 'Ledger height',
      value: data?.blockchain.blockHeight ? Number(data.blockchain.blockHeight) : null,
      sub: `Epoch ${data?.blockchain.epoch ?? '—'} · ${(data?.blockchain.network ?? '—').toUpperCase()}`,
    },
    {
      label: 'On-chain transactions',
      value: data?.blockchain.totalTransactions,
      sub: data?.blockchain.connected ? 'Aptos connected' : loading ? 'Connecting…' : 'Aptos unreachable',
    },
  ];

  const shortcuts: Array<{ tab: TabId; title: string; caption: string }> = [
    { tab: 'assets', title: 'Issue an asset', caption: 'Draft, then anchor on Aptos' },
    { tab: 'verify', title: 'Verify an asset', caption: 'Cross-layer parity check' },
    canAdminister
      ? { tab: 'admin', title: 'Manage access', caption: 'Roles and permissions' }
      : { tab: 'identity', title: 'View my identity', caption: 'DID document' },
    { tab: 'audit', title: 'Open audit log', caption: 'Append-only history' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={user.organization?.slug ?? 'workspace'}
        title="Overview"
        description={
          <>
            {greeting()}, {firstName}. Custody across {user.organization?.name || 'your organization'}, reconciled
            between PostgreSQL and the Aptos ledger.
          </>
        }
        meta={
          user.identity?.did && (
            <span className="inline-flex max-w-full items-center gap-1 rounded-md border border-line/10 py-0.5 pl-2.5 pr-0.5 font-mono text-[12px] text-fg-muted">
              <span className="truncate">{truncateMiddle(user.identity.did, 24, 6)}</span>
              <CopyButton value={user.identity.did} size="sm" label="Copy DID" />
            </span>
          )
        }
        actions={
          <>
            <button type="button" onClick={fetchMetrics} className="btn-icon h-10 w-10" title="Refresh" aria-label="Refresh metrics">
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </button>
            <button type="button" onClick={() => onNavigate('assets')} className="btn-primary">
              <Plus className="h-4 w-4" /> Issue asset
            </button>
          </>
        }
      />

      {error && (
        <StatusAlert type="error" title="Telemetry alert" message={error} onRetry={fetchMetrics} onDismiss={() => setError(null)} />
      )}

      {/* KPI strip */}
      <section className="card grid grid-cols-2 overflow-hidden xl:grid-cols-4">
        {kpis.map((k, i) => (
          <div
            key={k.label}
            className={cn(
              'flex min-h-[148px] flex-col justify-between gap-6 p-5',
              i % 2 === 1 && 'border-l border-line/[0.08]',
              i >= 2 && 'border-t border-line/[0.08] xl:border-t-0',
              i === 2 && 'xl:border-l'
            )}
          >
            <span className="text-[13px] text-fg-muted">{k.label}</span>
            <div>
              {loading && !data ? (
                <div className="skeleton h-11 w-24" />
              ) : (
                <AnimatedNumber
                  value={k.value ?? null}
                  duration={0.9}
                  className="block truncate font-serif text-[clamp(1.6rem,3.4vw,3.25rem)] leading-none tabular text-fg"
                />
              )}
              <div className="meta mt-2 truncate">{k.sub}</div>
            </div>
          </div>
        ))}
      </section>

      {/* Lifecycle distribution */}
      <Panel title="Lifecycle distribution" action={<span className="meta">{assetTotal} assets</span>}>
        <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-fg/[0.06]">
          {data &&
            assetTotal > 0 &&
            lifecycleSegments.map((seg) => {
              const v = data.assets[seg.key];
              if (!v) return null;
              return (
                <div
                  key={seg.key}
                  className={cn('h-full transition-[width] duration-700 ease-out first:rounded-l-full last:rounded-r-full', seg.className)}
                  style={{ width: `${(v / assetTotal) * 100}%` }}
                  title={`${seg.label}: ${v}`}
                />
              );
            })}
        </div>
        <dl className="mt-5 grid grid-cols-3 gap-y-4 sm:grid-cols-5">
          {lifecycleSegments.map((seg) => (
            <div key={seg.key}>
              <dt className="flex items-center gap-2 text-[13px] text-fg-muted">
                <span className={cn('h-2 w-2 rounded-[2px]', seg.className)} />
                {seg.label}
              </dt>
              <dd className="mt-1 font-serif text-[28px] leading-none tabular text-fg">{data ? data.assets[seg.key] : '—'}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Activity */}
        <Panel
          className="xl:col-span-8"
          title="Recent operations"
          padded={false}
          action={
            <button type="button" onClick={() => onNavigate('audit')} className="btn-ghost btn-sm -mr-2">
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          }
        >
          {loading && !data ? (
            <div className="p-5">
              <TableSkeleton rows={5} cols={3} />
            </div>
          ) : data?.recentActivity && data.recentActivity.length > 0 ? (
            <ul className="divide-y divide-line/[0.06]">
              {data.recentActivity.slice(0, 8).map((act) => (
                <li key={act.id} className="flex flex-col gap-1.5 px-5 py-3.5 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <ActionBadge action={act.action} />
                    <span className="truncate text-sm text-fg">{act.entity}</span>
                  </div>
                  <span className="truncate text-[13px] text-fg-subtle sm:w-56">{act.actorEmail || act.actorName || 'System'}</span>
                  <span className="meta shrink-0 sm:w-20 sm:text-right">{formatRelative(act.createdAt)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-12 text-center text-sm text-fg-subtle">No operations recorded yet.</p>
          )}
        </Panel>

        <div className="space-y-6 xl:col-span-4">
          <Panel title="Shortcuts" padded={false}>
            <ul className="divide-y divide-line/[0.06]">
              {shortcuts.map((s) => (
                <li key={s.tab}>
                  <button
                    type="button"
                    onClick={() => onNavigate(s.tab)}
                    className="group flex w-full items-center justify-between gap-3 px-5 py-3.5 text-left transition-colors duration-150 hover:bg-fg/[0.03]"
                  >
                    <span>
                      <span className="block text-sm text-fg">{s.title}</span>
                      <span className="block text-[13px] text-fg-subtle">{s.caption}</span>
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-fg-subtle transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-fg" />
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Latest transactions" padded={false}>
            {loading && !data ? (
              <div className="p-5">
                <TableSkeleton rows={3} cols={3} />
              </div>
            ) : data?.recentTransactions && data.recentTransactions.length > 0 ? (
              <ul className="divide-y divide-line/[0.06]">
                {data.recentTransactions.slice(0, 4).map((tx) => (
                  <li key={tx.txHash} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm text-fg">{tx.txType}</div>
                      <div className="meta">{truncateMiddle(tx.txHash, 10, 6)}</div>
                    </div>
                    <a
                      href={`https://explorer.aptoslabs.com/txn/${tx.txHash}?network=testnet`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-icon h-8 w-8 border-transparent"
                      title="Open in Aptos Explorer"
                      aria-label="Open in Aptos Explorer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-8 text-center text-sm text-fg-subtle">No transactions anchored yet.</p>
            )}
          </Panel>

          <Panel title="Consensus node">
            <dl className="-my-2.5">
              <div className="kv">
                <dt>Aptos fullnode</dt>
                <dd className={data?.blockchain.connected ? 'text-ok' : 'text-warn'}>
                  {data?.blockchain.connected ? 'Testnet online' : 'Unavailable'}
                </dd>
              </div>
              <div className="kv">
                <dt>Module</dt>
                <dd className="font-mono text-[13px]">{truncateMiddle(data?.blockchain.moduleAddress, 6, 4) || '—'}</dd>
              </div>
              <div className="kv">
                <dt>Hashing</dt>
                <dd>SHA-256 · Argon2id</dd>
              </div>
              <div className="kv">
                <dt>Relational store</dt>
                <dd>PostgreSQL · Prisma</dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  );
};
