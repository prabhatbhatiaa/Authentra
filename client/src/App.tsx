import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { authClient } from './services/auth.service';
import { UserProfile } from './types/auth.types';
import { AppShell, HealthData } from './components/layout/AppShell';
import { getNavItems, isTabId, TabId } from './components/layout/nav';
import { LogoMark } from './components/ui/Logo';

// Route-level code splitting: visitors only download the landing page,
// signed-in users only download the console pages they open.
const LandingPage = lazy(() => import('./pages/LandingPage').then((m) => ({ default: m.LandingPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const IdentityPage = lazy(() => import('./pages/IdentityPage').then((m) => ({ default: m.IdentityPage })));
const AssetsPage = lazy(() => import('./pages/AssetsPage').then((m) => ({ default: m.AssetsPage })));
const VerifyPage = lazy(() => import('./pages/VerifyPage').then((m) => ({ default: m.VerifyPage })));
const AuditPage = lazy(() => import('./pages/AuditPage').then((m) => ({ default: m.AuditPage })));
const AdminPortalPage = lazy(() => import('./pages/AdminPortalPage').then((m) => ({ default: m.AdminPortalPage })));

/** Read the active console tab from the URL hash (`#/assets`). */
function tabFromHash(): TabId {
  const raw = window.location.hash.replace(/^#\/?/, '');
  return isTabId(raw) ? raw : 'dashboard';
}

function SessionSplash({ label = 'Verifying session' }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-canvas">
      <LogoMark className="h-8 w-8 animate-pulse" />
      <p className="meta">{label}</p>
    </div>
  );
}

export function App() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<TabId>(tabFromHash);

  // Theme management
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('authentra_theme');
    if (saved) return saved === 'dark';
    return true; // Default to dark enterprise mode
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    localStorage.setItem('authentra_theme', isDark ? 'dark' : 'light');
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

  // Keep the active tab in sync with the URL so refresh and back/forward work.
  useEffect(() => {
    const onHashChange = () => setCurrentTab(tabFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((tab: TabId) => {
    if (`#/${tab}` !== window.location.hash) {
      window.location.hash = `/${tab}`;
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0 });
  }, []);

  const handleLogout = async () => {
    await authClient.logout();
    setUser(null);
    history.replaceState(null, '', window.location.pathname + window.location.search);
    setCurrentTab('dashboard');
    refreshHealth();
  };

  const isAdminOrManager = !!(user?.roles?.includes('ADMIN') || user?.roles?.includes('MANAGER'));

  if (checkingAuth) {
    return <SessionSplash />;
  }

  // Unauthenticated visitors see the marketing landing page
  if (!user) {
    return (
      <Suspense fallback={<SessionSplash label="Loading" />}>
        <LandingPage
          onLoginSuccess={(loggedUser) => {
            setUser(loggedUser);
            navigate('dashboard');
          }}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />
      </Suspense>
    );
  }

  const navItems = getNavItems(isAdminOrManager);
  // Guard against a hash pointing at a tab this user cannot see.
  const activeTab: TabId = navItems.some((n) => n.id === currentTab) ? currentTab : 'dashboard';

  const renderPage = () => {
    switch (activeTab) {
      case 'identity':
        return <IdentityPage />;
      case 'assets':
        return <AssetsPage />;
      case 'verify':
        return <VerifyPage />;
      case 'audit':
        return <AuditPage />;
      case 'admin':
        return <AdminPortalPage />;
      default:
        return <DashboardPage user={user} canAdminister={isAdminOrManager} onNavigate={navigate} />;
    }
  };

  return (
    <AppShell
      user={user}
      navItems={navItems}
      currentTab={activeTab}
      onNavigate={navigate}
      onLogout={handleLogout}
      isDark={isDark}
      onToggleTheme={toggleTheme}
      health={health}
      loadingHealth={loadingHealth}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex w-full flex-1 flex-col"
        >
          <Suspense fallback={<div className="skeleton h-[60vh] rounded-xl" />}>{renderPage()}</Suspense>
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}
