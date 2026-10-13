import React, { useEffect, useState, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  RefreshCw,
  Shield,
  Terminal,
  UserRound,
  Waypoints,
} from 'lucide-react';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';
import { StatusAlert } from '../components/StatusAlert';
import { PageHeader } from '../components/ui/PageHeader';
import { Modal } from '../components/ui/Modal';
import { ActionBadge } from '../components/ui/Badge';
import { JsonView } from '../components/ui/JsonView';
import { CopyButton } from '../components/ui/CopyButton';
import { formatDateTime, formatRelative, truncateMiddle } from '../lib/format';
import { cn } from '../lib/cn';

interface AuditEventItem {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  actor: {
    id: string;
    name: string;
    email: string;
    did: string | null;
    walletAddress: string | null;
  } | null;
  ipAddress: string | null;
  userAgent: string | null;
  transaction: {
    txHash: string;
    txType: string;
    status: string;
    blockHeight: string | null;
  } | null;
  metadata: Record<string, any> | null;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export const AuditPage: React.FC = () => {
  const [events, setEvents] = useState<AuditEventItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Available filter options fetched from the backend
  const [actionsList, setActionsList] = useState<string[]>([]);
  const [entitiesList, setEntitiesList] = useState<string[]>([]);

  // Selected filter states
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedEntity, setSelectedEntity] = useState<string>('ALL');
  const [selectedEvent, setSelectedEvent] = useState<AuditEventItem | null>(null);

  // Blockchain indexer sync state
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const token = localStorage.getItem('authentra_token');

