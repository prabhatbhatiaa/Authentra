import React, { useState, useEffect, useId } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  ExternalLink,
  Hash,
  History,
  Layers,
  Link,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { DetailSkeleton } from '../components/LoadingSkeleton';
import { StatusAlert } from '../components/StatusAlert';
import { PageHeader } from '../components/ui/PageHeader';
import { Panel } from '../components/ui/Panel';
import { Badge, StatusBadge, Tone } from '../components/ui/Badge';
import { CopyButton } from '../components/ui/CopyButton';
import { formatDateTime, truncateMiddle } from '../lib/format';
import { cn } from '../lib/cn';

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

type Verdict = VerificationData['verdict'];

const verdictMeta: Record<
  Verdict,
  { label: string; tone: Tone; ring: string; text: string; icon: React.ComponentType<{ className?: string }> }
> = {
  VERIFIED: { label: 'Verified', tone: 'ok', ring: 'text-ok', text: 'text-ok', icon: ShieldCheck },
  REVOKED: { label: 'Revoked', tone: 'bad', ring: 'text-bad', text: 'text-bad', icon: XCircle },
  MISMATCH: { label: 'State mismatch', tone: 'warn', ring: 'text-warn', text: 'text-warn', icon: AlertTriangle },
  BLOCKCHAIN_UNAVAILABLE: { label: 'RPC unavailable', tone: 'info', ring: 'text-info', text: 'text-info', icon: Clock },
  UNANCHORED: { label: 'Off-chain only', tone: 'accent', ring: 'text-accent', text: 'text-accent', icon: Layers },
  NOT_FOUND: { label: 'Not found', tone: 'neutral', ring: 'text-fg-subtle', text: 'text-fg-muted', icon: XCircle },
};

/** Rotating circular seal stamped with the verdict. */
function VerdictSeal({ verdict }: { verdict: Verdict }) {
  const meta = verdictMeta[verdict];
  const Icon = meta.icon;
  const pathId = useId().replace(/:/g, '');
  return (
    <div className={cn('relative h-36 w-36 shrink-0 sm:h-40 sm:w-40', meta.ring)}>
      <svg viewBox="0 0 160 160" className="absolute inset-0 animate-spin [animation-duration:28s]">
        <defs>
          <path id={pathId} d="M80,80 m-62,0 a62,62 0 1,1 124,0 a62,62 0 1,1 -124,0" />
        </defs>
        <circle cx="80" cy="80" r="76" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeDasharray="2 5" />
        <text className="fill-current font-mono text-[9.5px] uppercase tracking-[0.32em]">
          <textPath href={`#${pathId}`}>
            {`${meta.label} · Authentra dual consensus · Aptos · `}
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-[30px] flex items-center justify-center rounded-full border border-line/15 bg-canvas">
        <Icon className="h-10 w-10" />
      </div>
    </div>
  );
}

