'use client';

/** Minimal enterprise backdrop — no orbs, bloom, or WebGL. */
export function SiteBackdrop() {
  return (
    <div className="site-backdrop" aria-hidden="true">
      <div className="site-backdrop__vignette" />
    </div>
  );
}
