import { useEffect, useState } from 'react';
import {
  Shield,
  ArrowRight,
  LogOut,
  Fingerprint,
  CheckCircle,
  Boxes,
  CheckCheck,
  FileText,
} from 'lucide-react';

import { AuthModal } from './components/AuthModal';
import { IdentityPage } from './pages/IdentityPage';
import { AdminPortalPage } from './pages/AdminPortalPage';
import { AssetsPage } from './pages/AssetsPage';
import { VerifyPage } from './pages/VerifyPage';
import { AuditPage } from './pages/AuditPage';
import { DashboardPage } from './pages/DashboardPage';
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

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'identity' | 'assets' | 'verify' | 'audit' | 'admin'>('dashboard');

  const isAdminOrManager = user?.roles.includes('ADMIN') || user?.roles.includes('MANAGER');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-brand-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-3.5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-lg tracking-tight">AUTHENTRA</span>
                <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  v1.0.0
                </span>
              </div>
            </div>

            {user && (
              <nav className="hidden sm:flex items-center gap-1 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setCurrentTab('dashboard')}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    currentTab === 'dashboard'
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  DASHBOARD
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('identity')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    currentTab === 'identity'
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>IDENTITY (/identity)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('assets')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    currentTab === 'assets'
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Boxes className="w-3.5 h-3.5" />
                  <span>ASSETS (/assets)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('verify')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    currentTab === 'verify'
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>VERIFY (/verify)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('audit')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    currentTab === 'audit'
                      ? 'bg-slate-800 text-emerald-400 border border-slate-700 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>AUDIT (/audit)</span>
                </button>
                {isAdminOrManager && (
                  <button
                    type="button"
                    onClick={() => setCurrentTab('admin')}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                      currentTab === 'admin'
                        ? 'bg-slate-800 text-emerald-400 border border-slate-700 font-semibold'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>ADMIN (/admin)</span>
                  </button>
                )}
              </nav>
            )}
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
        ) : currentTab === 'identity' ? (
          /* Render Dedicated Identity Management Page (/identity) */
          <IdentityPage />
        ) : currentTab === 'assets' ? (
          /* Render Dedicated Digital Assets Lifecycle & Ownership Page (/assets) */
          <AssetsPage />
        ) : currentTab === 'verify' ? (
          /* Render Dedicated Multi-Source Verification Engine (/verify) */
          <VerifyPage />
        ) : currentTab === 'audit' ? (
          /* Render Dedicated Immutable System Audit Trail (/audit) */
          <AuditPage />
        ) : currentTab === 'admin' ? (
          /* Render Dedicated Admin Governance & RBAC Portal (/admin) */
          <AdminPortalPage />
        ) : (



          /* Authenticated State: Active Executive Workspace */
          <DashboardPage
            user={user}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}
      </main>


      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-6 py-4 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Authentra Security & Compliance Architecture</span>
          <span className="flex items-center gap-1 text-slate-400">
            Next: Task 7 — Move Smart Contract (Aptos) <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </footer>
    </div>
  );
}