const howItWorks = [
  {
    icon: Database,
    title: 'Relational record',
    body: 'Resolve the asset, its custodian and every ownership interval from PostgreSQL.',
  },
  {
    icon: Link,
    title: 'On-chain state',
    body: 'Query the Aptos Move view function for the anchored asset resource.',
  },
  {
    icon: Hash,
    title: 'Digest parity',
    body: 'Recompute the SHA-256 metadata digest and compare it with the ledger.',
  },
];

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

  const passed = result?.checks.filter((c) => c.passed).length ?? 0;
  const total = result?.checks.length ?? 0;

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Dual-consensus verification"
        title="Verify"
        description="Cross-check any asset against the PostgreSQL registry, live Aptos contract state, its continuous ownership intervals and SHA-256 anchors — in one query."
      />

      {/* ── Query bar ───────────────────────────────────────────── */}
      <div>
        <form
          onSubmit={handleSearch}
          className="card flex flex-col gap-2 p-2 sm:flex-row sm:items-center"
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-fg-subtle" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Asset number (101), UUID, or name…"
              aria-label="Asset to verify"
              className="w-full bg-transparent py-3.5 pl-12 pr-4 text-[15px] text-fg outline-none placeholder:text-fg-subtle"
            />
          </div>
          <button type="submit" disabled={loading || !query.trim()} className="btn-primary btn-lg">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {loading ? 'Verifying…' : 'Verify asset'}
          </button>
        </form>
        <div className="mt-3 flex flex-wrap items-center gap-2 px-2 text-xs text-fg-subtle">
          <span>Try</span>
          {['101', '900'].map((ex) => (
            <button
              key={ex}
              type="button"
              onClick={() => {
                setQuery(ex);
                performVerification(ex);
              }}
              className="h-7 rounded-md border border-line/10 px-2.5 font-mono text-[12px] text-fg-muted transition-colors hover:border-line/20 hover:text-fg"
            >
              #{ex}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <StatusAlert
          type="error"
          title="Verification failed"
          message={error}
          onRetry={() => {
            if (query.trim()) performVerification(query.trim());
          }}
          onDismiss={() => setError(null)}
        />
      )}

      {loading && <DetailSkeleton />}

      {/* ── Idle state: explain the three checks ────────────────── */}
      {!loading && !result && !error && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {howItWorks.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.title}>
                <div className="card h-full space-y-6 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-line/10 bg-fg/[0.04] text-fg">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="font-serif text-3xl italic text-fg-subtle">0{i + 1}</span>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-medium text-fg">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-fg-muted">{step.body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Result ──────────────────────────────────────────────── */}
      {result && (
        <div className="space-y-6">
          <div>
            <section className="card relative overflow-hidden rounded-xl p-6 sm:p-8">
              <div className="flex flex-col items-center gap-8 text-center md:flex-row md:text-left">
                <VerdictSeal verdict={result.verdict} />
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="meta">Verdict · {formatDateTime(result.verifiedAt)}</div>
                  <h2 className={cn('font-serif text-display-sm', verdictMeta[result.verdict].text)}>
                    {verdictMeta[result.verdict].label}
                  </h2>
                  <p className="max-w-2xl text-[15px] leading-relaxed text-fg-muted">{result.verdictMessage}</p>
                  {total > 0 && (
                    <div className="mx-auto max-w-sm space-y-2 md:mx-0">
                      <div className="flex justify-between text-xs text-fg-subtle">
                        <span>Integrity checks</span>
                        <span className="tabular text-fg">
                          {passed}/{total} passed
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-fg/[0.07]">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-1000 ease-silk',
                            passed === total ? 'bg-ok' : 'bg-warn'
                          )}
                          style={{ width: `${(passed / total) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {result.asset && (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <Panel title="Metadata registry" icon={Database}>
                  <dl className="-my-2.5">
                    <div className="kv">
                      <dt>Asset</dt>
                      <dd className="font-medium">
                        {result.asset.name} <span className="font-mono text-fg-subtle">#{result.asset.assetNumber}</span>
                      </dd>
                    </div>
                    <div className="kv">
                      <dt>Type</dt>
                      <dd className="font-mono text-xs">{result.asset.assetType}</dd>
                    </div>
                    <div className="kv">
                      <dt>Lifecycle</dt>
                      <dd>
                        <StatusBadge status={result.asset.status} />
                      </dd>
                    </div>
                    <div className="kv">
                      <dt>Organization</dt>
                      <dd>{result.asset.organization.name}</dd>
                    </div>
                    <div className="kv">
                      <dt>ID</dt>
                      <dd className="flex items-center justify-end gap-1 font-mono text-xs text-fg-muted">
                        {truncateMiddle(result.asset.id, 8, 6)}
                        <CopyButton value={result.asset.id} size="sm" label="Copy asset ID" />
                      </dd>
                    </div>
                  </dl>
                </Panel>

                <Panel title="Aptos anchor" icon={Link}>
                  <dl className="-my-2.5">
                    <div className="kv">
                      <dt>Network</dt>
                      <dd className="font-mono text-xs uppercase">{result.blockchain.network}</dd>
                    </div>
                    <div className="kv">
                      <dt>On-chain state</dt>
                      <dd>
                        {result.blockchain.onChainRecord ? (
                          <Badge tone="ok" dot>
                            Synchronized
                          </Badge>
                        ) : (
                          <Badge tone="warn" dot>
                            Off-chain only
                          </Badge>
                        )}
                      </dd>
                    </div>
                    <div className="kv">
                      <dt>Custodian</dt>
                      <dd>{result.asset.currentOwner ? result.asset.currentOwner.name : 'Unassigned'}</dd>
                    </div>
                    <div className="kv">
                      <dt>Custodian DID</dt>
                      <dd className="font-mono text-xs text-fg-muted">
                        {truncateMiddle(result.asset.currentOwner?.did, 16, 6) || 'None'}
                      </dd>
                    </div>
                    <div className="kv">
                      <dt>Wallet</dt>
                      <dd className="font-mono text-xs text-fg-muted">
                        {truncateMiddle(result.asset.currentOwner?.walletAddress, 8, 6) || 'None'}
                      </dd>
                    </div>
                  </dl>
                </Panel>
              </div>

              <Panel
                title="Cryptographic integrity"
                icon={Hash}
                action={
                  <span className="hidden items-center gap-1 font-mono text-[11px] text-fg-subtle sm:flex">
                    SHA-256 {truncateMiddle(result.integrity.computedMetadataHash, 10, 6)}
                    <CopyButton value={result.integrity.computedMetadataHash} size="sm" label="Copy digest" />
                  </span>
                }
              >
                <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {result.checks.map((c, i) => (
                    <li
                      key={i}
                      className={cn(
                        'flex items-start gap-3 rounded-lg border p-4',
                        c.passed ? 'border-ok/15 bg-ok/[0.05]' : 'border-bad/20 bg-bad/[0.06]'
                      )}
                    >
                      {c.passed ? (
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok" />
                      ) : (
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-bad" />
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-fg">{c.name}</div>
                        <div className="mt-0.5 text-xs leading-relaxed text-fg-muted">{c.message}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </Panel>

              <Panel title="Custody interval chain" icon={History}>
                {result.ownershipHistory.length === 0 ? (
                  <p className="py-6 text-center text-sm text-fg-subtle">No custody intervals recorded.</p>
                ) : (
                  <ol className="relative space-y-3 pl-7">
                    <span className="absolute bottom-2 left-[9px] top-2 w-px bg-line/15" />
                    {result.ownershipHistory.map((rec) => (
                      <li key={rec.intervalNumber} className="relative">
                        <span
                          className={cn(
                            'absolute -left-7 top-4 flex h-[19px] w-[19px] items-center justify-center rounded-full border bg-canvas',
                            rec.validTo ? 'border-line/15' : 'border-accent/50'
                          )}
                        >
                          <span className={cn('h-2 w-2 rounded-full', rec.validTo ? 'bg-fg-subtle' : 'bg-accent')} />
                        </span>
                        <div className="well space-y-1.5 p-4">
                          <div className="flex items-center justify-between gap-2">
                            <span className="meta">Interval #{rec.intervalNumber}</span>
                            <StatusBadge status={rec.status} />
                          </div>
                          <div className="text-sm text-fg">
                            <span className="font-medium">{rec.custodianName}</span>{' '}
                            <span className="font-mono text-[11px] text-fg-subtle">
                              {truncateMiddle(rec.custodianDid, 20, 6)}
                            </span>
                          </div>
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
              </Panel>

              {result.blockchain.transactions.length > 0 && (
                <Panel title="On-chain transaction record" icon={ExternalLink} padded={false}>
                  <ul className="divide-y divide-line/[0.06]">
                    {result.blockchain.transactions.map((tx) => (
                      <li
                        key={tx.txHash}
                        className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-fg">{tx.txType}</div>
                          <div className="truncate font-mono text-[11px] text-fg-subtle">
                            {truncateMiddle(tx.txHash, 18, 10)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge tone="ok">{tx.status}</Badge>
                          <a
                            href={`https://explorer.aptoslabs.com/txn/${tx.txHash}?network=testnet`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary btn-sm"
                          >
                            Explorer <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
