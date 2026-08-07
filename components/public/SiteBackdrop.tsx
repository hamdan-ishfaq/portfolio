'use client';

import dynamic from 'next/dynamic';

const AmbientField = dynamic(
  () => import('@/components/public/AmbientField').then((m) => m.AmbientField),
  { ssr: false }
);

/**
 * Blueprint-style atmosphere + far-field document tiles.
 * No orbs / bloom — enterprise paper with a quiet 3D signature.
 */
export function SiteBackdrop() {
  return (
    <div className="site-backdrop" aria-hidden="true">
      <div className="site-backdrop__grid" />
      <div className="site-backdrop__rule" />
      <AmbientField />
      <div className="site-backdrop__vignette" />
    </div>
  );
}
