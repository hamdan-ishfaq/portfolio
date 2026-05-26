/**
 * Design system reference — token names & semantic class map.
 * Visual values live in styles/design-system.css (single source of truth).
 */

export const designSystem = {
  /** CSS custom properties (see styles/design-system.css) */
  tokens: {
    bg: '--ds-bg',
    sectionBand: '--ds-section-band',
    border: '--ds-border',
    glassBg: '--ds-glass-bg',
    accentFrom: '--ds-accent-from',
    accentTo: '--ds-accent-to',
    containerMax: '--ds-container-max',
  },

  /** Semantic layout / surface classes */
  layout: {
    page: 'page-container',
    section: 'section-block',
    divider: 'section-divider',
    body: 'ds-body mesh-bg',
  },

  /** Reusable surface & interaction classes */
  surfaces: {
    card: 'glass-card',
    panel: 'glass-panel',
    inset: 'surface-inset',
    hover: 'hover-glow',
  },

  /** Button variants (also available via components/ui/Button.tsx) */
  buttons: {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  },

  /** Typography scale */
  type: {
    display: 'font-display-lg text-display-lg',
    displayMobile: 'font-display-lg-mobile text-display-lg-mobile',
    headline: 'font-headline-md text-headline-md',
    body: 'font-body-base text-body-base',
    bodySm: 'font-body-sm text-body-sm',
    label: 'font-label-caps text-label-caps',
    code: 'font-code-base text-code-base',
    accentGradient: 'text-accent-gradient',
  },

  /** Badge classes (components/ui/Badge.tsx) */
  badges: {
    tech: (category: string) => `badge-pill badge-tech-${category}`,
    status: (status: string) => `badge-pill badge-status-${status}`,
    tier: (tier: number) => `badge-pill badge-tier-${tier}`,
    devlog: (type: string) => `badge-pill badge-devlog-${type}`,
  },
} as const;

export type DesignSystem = typeof designSystem;
