import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRightLeft,
  Ban,
  Boxes,
  Fingerprint,
  History,
  KeyRound,
  Landmark,
  Plus,
  RefreshCw,
  ScrollText,
  Search,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { StatusAlert } from '../components/StatusAlert';
import { PageHeader } from '../components/ui/PageHeader';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/Badge';
import { formatDateTime, truncateMiddle } from '../lib/format';
import { cn } from '../lib/cn';

interface Asset {
  id: string;
  assetNumber: number;
  name: string;
  description: string | null;
  assetType: string;
  status: 'DRAFT' | 'MINTED' | 'ASSIGNED' | 'ACTIVE' | 'TRANSFERRED' | 'REVOKED';
  createdAt: string;
  currentOwner?: {
    id: string;
    did: string;
    walletAddress: string;
    user?: { firstName: string; lastName: string; email: string };
  };
}

interface OwnershipRecord {
  id: string;
  status: string;
  validFrom: string;
  validTo: string | null;
  notes: string | null;
  identity: {
    did: string;
    walletAddress: string;
    user?: { firstName: string; lastName: string; email: string };
  };
}

type ActionKind = 'assign' | 'transfer' | 'revoke';

const ASSET_TYPES = ['SECURITY_TOKEN', 'IDENTITY_CREDENTIAL', 'ACCESS_BADGE', 'COMPLIANCE_CERT'];
const STATUS_FILTERS = ['ALL', 'DRAFT', 'MINTED', 'ACTIVE', 'TRANSFERRED', 'REVOKED'] as const;

const typeIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  SECURITY_TOKEN: Landmark,
  IDENTITY_CREDENTIAL: Fingerprint,
  ACCESS_BADGE: KeyRound,
  COMPLIANCE_CERT: ScrollText,
};

const actionCopy: Record<ActionKind, { title: string; icon: React.ComponentType<{ className?: string }> }> = {
  assign: { title: 'Assign custody', icon: UserPlus },
  transfer: { title: 'Transfer custody', icon: ArrowRightLeft },
  revoke: { title: 'Revoke asset', icon: Ban },
};

function AssetGlyph({ type }: { type: string }) {
  const Icon = typeIcon[type] ?? Boxes;
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-line/[0.08] text-fg-muted">
      <Icon className="h-[18px] w-[18px]" />
    </span>
  );
}

function custodianName(owner: Asset['currentOwner']) {
  if (!owner) return null;
  return owner.user ? `${owner.user.firstName} ${owner.user.lastName}` : 'Registered DID';
}

