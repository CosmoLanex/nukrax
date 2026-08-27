// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/shell/avatar.js
// Section 6 of the platform brief: every user without a custom profile
// picture should show the SAME provided default avatar — not a random
// initial-letter placeholder, and not a different fallback on every page.
// This is the one place that decision is made; everywhere that renders a
// user's avatar (community feed, notifications, search, profile modal,
// the nav shell's own profile button) imports avatarHtml() from here
// instead of hand-rolling its own `avatar_url ? <img> : ???` fallback.
// ═══════════════════════════════════════════════════════════════════════

const DEFAULT_AVATAR_SVG = '<svg viewBox="0 0 24 24" width="60%" height="60%"><path fill="currentColor" d="M12 12.25a3.75 3.75 0 1 1 3.75-3.75A3.75 3.75 0 0 1 12 12.25m0-6a2.25 2.25 0 1 0 2.25 2.25A2.25 2.25 0 0 0 12 6.25m7 13a.76.76 0 0 1-.75-.75c0-1.95-1.06-3.25-6.25-3.25s-6.25 1.3-6.25 3.25a.75.75 0 0 1-1.5 0c0-4.75 5.43-4.75 7.75-4.75s7.75 0 7.75 4.75a.76.76 0 0 1-.75.75"/></svg>';

/**
 * Returns the HTML for a user's avatar — their custom picture if they
 * have one, otherwise the default silhouette (never an initials letter).
 * @param {{avatar_url?: string}|null|undefined} profile
 * @param {string} escapeHtmlFn - pass the page's own escapeHtml() so URLs
 *   stay escaped exactly the way each page already escapes everything else.
 */
export function avatarHtml(profile, escapeHtmlFn) {
  const url = profile?.avatar_url;
  const esc = typeof escapeHtmlFn === 'function' ? escapeHtmlFn : (s => s);
  if (url) return `<img src="${esc(url)}" alt="">`;
  return `<span class="nkx-default-avatar" aria-hidden="true">${DEFAULT_AVATAR_SVG}</span>`;
}

export { DEFAULT_AVATAR_SVG };
