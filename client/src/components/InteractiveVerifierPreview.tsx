import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Code2,
  Cpu,
  Database,
  ShieldAlert,
  ShieldCheck,
  Terminal,
  WifiOff,
} from 'lucide-react';
import { Badge, StatusBadge, Tone } from './ui/Badge';
import { CopyButton } from './ui/CopyButton';
import { JsonView } from './ui/JsonView';
import { truncateMiddle } from '../lib/format';
import { cn } from '../lib/cn';

interface VerificationResult {
  verdict: 'VERIFIED' | 'REVOKED' | 'MISMATCH' | 'BLOCKCHAIN_UNAVAILABLE' | 'NOT_FOUND' | 'UNANCHORED';
  verdictMessage: string;
  verifiedAt: string;
  asset: {
    assetNumber: number;
    name: string;
    assetType: string;
    status: string;
    organization?: { name: string };
    currentOwner?: {
      did: string;
      walletAddress: string;
      name: string;
      verificationStatus: string;
    } | null;
  } | null;
  integrity: {
    computedMetadataHash: string;
    matchesOnChain: boolean | null;
  };
  blockchain: {
    network: string;
    moduleAddress: string;
    connected: boolean;
    onChainRecord?: unknown;
  };
  checks: Array<{ name: string; passed: boolean; message: string }>;
}

const verdictTone: Record<VerificationResult['verdict'], Tone> = {
  VERIFIED: 'ok',
  REVOKED: 'bad',
  MISMATCH: 'warn',
  BLOCKCHAIN_UNAVAILABLE: 'info',
  UNANCHORED: 'accent',
  NOT_FOUND: 'neutral',
};

// Seeded records (see prisma/seed.ts) — the genesis certificate is asset #1.
const presets = [
  { label: '#1', id: '1' },
  { label: 'Genesis certificate', id: 'Enterprise Security Master Certificate' },
  { label: '#101', id: '101' },
];

/**
 * Live, public verifier embedded on the landing page. Calls the same
 * unauthenticated endpoint as the console's Verify page. When the API is
 * unreachable it says so plainly rather than showing a simulated verdict.
 */
