import { useState, useEffect } from 'react';
import {
  Shield,
  ArrowRight,
  Sun,
  Moon,
  X,
  CheckCircle2,
} from 'lucide-react';
import { AboutSection } from '../components/landing/AboutSection';
import { FeaturedVideoSection } from '../components/landing/FeaturedVideoSection';
import { PhilosophySection } from '../components/landing/PhilosophySection';
import { ServicesSection } from '../components/landing/ServicesSection';
import { Footer } from '../components/landing/Footer';
import { AuthModal } from '../components/AuthModal';
import { UserProfile } from '../types/auth.types';

interface LandingPageProps {
  onLoginSuccess: (user: UserProfile) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function LandingPage({ onLoginSuccess, isDark, onToggleTheme }: LandingPageProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showManifesto, setShowManifesto] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [blockHeight, setBlockHeight] = useState<string>('859,420,119');

  // Fetch real Aptos blockchain telemetry
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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setMobileMenuOpen(false);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'Protocol', id: 'about' },
    { label: 'Architecture', id: 'architecture' },
    { label: 'Capabilities', id: 'capabilities' },
    { label: 'Manifesto', action: () => setShowManifesto(true) },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-950 font-sans">
      {/* SECTION 1: FULLSCREEN HERO WITH BACKGROUND VIDEO */}
      <section className="relative w-full min-h-screen overflow-hidden flex flex-col">
        {/* Fullscreen Looping Video */}
        <video
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />

        {/* Cinematic Atmospheric Overlay for Light & Dark Modes */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/60 to-slate-50 dark:from-black/75 dark:via-black/55 dark:to-[#0b0f19] pointer-events-none transition-colors duration-300" />

        {/* NAVBAR */}
        <header className="relative z-20 w-full px-6 md:px-12 lg:px-16 py-5 md:py-6 flex items-center justify-between">
          {/* Left: Logo & Desktop Links */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center font-bold text-sm shadow-md">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-semibold text-lg tracking-tight font-sans text-slate-900 dark:text-white">
                Authentra
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 ml-8">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={link.action ? link.action : () => scrollToSection(link.id!)}
                  className="text-slate-700 hover:text-slate-950 dark:text-white/80 dark:hover:text-white text-sm font-light transition-colors duration-200"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: Actions & Hamburger */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-full border border-slate-300/80 dark:border-white/20 bg-white/60 dark:bg-black/40 text-slate-700 dark:text-white/90 hover:bg-white dark:hover:bg-white/10 transition-all backdrop-blur-md"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
            </button>

            {/* Sign In Text Link (Hidden Mobile) */}
            <button
              onClick={() => openAuth('login')}
              className="hidden md:inline-block text-slate-800 hover:text-slate-950 dark:text-white/80 dark:hover:text-white text-sm font-light transition-colors duration-200 px-2"
            >
              Sign In
            </button>

            {/* Launch Console Button (Hidden Mobile) */}
            <button
              onClick={() => openAuth('register')}
              className="hidden md:inline-flex items-center gap-2 bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-medium text-sm rounded-full px-5 py-2 hover:opacity-90 transition-opacity shadow-sm"
            >
              <span>Launch Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Animated Hamburger Button (Mobile Only) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex flex-col justify-center items-end gap-1.5 w-9 h-9 p-1 focus:outline-none"
              aria-label="Toggle navigation"
            >
              <span
                className={`h-[2px] rounded-full bg-slate-900 dark:bg-white transition-all duration-500 ease-atelier ${
                  mobileMenuOpen ? 'w-6 rotate-45 translate-y-[8px]' : 'w-6'
                }`}
              />
              <span
                className={`h-[2px] rounded-full bg-slate-900 dark:bg-white transition-all duration-500 ease-atelier ${
                  mobileMenuOpen ? 'opacity-0' : 'w-4'
                }`}
              />
              <span
                className={`h-[2px] rounded-full bg-slate-900 dark:bg-white transition-all duration-500 ease-atelier ${
                  mobileMenuOpen ? 'w-6 -rotate-45 -translate-y-[8px]' : 'w-6'
                }`}
              />
            </button>
          </div>
        </header>

        {/* HERO CONTENT - CENTERED */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-5xl mx-auto my-auto py-12 space-y-6">
          {/* Main Display Headline (Instrument Serif in mixed case) */}
          <h1 className="font-instrument-serif text-slate-950 dark:text-white text-4xl sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight max-w-5xl">
            Digital <span className="italic font-instrument-serif">and</span> Asset<br />
            Governance <span className="italic font-instrument-serif">for</span> Sovereign<br />
            Institutions
          </h1>

          {/* Subtext */}
          <p className="mt-4 md:mt-5 text-slate-700 dark:text-white/70 text-sm md:text-base font-light max-w-md md:max-w-lg leading-relaxed">
            Where decentralized W3C identity meets Move smart contracts<br className="hidden sm:block" /> for deterministic digital asset custody.
          </p>

          {/* Action Buttons Row */}
          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={() => openAuth('register')}
              className="bg-slate-900 text-white dark:bg-white dark:text-black rounded-full px-7 py-3 text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-all group shadow-md"
            >
              <span>Initialize Console</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection('architecture')}
              className="transparent border border-slate-400/80 dark:border-white/40 text-slate-900 dark:text-white rounded-full px-7 py-3 text-sm font-medium hover:bg-slate-900/5 dark:hover:bg-white/10 dark:hover:border-white/60 transition-all flex items-center gap-2"
            >
              <span>Explore Architecture</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* MOBILE MENU OVERLAY (fixed inset-0 z-50, md:hidden) */}
      <div
        className={`fixed inset-0 z-50 md:hidden bg-white/95 dark:bg-black/90 backdrop-blur-xl transition-all duration-700 ease-atelier flex flex-col justify-between px-6 py-6 ${
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center font-bold text-sm">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-semibold text-lg tracking-tight font-sans text-slate-900 dark:text-white">
              Authentra
            </span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-slate-900 dark:text-white focus:outline-none"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stacked Nav Links with Staggered Delays */}
        <div className="flex flex-col items-center justify-center w-full max-w-sm mx-auto my-auto space-y-2 text-center">
          {navLinks.map((link, idx) => (
            <button
              key={link.label}
              onClick={link.action ? () => { setMobileMenuOpen(false); link.action!(); } : () => scrollToSection(link.id!)}
              style={{
                transitionDelay: `${150 + idx * 80}ms`,
              }}
              className={`w-full py-4 text-4xl sm:text-5xl font-instrument-serif text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 text-left transition-all duration-500 ease-atelier hover:pl-4 ${
                mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Mobile Footer CTA */}
        <div
          style={{ transitionDelay: '550ms' }}
          className={`w-full max-w-sm mx-auto transition-all duration-700 ease-atelier ${
            mobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <button
            onClick={() => openAuth('register')}
            className="w-full bg-slate-900 text-white dark:bg-white dark:text-black rounded-full py-4 text-center font-medium text-sm shadow-xl hover:opacity-90 transition-opacity"
          >
            Launch Console
          </button>
        </div>
      </div>

      {/* SECTION 2: PROTOCOL ESSENCE & MANIFESTO */}
      <AboutSection />

      {/* SECTION 3: DUAL ARCHITECTURE */}
      <FeaturedVideoSection onOpenAuth={openAuth} />

      {/* SECTION 4: PHILOSOPHY / CONSENSUS x PROVENANCE */}
      <PhilosophySection />

      {/* SECTION 5: PROTOCOL CAPABILITIES */}
      <ServicesSection onSelectService={() => openAuth('register')} />

      {/* SECTION 7: FINAL WORKSPACE CTA */}
      <section className="py-24 sm:py-36 px-6 overflow-hidden border-t border-slate-200/80 dark:border-white/[0.08]">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="glass-panel p-8 sm:p-14 space-y-6">
            <div className="inline-flex p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 mb-1">
              <Shield className="w-8 h-8" />
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white font-sans leading-[1.05]">
              Begin governing assets with{' '}
              <span className="font-serif italic font-normal text-slate-500 dark:text-slate-400 block sm:inline">
                mathematical certainty
              </span>
              .
            </h2>

            <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed font-normal font-sans">
              Initialize your institutional organization workspace or explore live on-chain custody proofs on Aptos Testnet.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => openAuth('register')}
                className="btn-primary py-3 px-8 text-sm font-mono w-full sm:w-auto"
              >
                INITIALIZE WORKSPACE
              </button>
              <button
                onClick={() => openAuth('login')}
                className="btn-secondary py-3 px-8 text-sm font-mono w-full sm:w-auto"
              >
                SIGN IN TO CONSOLE
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* DETAILED INSTITUTIONAL FOOTER */}
      <Footer
        onNavigate={scrollToSection}
        onOpenManifesto={() => setShowManifesto(true)}
        onOpenAuth={openAuth}
        blockHeight={blockHeight}
      />

      {/* PROTOCOL MANIFESTO MODAL */}
      {showManifesto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel p-8 sm:p-10 max-w-2xl w-full text-left space-y-6 relative max-h-[90vh] overflow-y-auto shadow-2xl">
            <button
              onClick={() => setShowManifesto(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="text-slate-400 text-xs font-mono tracking-widest uppercase">
                Protocol Manifesto
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white font-sans">
                The Zero-Trust Custody Standard
              </h3>
            </div>

            <div className="space-y-4 text-slate-600 dark:text-slate-300 text-sm leading-relaxed font-normal font-sans">
              <p>
                In an era where digital financial assets represent trillions of dollars in securities, tokenized bonds, and private equity, reliance on isolated centralized databases is an institutional vulnerability.
              </p>
              <p>
                Authentra was built on a single, uncompromising principle: <strong>Every state transition must be mathematically provable, cryptographically bound to W3C Decentralized Identifiers, and anchored directly to the Aptos Move Virtual Machine.</strong>
              </p>
              <div className="space-y-2.5 pt-2 font-sans text-xs sm:text-sm">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Dual Consensus:</strong> PostgreSQL relational performance coupled with Move on-chain immutability.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Linear Asset Lifecycles:</strong> Non-destructive status transitions (Draft → Minted → Active → Revoked).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>W3C DIDs & Argon2id:</strong> Standardized identity derivation with memory-hard RFC 9106 security.</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex justify-end">
              <button
                onClick={() => {
                  setShowManifesto(false);
                  openAuth('register');
                }}
                className="btn-primary text-xs py-2.5 px-5 font-mono"
              >
                ACCESS PLATFORM CONSOLE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTH MODAL OVERLAY */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute -top-3 -right-3 z-10 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shadow-lg border border-slate-700 text-xs font-mono"
            >
              ✕
            </button>
            <AuthModal
              initialMode={authMode}
              onSuccess={(user) => {
                setShowAuthModal(false);
                onLoginSuccess(user);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
