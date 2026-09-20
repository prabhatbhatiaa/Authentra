import { Fingerprint, Shield } from 'lucide-react';

export function PhilosophySection() {
  return (
    <section className="py-20 sm:py-32 px-6 overflow-hidden border-t border-slate-200/80 dark:border-white/[0.08]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Editorial Heading mixing Inter & Instrument Serif */}
        <div className="text-left space-y-3">
          <div className="text-slate-400 dark:text-slate-500 text-xs tracking-widest uppercase font-mono">
            Core Philosophy
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 dark:text-white font-sans leading-[1.05]">
            Consensus{' '}
            <span className="font-serif italic font-normal text-slate-400 dark:text-slate-500">
              meets
            </span>{' '}
            Provenance.
          </h2>
        </div>

        {/* Two-Column Structured Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Card 1: Deterministic Custody */}
          <div className="glass-panel p-8 sm:p-10 space-y-6 flex flex-col justify-between hover:border-slate-400 dark:hover:border-white/20 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Fingerprint className="w-5 h-5" />
                </div>
                <span className="font-serif text-2xl italic text-slate-400 dark:text-slate-500 font-normal">
                  Pillar I
                </span>
              </div>

              <div className="text-xs font-mono tracking-wider uppercase text-slate-400">
                Identity & Cryptographic Anchoring
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">
                Deterministic Custody & Ownership Chains
              </h3>

              <p className="font-serif italic text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                “A digital security without verifiable self-sovereign identity is merely an entry in someone else’s database.”
              </p>

              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-normal font-sans">
                Every meaningful digital security begins at the intersection of cryptographic discipline and enterprise certainty. Authentra derives W3C Decentralized Identifiers directly from Aptos Ed25519 addresses, securing linear custody intervals from initial issuance to final redemption.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200/80 dark:border-white/10 grid grid-cols-2 gap-4 font-mono text-xs text-slate-600 dark:text-slate-400">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Identity Standard</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">did:authentra:...</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">State Model</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Linear Non-Destructive</span>
              </div>
            </div>
          </div>

          {/* Card 2: Institutional Compliance */}
          <div className="glass-panel p-8 sm:p-10 space-y-6 flex flex-col justify-between hover:border-slate-400 dark:hover:border-white/20 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="font-serif text-2xl italic text-slate-400 dark:text-slate-500 font-normal">
                  Pillar II
                </span>
              </div>

              <div className="text-xs font-mono tracking-wider uppercase text-slate-400">
                Security & Anti-Escalation
              </div>

              <h3 className="text-2xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">
                Institutional Compliance & Zero Discrepancy
              </h3>

              <p className="font-serif italic text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                “Trust is forged through constant mathematical reconciliation, not human assumption.”
              </p>

              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-normal font-sans">
                With Argon2id memory-hard hashing, server-enforced role permissions, and Move VM formal verification, our dual-consensus architecture ensures that what you see in the executive console matches the on-chain ledger with zero discrepancy.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200/80 dark:border-white/10 grid grid-cols-2 gap-4 font-mono text-xs text-slate-600 dark:text-slate-400">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Key Derivation</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">RFC 9106 Argon2id</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Access Control</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Anti-Escalation RBAC</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
