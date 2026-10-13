import { Logo } from '../ui/Logo';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
  onOpenManifesto: () => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
  blockHeight: string | null;
}

export function Footer({ onNavigate, onOpenManifesto, onOpenAuth, blockHeight }: FooterProps) {
  const columns: Array<{ title: string; links: Array<{ label: string; onClick: () => void }> }> = [
    {
      title: 'Protocol',
      links: [
        { label: 'Primitives', onClick: () => onNavigate('protocol') },
        { label: 'Architecture', onClick: () => onNavigate('architecture') },
        { label: 'Lifecycle', onClick: () => onNavigate('lifecycle') },
        { label: 'Platform', onClick: () => onNavigate('capabilities') },
      ],
    },
    {
      title: 'Product',
      links: [
        { label: 'Live verifier', onClick: () => onNavigate('verify') },
        { label: 'Sign in', onClick: () => onOpenAuth('login') },
        { label: 'Create account', onClick: () => onOpenAuth('register') },
        { label: 'Manifesto', onClick: onOpenManifesto },
      ],
    },
    {
      title: 'Standards',
      links: [
        { label: 'W3C DID v1.0', onClick: () => onNavigate('protocol') },
        { label: 'Aptos Move VM', onClick: () => onNavigate('architecture') },
        { label: 'Argon2id · RFC 9106', onClick: () => onNavigate('capabilities') },
        { label: 'SHA-256', onClick: () => onNavigate('verify') },
      ],
    },
  ];

  return (
    <footer className="relative z-10 overflow-hidden border-t border-line/10 bg-canvas">
      <div className="grid grid-cols-2 lg:grid-cols-12">
        <div className="gutter col-span-2 space-y-5 border-b border-line/10 py-10 lg:col-span-6 lg:border-b-0">
          <Logo />
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
            className={`gutter space-y-4 border-line/10 py-10 lg:col-span-2 lg:border-l ${i === 2 ? 'col-span-2 border-t lg:border-t-0' : ''} ${i === 1 ? 'border-l' : ''}`}
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

      <div className="gutter flex flex-col justify-between gap-2 border-t border-line/10 py-5 sm:flex-row">
        <span className="meta">© {new Date().getFullYear()} Authentra</span>
        <span className="meta">Custody you can prove.</span>
      </div>
    </footer>
  );
}
