import { useEffect, useState } from 'react';
import {
  Fingerprint,
  Key,
  ShieldCheck,
  Building2,
  Calendar,
  Copy,
  Check,
  Search,
  AlertCircle,
  Sparkles,
  Code2,
} from 'lucide-react';
import { identityClient } from '../services/identity.service';
import { DetailedIdentity, ResolveIdentityResponse } from '../types/identity.types';

export function IdentityPage() {
  const [identity, setIdentity] = useState<DetailedIdentity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // DID Resolution lookup state
  const [lookupDid, setLookupDid] = useState<string>('');
  const [resolvedIdentity, setResolvedIdentity] = useState<ResolveIdentityResponse | null>(null);
  const [lookupLoading, setLookupLoading] = useState<boolean>(false);
  const [lookupError, setLookupError] = useState<string | null>(null);

  // Status toggle state
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchIdentity = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await identityClient.getMyIdentity();
      setIdentity(res.data.identity);
    } catch (err: any) {
      setError(err.message || 'Failed to load identity details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIdentity();
  }, []);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupDid.trim()) return;

    setLookupLoading(true);
    setLookupError(null);
    setResolvedIdentity(null);

    try {
      const res = await identityClient.resolveDid(lookupDid.trim());
      setResolvedIdentity(res.data.identity);
    } catch (err: any) {
      setLookupError(err.message || `No identity found matching DID: ${lookupDid}`);
    } finally {
      setLookupLoading(false);
    }
  };

  const handleToggleVerification = async () => {
    if (!identity) return;
    setActionLoading(true);
    setActionSuccess(null);

    const nextStatus =
      identity.verificationStatus === 'VERIFIED' ? 'PENDING_VERIFICATION' : 'VERIFIED';

    try {
      const res = await identityClient.updateVerification(
        identity.id,
        nextStatus,
        `Manual verification state toggle by user`
      );
      setActionSuccess(res.message);
      await fetchIdentity();
    } catch (err: any) {
      setError(err.message || 'Failed to update verification status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3 font-mono text-xs text-slate-400">
        <div className="w-8 h-8 mx-auto border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p>Loading cryptographic identity & W3C DID document...</p>
      </div>
    );
  }

  if (error || !identity) {
    return (
      <div className="max-w-2xl mx-auto p-6 rounded-2xl bg-rose-950/30 border border-rose-900/60 text-rose-300 text-sm space-y-4">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-400" />
          <span>Identity Resolution Error</span>
        </div>
        <p>{error || 'No identity is associated with this account.'}</p>
        <button
          onClick={fetchIdentity}
          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/90 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Fingerprint className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Cryptographic Identity
              </h1>
              <span
                className={`text-xs font-mono px-2.5 py-0.5 rounded-full border ${
                  identity.verificationStatus === 'VERIFIED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                ● {identity.verificationStatus}
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                STATUS: {identity.status}
              </span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm">
              W3C Decentralized Identifier bound to the Aptos blockchain public ledger.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleVerification}
            disabled={actionLoading}
            className="px-4 py-2.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {identity.verificationStatus === 'VERIFIED'
                ? 'Set Pending Verification'
                : 'Verify Identity'}
            </span>
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Identity Specs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: DID & Aptos Binding */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" /> Decentralized Identifier (DID)
            </span>
            <button
              onClick={() => handleCopy(identity.did, 'did')}
              className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-emerald-400 transition-colors"
              title="Copy DID"
            >
              {copiedField === 'did' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 break-all select-all">
            {identity.did}
          </div>

          <div className="pt-2 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" /> Bound Aptos Wallet Address
              </span>
              <button
                onClick={() => handleCopy(identity.walletAddress, 'wallet')}
                className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-emerald-400"
              >
                {copiedField === 'wallet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 break-all select-all">
              {identity.walletAddress}
            </div>
          </div>
        </div>

        {/* Card 2: Organization & Assigned Roles */}
        <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" /> Organization & Governance
          </span>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Organization:</span>
              <span className="text-slate-200 font-semibold">{identity.user.organization.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Account Owner:</span>
              <span className="text-slate-200 font-semibold">{identity.user.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-800/80">
              <span className="text-slate-400">Assigned Roles:</span>
              <div className="flex gap-1.5">
                {identity.user.roles.map((r) => (
                  <span key={r} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-semibold">
                    {r}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Issued Timestamp:
              </span>
              <span className="text-slate-400">{new Date(identity.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* DID Document & Universal Resolver Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive W3C DID Document */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" /> W3C DID Document Specification
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800">
              did:authentra:aptos
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Machine-readable cryptographic proof document specifying verification methods and authentication keys.
          </p>
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/90 text-emerald-400 text-xs font-mono overflow-x-auto max-h-80 select-all">
            {JSON.stringify(identity.didDocument, null, 2)}
          </pre>
        </div>

        {/* Right: Public DID Resolver Explorer */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" /> Public DID Resolver
            </span>
            <p className="text-xs text-slate-400">
              Query and resolve any Authentra decentralized identifier across the network.
            </p>
          </div>

          <form onSubmit={handleLookup} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={lookupDid}
                onChange={(e) => setLookupDid(e.target.value)}
                placeholder="did:authentra:aptos:0x..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={lookupLoading || !lookupDid.trim()}
              className="w-full py-2 px-4 rounded-lg bg-slate-800 hover:bg-slate-750 border border-slate-700 text-xs font-mono text-emerald-400 hover:text-emerald-300 transition-colors flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {lookupLoading ? 'Resolving on Ledger...' : 'Resolve DID Document'}
            </button>
          </form>

          {lookupError && (
            <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/50 text-rose-300 text-xs font-mono">
              {lookupError}
            </div>
          )}

          {resolvedIdentity && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
              <div className="text-emerald-400 font-semibold flex items-center justify-between">
                <span>✓ Verified Identity Match</span>
                <span className="text-[10px] text-slate-400">{resolvedIdentity.status}</span>
              </div>
              <div className="text-[11px] text-slate-300 break-all">
                <span className="text-slate-500">DID: </span>{resolvedIdentity.did}
              </div>
              <div className="text-[11px] text-slate-300 break-all">
                <span className="text-slate-500">Wallet: </span>{resolvedIdentity.walletAddress}
              </div>
              <div className="text-[11px] text-slate-300">
                <span className="text-slate-500">Org: </span>{resolvedIdentity.organization.name}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
