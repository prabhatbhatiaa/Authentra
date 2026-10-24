import { lazy, Suspense, useEffect, useState } from 'react';
import { CheckCircle2, ScrollText } from 'lucide-react';
import { AuthModal } from '../components/AuthModal';
import { UserProfile } from '../types/auth.types';
import { Modal } from '../components/ui/Modal';
import { LandingNav, LandingLink } from '../components/landing/LandingNav';
import { HeroSection } from '../components/landing/HeroSection';
import { PrimitivesStrip } from '../components/landing/PrimitivesStrip';
import { ManifestoSection } from '../components/landing/ManifestoSection';
import { ArchitectureSection } from '../components/landing/ArchitectureSection';
import { LifecycleSection } from '../components/landing/LifecycleSection';
import { CapabilitiesSection } from '../components/landing/CapabilitiesSection';
import { VerifierSection } from '../components/landing/VerifierSection';
import { ClosingCta } from '../components/landing/ClosingCta';
import { Footer } from '../components/landing/Footer';
import { scrollToId, startSmoothScroll, stopSmoothScroll } from '../lib/smoothScroll';

// three.js is large; load the WebGL field after the page's text has painted.
const ParticleField = lazy(() => import('../components/three/ParticleField').then((m) => ({ default: m.ParticleField })));

interface LandingPageProps {
  user?: UserProfile | null;
  onGoToDashboard?: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const manifestoPoints = [
  ['Dual consensus', 'PostgreSQL relational performance coupled with Move on-chain immutability.'],
  ['Linear asset lifecycles', 'Non-destructive status transitions: Draft → Minted → Active → Revoked.'],
  ['W3C DIDs & Argon2id', 'Standardized identity derivation with memory-hard RFC 9106 security.'],
];

export function LandingPage({
  user,
  onGoToDashboard,
  onLoginSuccess,
  isDark,
  onToggleTheme,
}: LandingPageProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showManifesto, setShowManifesto] = useState(false);
  const [blockHeight, setBlockHeight] = useState<string | null>(null);

  // Inertial smooth scrolling for the marketing site only.
  useEffect(() => {
    startSmoothScroll();
    return () => stopSmoothScroll();
  }, []);

  // Live Aptos ledger height for the hero and footer
  useEffect(() => {
    fetch('/api/blockchain/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.ledger?.blockHeight) {
          setBlockHeight(Number(data.data.ledger.blockHeight).toLocaleString());
        }
      })
      .catch(() => {});
  }, []);

  // Support programmatic auth modal triggers
  useEffect(() => {
    const onTrigger = (e: Event) => {
      const custom = e as CustomEvent<{ mode?: 'login' | 'register' }>;
      openAuth(custom.detail?.mode ?? 'login');
    };
    window.addEventListener('authentra_open_auth', onTrigger);
    return () => window.removeEventListener('authentra_open_auth', onTrigger);
  }, []);

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const navLinks: LandingLink[] = [
    { label: 'Protocol', id: 'protocol' },
    { label: 'Architecture', id: 'architecture' },
    { label: 'Lifecycle', id: 'lifecycle' },
    { label: 'Verify', id: 'verify' },
  ];

  return (
    <div className="relative min-h-screen">
      {/* One WebGL object behind the whole page; sections steer it via data-scene. */}
      <Suspense fallback={null}>
        <ParticleField className="pointer-events-none fixed inset-0 z-0 animate-fade-in" />
      </Suspense>

      <LandingNav
        user={user}
        onGoToDashboard={onGoToDashboard}
        links={navLinks}
        onNavigate={scrollToId}
        onOpenAuth={openAuth}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
      />

      <main className="relative z-10">
        <HeroSection blockHeight={blockHeight} onOpenAuth={openAuth} onNavigate={scrollToId} />
        <PrimitivesStrip />
        <ManifestoSection />
        <ArchitectureSection />
        <LifecycleSection />
        <CapabilitiesSection />
        <VerifierSection />
        <ClosingCta onOpenAuth={openAuth} />
      </main>

      <Footer
        onNavigate={scrollToId}
        onOpenManifesto={() => setShowManifesto(true)}
        onOpenAuth={openAuth}
        blockHeight={blockHeight}
      />

      <Modal
        open={showManifesto}
        onClose={() => setShowManifesto(false)}
        size="lg"
        icon={ScrollText}
        title="The zero-trust custody standard"
        description="Protocol manifesto"
        footer={
          <button
            type="button"
            onClick={() => {
              setShowManifesto(false);
              openAuth('register');
            }}
            className="btn-primary"
          >
            Open the console
          </button>
        }
      >
        <div className="space-y-5 text-[15px] leading-relaxed text-fg-muted">
          <p>
            In an era where digital financial assets represent trillions in securities, tokenized bonds and private
            equity, reliance on isolated centralized databases is an institutional vulnerability.
          </p>
          <p className="border-l border-fg/30 pl-4 font-serif text-xl leading-snug text-fg">
            Every state transition must be mathematically provable, cryptographically bound to W3C Decentralized
            Identifiers, and anchored directly to the Aptos Move Virtual Machine.
          </p>
          <ul className="space-y-3 pt-1">
            {manifestoPoints.map(([title, body]) => (
              <li key={title} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-fg" />
                <span>
                  <span className="text-fg">{title}.</span> {body}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Modal>

      <Modal open={showAuthModal} onClose={() => setShowAuthModal(false)} size="sm" bare>
        <AuthModal
          key={authMode}
          initialMode={authMode}
          onSuccess={(user) => {
            setShowAuthModal(false);
            onLoginSuccess(user);
          }}
        />
      </Modal>
    </div>
  );
}
