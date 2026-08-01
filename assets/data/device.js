// ═══════════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/device.js
// Centralized device / environment detection. Any script that currently
// (or in future) needs to branch on screen size, touch support, reduced
// motion, or viewport dimensions should pull it from here instead of
// re-implementing its own `matchMedia`/`innerWidth` checks.
// ═══════════════════════════════════════════════════════════════════════════

import { BREAKPOINTS, DEVICE_BREAKPOINTS, getCurrentBreakpoint } from "./breakpoints.js";

const hasWindow = typeof window !== "undefined";
const hasNavigator = typeof navigator !== "undefined";

/** Current viewport size, safe on the server / before load. */
export function getViewportSize() {
  if (!hasWindow) return { width: BREAKPOINTS.laptop, height: 800 };
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  };
}

/** "mobile" | "tablet" | "laptop" | "desktop" based on the centralized scale. */
export function getDeviceClass(width) {
  const w = typeof width === "number" ? width : getViewportSize().width;
  if (w < DEVICE_BREAKPOINTS.mobileMax) return "mobile";
  if (w < DEVICE_BREAKPOINTS.tabletMax) return "tablet";
  if (w < DEVICE_BREAKPOINTS.laptopMax) return "laptop";
  return "desktop";
}

/** True if the primary input is touch (no fine hover-capable pointer). */
export function isTouchDevice() {
  if (!hasWindow) return false;
  return !window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** True if the user has requested reduced motion at the OS level. */
export function prefersReducedMotion() {
  if (!hasWindow) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True if the user's system is in dark-mode / light-mode (site is dark-only, but useful for future). */
export function prefersColorScheme() {
  if (!hasWindow) return "dark";
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

/** Rough OS/browser sniff — used sparingly, only for known layout quirks (e.g. iOS Safari 100vh). */
export function getPlatform() {
  if (!hasNavigator) return { isIOS: false, isSafari: false, isAndroid: false };
  const ua = navigator.userAgent || "";
  const isIOS = /iP(hone|od|ad)/.test(ua) || (ua.includes("Macintosh") && hasNavigator && "ontouchend" in document);
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
  const isAndroid = /Android/.test(ua);
  return { isIOS, isSafari, isAndroid };
}

/** Device pixel ratio, clamped to a sane range for canvas/image work. */
export function getDPR(max = 3) {
  if (!hasWindow) return 1;
  return Math.min(window.devicePixelRatio || 1, max);
}

/**
 * Subscribe to breakpoint changes. Calls `callback(breakpointName)`
 * immediately and again whenever the active named breakpoint changes
 * (debounced on resize). Returns an unsubscribe function.
 */
export function onBreakpointChange(callback) {
  if (!hasWindow) return () => {};
  let last = getCurrentBreakpoint();
  callback(last);
  let raf = null;
  const handler = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const current = getCurrentBreakpoint();
      if (current !== last) {
        last = current;
        callback(current);
      }
    });
  };
  window.addEventListener("resize", handler, { passive: true });
  return () => window.removeEventListener("resize", handler);
}

/**
 * Fixes the classic mobile-browser `100vh` bug (address bar resizing the
 * viewport) by writing the true viewport height to a `--vh` CSS custom
 * property (1% of real innerHeight). Opt-in only — call this from a page
 * that wants it; it does nothing until called, so it never changes any
 * existing page's rendering unless explicitly wired in.
 */
export function installViewportHeightFix() {
  if (!hasWindow) return () => {};
  const set = () => {
    document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
  };
  set();
  window.addEventListener("resize", set, { passive: true });
  window.addEventListener("orientationchange", set, { passive: true });
  return () => {
    window.removeEventListener("resize", set);
    window.removeEventListener("orientationchange", set);
  };
}

export const device = {
  getViewportSize,
  getDeviceClass,
  isTouchDevice,
  prefersReducedMotion,
  prefersColorScheme,
  getPlatform,
  getDPR,
  onBreakpointChange,
  installViewportHeightFix,
};

export default device;
