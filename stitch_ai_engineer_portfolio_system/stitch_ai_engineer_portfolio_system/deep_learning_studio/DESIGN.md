---
name: Deep Learning Studio
colors:
  surface: '#0b1326'
  surface-dim: '#0b1326'
  surface-bright: '#31394d'
  surface-container-lowest: '#060e20'
  surface-container-low: '#131b2e'
  surface-container: '#171f33'
  surface-container-high: '#222a3d'
  surface-container-highest: '#2d3449'
  on-surface: '#dae2fd'
  on-surface-variant: '#bec8d2'
  inverse-surface: '#dae2fd'
  inverse-on-surface: '#283044'
  outline: '#88929b'
  outline-variant: '#3e4850'
  surface-tint: '#89ceff'
  primary: '#89ceff'
  on-primary: '#00344d'
  primary-container: '#0ea5e9'
  on-primary-container: '#003751'
  inverse-primary: '#006591'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#ffb86e'
  on-tertiary: '#492900'
  tertiary-container: '#de8712'
  on-tertiary-container: '#4d2b00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c9e6ff'
  primary-fixed-dim: '#89ceff'
  on-primary-fixed: '#001e2f'
  on-primary-fixed-variant: '#004c6e'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#ffdcbd'
  tertiary-fixed-dim: '#ffb86e'
  on-tertiary-fixed: '#2c1600'
  on-tertiary-fixed-variant: '#693c00'
  background: '#0b1326'
  on-background: '#dae2fd'
  surface-variant: '#2d3449'
typography:
  display-lg:
    fontFamily: Geist Sans
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Geist Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Geist Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: -0.02em
  body-base:
    fontFamily: Geist Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Geist Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  code-base:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '450'
    lineHeight: '1.6'
  label-caps:
    fontFamily: Geist Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 0.25rem
  sm: 0.5rem
  md: 1rem
  lg: 1.5rem
  xl: 2.5rem
  2xl: 4rem
  container-max: 1200px
  gutter: 24px
---

## Brand & Style

The design system is engineered for high-performance AI/ML engineering portfolios, blending the technical precision of a developer environment with the polished aesthetics of premium SaaS platforms. It draws inspiration from modern "Dark Mode" pioneers like Vercel and Linear, emphasizing clarity, structural integrity, and high-end finish.

The visual style is **Minimalist-Glassmorphism**. It utilizes deep obsidian backgrounds, translucent layers, and microscopic details (like 1px borders) to create a sense of depth and technical sophistication. The user experience should feel fast, responsive, and authoritative, evoking a sense of "intelligence behind the interface."

## Colors

The system is optimized for a **Dark Mode First** experience.

- **Primary:** Sky Blue (#0ea5e9) serves as the core brand identifier, used for primary actions, focus states, and accent highlights.
- **Backgrounds:** The primary dark canvas is Deep Slate (#0f172a), providing a softer, more sophisticated alternative to pure black. In light mode, a clean White (#ffffff) is used.
- **Surfaces:** Cards and containers use Slate-800 (#1e293b) in dark mode to create a clear visual hierarchy against the background.
- **Accents:** A secondary Cyan is introduced via gradients for high-impact elements like primary buttons and progress indicators.

## Typography

Typography is used to reinforce the "Engineer-as-Author" persona. **Geist Sans** provides a clean, neutral, and highly legible sans-serif for interface elements and long-form descriptions. **JetBrains Mono** (or Geist Mono) is used exclusively for code snippets, terminal outputs, and technical metadata.

- **Scale:** Use tight letter-spacing on larger headlines to create a "compact" premium feel.
- **Hierarchy:** Reserve the highest weight (700) for page titles and the medium weight (500/600) for section headers and labels.
- **Monospace:** Ensure code blocks have sufficient line-height (1.6) for readability during technical deep-dives.

## Layout & Spacing

The design system follows a **12-column fluid grid** for desktop, transitioning to a single-column stack on mobile.

- **Whitespace:** Emphasize generous vertical margins (4rem+) between major sections to allow the content to "breathe" and signal high-end quality.
- **Rhythm:** Use an 8px base grid. Components should use `1rem (16px)` or `1.5rem (24px)` padding to maintain consistency.
- **Containment:** Main content should be centered with a max-width of 1200px. For data-heavy dashboard views, a 1440px wide-width may be used.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Glassmorphism** rather than traditional drop shadows.

1.  **Level 0 (Floor):** Deep Slate (#0f172a).
2.  **Level 1 (Cards):** Slate-800 (#1e293b) with a 1px border of Slate-700 (#334155).
3.  **Level 2 (Modals/Overlays):** Background blur (12px to 20px) with 80% opacity and a subtle "inner glow" achieved via a light top-border.

**Borders:** Use low-opacity white (e.g., `rgba(255,255,255,0.05)`) for borders in dark mode to create a "etched" look. Avoid heavy black shadows; if used, they should be extremely diffused and slightly tinted with the primary blue.

## Shapes

The shape language is sophisticated and modern, utilizing "Soft-Rounded" corners that feel more organic than sharp edges but more professional than pill-shaped bubbles.

- **Components:** Standard buttons and inputs use `0.5rem (8px)`.
- **Containers:** Project cards and main surface areas use `rounded-lg (16px)`.
- **Interactive States:** On hover, certain elements may subtly increase their "perceived" roundedness through scale transforms or softened border transitions.

## Components

### Buttons

- **Primary:** Subtle gradient from Sky Blue to Cyan. 1px inset top-border for a "pressed" look. No shadow.
- **Secondary:** Transparent background with a thin Slate-700 border. Hover state fills with a low-opacity Sky Blue.
- **Micro-interaction:** On hover, buttons should scale by 1.02x with a smooth 200ms transition.

### Cards (The "Glass" Effect)

- Cards must use `backdrop-blur: 16px` and a semi-transparent background (`rgba(30, 41, 59, 0.7)`).
- A 1px border of `rgba(255, 255, 255, 0.1)` is mandatory to define the edges against dark backgrounds.

### Inputs

- **Base:** Dark background with a subtle border.
- **Focus:** The border transitions to Primary Sky Blue, and a subtle "glow" (2px spread blue shadow at 20% opacity) appears.

### Toasts & Modals

- **Toasts:** Positioned top-right. High-contrast (Primary Blue accent on the left edge).
- **Modals:** Centered, utilizing heavy backdrop-blur (24px) on the page content behind them.

### Code Blocks

- Integrated "Copy" button on hover.
- Syntax highlighting should use a custom theme based on the primary Sky Blue and complementary muted teals and purples.
