import { Database, Cpu, CheckCircle2, ArrowRight, ShieldCheck, Zap, RefreshCw } from 'lucide-react';

interface FeaturedVideoSectionProps {
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export function FeaturedVideoSection({ onOpenAuth }: FeaturedVideoSectionProps) {
  return (
    <section id="architecture" className="py-24 sm:py-36 px-6 overflow-hidden border-t border-slate-200/80 dark:border-white/[0.08]">
      <div className="max-w-6xl mx-auto space-y-20">
        {/* Section Header with Typographic Contrast */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <Zap className="w-3.5 h-3.5 text-blue-500" />
            <span>Dual-Consensus Architecture</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white font-sans leading-[1.1]">
            Two engines,{' '}
            <span className="font-serif italic font-normal text-slate-500 dark:text-slate-400">
              one verifiable truth
            </span>
            .
          </h2>

          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base leading-relaxed font-normal font-sans">
            Authentra decouples high-speed data queries from on-chain state anchors. Your applications query records at sub-millisecond speeds while Aptos Move bytecode guarantees tamper-proof immutability.
          </p>
        </div>

        {/* Visual Pipeline Reconciliation Flow */}
        <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center font-mono text-xs">
            {/* Stage 1 */}
            <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-wider block">01 / Ingestion</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block text-sm">PostgreSQL Pooler</span>
              <span className="text-[11px] text-slate-500 block">&lt; 4ms CRUD & Session Index</span>
            </div>

            {/* Reconciler Link */}
            <div className="flex flex-col items-center justify-center py-2 space-y-1">
              <div className="flex items-center gap-2 text-slate-500 font-semibold text-xs">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-500" />
                <span>SHA-256 State Reconciler</span>
              </div>
              <span className="text-[10px] text-slate-400">Continuous 100% Vector Parity</span>
            </div>

            {/* Stage 3 */}
            <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-white/5 space-y-1">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">02 / Anchor</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 block text-sm">Aptos Move VM</span>
              <span className="text-[11px] text-slate-500 block">Formal Bytecode Verification</span>
            </div>
          </div>
        </div>

        {/* Two-Layer Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Layer 1: Enterprise Relational Core */}
          <div className="glass-panel p-8 sm:p-10 space-y-6 flex flex-col justify-between hover:border-slate-400 dark:hover:border-white/20 transition-all relative group">
            <span className="absolute top-2 left-2.5 font-mono text-[10px] text-slate-300 dark:text-slate-700 select-none pointer-events-none">+</span>
            <span className="absolute top-2 right-2.5 font-mono text-[10px] text-slate-300 dark:text-slate-700 select-none pointer-events-none">+</span>
            <span className="absolute bottom-2 left-2.5 font-mono text-[10px] text-slate-300 dark:text-slate-700 select-none pointer-events-none">+</span>
            <span className="absolute bottom-2 right-2.5 font-mono text-[10px] text-slate-300 dark:text-slate-700 select-none pointer-events-none">+</span>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Database className="w-5 h-5" />
                </div>
                <span className="font-serif text-2xl italic text-slate-400 dark:text-slate-500 font-normal">
                  Layer I
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">
                  Enterprise Relational Core
                </h3>
                <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mt-1">
                  Neon PostgreSQL Serverless • PgBouncer Pooler • Prisma ORM
                </p>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal font-sans">
                Handles high-frequency transactional queries, relational indexing, user sessions, and organization multi-tenancy with sub-millisecond latency.
              </p>

              <ul className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-300 font-sans">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>Sub-millisecond query latency for dashboard analytics & filtering.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>Strict multi-tenant organization boundary isolation.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <span>Argon2id password hashing with memory-hard parameter tuning (RFC 9106).</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs font-mono text-slate-500">
              <span>Read Latency: &lt; 4ms</span>
              <span>Connection Pool: Synced</span>
            </div>
          </div>

          {/* Layer 2: Aptos Move Smart Contract Layer */}
          <div className="glass-panel p-8 sm:p-10 space-y-6 flex flex-col justify-between hover:border-slate-400 dark:hover:border-white/20 transition-all relative group">
            <span className="absolute top-2 left-2.5 font-mono text-[10px] text-slate-300 dark:text-slate-700 select-none pointer-events-none">+</span>
            <span className="absolute top-2 right-2.5 font-mono text-[10px] text-slate-300 dark:text-slate-700 select-none pointer-events-none">+</span>
            <span className="absolute bottom-2 left-2.5 font-mono text-[10px] text-slate-300 dark:text-slate-700 select-none pointer-events-none">+</span>
            <span className="absolute bottom-2 right-2.5 font-mono text-[10px] text-slate-300 dark:text-slate-700 select-none pointer-events-none">+</span>

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="font-serif text-2xl italic text-slate-400 dark:text-slate-500 font-normal">
                  Layer II
                </span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">
                  Aptos Move VM On-Chain Engine
                </h3>
                <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                  Move Bytecode • SHA-256 Anchors • AptosBFTv4 Consensus
                </p>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal font-sans">
                Anchors digital securities and custody intervals directly to the Aptos blockchain with native Move resource safety, formal verification, and zero re-entrancy risks.
              </p>

              <ul className="space-y-3 pt-2 text-xs text-slate-600 dark:text-slate-300 font-sans">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Trustless state machine ensuring custody intervals cannot be forged.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Decentralized W3C DID verification accessible to any external validator node.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Cryptographic metadata hashes matched against smart contract bytecode.</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs font-mono text-slate-500">
              <span>Block Time: ~400ms</span>
              <span>Formal Safety: Verified</span>
            </div>
          </div>
        </div>

        {/* Architecture Spec CTA Bar */}
        <div className="glass-panel p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h4 className="font-bold text-base text-slate-900 dark:text-white font-sans">
                Enterprise Cryptographic Verification Engine
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-sans">
              Authorized institutional operators reconcile custody intervals across PostgreSQL and Aptos Move VM contracts.
            </p>
          </div>

          <button
            onClick={() => onOpenAuth?.('register')}
            className="btn-primary py-2.5 px-6 whitespace-nowrap text-xs font-mono flex items-center gap-2 w-full sm:w-auto"
          >
            <span>REQUEST OPERATOR ACCESS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
