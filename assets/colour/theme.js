// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/colour/theme.js
// Single source of truth for reading, applying, persisting, and toggling
// the light/dark theme. Pairs with assets/colour/theme.css, which defines
// what `.nkx-light` on <html> actually changes.
//
// USAGE
//   Call applyStoredTheme() as early as possible (ideally inline in
//   <head>, before first paint) to avoid a flash of the wrong theme.
//   Anywhere with a toggle control, import { toggleTheme, getTheme }.
// ═══════════════════════════════════════════════════════════════════════

const STORAGE_KEY = 'nkx-theme'; // 'light' | 'dark'

export function getTheme() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch (e) { /* localStorage unavailable (private mode, etc.) — fall through */ }
  // No stored preference yet — respect the OS-level preference once, same
  // convention as the existing prefers-reduced-motion handling.
  return (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
}

export function applyTheme(theme, { persist = true, animate = true } = {}) {
  const root = document.documentElement;
  if (!animate) root.classList.add('nkx-theme-no-transition');
  root.classList.toggle('nkx-light', theme === 'light');
  if (!animate) {
    // Force a reflow so the no-transition class actually takes effect for
    // this change before being removed on the next frame.
    void root.offsetHeight;
    requestAnimationFrame(() => root.classList.remove('nkx-theme-no-transition'));
  }
  if (persist) {
    try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) { /* ignore */ }
  }
  document.dispatchEvent(new CustomEvent('nkx-theme-change', { detail: { theme } }));
}

/** Call this ASAP (before first paint if possible) — no flash, no transition. */
export function applyStoredTheme() {
  applyTheme(getTheme(), { persist: false, animate: false });
}

export function toggleTheme() {
  const next = getTheme() === 'light' ? 'dark' : 'light';
  applyTheme(next);
  return next;
}

// Auto-apply immediately on import so pages that only need the default
// behavior can just `<script type="module" src=".../theme.js"></script>`
// with no further code.
applyStoredTheme();
