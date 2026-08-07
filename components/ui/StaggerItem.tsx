'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

type StaggerVariant = 'rise' | 'wipe' | 'fade';

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  index?: number;
  variant?: StaggerVariant;
};

export function StaggerItem({
  children,
  className,
  index = 0,
  variant = 'rise',
}: StaggerItemProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const initial =
    variant === 'wipe'
      ? { opacity: 0, x: -12 }
      : variant === 'fade'
        ? { opacity: 0 }
        : { opacity: 0, y: 18 };

  const animate =
    variant === 'wipe'
      ? { opacity: 1, x: 0 }
      : variant === 'fade'
        ? { opacity: 1 }
        : { opacity: 1, y: 0 };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
