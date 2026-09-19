import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Shield,
  Layers,
  ExternalLink,
  History,
  Hash,
  Database,
  Link,
  RefreshCw,
} from 'lucide-react';

interface VerificationData {
  verdict: 'VERIFIED' | 'REVOKED' | 'MISMATCH' | 'BLOCKCHAIN_UNAVAILABLE' | 'NOT_FOUND' | 'UNANCHORED';
  verdictMessage: string;
  verifiedAt: string;
  asset: {
    id: string;
    assetNumber: number;
    name: string;
    description: string | null;
    assetType: string;
    status: string;
    organization: {
      name: string;
      slug: string;
    };
    currentOwner: {
      did: string;
      walletAddress: string;
      name: string;
      verificationStatus: string;
    } | null;
    createdAt: string;
    updatedAt: string;
    metadata: Record<string, any> | null;
  } | null;
  integrity: {
    computedMetadataHash: string;
    matchesOnChain: boolean | null;
  };
  blockchain: {
    network: string;
    moduleAddress: string;
    connected: boolean;
    onChainRecord: any | null;
    onChainHistoryCount: number;
    transactions: Array<{
      txHash: string;
      txType: string;
      status: string;
      blockHeight: string | null;
      gasUsed: string | null;
      senderAddress: string;
      submittedAt: string;
    }>;
  };
  ownershipHistory: Array<{
    intervalNumber: number;
    status: string;
    custodianName: string;
    custodianDid: string;
    custodianWallet: string;
    validFrom: string;
    validTo: string | null;
    notes: string | null;
  }>;
  checks: Array<{
    name: string;
    passed: boolean;
    message: string;
    expected?: string | number | boolean;
    actual?: string | number | boolean;
  }>;
}

