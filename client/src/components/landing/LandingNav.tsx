import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { scrollToTop } from '../../lib/smoothScroll';
import { cn } from '../../lib/cn';

export interface LandingLink {
  label: string;
  id?: string;
  action?: () => void;
}

interface LandingNavProps {
  links: LandingLink[];
  onNavigate: (id: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function LandingNav({ links, onNavigate, onOpenAuth, isDark, onToggleTheme }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  useBodyScrollLock(menuOpen);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLink = (link: LandingLink) => {
    setMenuOpen(false);
    if (link.action) link.action();
    else if (link.id) onNavigate(link.id);
  };

  return (
    <>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300',
          scrolled || menuOpen
            ? 'border-line/[0.08] bg-canvas/80 backdrop-blur-md'
            : 'border-transparent bg-transparent'
        )}
      >
        <div className="gutter flex h-16 items-center justify-between gap-6">
          <Logo onClick={scrollToTop} />

          <nav aria-label="Sections" className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => handleLink(link)}
                className="link text-sm text-fg-muted transition-colors hover:text-fg"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} className="border-transparent" />
            <button type="button" onClick={() => onOpenAuth('login')} className="btn-ghost btn-sm hidden md:inline-flex">
              Sign in
            </button>
            <button type="button" onClick={() => onOpenAuth('register')} className="btn-primary btn-sm hidden md:inline-flex">
              Get started <ArrowRight className="arrow h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              className="btn-icon relative border-transparent md:hidden"
            >
              <span
                className={cn(
                  'absolute h-px w-4 bg-fg transition-transform duration-300 ease-out',
                  menuOpen ? 'rotate-45' : '-translate-y-[3px]'
                )}
              />
              <span
                className={cn(
                  'absolute h-px w-4 bg-fg transition-transform duration-300 ease-out',
                  menuOpen ? '-rotate-45' : 'translate-y-[3px]'
                )}
              />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="gutter fixed inset-0 z-40 flex flex-col bg-canvas pb-8 pt-20 md:hidden"
          >
            <nav aria-label="Sections" className="flex flex-1 flex-col">
              {links.map((link, idx) => (
                <motion.button
                  key={link.label}
                  type="button"
                  onClick={() => handleLink(link)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 + idx * 0.04, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-baseline justify-between border-b border-line/[0.08] py-4 text-left font-serif text-[40px] leading-none text-fg"
                >
                  {link.label}
                  <span className="meta">0{idx + 1}</span>
                </motion.button>
              ))}
            </nav>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="btn-secondary btn-lg"
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenAuth('register');
                }}
                className="btn-primary btn-lg"
              >
                Get started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
