import { useEffect, useState } from 'react';
import {
  BadgeCheck,
  Boxes,
  Building2,
  Code2,
  History,
  KeyRound,
  Search,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { DetailSkeleton } from '../components/LoadingSkeleton';
import { StatusAlert } from '../components/StatusAlert';
import { identityClient } from '../services/identity.service';
import { DetailedIdentity, ResolveIdentityResponse } from '../types/identity.types';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { Badge } from '../components/ui/Badge';
import { CopyButton } from '../components/ui/CopyButton';
import { JsonView } from '../components/ui/JsonView';
import { formatDateTime } from '../lib/format';
import { cn } from '../lib/cn';

/** Machine-readable zone line, passport style: uppercase, `<` padded to a fixed width. */
function mrz(text: string, width = 44) {
  const clean = text.toUpperCase().replace(/[^A-Z0-9]/g, '<');
  return (clean + '<'.repeat(width)).slice(0, width);
}

/** Monochrome credential "data page" for the signed-in identity. */
function CredentialCard({ identity }: { identity: DetailedIdentity }) {
  const verified = identity.verificationStatus === 'VERIFIED';
  const holder = identity.user.firstName
    ? `${identity.user.firstName} ${identity.user.lastName ?? ''}`.trim()
    : identity.user.email;
  const issued = new Date(identity.createdAt);

  return (
    <div className="group pb-3 [perspective:1200px]">
      <div className="relative aspect-[1.586/1] w-full overflow-hidden rounded-xl border border-white/10 bg-[#0c0c0c] text-[#ededed] shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)] transition-transform duration-500 ease-out [transform:rotateX(4deg)_rotateY(-8deg)] group-hover:[transform:rotateX(0deg)_rotateY(0deg)]">
        {/* Fine dot grid */}
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 0.6px, transparent 0.6px)', backgroundSize: '12px 12px' }}
        />
        {/* Seal watermark */}
        <svg className="absolute -right-10 top-1/2 h-[85%] -translate-y-1/2 opacity-[0.07]" viewBox="0 0 100 100" fill="none" aria-hidden>
          <circle cx="50" cy="50" r="46" stroke="white" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="38" stroke="white" strokeWidth="0.5" strokeDasharray="1 2" />
          <circle cx="50" cy="50" r="14" fill="white" />
        </svg>

        <div className="relative flex h-full flex-col justify-between p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                <circle cx="12" cy="12" r="9.25" stroke="#ededed" strokeWidth="1.75" />
                <circle cx="12" cy="12" r="3" fill="#ff5b1f" />
              </svg>
              <span className="text-[13px] font-semibold tracking-[-0.02em]">Authentra</span>
            </div>
            <span className="font-mono text-[10px] text-white/50">Verifiable identity · W3C DID</span>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            <div className="col-span-2 min-w-0 sm:col-span-3">
              <div className="font-mono text-[9.5px] text-white/40">Holder</div>
              <div className="truncate font-serif text-[26px] leading-tight sm:text-[30px]">{holder}</div>
            </div>
            <div>
              <div className="font-mono text-[9.5px] text-white/40">Status</div>
              <div className={cn('font-mono text-[11px]', verified ? 'text-[#4ade80]' : 'text-[#facc15]')}>
                {identity.verificationStatus.replace(/_/g, ' ')}
              </div>
            </div>
            <div>
              <div className="font-mono text-[9.5px] text-white/40">Issued</div>
              <div className="font-mono text-[11px]">{issued.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</div>
            </div>
            <div className="hidden sm:block">
              <div className="font-mono text-[9.5px] text-white/40">Organization</div>
              <div className="truncate font-mono text-[11px]">{identity.user.organization.slug}</div>
            </div>
          </div>

          {/* Machine-readable zone */}
          <div className="space-y-0.5 border-t border-white/10 pt-3 font-mono text-[9.5px] leading-tight tracking-[0.12em] text-white/55 sm:text-[10.5px]">
            <div className="truncate">{mrz(`ID<AUTHENTRA<${holder}`)}</div>
            <div className="truncate">{mrz(identity.walletAddress.replace(/^0x/, ''))}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function IdentityPage() {
  const [identity, setIdentity] = useState<DetailedIdentity | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // DID resolution lookup state
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

    const nextStatus = identity.verificationStatus === 'VERIFIED' ? 'PENDING_VERIFICATION' : 'VERIFIED';

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
    return <DetailSkeleton />;
  }

  if (error || !identity) {
    return (
      <div className="mx-auto w-full max-w-2xl">
        <StatusAlert
          type="error"
          title="Identity resolution error"
          message={error || 'No identity is associated with this account.'}
          onRetry={fetchIdentity}
        />
      </div>
    );
  }

  const verified = identity.verificationStatus === 'VERIFIED';

  return (
    <div className="space-y-8 sm:space-y-10">
      <PageHeader
        eyebrow="W3C DID v1.0"
        title="Identity"
        description="A W3C Decentralized Identifier derived from your Aptos account and bound to the public ledger — resolvable by anyone, controlled only by you."
        meta={
          <>
            <Badge tone={verified ? 'ok' : 'warn'} dot>
              {identity.verificationStatus.replace(/_/g, ' ')}
            </Badge>
            <Badge>STATUS · {identity.status}</Badge>
          </>
        }
        actions={
          <button
            onClick={handleToggleVerification}
            disabled={actionLoading}
            className={verified ? 'btn-secondary' : 'btn-primary'}
          >
            <ShieldCheck className="h-4 w-4" />
            {actionLoading ? 'Updating…' : verified ? 'Set pending verification' : 'Verify identity'}
          </button>
        }
      />

      {actionSuccess && (
        <StatusAlert
          type="success"
          title="Verification status updated"
          message={actionSuccess}
          onDismiss={() => setActionSuccess(null)}
        />
      )}

      {/* ── Credential + governance ─────────────────────────────── */}
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[1.05fr_1fr]">
        <div className="space-y-5">
          <div className="mx-auto w-full max-w-[520px] lg:mx-0">
            <CredentialCard identity={identity} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="card rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs text-fg-subtle">
                <Boxes className="h-3.5 w-3.5" /> Assets held
              </div>
              <div className="mt-3 font-serif text-4xl leading-none text-fg tabular">
                {identity.stats?.ownedAssetsCount ?? 0}
              </div>
            </div>
            <div className="card rounded-xl p-5">
              <div className="flex items-center gap-2 text-xs text-fg-subtle">
                <History className="h-3.5 w-3.5" /> Custody intervals
              </div>
              <div className="mt-3 font-serif text-4xl leading-none text-fg tabular">
                {identity.stats?.ownershipHistoryCount ?? 0}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <Panel title="Decentralized identifier" icon={KeyRound}>
            <div className="space-y-4">
              <div>
                <div className="label">DID</div>
                <div className="well flex items-start justify-between gap-2 p-3 pl-4">
                  <code className="min-w-0 break-all py-1 font-mono text-xs leading-relaxed text-fg">{identity.did}</code>
                  <CopyButton value={identity.did} label="Copy DID" />
                </div>
              </div>
              <div>
                <div className="label flex items-center gap-1.5">
                  <Wallet className="h-3.5 w-3.5" /> Bound Aptos wallet
                </div>
                <div className="well flex items-start justify-between gap-2 p-3 pl-4">
                  <code className="min-w-0 break-all py-1 font-mono text-xs leading-relaxed text-fg-muted">
                    {identity.walletAddress}
                  </code>
                  <CopyButton value={identity.walletAddress} label="Copy wallet address" />
                </div>
              </div>
            </div>
          </Panel>

          <Panel title="Organization & governance" icon={Building2}>
            <dl className="-my-2.5">
              <div className="kv">
                <dt>Organization</dt>
                <dd className="font-medium">{identity.user.organization.name}</dd>
              </div>
              <div className="kv">
                <dt>Account owner</dt>
                <dd className="truncate">{identity.user.email}</dd>
              </div>
              <div className="kv">
                <dt>Assigned roles</dt>
                <dd className="flex flex-wrap justify-end gap-1.5">
                  {identity.user.roles.map((r) => (
                    <Badge key={r}>
                      {r}
                    </Badge>
                  ))}
                </dd>
              </div>
              <div className="kv">
                <dt>Issued</dt>
                <dd className="text-fg-muted">{formatDateTime(identity.createdAt)}</dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>

      {/* ── DID document + resolver ─────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <Panel
          className="lg:col-span-7"
          title="DID document"
          icon={Code2}
          action={<Badge>did:authentra:aptos</Badge>}
        >
          <p className="mb-4 text-sm text-fg-muted">
            Machine-readable proof specifying verification methods and authentication keys.
          </p>
          <JsonView value={identity.didDocument} className="max-h-[420px]" />
        </Panel>

        <Panel className="lg:col-span-5" title="Public DID resolver" icon={Search}>
          <p className="mb-4 text-sm text-fg-muted">
            Resolve any Authentra decentralized identifier across the network.
          </p>
          <form onSubmit={handleLookup} className="space-y-3">
            <input
              type="text"
              value={lookupDid}
              onChange={(e) => setLookupDid(e.target.value)}
              placeholder="did:authentra:aptos:0x…"
              className="input font-mono text-xs"
              aria-label="DID to resolve"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={lookupLoading || !lookupDid.trim()}
                className="btn-primary flex-1"
              >
                {lookupLoading ? 'Resolving on ledger…' : 'Resolve DID'}
              </button>
              <button
                type="button"
                onClick={() => setLookupDid(identity.did)}
                className="btn-secondary"
                title="Use my DID"
              >
                Mine
              </button>
            </div>
          </form>

          {lookupError && (
            <div className="mt-4">
              <StatusAlert type="error" message={lookupError} onDismiss={() => setLookupError(null)} />
            </div>
          )}

          {resolvedIdentity && (
            <div className="well mt-4 space-y-3 p-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-ok">
                  <BadgeCheck className="h-4 w-4" /> Identity resolved
                </span>
                <Badge>{resolvedIdentity.status}</Badge>
              </div>
              <dl className="space-y-2 text-xs">
                <div>
                  <dt className="text-fg-subtle">DID</dt>
                  <dd className="break-all font-mono text-fg">{resolvedIdentity.did}</dd>
                </div>
                <div>
                  <dt className="text-fg-subtle">Wallet</dt>
                  <dd className="break-all font-mono text-fg-muted">{resolvedIdentity.walletAddress}</dd>
                </div>
                <div className="flex justify-between gap-3 border-t border-line/[0.06] pt-2">
                  <dt className="text-fg-subtle">Organization</dt>
                  <dd className="text-fg">{resolvedIdentity.organization.name}</dd>
                </div>
              </dl>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