  const handleSyncBlockchain = async () => {
    setSyncing(true);
    setSyncNotice(null);
    try {
      const res = await fetch('/api/blockchain/sync', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setSyncNotice(
          `Aptos sync complete: ${data.data.syncedEventsCount} events, ${data.data.newTransactionsIndexed} txs indexed (${data.data.skippedDuplicates} duplicates skipped).`
        );
        fetchAuditLogs(1);
        fetchMetadata();
      } else {
        setSyncNotice(data.error?.message || 'Sync failed.');
      }
    } catch (err: any) {
      setSyncNotice(err.message || 'Network error during sync.');
    } finally {
      setSyncing(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const res = await fetch('/api/audit/metadata', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.data) {
        setActionsList(data.data.actions || []);
        setEntitiesList(data.data.entities || []);
      }
    } catch {
      // Non-critical, filter dropdowns will still have default choices
    }
  };

  const fetchAuditLogs = useCallback(
    async (targetPage = 1) => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({
          page: String(targetPage),
          limit: '15',
        });

        if (selectedAction !== 'ALL') queryParams.append('action', selectedAction);
        if (selectedEntity !== 'ALL') queryParams.append('entity', selectedEntity);

        const res = await fetch(`/api/audit?${queryParams.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success && data.data) {
          setEvents(data.data.events);
          setPagination(data.data.pagination);
        } else {
          setError(data.error?.message || 'Failed to retrieve audit records.');
        }
      } catch (err: any) {
        setError(err.message || 'Network error fetching audit trail.');
      } finally {
        setLoading(false);
      }
    },
    [token, selectedAction, selectedEntity]
  );

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchAuditLogs(1);
  }, [fetchAuditLogs]);

  const filtersActive = selectedAction !== 'ALL' || selectedEntity !== 'ALL';

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Append-only journal"
        title="Audit log"
        description="A tamper-evident chronological journal of actor identities, role transitions, custody intervals and Aptos Move executions."
        actions={
          <>
            <button
              type="button"
              onClick={() => fetchAuditLogs(pagination.page)}
              className="btn-icon h-10 w-10"
              title="Refresh audit log"
              aria-label="Refresh audit log"
            >
              <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            </button>
            <button
              type="button"
              onClick={handleSyncBlockchain}
              disabled={syncing}
              className="btn-primary"
              title="Index on-chain Aptos events into PostgreSQL"
            >
              <Waypoints className={cn('h-4 w-4', syncing && 'animate-pulse')} />
              {syncing ? 'Syncing…' : 'Sync Aptos events'}
            </button>
          </>
        }
      />

      {syncNotice && (
        <StatusAlert type="info" title="Indexer" message={syncNotice} onDismiss={() => setSyncNotice(null)} />
      )}

      {/* ── Filters ─────────────────────────────────────────────── */}
      <div className="card flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <span className="flex items-center gap-2 text-sm font-medium text-fg">
            <Filter className="h-4 w-4 text-fg-subtle" /> Filter
          </span>
          <div className="grid grid-cols-2 gap-2.5 sm:flex">
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="input py-2 text-xs sm:w-52"
              aria-label="Filter by action"
            >
              <option value="ALL">All actions</option>
              {actionsList.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="input py-2 text-xs sm:w-44"
              aria-label="Filter by entity"
            >
              <option value="ALL">All entities</option>
              {entitiesList.map((ent) => (
                <option key={ent} value={ent}>
                  {ent}
                </option>
              ))}
            </select>
          </div>
          {filtersActive && (
            <button
              type="button"
              onClick={() => {
                setSelectedAction('ALL');
                setSelectedEntity('ALL');
              }}
              className="btn-ghost btn-sm self-start sm:self-auto"
            >
              Clear
            </button>
          )}
        </div>
        <div className="text-sm text-fg-subtle">
          <span className="font-serif text-2xl text-fg tabular">{pagination.total.toLocaleString()}</span> events
        </div>
      </div>

      {error && (
        <StatusAlert
          type="error"
          title="Audit trail alert"
          message={error}
          onRetry={() => fetchAuditLogs(pagination.page)}
          onDismiss={() => setError(null)}
        />
      )}

      {/* ── Ledger ──────────────────────────────────────────────── */}
      <section className="card overflow-hidden rounded-xl">
        {loading && events.length === 0 ? (
          <div className="p-6">
            <TableSkeleton rows={6} cols={6} />
          </div>
        ) : events.length === 0 ? (
          <div className="p-4 sm:p-6">
            <EmptyState
              icon={Shield}
              title="No audit records found"
              description="No logged security actions match the active filters. Reset them to see the full history."
              actionLabel="Reset filters"
              onAction={() => {
                setSelectedAction('ALL');
                setSelectedEntity('ALL');
              }}
            />
          </div>
        ) : (
          <div className={cn('transition-opacity duration-300', loading && 'opacity-50')}>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Entity</th>
                    <th>Actor</th>
                    <th>On-chain</th>
                    <th className="text-right" aria-label="Details" />
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id} className="cursor-pointer" onClick={() => setSelectedEvent(event)}>
                      <td className="whitespace-nowrap">
                        <div className="text-sm text-fg">{formatRelative(event.createdAt)}</div>
                        <div className="font-mono text-[10.5px] text-fg-subtle">{formatDateTime(event.createdAt)}</div>
                      </td>
                      <td>
                        <ActionBadge action={event.action} />
                      </td>
                      <td>
                        <span className="font-mono text-[11px] text-fg-muted">{event.entity}</span>
                      </td>
                      <td>
                        {event.actor ? (
                          <div className="min-w-0">
                            <div className="text-sm text-fg">{event.actor.name}</div>
                            <div className="text-[11px] text-fg-subtle">{event.actor.email}</div>
                          </div>
                        ) : (
                          <span className="text-xs italic text-fg-subtle">System</span>
                        )}
                      </td>
                      <td>
                        {event.transaction ? (
                          <a
                            href={`https://explorer.aptoslabs.com/txn/${event.transaction.txHash}?network=testnet`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="link inline-flex items-center gap-1 font-mono text-[12px] text-fg"
                          >
                            {truncateMiddle(event.transaction.txHash, 8, 4)}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <span className="text-xs text-fg-subtle">—</span>
                        )}
                      </td>
                      <td className="text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          className="btn-secondary btn-sm"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <ul className="divide-y divide-line/[0.06] md:hidden">
              {events.map((event) => (
                <li key={event.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedEvent(event)}
                    className="w-full space-y-2.5 p-4 text-left transition-colors active:bg-fg/[0.03]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <ActionBadge action={event.action} />
                      <span className="text-[11px] text-fg-subtle">{formatRelative(event.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="font-mono text-xs text-fg">{event.entity}</span>
                      <span className="min-w-0 truncate text-xs text-fg-subtle">{event.actor?.email || 'System'}</span>
                    </div>
                    <div className="font-mono text-[10.5px] text-fg-subtle">
                      {event.transaction ? (
                        <span className="text-fg">Tx {truncateMiddle(event.transaction.txHash, 10, 4)}</span>
                      ) : (
                        'Off-chain entry'
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-line/[0.06] px-5 py-3.5 text-xs text-fg-subtle">
          <span>
            Page <span className="text-fg tabular">{pagination.page}</span> of {pagination.totalPages || 1}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={pagination.page <= 1 || loading}
              onClick={() => fetchAuditLogs(pagination.page - 1)}
              className="btn-icon h-8 w-8"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => fetchAuditLogs(pagination.page + 1)}
              className="btn-icon h-8 w-8"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Inspect record ──────────────────────────────────────── */}
      <Modal
        open={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        icon={Terminal}
        title="Audit record"
        description={selectedEvent ? <span className="font-mono text-xs">#{selectedEvent.id.slice(0, 8)}</span> : undefined}
        footer={
          <button type="button" onClick={() => setSelectedEvent(null)} className="btn-secondary">
            Close
          </button>
        }
      >
        {selectedEvent && (
          <div className="space-y-5">
            <dl className="-my-2.5">
              <div className="kv">
                <dt>Timestamp</dt>
                <dd className="font-mono text-xs">{new Date(selectedEvent.createdAt).toISOString()}</dd>
              </div>
              <div className="kv">
                <dt>Action</dt>
                <dd>
                  <ActionBadge action={selectedEvent.action} />
                </dd>
              </div>
              <div className="kv">
                <dt>Entity</dt>
                <dd className="font-mono text-xs">{selectedEvent.entity}</dd>
              </div>
              {selectedEvent.entityId && (
                <div className="kv">
                  <dt>Entity ID</dt>
                  <dd className="flex items-center justify-end gap-1 font-mono text-xs text-fg-muted">
                    {truncateMiddle(selectedEvent.entityId, 10, 6)}
                    <CopyButton value={selectedEvent.entityId} size="sm" />
                  </dd>
                </div>
              )}
            </dl>

            {selectedEvent.actor && (
              <div className="well space-y-1 p-4">
                <div className="meta mb-2 flex items-center gap-1.5">
                  <UserRound className="h-3 w-3" /> Actor
                </div>
                <div className="text-sm font-medium text-fg">{selectedEvent.actor.name}</div>
                <div className="text-xs text-fg-muted">{selectedEvent.actor.email}</div>
                {selectedEvent.actor.did && (
                  <div className="break-all pt-1 font-mono text-[10.5px] text-fg-subtle">{selectedEvent.actor.did}</div>
                )}
              </div>
            )}

            {selectedEvent.transaction && (
              <div className="well space-y-1.5 p-4">
                <div className="meta mb-2 flex items-center gap-1.5">
                  <Waypoints className="h-3 w-3" /> Aptos transaction
                </div>
                <div className="break-all font-mono text-xs text-fg">{selectedEvent.transaction.txHash}</div>
                <div className="flex items-center justify-between text-xs text-fg-muted">
                  <span>Type · {selectedEvent.transaction.txType}</span>
                  <a
                    href={`https://explorer.aptoslabs.com/txn/${selectedEvent.transaction.txHash}?network=testnet`}
                    target="_blank"
                    rel="noreferrer"
                    className="link inline-flex items-center gap-1 text-fg"
                  >
                    Explorer <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}

            {selectedEvent.metadata && (
              <div>
                <div className="meta mb-2">Event metadata</div>
                <JsonView value={selectedEvent.metadata} className="max-h-64" />
              </div>
            )}

            {(selectedEvent.ipAddress || selectedEvent.userAgent) && (
              <div className="space-y-1 border-t border-line/[0.06] pt-4 font-mono text-[11px] text-fg-subtle">
                {selectedEvent.ipAddress && <div>IP · {selectedEvent.ipAddress}</div>}
                {selectedEvent.userAgent && <div className="truncate">Client · {selectedEvent.userAgent}</div>}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};