export const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState<ActionKind | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [historyRecords, setHistoryRecords] = useState<OwnershipRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('SECURITY_TOKEN');
  const [targetIdentityId, setTargetIdentityId] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // View filters (client-side)
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>('ALL');
  const [search, setSearch] = useState('');

  const token = localStorage.getItem('authentra_token');

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/assets', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAssets(data.data.assets);
      } else {
        setError(data.error?.message || 'Failed to fetch assets.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error fetching assets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName,
          description: newDesc,
          assetType: newType,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Asset "${data.data.asset.name}" created successfully.`);
        setShowCreateModal(false);
        setNewName('');
        setNewDesc('');
        fetchAssets();
      } else {
        setError(data.error?.message || 'Failed to create asset.');
      }
    } catch (err: any) {
      setError(err.message || 'Error executing asset creation.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleMint = async (asset: Asset) => {
    setActionSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/assets/${asset.id}/mint`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reason: 'Initial protocol issuance on Aptos Testnet',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Asset #${asset.assetNumber} anchored & minted.`);
        fetchAssets();
      } else {
        setError(data.error?.message || 'Failed to mint asset.');
      }
    } catch (err: any) {
      setError(err.message || 'Error executing asset mint.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !showActionModal) return;

    setActionSubmitting(true);
    setError(null);

    let endpoint = '';
    const bodyData: Record<string, string> = { reason: actionReason };

    if (showActionModal === 'assign') {
      endpoint = `/api/assets/${selectedAsset.id}/assign`;
      bodyData.identityId = targetIdentityId;
    } else if (showActionModal === 'transfer') {
      endpoint = `/api/assets/${selectedAsset.id}/transfer`;
      bodyData.toIdentityId = targetIdentityId;
    } else if (showActionModal === 'revoke') {
      endpoint = `/api/assets/${selectedAsset.id}/revoke`;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Asset #${selectedAsset.assetNumber} updated: ${showActionModal.toUpperCase()}`);
        setShowActionModal(null);
        setTargetIdentityId('');
        setActionReason('');
        setSelectedAsset(null);
        fetchAssets();
      } else {
        setError(data.error?.message || `Action ${showActionModal} failed.`);
      }
    } catch (err: any) {
      setError(err.message || 'Network error processing state transition.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleViewHistory = async (asset: Asset) => {
    setSelectedAsset(asset);
    setHistoryRecords([]);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/assets/${asset.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data.asset.ownershipHistory) {
        setHistoryRecords(data.data.asset.ownershipHistory);
      }
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const openAction = (asset: Asset, kind: ActionKind) => {
    setSelectedAsset(asset);
    setShowActionModal(kind);
  };

  const closeAction = () => {
    setShowActionModal(null);
    setTargetIdentityId('');
    setActionReason('');
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { ALL: assets.length };
    for (const a of assets) c[a.status] = (c[a.status] ?? 0) + 1;
    return c;
  }, [assets]);

  const visibleAssets = useMemo(() => {
    const q = search.trim().toLowerCase();
    return assets.filter((a) => {
      if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
      if (!q) return true;
      return (
        a.name.toLowerCase().includes(q) ||
        String(a.assetNumber).includes(q.replace('#', '')) ||
        a.assetType.toLowerCase().includes(q) ||
        (a.currentOwner?.did ?? '').toLowerCase().includes(q)
      );
    });
  }, [assets, statusFilter, search]);

  /** Lifecycle buttons, shared by the table and the mobile cards. */
  const renderLifecycleActions = (asset: Asset, compact = false) => (
    <div className={cn('flex flex-wrap items-center gap-1.5', !compact && 'justify-end')}>
      {asset.status === 'DRAFT' && (
        <button
          type="button"
          onClick={() => handleMint(asset)}
          disabled={actionSubmitting}
          className="btn-primary btn-sm"
        >
          <Sparkles className="h-3.5 w-3.5" /> Mint
        </button>
      )}
      {(asset.status === 'MINTED' || asset.status === 'DRAFT') && (
        <button
          type="button"
          onClick={() => openAction(asset, 'assign')}
          className="btn-secondary btn-sm"
        >
          Assign
        </button>
      )}
      {asset.status === 'ACTIVE' && (
        <button
          type="button"
          onClick={() => openAction(asset, 'transfer')}
          className="btn-secondary btn-sm"
        >
          Transfer
        </button>
      )}
      {asset.status !== 'REVOKED' && (
        <button
          type="button"
          onClick={() => openAction(asset, 'revoke')}
          className="btn-ghost btn-sm text-bad hover:bg-bad/10 hover:text-bad"
        >
          Revoke
        </button>
      )}
      <button
        type="button"
        onClick={() => handleViewHistory(asset)}
        className={compact ? 'btn-secondary btn-sm' : 'btn-icon h-8 w-8'}
        title="View ownership history"
        aria-label="View ownership history"
      >
        <History className="h-3.5 w-3.5" />
        {compact && 'History'}
      </button>
    </div>
  );

  const ActionIcon = showActionModal ? actionCopy[showActionModal].icon : undefined;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Custody registry"
        title="Assets"
        description="Govern digital asset lifecycles, anchor state to Aptos Move contracts, and audit every custody transfer."
        actions={
          <>
            <button
              type="button"
              onClick={fetchAssets}
              className="btn-icon h-10 w-10"
              title="Refresh assets"
              aria-label="Refresh assets"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </button>
            <button type="button" onClick={() => setShowCreateModal(true)} className="btn-primary">
              <Plus className="h-4 w-4" />
              Create asset
            </button>
          </>
        }
      />

      {actionSuccess && (
        <StatusAlert
          type="success"
          title="Operation confirmed"
          message={actionSuccess}
          onDismiss={() => setActionSuccess(null)}
        />
      )}

      {error && (
        <StatusAlert
          type="error"
          title="Asset registry alert"
          message={error}
          onRetry={fetchAssets}
          onDismiss={() => setError(null)}
        />
      )}

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:px-0">
          {STATUS_FILTERS.map((s) => {
            const active = statusFilter === s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'flex h-8 shrink-0 items-center gap-2 rounded-md border px-3 text-[13px] transition-colors duration-150',
                  active
                    ? 'border-transparent bg-fg text-canvas'
                    : 'border-line/[0.08] bg-fg/[0.03] text-fg-muted hover:border-line/[0.16] hover:text-fg'
                )}
              >
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
                <span className={cn('tabular', active ? 'text-canvas/60' : 'text-fg-subtle')}>{counts[s] ?? 0}</span>
              </button>
            );
          })}
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-fg-subtle" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, #number, DID…"
            className="input rounded-full pl-10"
            aria-label="Search assets"
          />
        </div>
      </div>

      {/* ── Registry ────────────────────────────────────────────── */}
      <section className="card overflow-hidden rounded-xl">
        {loading && assets.length === 0 ? (
          <div className="p-6">
            <TableSkeleton rows={5} cols={5} />
          </div>
        ) : assets.length === 0 ? (
          <div className="p-4 sm:p-6">
            <EmptyState
              icon={Boxes}
              title="No digital assets yet"
              description="Nothing is registered in this organization. Create a draft asset to begin its Aptos lifecycle."
              actionLabel="Create asset"
              onAction={() => setShowCreateModal(true)}
            />
          </div>
        ) : visibleAssets.length === 0 ? (
          <div className="p-4 sm:p-6">
            <EmptyState
              icon={Search}
              title="No matching assets"
              description="Nothing matches the current filter and search. Clear them to see the full registry."
              actionLabel="Clear filters"
              onAction={() => {
                setStatusFilter('ALL');
                setSearch('');
              }}
            />
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Custodian</th>
                    <th className="text-right">Lifecycle</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleAssets.map((asset) => (
                    <tr key={asset.id}>
                      <td>
                        <div className="flex items-center gap-3.5">
                          <AssetGlyph type={asset.assetType} />
                          <div className="min-w-0">
                            <div className="truncate font-medium text-fg">{asset.name}</div>
                            <div className="max-w-[320px] truncate text-xs text-fg-subtle">
                              <span className="font-mono">#{asset.assetNumber}</span>
                              {' · '}
                              {asset.description || 'No description provided'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="font-mono text-[11px] text-fg-muted">{asset.assetType}</span>
                      </td>
                      <td>
                        <StatusBadge status={asset.status} />
                      </td>
                      <td>
                        {asset.currentOwner ? (
                          <div className="min-w-0">
                            <div className="text-sm text-fg">{custodianName(asset.currentOwner)}</div>
                            <div className="max-w-[200px] truncate font-mono text-[10.5px] text-fg-subtle">
                              {truncateMiddle(asset.currentOwner.did, 20, 6)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm italic text-fg-subtle">Unassigned</span>
                        )}
                      </td>
                      <td>
                        {renderLifecycleActions(asset)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <ul className="divide-y divide-line/[0.06] md:hidden">
              {visibleAssets.map((asset) => (
                <li key={asset.id} className="space-y-4 p-4">
                  <div className="flex items-start gap-3">
                    <AssetGlyph type={asset.assetType} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate font-medium text-fg">{asset.name}</div>
                        <StatusBadge status={asset.status} />
                      </div>
                      <div className="mt-0.5 truncate font-mono text-[11px] text-fg-subtle">
                        #{asset.assetNumber} · {asset.assetType}
                      </div>
                    </div>
                  </div>
                  <div className="well flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs">
                    <span className="text-fg-subtle">Custodian</span>
                    {asset.currentOwner ? (
                      <span className="min-w-0 truncate text-right text-fg">{custodianName(asset.currentOwner)}</span>
                    ) : (
                      <span className="italic text-fg-subtle">Unassigned</span>
                    )}
                  </div>
                  {renderLifecycleActions(asset, true)}
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-line/[0.06] px-5 py-3.5 text-xs text-fg-subtle">
              <span>
                Showing <span className="text-fg">{visibleAssets.length}</span> of {assets.length}
              </span>
              <span className="hidden font-mono sm:inline">DRAFT → MINTED → ACTIVE → TRANSFERRED → REVOKED</span>
            </div>
          </>
        )}
      </section>

      {/* ── Create asset ────────────────────────────────────────── */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create digital asset"
        description="Initialize a new enterprise asset in DRAFT state."
        icon={Plus}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label" htmlFor="asset-name">
              Asset name
            </label>
            <input
              id="asset-name"
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Sovereign Treasury Bond #402"
              className="input"
            />
          </div>
          <div>
            <span className="label">Asset type</span>
            <div className="grid grid-cols-2 gap-2">
              {ASSET_TYPES.map((t) => {
                const Icon = typeIcon[t];
                const active = newType === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setNewType(t)}
                    aria-pressed={active}
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg border px-3 py-3 text-left text-xs transition-all duration-300',
                      active
                        ? 'border-fg/40 bg-fg/[0.04] text-fg'
                        : 'border-line/10 bg-fg/[0.02] text-fg-muted hover:border-line/20'
                    )}
                  >
                    <Icon className={cn('h-4 w-4 shrink-0', active && 'text-fg')} />
                    <span className="truncate font-mono text-[10.5px]">{t}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="label" htmlFor="asset-desc">
              Description
            </label>
            <textarea
              id="asset-desc"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Asset specifications and governance notes…"
              className="input h-24 resize-none"
            />
          </div>
          <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={actionSubmitting} className="btn-primary">
              {actionSubmitting ? 'Creating…' : 'Initialize asset'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Assign / transfer / revoke ──────────────────────────── */}
      <Modal
        open={!!showActionModal && !!selectedAsset}
        onClose={closeAction}
        title={showActionModal ? actionCopy[showActionModal].title : ''}
        icon={ActionIcon}
        description={
          selectedAsset &&
          (showActionModal === 'revoke'
            ? `Permanently decommission #${selectedAsset.assetNumber} and seal its ownership intervals.`
            : `Update custody intervals for #${selectedAsset.assetNumber} · ${selectedAsset.name}.`)
        }
      >
        <form onSubmit={handleActionSubmit} className="space-y-4">
          {showActionModal !== 'revoke' && (
            <div>
              <label className="label" htmlFor="target-identity">
                Target identity ID (UUID)
              </label>
              <input
                id="target-identity"
                type="text"
                required
                value={targetIdentityId}
                onChange={(e) => setTargetIdentityId(e.target.value)}
                placeholder="Enter target identity UUID"
                className="input font-mono text-xs"
              />
            </div>
          )}
          <div>
            <label className="label" htmlFor="action-reason">
              {showActionModal === 'revoke' ? 'Revocation rationale' : 'Compliance notes'}
            </label>
            <textarea
              id="action-reason"
              required
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              placeholder="Audit trail verification notes…"
              className="input h-24 resize-none"
            />
          </div>
          {showActionModal === 'revoke' && (
            <StatusAlert
              type="warning"
              message="Revocation is permanent and recorded on the Aptos ledger. It cannot be undone."
            />
          )}
          <div className="flex flex-col-reverse gap-2.5 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={closeAction} className="btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionSubmitting}
              className={showActionModal === 'revoke' ? 'btn-danger' : 'btn-primary'}
            >
              {actionSubmitting ? 'Submitting…' : `Confirm ${showActionModal ?? ''}`}
            </button>
          </div>
        </form>
      </Modal>

      {/* ── Ownership history ───────────────────────────────────── */}
      <Modal
        open={showHistoryModal && !!selectedAsset}
        onClose={() => setShowHistoryModal(false)}
        size="lg"
        icon={History}
        title="Ownership chain"
        description={selectedAsset ? `#${selectedAsset.assetNumber} · ${selectedAsset.name}` : undefined}
      >
        {historyLoading ? (
          <TableSkeleton rows={3} cols={3} />
        ) : historyRecords.length === 0 ? (
          <p className="py-10 text-center text-sm text-fg-subtle">No ownership intervals recorded yet.</p>
        ) : (
          <ol className="relative space-y-4 pl-7">
            <span className="absolute bottom-2 left-[9px] top-2 w-px bg-line/15" />
            {historyRecords.map((rec, idx) => (
              <li key={rec.id} className="relative">
                <span
                  className={cn(
                    'absolute -left-7 top-4 flex h-[19px] w-[19px] items-center justify-center rounded-full border bg-canvas',
                    rec.validTo ? 'border-line/15' : 'border-accent/50'
                  )}
                >
                  <span className={cn('h-2 w-2 rounded-full', rec.validTo ? 'bg-fg-subtle' : 'bg-accent')} />
                </span>
                <div className="well space-y-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="meta">
                      Interval #{historyRecords.length - idx}
                    </span>
                    <StatusBadge status={rec.status} />
                  </div>
                  <div className="text-sm font-medium text-fg">
                    {rec.identity.user
                      ? `${rec.identity.user.firstName} ${rec.identity.user.lastName}`
                      : 'Cryptographic DID'}
                  </div>
                  <div className="break-all font-mono text-[10.5px] text-fg-subtle">{rec.identity.did}</div>
                  <div className="flex flex-col gap-1 border-t border-line/[0.06] pt-2 text-xs text-fg-muted sm:flex-row sm:justify-between">
                    <span>From {formatDateTime(rec.validFrom)}</span>
                    <span>{rec.validTo ? `To ${formatDateTime(rec.validTo)}` : 'Present · active'}</span>
                  </div>
                  {rec.notes && <p className="font-serif text-[15px] italic text-fg-muted">“{rec.notes}”</p>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Modal>
    </div>
  );
};
