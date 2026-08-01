// ═══════════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/responsive.js
// Responsive calculation helpers shared by any script that needs to size,
// scale, or throttle work in response to the viewport (canvas drawing,
// Three.js scenes, particle counts, etc). Mirrors the same fluid-clamp
// approach already used in the site's CSS (`--fs-*` custom properties)
// so JS-computed sizes stay visually consistent with CSS-computed ones.
// ═══════════════════════════════════════════════════════════════════════════

/** Clamp a number between min and max. */
export function clampNum(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Linear interpolation. */
export function lerp(a, b, t) {
  return a + (b - a) * t;
}

/**
 * JS equivalent of CSS `clamp(min, preferred(vw), max)`, so canvas/JS-driven
 * sizing can follow the exact same fluid curve as the CSS type scale.
 * @param {number} minPx
 * @param {number} vwRatio value 0..100 meaning "vw units"
 * @param {number} maxPx
 * @param {number} [viewportWidth] defaults to window.innerWidth
 */
export function fluidSize(minPx, vwRatio, maxPx, viewportWidth) {
  const vw = typeof viewportWidth === "number" ? viewportWidth : (typeof window !== "undefined" ? window.innerWidth : 1180);
  const preferred = (vwRatio / 100) * vw;
  return clampNum(preferred, minPx, maxPx);
}

/**
 * Proportionally scale a value between a min/max viewport range — e.g.
 * scale a particle count from 40 (at 480px wide) to 160 (at 1440px wide).
 */
export function scaleByViewport(value, { minWidth = 480, maxWidth = 1440, minValue, maxValue, viewportWidth } = {}) {
  const vw = typeof viewportWidth === "number" ? viewportWidth : (typeof window !== "undefined" ? window.innerWidth : maxWidth);
  const t = clampNum((vw - minWidth) / (maxWidth - minWidth), 0, 1);
  const min = typeof minValue === "number" ? minValue : value;
  const max = typeof maxValue === "number" ? maxValue : value;
  return lerp(min, max, t);
}

/** Standard debounce — waits for a pause in calls before firing. */
export function debounce(fn, wait = 150) {
  let t;
  return function debounced(...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

/** Standard throttle — fires at most once per `wait` ms. */
export function throttle(fn, wait = 150) {
  let last = 0;
  let t;
  return function throttled(...args) {
    const now = Date.now();
    const remaining = wait - (now - last);
    if (remaining <= 0) {
      clearTimeout(t);
      last = now;
      fn.apply(this, args);
    } else {
      clearTimeout(t);
      t = setTimeout(() => {
        last = Date.now();
        fn.apply(this, args);
      }, remaining);
    }
  };
}

/** rAF-batched resize handler — avoids layout-thrash from naive resize listeners. */
export function onResize(fn, { passive = true } = {}) {
  if (typeof window === "undefined") return () => {};
  let raf = null;
  const handler = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => fn(getViewport()));
  };
  window.addEventListener("resize", handler, { passive });
  return () => window.removeEventListener("resize", handler);
}

function getViewport() {
  if (typeof window === "undefined") return { width: 1180, height: 800 };
  return { width: window.innerWidth, height: window.innerHeight };
}

export default {
  clampNum,
  lerp,
  fluidSize,
  scaleByViewport,
  debounce,
  throttle,
  onResize,
};
