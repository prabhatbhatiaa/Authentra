import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { cn } from '../../lib/cn';

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export function CopyButton({ value, label = 'Copy', className, size = 'md' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard can be unavailable on insecure origins; fail quietly.
    }
  };

  const icon = size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? 'Copied' : label}
      aria-label={copied ? 'Copied' : label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-lg text-fg-subtle transition-colors hover:bg-fg/[0.06] hover:text-fg',
        size === 'sm' ? 'h-6 w-6' : 'h-8 w-8',
        className
      )}
    >
      {copied ? <Check className={cn(icon, 'text-ok')} /> : <Copy className={icon} />}
    </button>
  );
}
