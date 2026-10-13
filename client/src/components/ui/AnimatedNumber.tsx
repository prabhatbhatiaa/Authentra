import { useEffect, useRef } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';

interface AnimatedNumberProps {
  value: number | null | undefined;
  className?: string;
  duration?: number;
  /** Rendered when the value is unknown. */
  fallback?: string;
}

/** Counts up to `value` the first time it scrolls into view. */
export function AnimatedNumber({ value, className, duration = 1.4, fallback = '—' }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-20px' });
  const reduced = useReducedMotion();
  const fromRef = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node || value == null || Number.isNaN(value)) return;
    if (!inView) return;
    if (reduced) {
      node.textContent = value.toLocaleString();
      fromRef.current = value;
      return;
    }
    const controls = animate(fromRef.current, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        node.textContent = Math.round(v).toLocaleString();
      },
    });
    fromRef.current = value;
    return () => controls.stop();
  }, [value, inView, reduced, duration]);

  return (
    <span ref={ref} className={className}>
      {value == null || Number.isNaN(value) ? fallback : '0'}
    </span>
  );
}
