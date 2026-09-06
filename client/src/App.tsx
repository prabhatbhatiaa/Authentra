import { useEffect, useState } from 'react';
import { Shield, CheckCircle, Server, Database, Layers, ArrowRight } from 'lucide-react';

interface HealthData {
  status: string;
  service: string;
  version: string;
  environment: string;
  timestamp: string;
}

export function App() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then((data: HealthData) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight">AUTHENTRA</span>
              <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                v1.0.0-foundation
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm font-mono">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
              <span className={`w-2 h-2 rounded-full ${health ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-xs text-slate-400">
                Backend: {loading ? 'Checking...' : health ? 'Connected' : 'Offline / Booting'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero / Main Foundation Card */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="max-w-3xl mx-auto w-full text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Task 1 Foundation Initialized & Active</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Enterprise Identity & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
              Digital Asset Verification
            </span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            High-integrity platform binding decentralized digital identities, strict RBAC authorization, and immutable Aptos blockchain audit trails.
          </p>

          {/* System Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 text-left">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono uppercase tracking-wider">Frontend Client</span>
                <Layers className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-slate-200">React + TS + Vite + Tailwind</p>
              <div className="text-xs font-mono text-emerald-400">● 60 FPS UI Ready</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono uppercase tracking-wider">API Engine</span>
                <Server className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-slate-200">Express + TypeScript</p>
              <div className="text-xs font-mono text-slate-400">
                {health ? `● ${health.status.toUpperCase()} (${health.environment})` : '● Waiting connection'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-mono uppercase tracking-wider">Data & Ledger</span>
                <Database className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-sm font-semibold text-slate-200">PostgreSQL & Aptos Move</p>
              <div className="text-xs font-mono text-slate-400">● Ready for Task 2 Migration</div>
            </div>
          </div>

          {health && (
            <div className="mt-6 p-4 rounded-lg bg-slate-900 border border-slate-800 text-left font-mono text-xs text-slate-300">
              <div className="text-slate-400 mb-2">// Live API Diagnostic Response</div>
              <pre className="text-emerald-400 overflow-x-auto">{JSON.stringify(health, null, 2)}</pre>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 text-xs font-mono">
              API Connection note: {error} (Ensure backend server is running on port 5000)
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Authentra Security & Compliance Architecture</span>
          <span className="flex items-center gap-1 text-slate-400">
            Next: Task 2 — PostgreSQL + Prisma <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </footer>
    </div>
  );
}
