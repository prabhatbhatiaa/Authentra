import { useEffect, useState } from 'react';
import {
  Shield,
  ArrowRight,
  LogOut,
  User,
  Key,
  Fingerprint,
  Building2,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { AuthModal } from './components/AuthModal';
import { authClient } from './services/auth.service';
import { UserProfile } from './types/auth.types';

interface HealthData {
  status: string;
  service: string;
  version: string;
  environment: string;
  database?: {
    connected: boolean;
    provider: string;
    counts: {
      organizations: number;
      users: number;
      assets: number;
    };
  };
  timestamp: string;
}

export function App() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  // Fetch API health
  const refreshHealth = () => {
    setLoadingHealth(true);
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: HealthData) => {
        setHealth(data);
        setLoadingHealth(false);
      })
      .catch(() => {
        setLoadingHealth(false);
      });
  };

  // Check current session
  useEffect(() => {
    refreshHealth();

    const token = localStorage.getItem('authentra_token');
    if (token) {
      authClient
        .getMe()
        .then((res) => {
          setUser(res.data.user);
          setCheckingAuth(false);
        })
        .catch(() => {
          localStorage.removeItem('authentra_token');
          localStorage.removeItem('authentra_user');
          setUser(null);
          setCheckingAuth(false);
        });
    } else {
      setCheckingAuth(false);
    }

    const handleAuthChange = () => {
      const stored = localStorage.getItem('authentra_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    };

    window.addEventListener('authentra_auth_change', handleAuthChange);
    return () => window.removeEventListener('authentra_auth_change', handleAuthChange);
  }, []);

  const handleLogout = async () => {
    await authClient.logout();
    setUser(null);
    refreshHealth();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-3.5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-semibold text-lg tracking-tight">AUTHENTRA</span>
              <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                v1.0.0-auth
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-sm font-mono">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
              <span className={`w-2 h-2 rounded-full ${health?.database?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-xs text-slate-400">
                {loadingHealth ? 'Probing...' : health?.database?.connected ? 'PostgreSQL Active' : 'Offline'}
              </span>
            </div>

            {user && (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-medium text-slate-200">
                    {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono">
                    [{user.roles.join(', ')}]
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-rose-400 transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 flex flex-col justify-center w-full">
        {checkingAuth ? (
          <div className="text-center py-20 font-mono text-xs text-slate-400 animate-pulse">
            Verifying cryptographic credentials and session tokens...
          </div>
        ) : !user ? (
          /* Unauthenticated State: Render Authentication Gateway */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto w-full">
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Task 3: Production Auth Active</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
                Decentralized Identity & <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                  Access Management
                </span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Sign in with enterprise accounts or register to receive your cryptographic Authentra DID bound to an Aptos blockchain wallet.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">PASSWORD HASHING</div>
                  <div className="text-emerald-400 font-semibold mt-1">Argon2id Memory-Hard</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-400 text-[11px]">SESSION INTEGRITY</div>
                  <div className="text-emerald-400 font-semibold mt-1">HMAC-SHA256 JWT</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6">
              <AuthModal onSuccess={(u) => setUser(u)} />
            </div>
          </div>
        ) : (
          /* Authenticated State: Active Executive Workspace */
          <div className="space-y-6 max-w-5xl mx-auto w-full">
            {/* Greeting & Quick Identity Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Fingerprint className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>Welcome back, {user.firstName || user.email}</span>
                      <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {user.identity?.verificationStatus || 'ACTIVE'}
                      </span>
                    </h2>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">
                      Authenticated under {user.organization.name} ({user.organization.slug})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono text-slate-300 hover:text-rose-400 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>End Session</span>
                  </button>
                </div>
              </div>

              {/* Cryptographic Identity Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-emerald-400" />
                    <span>DECENTRALIZED IDENTIFIER (DID)</span>
                  </div>
                  <div className="text-xs font-mono text-emerald-400 font-semibold break-all">
                    {user.identity?.did || 'No DID Bound'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>APTOS WALLET ADDRESS</span>
                  </div>
                  <div className="text-xs font-mono text-slate-300 font-semibold break-all">
                    {user.identity?.walletAddress || '0x...'}
                  </div>
                </div>
              </div>
            </div>

            {/* Roles & Permissions Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assigned Roles */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-400" /> Assigned Roles
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {user.roles.length} active
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.roles.map((r) => (
                    <span
                      key={r}
                      className="px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Effective Server Permissions */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" /> Effective Server Permissions
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {user.permissions.length} granted
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {user.permissions.map((p) => (
                    <span
                      key={p}
                      className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[10px]"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Diagnostic Token Payload */}
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left font-mono text-xs text-slate-300 space-y-2">
              <div className="text-slate-400 text-xs flex items-center justify-between">
                <span>// Verified Protected Session Context (`GET /api/auth/me`)</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  Status: 200 OK <ExternalLink className="w-3 h-3" />
                </span>
              </div>
              <pre className="text-emerald-400 bg-slate-950 p-3 rounded-lg overflow-x-auto text-[11px]">
                {JSON.stringify(user, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Authentra Security & Compliance Architecture</span>
          <span className="flex items-center gap-1 text-slate-400">
            Next: Task 4 — Identity Management <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </footer>
    </div>
  );
}
