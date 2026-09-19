import React, { useEffect, useState, useCallback } from 'react';
import {
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Shield,
  Terminal,
} from 'lucide-react';


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

  const token = localStorage.getItem('authentra_token');

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

  const fetchAuditLogs = useCallback(async (targetPage = 1) => {
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
  }, [token, selectedAction, selectedEntity]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  useEffect(() => {
    fetchAuditLogs(1);
  }, [fetchAuditLogs]);

  // Color-coded badge helper for action types
  const getActionBadge = (action: string) => {
    if (action.includes('REVOKE') || action.includes('DELETED')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-red-500/10 text-red-400 border border-red-500/30">
          {action}
        </span>
      );
    }
    if (action.includes('MINT') || action.includes('CREATED') || action.includes('REGISTERED')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          {action}
        </span>
      );
    }
    if (action.includes('ASSIGN') || action.includes('TRANSFER')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/30">
          {action}
        </span>
      );
    }
    if (action.includes('LOGIN') || action.includes('LOGOUT')) {
      return (
        <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30">
          {action}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
        {action}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full text-left">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Task 12: Immutable Event Audit Trail</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">System Audit Explorer</h2>
          <p className="text-slate-400 text-sm mt-1">
            Tamper-evident chronological journal capturing user actions, state transitions, and on-chain transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchAuditLogs(pagination.page)}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors self-start sm:self-auto"
          title="Refresh audit log"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Controls */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter className="w-4 h-4 text-emerald-400" />
          <span>FILTERS:</span>
        </div>

        {/* Action Filter */}
        <div className="flex items-center gap-2">
          <label className="text-slate-500">Action:</label>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-emerald-500/60"
          >
            <option value="ALL">ALL ACTIONS</option>
            {actionsList.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>

        {/* Entity Filter */}
        <div className="flex items-center gap-2">
          <label className="text-slate-500">Entity:</label>
          <select
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white outline-none focus:border-emerald-500/60"
          >
            <option value="ALL">ALL ENTITIES</option>
            {entitiesList.map((ent) => (
              <option key={ent} value={ent}>
                {ent}
              </option>
            ))}
          </select>
        </div>

        <div className="ml-auto text-slate-500">
          Total Recorded Events: <span className="text-emerald-400 font-semibold">{pagination.total}</span>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/80 font-mono text-xs text-slate-400">
              <tr>
                <th className="px-6 py-3.5 font-medium">TIMESTAMP</th>
                <th className="px-6 py-3.5 font-medium">ACTION</th>
                <th className="px-6 py-3.5 font-medium">ENTITY</th>
                <th className="px-6 py-3.5 font-medium">ACTOR</th>
                <th className="px-6 py-3.5 font-medium">ON-CHAIN HASH</th>
                <th className="px-6 py-3.5 font-medium text-right">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {loading && events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 animate-pulse">
                    Retrieving tamper-evident audit records...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No matching audit events found for current filters.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-3.5 text-slate-400 whitespace-nowrap">
                      {new Date(event.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5">{getActionBadge(event.action)}</td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {event.entity}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      {event.actor ? (
                        <div>
                          <div className="text-slate-200 font-sans">{event.actor.name}</div>
                          <div className="text-[10px] text-slate-500">{event.actor.email}</div>
                        </div>
                      ) : (
                        <span className="text-slate-600">SYSTEM / INTERNAL</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5">
                      {event.transaction ? (
                        <a
                          href={`https://explorer.aptoslabs.com/txn/${event.transaction.txHash}?network=testnet`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                        >
                          <span>{event.transaction.txHash.slice(0, 10)}...</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-slate-600">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedEvent(event)}
                        className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between font-mono text-xs text-slate-400">
          <div>
            Page {pagination.page} of {pagination.totalPages || 1}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1 || loading}
              onClick={() => fetchAuditLogs(pagination.page - 1)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={pagination.page >= pagination.totalPages || loading}
              onClick={() => fetchAuditLogs(pagination.page + 1)}
              className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* INSPECT EVENT MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full space-y-4 max-h-[85vh] flex flex-col font-mono text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <Terminal className="w-4 h-4" />
                <span>AUDIT RECORD #{selectedEvent.id.slice(0, 8)}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto pr-1">
              <div>
                <span className="text-slate-500 block mb-0.5">TIMESTAMP</span>
                <span className="text-white">{new Date(selectedEvent.createdAt).toISOString()}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 block mb-0.5">ACTION</span>
                  <div>{getActionBadge(selectedEvent.action)}</div>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">ENTITY</span>
                  <span className="text-white">{selectedEvent.entity}</span>
                </div>
              </div>

              {selectedEvent.entityId && (
                <div>
                  <span className="text-slate-500 block mb-0.5">ENTITY ID</span>
                  <span className="text-slate-300 break-all">{selectedEvent.entityId}</span>
                </div>
              )}

              {selectedEvent.actor && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500 block text-[11px]">ACTOR DETAILS</span>
                  <div className="text-white font-sans">{selectedEvent.actor.name}</div>
                  <div className="text-slate-400">{selectedEvent.actor.email}</div>
                  {selectedEvent.actor.did && (
                    <div className="text-[10px] text-slate-500 break-all">{selectedEvent.actor.did}</div>
                  )}
                </div>
              )}

              {selectedEvent.transaction && (
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-slate-500 block text-[11px]">APTOS ON-CHAIN TRANSACTION</span>
                  <div className="text-emerald-400 break-all">{selectedEvent.transaction.txHash}</div>
                  <div className="text-slate-400">Type: {selectedEvent.transaction.txType}</div>
                </div>
              )}

              {selectedEvent.metadata && (
                <div>
                  <span className="text-slate-500 block mb-1">EVENT METADATA (JSON)</span>
                  <pre className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400/90 text-[11px] overflow-x-auto">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {(selectedEvent.ipAddress || selectedEvent.userAgent) && (
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500">
                  {selectedEvent.ipAddress && <div>IP: {selectedEvent.ipAddress}</div>}
                  {selectedEvent.userAgent && <div className="truncate">Client: {selectedEvent.userAgent}</div>}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
