import { useEffect, useState } from 'react';
import {
  Shield,
  LogOut,
  Fingerprint,
  Boxes,
  CheckCheck,
  FileText,
  Sun,
  Moon,
} from 'lucide-react';

import { LandingPage } from './pages/LandingPage';
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
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'identity' | 'assets' | 'verify' | 'audit' | 'admin'>('dashboard');

  // Theme Management
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('authentra_theme');
    if (saved) return saved === 'dark';
    return true; // Default to dark enterprise mode
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('authentra_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('authentra_theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

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

  const isAdminOrManager = user?.roles?.includes('ADMIN') || user?.roles?.includes('MANAGER');

  // If user is unauthenticated, render the full Landing Page
  if (!checkingAuth && !user) {
    return (
      <LandingPage
        onLoginSuccess={(loggedUser) => setUser(loggedUser)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
      />
    );
  }

  // Authenticated Application Workspace Shell
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#060911] text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 transition-colors duration-300">
      {/* Top Header */}
      <header className="border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl px-6 py-3.5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-sm shadow-cyan-500/20">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-blue-700 dark:from-white dark:to-cyan-300">
                  AUTHENTRA
                </span>
                <span className="ml-2 text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10">
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
                      ? 'bg-slate-200 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  DASHBOARD
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('identity')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    currentTab === 'identity'
                      ? 'bg-slate-200 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Fingerprint className="w-3.5 h-3.5" />
                  <span>IDENTITY</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('assets')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    currentTab === 'assets'
                      ? 'bg-slate-200 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Boxes className="w-3.5 h-3.5" />
                  <span>ASSETS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('verify')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    currentTab === 'verify'
                      ? 'bg-slate-200 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>VERIFY</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab('audit')}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    currentTab === 'audit'
                      ? 'bg-slate-200 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>AUDIT</span>
                </button>
                {isAdminOrManager && (
                  <button
                    type="button"
                    onClick={() => setCurrentTab('admin')}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                      currentTab === 'admin'
                        ? 'bg-slate-200 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>ADMIN</span>
                  </button>
                )}
              </nav>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm font-mono">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* DB Status */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10">
              <span className={`w-2 h-2 rounded-full ${health?.database?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {loadingHealth ? 'Probing...' : health?.database?.connected ? 'PostgreSQL Active' : 'Offline'}
              </span>
            </div>

            {user && (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-white/10">
                <div className="text-right hidden md:block">
                  <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                    {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.email}
                  </div>
                  <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono">
                    [{user.roles.join(', ')}]
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 hover:text-rose-500 dark:text-slate-300 dark:hover:text-rose-400 border border-slate-200 dark:border-white/10 transition-colors"
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col w-full">
        {checkingAuth ? (
          <div className="text-center py-24 font-mono text-xs text-slate-400 animate-pulse">
            Verifying cryptographic credentials and session tokens...
          </div>
        ) : currentTab === 'identity' ? (
          <IdentityPage />
        ) : currentTab === 'assets' ? (
          <AssetsPage />
        ) : currentTab === 'verify' ? (
          <VerifyPage />
        ) : currentTab === 'audit' ? (
          <AuditPage />
        ) : currentTab === 'admin' ? (
          <AdminPortalPage />
        ) : (
          <DashboardPage
            user={user!}
            onNavigate={(tab) => setCurrentTab(tab)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/10 bg-white/60 dark:bg-[#060911]/80 px-6 py-4 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Authentra Security & Compliance Architecture</span>
          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            Aptos Testnet Verified • Neon PostgreSQL Secure
          </span>
        </div>
      </footer>
    </div>
  );
}
