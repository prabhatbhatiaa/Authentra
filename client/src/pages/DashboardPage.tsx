import React, { useEffect, useState } from 'react';
import {
  Shield,
  Fingerprint,
  Boxes,
  Link,
  Activity,
  Plus,
  Search,
  Users,
  FileText,
  ExternalLink,
  RefreshCw,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { UserProfile } from '../types/auth.types';

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
  onNavigate: (tab: 'identity' | 'assets' | 'verify' | 'audit' | 'admin') => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ user, onNavigate }) => {
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

  const getActionBadge = (action: string) => {
    if (action.includes('REVOKE')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-500/10 text-red-400 border border-red-500/20">
          {action}
        </span>
      );
    }
    if (action.includes('MINT') || action.includes('CREATED')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          {action}
        </span>
      );
    }
    if (action.includes('ASSIGN') || action.includes('TRANSFER')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
          {action}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full text-left">
      {/* Executive Welcome Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-1">
            <Activity className="w-3.5 h-3.5" />
            <span>Task 14: Executive Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <span>{user.organization.name}</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {user.organization.slug}
            </span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm font-mono">
            DID: <span className="text-emerald-400">{user.identity?.did || 'Generating...'}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchMetrics}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Action Dock */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('assets')}
          className="p-4 rounded-xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-emerald-400 mb-2">
            <Plus className="w-5 h-5" />
            <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="font-semibold text-white text-sm">Create Asset</div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">Draft & mint tokens</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('verify')}
          className="p-4 rounded-xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-emerald-400 mb-2">
            <Search className="w-5 h-5" />
            <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="font-semibold text-white text-sm">Verify Asset</div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">Dual state proof</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('admin')}
          className="p-4 rounded-xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-emerald-400 mb-2">
            <Users className="w-5 h-5" />
            <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="font-semibold text-white text-sm">Manage Access</div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">RBAC & permissions</div>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('audit')}
          className="p-4 rounded-xl bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 text-left transition-all group"
        >
          <div className="flex items-center justify-between text-slate-400 group-hover:text-emerald-400 mb-2">
            <FileText className="w-5 h-5" />
            <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="font-semibold text-white text-sm">View Audit</div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">Immutable journal</div>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        {/* Total Assets */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-emerald-400" /> TOTAL ASSETS
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">Registry</span>
          </div>
          <div className="text-3xl font-bold text-white font-sans">{data?.assets.total ?? '-'}</div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span>Active: <strong className="text-emerald-400">{data?.assets.active ?? 0}</strong></span>
            <span>Revoked: <strong className="text-red-400">{data?.assets.revoked ?? 0}</strong></span>
          </div>
        </div>

        {/* Cryptographic Identities */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Fingerprint className="w-4 h-4 text-emerald-400" /> IDENTITIES
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">W3C DID</span>
          </div>
          <div className="text-3xl font-bold text-white font-sans">{data?.identity.activeIdentities ?? '-'}</div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span>Verified: <strong className="text-emerald-400">{data?.identity.verifiedIdentities ?? 0}</strong></span>
            <span>Accounts: <strong className="text-slate-300">{data?.identity.totalUsers ?? 0}</strong></span>
          </div>
        </div>

        {/* Blockchain Network */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Link className="w-4 h-4 text-emerald-400" /> APTOS NETWORK
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                data?.blockchain.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`}
            />
          </div>
          <div className="text-2xl font-bold text-white font-sans uppercase">
            {data?.blockchain.network ?? 'Aptos'}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-800/60">
            <span>Block: <strong className="text-slate-300">{data?.blockchain.blockHeight ? `#${data.blockchain.blockHeight.slice(-5)}` : '-'}</strong></span>
            <span>Epoch: <strong className="text-slate-300">{data?.blockchain.epoch ?? '-'}</strong></span>
          </div>
        </div>

        {/* User Roles & Permissions */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" /> YOUR PRIVILEGES
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">RBAC</span>
          </div>
          <div className="text-lg font-bold text-white font-sans flex flex-wrap gap-1.5">
            {user.roles.map((r) => (
              <span key={r} className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {r}
              </span>
            ))}
          </div>
          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-800/60">
            <span>Active Permissions: <strong className="text-emerald-400">{user.permissions.length} granted</strong></span>
          </div>
        </div>
      </div>

      {/* Two-Column Activity & Transactions Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Audit Activity (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>RECENT SYSTEM ACTIVITY</span>
            </span>
            <button
              type="button"
              onClick={() => onNavigate('audit')}
              className="text-slate-400 hover:text-emerald-400 text-[11px] flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((act) => (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      {getActionBadge(act.action)}
                      <span className="text-slate-400 text-[11px]">{act.entity}</span>
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Actor: <span className="font-sans text-white">{act.actorName}</span>
                    </div>
                  </div>
                  <div className="text-right text-[10px] text-slate-500 shrink-0">
                    <Clock className="w-3 h-3 inline mr-1 opacity-60" />
                    {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-500">No activity recorded yet.</div>
            )}
          </div>
        </div>

        {/* Recent On-Chain Transactions (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="font-semibold text-white flex items-center gap-2">
              <Link className="w-4 h-4 text-emerald-400" />
              <span>ON-CHAIN TRANSACTIONS</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
              {data?.blockchain.totalTransactions ?? 0} total
            </span>
          </div>

          <div className="space-y-2.5">
            {data?.recentTransactions && data.recentTransactions.length > 0 ? (
              data.recentTransactions.map((tx) => (
                <div
                  key={tx.txHash}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-white">{tx.txType}</span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20">
                      {tx.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="truncate max-w-[150px]">{tx.txHash}</span>
                    <a
                      href={`https://explorer.aptoslabs.com/txn/${tx.txHash}?network=testnet`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 hover:underline flex items-center gap-0.5"
                    >
                      <span>Explorer</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-slate-500">
                No on-chain transactions broadcasted yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
