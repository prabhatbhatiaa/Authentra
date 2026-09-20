import { ShieldCheck, Cpu, Key } from 'lucide-react';

export function AboutSection() {
  const pillars = [
    {
      numeral: '01',
      title: 'Dual-Layer Consensus',
      subtitle: 'PostgreSQL + Move VM',
      icon: ShieldCheck,
      description:
        'Continuous bi-directional reconciliation ensuring transactional database records are mathematically identical to on-chain Move contract states.',
      highlight: 'Sub-second reconciliation',
    },
    {
      numeral: '02',
      title: 'W3C Cryptographic DIDs',
      subtitle: 'did:authentra:...',
      icon: Key,
      description:
        'Self-sovereign identity credentials derived directly from Aptos Ed25519 keypairs, enabling trustless public verification without intermediaries.',
      highlight: 'RFC 9106 Argon2id KDF',
    },
    {
      numeral: '03',
      title: 'Linear Custody Intervals',
      subtitle: 'Immutable Provenance',
      icon: Cpu,
      description:
        'Non-destructive state progression from Draft through Active custody to Revocation with permanent cryptographic timestamps and audit proofs.',
      highlight: 'Zero-reentrancy bytecode',
    },
  ];

  return (
    <section id="about" className="relative py-28 sm:py-40 px-6 overflow-hidden border-t border-slate-200/80 dark:border-white/[0.08]">
      <div className="max-w-6xl mx-auto space-y-20">
        {/* Editorial Pull Statement */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>The Protocol Essence</span>
          </div>

          <p className="font-serif text-3xl sm:text-5xl lg:text-6xl text-slate-900 dark:text-slate-100 leading-[1.2] font-normal tracking-[-0.01em]">
            “In an era of synthetic assertions and fragmented ledgers,{' '}
            <span className="italic text-slate-500 dark:text-slate-400">
              trust cannot be assumed
            </span>{' '}
            — it must be computed, verified, and anchored.”
          </p>

          <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-sans font-normal pt-2">
            Authentra unites high-frequency relational transaction speeds with the mathematical certainty of the Aptos blockchain, providing deterministic digital asset custody for sovereign institutions.
          </p>
        </div>

        {/* 3 Typographic Pillars with Corner Crosshairs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.numeral}
                className="glass-panel p-8 sm:p-10 space-y-5 text-left border border-slate-200/80 dark:border-white/[0.08] relative group hover:border-slate-400 dark:hover:border-white/20 transition-all shadow-sm hover:shadow-xl"
              >
                {/* Corner Crosshairs */}
                <span className="absolute top-2 left-2.5 font-mono text-[10px] text-slate-300 dark:text-slate-700 select-none pointer-events-none">+</span>
                <span className="absolute top-2 right-2.5 font-mono text-[10px] text-slate-300 dark:text-slate-700 select-none pointer-events-none">+</span>
                <span className="absolute bottom-2 left-2.5 font-mono text-[10px] text-slate-300 dark:text-slate-700 select-none pointer-events-none">+</span>
                <span className="absolute bottom-2 right-2.5 font-mono text-[10px] text-slate-300 dark:text-slate-700 select-none pointer-events-none">+</span>

                <div className="flex items-baseline justify-between border-b border-slate-200/80 dark:border-white/10 pb-4">
                  <span className="font-serif text-3xl sm:text-4xl italic text-slate-400 dark:text-slate-500 font-normal">
                    {item.numeral}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-300">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-mono text-[10px] text-slate-400 uppercase tracking-widest block">
                    {item.subtitle}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">
                    {item.title}
                  </h3>
                </div>

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-sans font-normal">
                  {item.description}
                </p>

                <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 text-xs font-mono text-blue-600 dark:text-blue-400 flex items-center justify-between">
                  <span>{item.highlight}</span>
                  <span className="text-[10px] text-slate-400 font-sans">Active</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
