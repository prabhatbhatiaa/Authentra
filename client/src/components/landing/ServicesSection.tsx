import { Fingerprint, Cpu, Boxes, FileText, ArrowRight } from 'lucide-react';

interface ServicesSectionProps {
  onSelectService?: (serviceName: string) => void;
}

export function ServicesSection({ onSelectService }: ServicesSectionProps) {
  const capabilities = [
    {
      id: 'dids',
      numeral: '01',
      tag: 'IDENTITY & PROOF',
      title: 'W3C DIDs & Verifiable Credentials',
      description:
        'Deterministic cryptographic identity derivation bound to Aptos Ed25519 addresses. Issue, resolve, and audit institutional credentials with universal interoperability.',
      icon: Fingerprint,
      metric: 'did:authentra:...',
    },
    {
      id: 'move',
      numeral: '02',
      tag: 'EXECUTION & SAFETY',
      title: 'Aptos Move VM On-Chain Engine',
      description:
        'Native Move modules engineered for zero-reentrancy, linear resource typing, and formal verification. Powers linear asset custody intervals with mathematically provable state guarantees.',
      icon: Cpu,
      metric: 'AptosBFTv4 Consensus',
    },
    {
      id: 'lifecycle',
      numeral: '03',
      tag: 'ASSET GOVERNANCE',
      title: 'Linear Ownership & Custody Intervals',
      description:
        'Non-destructive state machine transitions from Draft through Active custody to Revocation with permanent interval timestamps, counterparty signatures, and cryptographic anchoring.',
      icon: Boxes,
      metric: 'Draft → Active → Revoked',
    },
    {
      id: 'audit',
      numeral: '04',
      tag: 'FORENSIC COMPLIANCE',
      title: 'Immutable Forensic Audit Trail',
      description:
        'Every authentication event, role reconfiguration, asset transfer, and smart contract execution is permanently committed with actor identity, timestamp, and SHA-256 state hashes.',
      icon: FileText,
      metric: 'Tamper-Evident Logs',
    },
  ];

  return (
    <section id="capabilities" className="py-20 sm:py-32 px-6 overflow-hidden border-t border-slate-200/80 dark:border-white/[0.08]">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-white/10 pb-6">
          <div className="space-y-3">
            <span className="text-slate-400 dark:text-slate-500 text-xs font-mono tracking-widest uppercase">
              Core Modules // Aptos Move
            </span>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white font-sans leading-[1.05]">
              The architecture of{' '}
              <span className="font-serif italic font-normal text-slate-500 dark:text-slate-400">
                institutional trust
              </span>
              .
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-mono text-slate-500 max-w-xs sm:text-right">
            Engineered for zero-trust security and sub-second auditability.
          </p>
        </div>

        {/* 4-Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => onSelectService?.(item.id)}
                className="glass-panel-hover p-8 sm:p-10 space-y-6 text-left cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-800 dark:text-slate-200 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 dark:text-slate-500">
                        {item.tag}
                      </span>
                    </div>

                    <span className="font-serif text-2xl italic text-slate-400 dark:text-slate-500 font-normal">
                      {item.numeral}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal font-sans">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>{item.metric}</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-slate-700 dark:text-slate-300">
                    <span>Inspect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
