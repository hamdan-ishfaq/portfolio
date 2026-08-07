'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

const STEPS = ['PR', 'PO', 'GR', 'IV', 'PAY'] as const;

/**
 * Quiet process status strip — steps through P2P postings like a live ledger cursor.
 */
export function DocumentFlowTicker({ className = '' }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % STEPS.length);
    }, 1600);
    return () => window.clearInterval(id);
  }, [prefersReducedMotion]);

  return (
    <div
      className={`inline-flex items-center gap-1.5 sm:gap-2 font-mono text-[11px] sm:text-xs tracking-[0.08em] ${className}`}
      aria-label="Procure-to-pay document sequence"
    >
      {STEPS.map((step, index) => {
        const isActive = index === active;
        const isDone = index < active;
        return (
          <span key={step} className="inline-flex items-center gap-1.5 sm:gap-2">
            {index > 0 ? (
              <span
                className={`h-px w-3 sm:w-4 transition-colors duration-500 ${
                  isDone || isActive ? 'bg-primary/70' : 'bg-white/15'
                }`}
                aria-hidden="true"
              />
            ) : null}
            <span
              className={`relative px-1.5 py-0.5 rounded-sm transition-colors duration-500 ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : isDone
                    ? 'text-on-surface'
                    : 'text-on-surface-variant/70'
              }`}
            >
              {step}
              {isActive ? (
                <span
                  className="absolute inset-x-0 -bottom-px h-px bg-primary doc-ticker-underline"
                  aria-hidden="true"
                />
              ) : null}
            </span>
          </span>
        );
      })}
    </div>
  );
}
