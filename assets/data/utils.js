// ═══════════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/utils.js
// Small, generic, dependency-free utility functions reused across scripts.
// ═══════════════════════════════════════════════════════════════════════════

/** Read a CSS custom property's current computed value (e.g. "--accent"). */
export function getCSSVar(name, el) {
  if (typeof window === "undefined") return "";
  const target = el || document.documentElement;
  return getComputedStyle(target).getPropertyValue(name).trim();
}

/** Set a CSS custom property at runtime (e.g. for the --vh viewport fix). */
export function setCSSVar(name, value, el) {
  if (typeof document === "undefined") return;
  (el || document.documentElement).style.setProperty(name, value);
}

/** True if an element is at least partially within the viewport. */
export function isElementInViewport(el, offset = 0) {
  if (!el || typeof window === "undefined") return false;
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight;
  const vw = window.innerWidth || document.documentElement.clientWidth;
  return (
    rect.bottom >= -offset &&
    rect.right >= -offset &&
    rect.top <= vh + offset &&
    rect.left <= vw + offset
  );
}

/** Format a number with thousands separators (locale-aware). */
export function formatNumber(n, locale = "en-US") {
  return Number(n).toLocaleString(locale);
}

/** Clamp + round to a fixed number of decimals. */
export function round(n, decimals = 2) {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}

/** Safe querySelector that never throws on an invalid/empty selector. */
export function qs(selector, root) {
  try {
    return (root || document).querySelector(selector);
  } catch {
    return null;
  }
}

/** Safe querySelectorAll returning a real array (never throws, never a live NodeList). */
export function qsa(selector, root) {
  try {
    return Array.from((root || document).querySelectorAll(selector));
  } catch {
    return [];
  }
}

/** Generate a short random id (non-cryptographic) — for DOM ids, list keys, etc. */
export function uid(prefix = "nkx") {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export default {
  getCSSVar,
  setCSSVar,
  isElementInViewport,
  formatNumber,
  round,
  qs,
  qsa,
  uid,
};
