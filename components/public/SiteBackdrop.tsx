'use client';

import { useReducedMotion } from 'framer-motion';
import { ThreeBackdrop } from '@/components/public/ThreeBackdrop';

export function SiteBackdrop() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className="site-backdrop" aria-hidden="true">
      <div className="site-backdrop__orb site-backdrop__orb--1" />
      <div className="site-backdrop__orb site-backdrop__orb--2" />
      <div className="site-backdrop__orb site-backdrop__orb--3" />
      <div className="site-backdrop__vignette" />
      {!prefersReducedMotion && <ThreeBackdrop />}
    </div>
  );
}
