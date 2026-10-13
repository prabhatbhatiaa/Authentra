import React, { useMemo } from 'react';
import { cn } from '../../lib/cn';

interface JsonViewProps {
  value: unknown;
  className?: string;
}

// Matches JSON strings (optionally followed by a colon → object key), literals and numbers.
const TOKEN = /("(?:\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g;

/** Read-only, syntax-highlighted JSON block. Rendered as React nodes (no innerHTML). */
export function JsonView({ value, className }: JsonViewProps) {
  const nodes = useMemo(() => {
    const text = JSON.stringify(value, null, 2) ?? 'null';
    const out: React.ReactNode[] = [];
    let last = 0;
    let i = 0;
    for (const match of text.matchAll(TOKEN)) {
      const idx = match.index ?? 0;
      if (idx > last) out.push(text.slice(last, idx));
      const tok = match[0];
      let cls = 'text-fg';
      if (tok.startsWith('"')) cls = match[2] ? 'text-fg-muted' : 'text-fg';
      else if (tok === 'true' || tok === 'false') cls = 'text-warn';
      else if (tok === 'null') cls = 'text-fg-subtle';
      out.push(
        <span key={i++} className={cls}>
          {tok}
        </span>
      );
      last = idx + tok.length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  }, [value]);

  return (
    <pre
      className={cn('well overflow-auto p-4 font-mono text-[11.5px] leading-relaxed text-fg-subtle', className)}
    >
      <code>{nodes}</code>
    </pre>
  );
}
