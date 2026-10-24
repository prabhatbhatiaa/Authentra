import { Logo } from '../ui/Logo';

interface FooterProps {
  onNavigate?: (sectionId: string) => void;
  onOpenManifesto?: () => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
  onOpenLegal?: (docId: 'privacy' | 'terms' | 'security' | 'compliance') => void;
  blockHeight?: string | null;
}

export function Footer({ onNavigate, onOpenManifesto, onOpenAuth, onOpenLegal, blockHeight }: FooterProps) {
  const handleNav = (sectionId: string) => {
    if (onNavigate) {
      onNavigate(sectionId);
    } else {
      window.location.hash = `#${sectionId}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAuth = (mode: 'login' | 'register') => {
    if (onOpenAuth) {
      onOpenAuth(mode);
    } else {
      window.dispatchEvent(new CustomEvent('authentra_open_auth', { detail: { mode } }));
    }
  };

  const handleManifesto = () => {
    if (onOpenManifesto) {
      onOpenManifesto();
    } else {
      handleNav('protocol');
    }
  };

  const openDoc = (docId: 'privacy' | 'terms' | 'security' | 'compliance') => {
    if (onOpenLegal) {
      onOpenLegal(docId);
    } else {
      window.location.hash = `#/${docId}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleHomeLogo = () => {
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const columns: Array<{ title: string; links: Array<{ label: string; onClick: () => void }> }> = [
    {
      title: 'Protocol',
      links: [
        { label: 'Primitives', onClick: () => handleNav('protocol') },
        { label: 'Architecture', onClick: () => handleNav('architecture') },
        { label: 'Lifecycle', onClick: () => handleNav('lifecycle') },
        { label: 'Platform', onClick: () => handleNav('capabilities') },
      ],
    },
    {
      title: 'Product',
      links: [
        { label: 'Live verifier', onClick: () => handleNav('verify') },
        { label: 'Sign in', onClick: () => handleAuth('login') },
        { label: 'Create account', onClick: () => handleAuth('register') },
        { label: 'Manifesto', onClick: handleManifesto },
      ],
    },
    {
      title: 'Trust & Legal',
      links: [
        { label: 'Privacy Policy', onClick: () => openDoc('privacy') },
        { label: 'Terms of Service', onClick: () => openDoc('terms') },
        { label: 'Security Architecture', onClick: () => openDoc('security') },
        { label: 'Compliance & Standards', onClick: () => openDoc('compliance') },
      ],
    },
  ];

  return (
    <footer className="relative z-10 overflow-hidden border-t border-line/10 bg-canvas">
      <div className="grid grid-cols-2 lg:grid-cols-12">
        <div className="gutter col-span-2 space-y-4 border-b border-line/10 py-8 lg:col-span-6 lg:border-b-0">
          <Logo onClick={handleHomeLogo} />
          <p className="max-w-sm text-[15px] leading-relaxed text-fg-muted">
            Identity, access control and digital-asset custody — cryptographically bound to decentralized identifiers
            and anchored on Aptos.
          </p>
          <p className="meta flex items-center gap-2">
            <span className="live-dot" /> Aptos Testnet · {blockHeight ? `block ${blockHeight}` : 'syncing'}
          </p>
        </div>
        {columns.map((col, i) => (
          <div
            key={col.title}
            className={`gutter space-y-3.5 border-line/10 py-8 lg:col-span-2 lg:border-l ${i === 2 ? 'col-span-2 border-t lg:border-t-0' : ''} ${i === 1 ? 'border-l' : ''}`}
          >
            <h4 className="meta">{col.title}</h4>
            <ul className="space-y-2.5">
              {col.links.map((l) => (
                <li key={l.label}>
                  <button type="button" onClick={l.onClick} className="link text-[15px] text-fg-muted hover:text-fg">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div aria-hidden className="select-none overflow-hidden border-t border-line/10">
        <div className="translate-y-[14%] whitespace-nowrap text-center font-serif text-[24.5vw] leading-[0.8] tracking-[-0.05em] text-fg">
          Authentra
        </div>
      </div>

      <div className="gutter flex flex-col justify-between gap-3 border-t border-line/10 py-5 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-fg-subtle">
          <span>© {new Date().getFullYear()} Authentra</span>
          <span>·</span>
          <button type="button" onClick={() => openDoc('privacy')} className="hover:text-fg transition-colors">
            Privacy
          </button>
          <span>·</span>
          <button type="button" onClick={() => openDoc('terms')} className="hover:text-fg transition-colors">
            Terms
          </button>
          <span>·</span>
          <button type="button" onClick={() => openDoc('security')} className="hover:text-fg transition-colors">
            Security
          </button>
          <span>·</span>
          <button type="button" onClick={() => openDoc('compliance')} className="hover:text-fg transition-colors">
            Compliance
          </button>
        </div>
        <span className="meta">Custody you can prove.</span>
      </div>
    </footer>
  );
}