export const VerifyPage: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-fill query parameter if present in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const assetParam = params.get('asset') || params.get('id');
    if (assetParam) {
      setQuery(assetParam);
      performVerification(assetParam);
    }
  }, []);

  const performVerification = async (searchTarget: string) => {
    if (!searchTarget.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/verification/verify/${encodeURIComponent(searchTarget.trim())}`);
      const data = await res.json();

      if (data.success && data.data) {
        setResult(data.data);
      } else {
        setError(data.error?.message || 'Verification query failed.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error executing verification query.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(query);
  };

  const getVerdictBadge = (verdict: VerificationData['verdict']) => {
    switch (verdict) {
      case 'VERIFIED':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-bold tracking-wider font-mono">VERIFIED</span>
          </div>
        );
      case 'REVOKED':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <XCircle className="w-5 h-5" />
            <span className="font-bold tracking-wider font-mono">REVOKED</span>
          </div>
        );
      case 'MISMATCH':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold tracking-wider font-mono">STATE MISMATCH</span>
          </div>
        );
      case 'BLOCKCHAIN_UNAVAILABLE':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Clock className="w-5 h-5" />
            <span className="font-bold tracking-wider font-mono">RPC UNAVAILABLE</span>
          </div>
        );
      case 'UNANCHORED':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <Layers className="w-5 h-5" />
            <span className="font-bold tracking-wider font-mono">OFF-CHAIN ONLY</span>
          </div>
        );
      case 'NOT_FOUND':
        return (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400">
            <XCircle className="w-5 h-5" />
            <span className="font-bold tracking-wider font-mono">NOT FOUND</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full text-left">
      {/* Search Header */}
      <div className="p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <Shield className="w-3.5 h-3.5" />
          <span>Task 11: Multi-Source Dual Verification Engine</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Public Asset Verification</h1>
        <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
          Verify digital assets against PostgreSQL metadata, Aptos smart contract state, continuous ownership intervals, and cryptographic SHA-256 metadata anchors.
        </p>

        {/* Input Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 pt-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Asset Number (#101), Asset UUID, or Name..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none font-mono transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            <span>Verify</span>
          </button>
        </form>

        {/* Quick Example Tags */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 pt-1">
          <span>Quick Lookup:</span>
          {['101', '900'].map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setQuery(ex);
                performVerification(ex);
              }}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
            >
              #{ex}
            </button>
          ))}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>
      )}

      {/* Verification Result Card */}
      {result && (
        <div className="space-y-6">
          {/* Main Verdict Banner */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                Verification Verdict • {new Date(result.verifiedAt).toLocaleString()}
              </div>
              <div className="text-lg font-semibold text-white">{result.verdictMessage}</div>
            </div>
            <div>{getVerdictBadge(result.verdict)}</div>
          </div>

          {result.asset && (
            <>
              {/* Asset & Custodian Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                {/* Asset Identity Card */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <Database className="w-4 h-4" />
                    <span>METADATA REGISTRY</span>
                  </div>
                  <div className="space-y-2 text-slate-300">
                    <div>
                      <span className="text-slate-500">Asset:</span>{' '}
                      <span className="font-semibold text-white font-sans text-sm">
                        {result.asset.name} (#{result.asset.assetNumber})
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Type:</span>{' '}
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                        {result.asset.assetType}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500">Lifecycle Status:</span>{' '}
                      <span className="font-semibold text-emerald-400">{result.asset.status}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Organization:</span> {result.asset.organization.name}
                    </div>
                    <div className="text-[11px] text-slate-500 break-all">
                      <span className="text-slate-400">ID:</span> {result.asset.id}
                    </div>
                  </div>
                </div>

                {/* Custodian & On-Chain State */}
                <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <Link className="w-4 h-4" />
                    <span>APTOS BLOCKCHAIN ANCHOR</span>
                  </div>
                  <div className="space-y-2 text-slate-300">
                    <div>
                      <span className="text-slate-500">Network:</span>{' '}
                      <span className="uppercase text-emerald-400">{result.blockchain.network}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">On-Chain State:</span>{' '}
                      {result.blockchain.onChainRecord ? (
                        <span className="text-emerald-400 font-semibold">Synchronized on Aptos</span>
                      ) : (
                        <span className="text-amber-400">Off-Chain Database Only</span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-500">Current Custodian:</span>{' '}
                      {result.asset.currentOwner ? result.asset.currentOwner.name : 'Unassigned'}
                    </div>
                    <div className="text-[11px] text-slate-500 break-all">
                      <span className="text-slate-400">DID:</span> {result.asset.currentOwner?.did || 'None'}
                    </div>
                    <div className="text-[11px] text-slate-500 break-all">
                      <span className="text-slate-400">Wallet:</span>{' '}
                      {result.asset.currentOwner?.walletAddress || 'None'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Cryptographic Proof & Integrity Checklist */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <Hash className="w-4 h-4" />
                    <span>CRYPTOGRAPHIC INTEGRITY CHECKS</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    SHA-256 Metadata Hash:{' '}
                    <span className="text-slate-300">
                      {result.integrity.computedMetadataHash.substring(0, 16)}...
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.checks.map((c, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                        c.passed
                          ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-300'
                          : 'bg-red-500/5 border-red-500/20 text-red-300'
                      }`}
                    >
                      {c.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-semibold text-white">{c.name}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{c.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ownership History Intervals */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 font-mono text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold border-b border-slate-800 pb-3">
                  <History className="w-4 h-4" />
                  <span>CUSTODY & OWNERSHIP INTERVAL CHAIN</span>
                </div>

                <div className="space-y-3">
                  {result.ownershipHistory.map((rec) => (
                    <div
                      key={rec.intervalNumber}
                      className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-emerald-400 font-semibold">INTERVAL #{rec.intervalNumber}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {rec.status}
                        </span>
                      </div>
                      <div className="text-slate-300">
                        Custodian: <span className="font-semibold text-white">{rec.custodianName}</span> (
                        {rec.custodianDid.slice(0, 24)}...)
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/50">
                        <span>From: {new Date(rec.validFrom).toLocaleString()}</span>
                        <span>To: {rec.validTo ? new Date(rec.validTo).toLocaleString() : 'Present (Active)'}</span>
                      </div>
                      {rec.notes && <div className="text-slate-400 italic text-[11px]">"{rec.notes}"</div>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions Timeline */}
              {result.blockchain.transactions.length > 0 && (
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 font-mono text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold border-b border-slate-800 pb-3">
                    <ExternalLink className="w-4 h-4" />
                    <span>ON-CHAIN TRANSACTION RECORD</span>
                  </div>
                  <div className="space-y-2">
                    {result.blockchain.transactions.map((tx) => (
                      <div
                        key={tx.txHash}
                        className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-semibold text-white">{tx.txType}</div>
                          <div className="text-[11px] text-slate-500 truncate max-w-md">Hash: {tx.txHash}</div>
                        </div>
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {tx.status}
                          </span>
                          <a
                            href={`https://explorer.aptoslabs.com/txn/${tx.txHash}?network=testnet`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-400 hover:underline inline-flex items-center gap-1"
                          >
                            <span>Explorer</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
