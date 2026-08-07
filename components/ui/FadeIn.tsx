'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

type FadeVariant = 'fade' | 'rise' | 'clip' | 'wipe';

type FadeInProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Use for above-the-fold content (hero) instead of scroll-triggered animation */
  immediate?: boolean;
  /** Domain-specific motion — avoid cloning the same Y-lift everywhere. */
  variant?: FadeVariant;
};

const EASE = [0.22, 1, 0.36, 1] as const;

function initialFor(variant: FadeVariant) {
  switch (variant) {
    case 'fade':
      return { opacity: 0 };
    case 'clip':
      return { opacity: 0, clipPath: 'inset(0 0 100% 0)' };
    case 'wipe':
      return { opacity: 0, x: -10 };
    case 'rise':
    default:
      return { opacity: 0, y: 16 };
  }
}

function animateFor(variant: FadeVariant) {
  switch (variant) {
    case 'fade':
      return { opacity: 1 };
    case 'clip':
      return { opacity: 1, clipPath: 'inset(0 0 0% 0)' };
    case 'wipe':
      return { opacity: 1, x: 0 };
    case 'rise':
    default:
      return { opacity: 1, y: 0 };
  }
}

export function FadeIn({
  children,
  className,
  delay = 0,
  immediate = false,
  variant = 'rise',
}: FadeInProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const transition = { duration: variant === 'clip' ? 0.7 : 0.5, delay, ease: EASE };
  const initial = initialFor(variant);
  const animate = animateFor(variant);

  if (immediate) {
    return (
      <motion.div className={className} initial={initial} animate={animate} transition={transition}>
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: '-40px' }}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