export function InteractiveVerifierPreview() {
  const [query, setQuery] = useState('1');
  const [verifying, setVerifying] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [offline, setOffline] = useState(false);

  const handleVerify = async (target: string) => {
    const clean = target.trim();
    if (!clean) return;
    setVerifying(true);
    setQuery(clean);
    setOffline(false);

    try {
      const res = await fetch(`/api/verification/verify/${encodeURIComponent(clean)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setResult(json.data);
      } else {
        throw new Error(json.error?.message || 'Verification unavailable');
      }
    } catch {
      setResult(null);
      setOffline(true);
    } finally {
      setVerifying(false);
    }
  };

  useEffect(() => {
    handleVerify('1');
  }, []);

  const verified = result?.verdict === 'VERIFIED';
  const passed = result?.checks.filter((c) => c.passed).length ?? 0;

  return (
    <div className="card overflow-hidden rounded-xl text-left">
      {/* Window chrome */}
      <div className="flex flex-col gap-3 border-b border-line/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-fg/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-fg/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-fg/15" />
          </div>
          <span className="flex items-center gap-2 font-mono text-[11px] text-fg-muted">
            <Terminal className="h-3.5 w-3.5" /> verify — public endpoint
          </span>
        </div>
        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
          {presets.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => handleVerify(p.id)}
              className={cn(
                'h-7 shrink-0 rounded-md border px-2.5 text-[12px] transition-colors duration-150',
                query === p.id
                  ? 'border-transparent bg-fg text-canvas'
                  : 'border-line/10 bg-fg/[0.03] text-fg-muted hover:border-line/20 hover:text-fg',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Query */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleVerify(query);
        }}
        className="flex flex-col gap-2.5 px-5 pt-5 sm:flex-row sm:px-6"
      >
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-sm text-accent">
            ›
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Asset number, UUID or exact name"
            aria-label="Asset to verify"
            className="input pl-9 font-mono text-[13px]"
          />
        </div>
        <button type="submit" disabled={verifying || !query.trim()} className="btn-primary">
          {verifying ? (
            <>
              <Cpu className="h-4 w-4 animate-spin" /> Verifying…
            </>
          ) : (
            <>
              Run proof <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="min-h-[300px] p-5 sm:p-6">
        <AnimatePresence mode="wait">
          {offline && !verifying && (
            <motion.div
              key="offline"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-3 py-14 text-center"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-line/10 bg-fg/[0.04] text-fg-muted">
                <WifiOff className="h-5 w-5" />
              </span>
              <div className="font-serif text-2xl text-fg">The verifier is offline</div>
              <p className="max-w-sm text-sm text-fg-muted">
                Start the Authentra API to run live proofs against PostgreSQL and the Aptos ledger.
              </p>
              <button type="button" onClick={() => handleVerify(query)} className="btn-secondary btn-sm mt-2">
                Try again
              </button>
            </motion.div>
          )}

          {result && !verifying && (
            <motion.div
              key={`${result.verdict}-${result.verifiedAt}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              {/* Verdict */}
              <div className="well flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  {verified ? (
                    <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-ok" />
                  ) : (
                    <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0 text-warn" />
                  )}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={verdictTone[result.verdict]} dot>
                        {result.verdict.replace(/_/g, ' ')}
                      </Badge>
                      {result.checks.length > 0 && (
                        <span className="font-mono text-[11px] text-fg-subtle">
                          {passed}/{result.checks.length} checks passed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-fg-muted">{result.verdictMessage}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowRawJson((v) => !v)}
                  className="btn-ghost btn-sm shrink-0 self-start sm:self-auto"
                >
                  <Code2 className="h-3.5 w-3.5" /> {showRawJson ? 'Hide JSON' : 'Raw JSON'}
                </button>
              </div>

              {showRawJson && <JsonView value={result} className="max-h-72" />}

              {result.asset && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="well space-y-1 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-medium text-fg">
                        <Database className="h-3.5 w-3.5 text-fg-subtle" /> PostgreSQL record
                      </span>
                      <StatusBadge status={result.asset.status} />
                    </div>
                    <dl>
                      <div className="kv text-[13px]">
                        <dt>Asset</dt>
                        <dd className="truncate">
                          #{result.asset.assetNumber} · {result.asset.name}
                        </dd>
                      </div>
                      <div className="kv text-[13px]">
                        <dt>Type</dt>
                        <dd className="font-mono text-xs">{result.asset.assetType}</dd>
                      </div>
                      <div className="kv text-[13px]">
                        <dt>Custodian</dt>
                        <dd className="flex items-center justify-end gap-1 font-mono text-xs">
                          {result.asset.currentOwner ? (
                            <>
                              {truncateMiddle(result.asset.currentOwner.did, 14, 4)}
                              <CopyButton value={result.asset.currentOwner.did} size="sm" label="Copy DID" />
                            </>
                          ) : (
                            'Unassigned'
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="well space-y-1 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-2 text-xs font-medium text-fg">
                        <Cpu className="h-3.5 w-3.5 text-fg-subtle" /> Aptos Move state
                      </span>
                      <Badge tone={result.blockchain.connected ? 'ok' : 'warn'} dot>
                        {result.blockchain.connected ? 'Connected' : 'Unreachable'}
                      </Badge>
                    </div>
                    <dl>
                      <div className="kv text-[13px]">
                        <dt>Network</dt>
                        <dd className="font-mono text-xs uppercase">{result.blockchain.network}</dd>
                      </div>
                      <div className="kv text-[13px]">
                        <dt>Module</dt>
                        <dd className="font-mono text-xs">{truncateMiddle(result.blockchain.moduleAddress, 8, 4)}</dd>
                      </div>
                      <div className="kv text-[13px]">
                        <dt>Digest</dt>
                        <dd className="flex items-center justify-end gap-1 font-mono text-xs">
                          {truncateMiddle(result.integrity.computedMetadataHash, 8, 4)}
                          <CopyButton value={result.integrity.computedMetadataHash} size="sm" label="Copy digest" />
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}

              {result.checks.length > 0 && (
                <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {result.checks.map((check, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2.5 rounded-xl border border-line/[0.07] bg-fg/[0.02] px-3 py-2.5 text-xs"
                    >
                      {check.passed ? (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-ok" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-bad" />
                      )}
                      <span className="truncate text-fg-muted" title={check.message}>
                        {check.name}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}

          {verifying && (
            <motion.div
              key="verifying"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              <div className="skeleton h-20 rounded-xl" />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="skeleton h-32 rounded-xl" />
                <div className="skeleton h-32 rounded-xl" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
