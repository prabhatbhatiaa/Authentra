import { useState } from 'react';
import { Shield, ArrowRight, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenManifesto: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  blockHeight: string;
}

export function Footer({
  onNavigate,
  onOpenManifesto,
  onOpenAuth,
  blockHeight,
}: FooterProps) {
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribedEmail.trim()) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setSubscribedEmail('');
    }
  };

  return (
    <footer className="border-t border-slate-200/80 dark:border-white/10 bg-white dark:bg-[#070b12] text-slate-600 dark:text-slate-400 font-sans transition-colors duration-200">
      {/* Top Banner: Brand, Navigation & Telemetry Dispatch */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Brand & Nav Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center font-bold text-sm shadow-sm">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-semibold text-lg tracking-tight font-sans text-slate-900 dark:text-white">
                Authentra
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Aptos Testnet
              </span>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md leading-relaxed font-light">
              Enterprise decentralized identity and deterministic digital asset custody. Cryptographically binding W3C Decentralized Identifiers with Move smart contracts.
            </p>

            {/* Clean Horizontal Quick Navigation */}
            <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-light text-slate-600 dark:text-slate-400 pt-1">
              <button
                onClick={() => onNavigate('about')}
                className="hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                Protocol
              </button>
              <button
                onClick={() => onNavigate('architecture')}
                className="hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                Architecture
              </button>
              <button
                onClick={() => onNavigate('capabilities')}
                className="hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                Capabilities
              </button>
              <button
                onClick={onOpenManifesto}
                className="hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                Manifesto
              </button>
              <button
                onClick={() => onOpenAuth('login')}
                className="hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="text-slate-900 dark:text-white font-medium hover:underline transition-all"
              >
                Launch Console →
              </button>
            </nav>
          </div>

          {/* Newsletter / Updates Subscription Form */}
          <div className="lg:col-span-6 space-y-4 lg:pl-8">
            <div className="space-y-1">
              <h4 className="text-xs font-mono uppercase tracking-widest text-slate-900 dark:text-white font-semibold">
                Protocol Telemetry & Security Advisories
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-light">
                Receive smart contract audits, Move module upgrades, and ledger consensus notices.
              </p>
            </div>

            {subscribed ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Subscription confirmed. Dispatch updates active.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2.5 max-w-md">
                <input
                  type="email"
                  required
                  value={subscribedEmail}
                  onChange={(e) => setSubscribedEmail(e.target.value)}
                  placeholder="auditor@institution.com"
                  className="flex-1 px-4 py-2.5 rounded-full bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 font-mono outline-none focus:border-slate-400 dark:focus:border-white/30 transition-colors"
                />
                <button
                  type="submit"
                  className="bg-slate-900 text-white dark:bg-white dark:text-slate-950 text-xs font-medium px-5 py-2.5 rounded-full flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar: Refined Container Modules */}
      <div className="border-t border-slate-200/80 dark:border-white/10 py-8 px-6 md:px-12 bg-slate-50/50 dark:bg-black/30">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 font-mono text-xs text-slate-500">
          {/* Container 1: Copyright & Seal */}
          <div className="flex items-center gap-2.5 text-center lg:text-left">
            <span className="text-slate-700 dark:text-slate-300 font-medium">© 2026 Authentra Protocol Foundation</span>
            <span className="text-slate-300 dark:text-slate-700 select-none">•</span>
            <span className="text-slate-400 dark:text-slate-500">Sovereign Custody</span>
          </div>

          {/* Container 2: Operational Telemetry Capsule */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 shadow-sm text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">Nodes Operational</span>
            <span className="text-slate-300 dark:text-slate-700 select-none">|</span>
            <span className="text-slate-500">Block {blockHeight}</span>
            <span className="text-slate-300 dark:text-slate-700 select-none">|</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">99.99% Parity</span>
          </div>

          {/* Container 3: Cryptographic Standard Badges */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              W3C DID v1.0
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              RFC 9106
            </span>
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-white/10 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              Aptos Move VM
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
