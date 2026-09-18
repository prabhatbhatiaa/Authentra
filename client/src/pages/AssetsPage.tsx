import React, { useEffect, useState } from 'react';
import { 
  Boxes, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  History
} from 'lucide-react';

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

export const AssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState<'assign' | 'transfer' | 'revoke' | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [historyRecords, setHistoryRecords] = useState<OwnershipRecord[]>([]);

  // Form states
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('SECURITY_TOKEN');
  const [targetIdentityId, setTargetIdentityId] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

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
        setActionSuccess(`Asset "${newName}" successfully created in DRAFT state.`);
        setShowCreateModal(false);
        setNewName('');
        setNewDesc('');
        fetchAssets();
      } else {
        setError(data.error?.message || 'Failed to create asset.');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating asset.');
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
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Asset #${asset.assetNumber} successfully minted on Aptos.`);
        fetchAssets();
      } else {
        setError(data.error?.message || 'Failed to mint asset.');
      }
    } catch (err: any) {
      setError(err.message || 'Minting error.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !showActionModal) return;
    setActionSubmitting(true);
    setError(null);

    try {
      let endpoint = `/api/assets/${selectedAsset.id}/${showActionModal}`;
      let body: any = {};

      if (showActionModal === 'assign') {
        body = { targetIdentityId, notes: actionReason };
      } else if (showActionModal === 'transfer') {
        body = { targetIdentityId, reason: actionReason };
      } else if (showActionModal === 'revoke') {
        body = { reason: actionReason };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setActionSuccess(`Asset #${selectedAsset.assetNumber} action "${showActionModal.toUpperCase()}" completed successfully.`);
        setShowActionModal(null);
        setSelectedAsset(null);
        setTargetIdentityId('');
        setActionReason('');
        fetchAssets();
      } else {
        setError(data.error?.message || `Failed to execute ${showActionModal}.`);
      }
    } catch (err: any) {
      setError(err.message || 'Operation failed.');
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleViewHistory = async (asset: Asset) => {
    setSelectedAsset(asset);
    setShowHistoryModal(true);
    try {
      const res = await fetch(`/api/assets/${asset.id}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setHistoryRecords(data.data.history);
      }
    } catch {
      setHistoryRecords([]);
    }
  };

  const getStatusBadge = (status: Asset['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="px-2.5 py-1 text-xs font-mono rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">ACTIVE</span>;
      case 'MINTED':
        return <span className="px-2.5 py-1 text-xs font-mono rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30">MINTED</span>;
      case 'ASSIGNED':
        return <span className="px-2.5 py-1 text-xs font-mono rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">ASSIGNED</span>;
      case 'DRAFT':
        return <span className="px-2.5 py-1 text-xs font-mono rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">DRAFT</span>;
      case 'TRANSFERRED':
        return <span className="px-2.5 py-1 text-xs font-mono rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">TRANSFERRED</span>;
      case 'REVOKED':
        return <span className="px-2.5 py-1 text-xs font-mono rounded-full bg-red-500/10 text-red-400 border border-red-500/30">REVOKED</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto w-full text-left">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-2">
            <Boxes className="w-3.5 h-3.5" />
            <span>Digital Asset Lifecycle (Task 9 & 10)</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Enterprise Asset Registry</h2>
          <p className="text-slate-400 text-sm mt-1">
            Create, mint on Aptos, assign custody, transfer ownership intervals, and manage verification states.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchAssets}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh assets"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition-all shadow-lg shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Asset</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>
      )}

      {/* Assets Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-800 bg-slate-900/80 font-mono text-xs text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">ASSET</th>
                <th className="px-6 py-4 font-medium">TYPE</th>
                <th className="px-6 py-4 font-medium">STATUS</th>
                <th className="px-6 py-4 font-medium">CURRENT CUSTODIAN</th>
                <th className="px-6 py-4 font-medium text-right">LIFECYCLE ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              {loading && assets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 animate-pulse">
                    Querying cryptographic assets and on-chain references...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No digital assets created yet. Click "Create Asset" to initiate.
                  </td>
                </tr>
              ) : (
                assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white font-sans text-sm">{asset.name}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        #{asset.assetNumber} • {asset.description || 'No description provided'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {asset.assetType}
                      </span>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(asset.status)}</td>
                    <td className="px-6 py-4">
                      {asset.currentOwner ? (
                        <div>
                          <div className="text-slate-200">
                            {asset.currentOwner.user
                              ? `${asset.currentOwner.user.firstName} ${asset.currentOwner.user.lastName}`
                              : 'Registered DID'}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[180px]">
                            {asset.currentOwner.did}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-600">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {asset.status === 'DRAFT' && (
                          <button
                            type="button"
                            onClick={() => handleMint(asset)}
                            disabled={actionSubmitting}
                            className="px-2.5 py-1 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/30 transition-colors"
                          >
                            Mint (Aptos)
                          </button>
                        )}
                        {(asset.status === 'MINTED' || asset.status === 'DRAFT') && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAsset(asset);
                              setShowActionModal('assign');
                            }}
                            className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/30 transition-colors"
                          >
                            Assign
                          </button>
                        )}
                        {asset.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAsset(asset);
                              setShowActionModal('transfer');
                            }}
                            className="px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border border-purple-500/30 transition-colors"
                          >
                            Transfer
                          </button>
                        )}
                        {asset.status !== 'REVOKED' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAsset(asset);
                              setShowActionModal('revoke');
                            }}
                            className="px-2.5 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-colors"
                          >
                            Revoke
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleViewHistory(asset)}
                          className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition-colors"
                          title="View Ownership Chain"
                        >
                          <History className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white">Create Digital Asset</h3>
            <p className="text-xs text-slate-400">Initialize a new enterprise asset in DRAFT state.</p>
            <form onSubmit={handleCreate} className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">ASSET NAME</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Enterprise Security Clearance #402"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">ASSET TYPE</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500"
                >
                  <option value="SECURITY_TOKEN">SECURITY_TOKEN</option>
                  <option value="IDENTITY_CREDENTIAL">IDENTITY_CREDENTIAL</option>
                  <option value="ACCESS_BADGE">ACCESS_BADGE</option>
                  <option value="COMPLIANCE_CERT">COMPLIANCE_CERT</option>
                </select>
              </div>
              <div>
                <label className="text-slate-400 block mb-1">DESCRIPTION</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Asset description and compliance notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 h-20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACTION MODAL: ASSIGN / TRANSFER / REVOKE */}
      {showActionModal && selectedAsset && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white capitalize">{showActionModal} Asset #{selectedAsset.assetNumber}</h3>
            <p className="text-xs text-slate-400">
              {showActionModal === 'revoke'
                ? 'Permanently decommission asset and seal ownership intervals.'
                : `Update custody and ownership intervals for ${selectedAsset.name}.`}
            </p>
            <form onSubmit={handleActionSubmit} className="space-y-3 font-mono text-xs">
              {showActionModal !== 'revoke' && (
                <div>
                  <label className="text-slate-400 block mb-1">TARGET IDENTITY ID (UUID)</label>
                  <input
                    type="text"
                    required
                    value={targetIdentityId}
                    onChange={(e) => setTargetIdentityId(e.target.value)}
                    placeholder="Enter target Identity UUID"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500"
                  />
                </div>
              )}
              <div>
                <label className="text-slate-400 block mb-1">
                  {showActionModal === 'revoke' ? 'REVOCATION REASON' : 'ACTION NOTES / REASON'}
                </label>
                <textarea
                  required
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="Compliance and authorization rationale..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white outline-none focus:border-emerald-500 h-20"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowActionModal(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionSubmitting}
                  className={`px-4 py-2 rounded-lg font-semibold ${
                    showActionModal === 'revoke'
                      ? 'bg-red-500 hover:bg-red-400 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  Confirm {showActionModal}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* OWNERSHIP HISTORY MODAL */}
      {showHistoryModal && selectedAsset && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl w-full space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Historical Ownership Chain</h3>
                <p className="text-xs text-slate-400">Asset #{selectedAsset.assetNumber}: {selectedAsset.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 font-mono text-xs pr-1">
              {historyRecords.length === 0 ? (
                <div className="py-8 text-center text-slate-500">No ownership history intervals recorded yet.</div>
              ) : (
                historyRecords.map((rec, idx) => (
                  <div key={rec.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-emerald-400 font-semibold">INTERVAL #{historyRecords.length - idx}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {rec.status}
                      </span>
                    </div>
                    <div className="text-slate-300">
                      <strong>Custodian:</strong>{' '}
                      {rec.identity.user
                        ? `${rec.identity.user.firstName} ${rec.identity.user.lastName}`
                        : 'Cryptographic DID'}
                    </div>
                    <div className="text-slate-500 text-[10px] break-all">{rec.identity.did}</div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/50">
                      <span>From: {new Date(rec.validFrom).toLocaleString()}</span>
                      <span>To: {rec.validTo ? new Date(rec.validTo).toLocaleString() : 'Present (Active)'}</span>
                    </div>
                    {rec.notes && <div className="text-slate-400 text-[11px] italic">"{rec.notes}"</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
