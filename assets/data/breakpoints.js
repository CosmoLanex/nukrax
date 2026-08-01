// ═══════════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/breakpoints.js
// Centralized breakpoint scale.
//
// IMPORTANT — why this doesn't rewrite existing CSS `@media` rules:
// This is a static, build-step-free site (plain HTML/CSS/JS served by a
// Cloudflare Worker `assets` binding — no bundler, no PostCSS). CSS media
// FEATURES (the part inside `@media (max-width: …)`) cannot reference CSS
// custom properties or JS values in any browser today — only literal
// lengths are allowed there. That means true "centralization" of CSS
// breakpoints without a build step can only happen at the *documentation
// and JS* layer, not by physically replacing numbers inside each page's
// `<style>` block. Rewriting those numbers by hand risks shifting where a
// page's layout changes, which is the one thing we were told never to do.
//
// So: this file is the single source of truth for (a) every distinct
// breakpoint value already found in the site's CSS, named and documented,
// and (b) the scale used by all *JS-driven* responsive logic (device
// detection, canvas/animation sizing, resize listeners, etc.), where
// centralization is fully real and live. Existing per-page `@media` rules
// are left exactly as they were — same numbers, same cascade, same output.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Canonical named breakpoints (min-width upward, "mobile-first" scale).
 * Values chosen to match the values already in use across the codebase
 * (found via a full-project audit) so this scale reflects real, already
 * battle-tested layout transitions rather than arbitrary numbers.
 */
export const BREAKPOINTS = Object.freeze({
  xs: 0,      // small mobile phones (iPhone SE and smaller)
  sm: 480,    // large mobile phones
  md: 640,    // small tablets / large phones landscape / foldables unfolded
  ml: 760,    // upper phone / lower tablet transition (most common page breakpoint)
  lg: 860,    // small tablets
  tab: 900,   // tablets
  tl: 1000,   // large tablets / small laptops
  xl: 1100,   // small laptops
  laptop: 1180, // matches --container (1180px) — the content max-width itself
  desktop: 1280, // standard desktop
  xxl: 1440,  // large desktop monitors
  uw: 1920,   // ultrawide / large desktop monitors
});

/**
 * Every distinct raw `max-width` value found in the project's inline
 * `<style>` blocks during the architecture audit, kept verbatim as
 * documentation so future edits can reuse an existing value instead of
 * inventing a new one. Do NOT delete entries just because a page doesn't
 * use them anymore — this is a historical + reference registry.
 */
export const LEGACY_PAGE_BREAKPOINTS = Object.freeze([
  480, 520, 560, 600, 640, 760, 860, 900, 1000, 1100,
]);

/** Device-class thresholds used by device.js for JS-side detection. */
export const DEVICE_BREAKPOINTS = Object.freeze({
  mobileMax: BREAKPOINTS.md,     // < 640px  => phone
  tabletMax: BREAKPOINTS.tl,     // < 1000px => tablet
  laptopMax: BREAKPOINTS.xxl,    // < 1440px => laptop
  // >= 1440px => desktop / large desktop / ultrawide
});

/**
 * Build a `(max-width: …px)` media query string for a named or numeric
 * breakpoint. Convenience for JS code using `matchMedia`.
 * @param {keyof typeof BREAKPOINTS | number} bp
 * @param {"max"|"min"} [direction="max"]
 */
export function mediaQuery(bp, direction = "max") {
  const px = typeof bp === "number" ? bp : BREAKPOINTS[bp];
  if (typeof px !== "number") {
    throw new Error(`[nukrax/breakpoints] Unknown breakpoint "${bp}"`);
  }
  return direction === "min"
    ? `(min-width: ${px}px)`
    : `(max-width: ${px}px)`;
}

/**
 * Returns the current active named breakpoint (largest one the current
 * viewport width satisfies), e.g. "sm", "md", "lg", "desktop"…
 * @param {number} [width] defaults to window.innerWidth
 */
export function getCurrentBreakpoint(width) {
  const w = typeof width === "number" ? width : (typeof window !== "undefined" ? window.innerWidth : BREAKPOINTS.laptop);
  const entries = Object.entries(BREAKPOINTS).sort((a, b) => a[1] - b[1]);
  let current = entries[0][0];
  for (const [name, min] of entries) {
    if (w >= min) current = name;
    else break;
  }
  return current;
}

export default BREAKPOINTS;
