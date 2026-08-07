'use client';

/**
 * Blueprint-style atmosphere: faint column grid + vignette.
 * No orbs, bloom, or WebGL — enterprise paper, not AI wallpaper.
 */
export function SiteBackdrop() {
  return (
    <div className="site-backdrop" aria-hidden="true">
      <div className="site-backdrop__grid" />
      <div className="site-backdrop__rule" />
      <div className="site-backdrop__vignette" />
    </div>
  );
}
