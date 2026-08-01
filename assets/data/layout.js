// ═══════════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/layout.js
// Shared layout constants — the JS-side mirror of the CSS custom properties
// declared in assets/css/tokens.css. Kept in sync by hand (there's no build
// step to generate one from the other); if a value changes in tokens.css it
// should change here too, and vice versa.
// ═══════════════════════════════════════════════════════════════════════════

/** Matches `--container` in tokens.css — the max content width. */
export const CONTAINER_WIDTH = 1180;

/** Matches `--gutter` in tokens.css: clamp(24px, 5vw, 64px). */
export const GUTTER = { min: 24, preferredVw: 5, max: 64 };

/** Spacing scale (px), for any JS that needs to compute layout in step with the site's rhythm. */
export const SPACING = Object.freeze({
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
});

/** z-index scale — keeps stacking contexts predictable if new overlays are added. */
export const Z_INDEX = Object.freeze({
  base: 0,
  decorative: 1,      // dot-grid / particle backgrounds
  content: 10,
  stickyNav: 100,
  topAccentLine: 200,
  overlay: 500,
  modal: 900,
  toast: 950,
  tooltip: 980,
  max: 999,
});

/** Shared animation/timing constants — matches `--ease` / `--ease-out` in tokens.css. */
export const EASING = Object.freeze({
  standard: "cubic-bezier(0.22,1,0.36,1)", // --ease
  out: "cubic-bezier(0.16,1,0.3,1)",       // --ease-out
});

export const DURATIONS = Object.freeze({
  instant: 100,
  fast: 200,
  base: 300,
  slow: 500,
  slower: 800,
});

export default {
  CONTAINER_WIDTH,
  GUTTER,
  SPACING,
  Z_INDEX,
  EASING,
  DURATIONS,
};
