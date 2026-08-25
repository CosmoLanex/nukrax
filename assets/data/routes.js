// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/routes.js
// THE single source of truth for clean `/page/` URLs across the site.
//
// HOW IT WORKS (see worker.js):
//   - A request for a clean URL (e.g. `/dashboard/`) is invisibly served
//     from the real file on the right (`/dashboard.html`) — the browser's
//     address bar keeps showing the clean URL. No client-side redirect,
//     no flash, works on direct load/refresh/deep-link.
//   - A request for the OLD file URL (e.g. `/dashboard.html`) gets a
//     permanent (301) redirect to the clean URL, so old bookmarks/links
//     keep working instead of breaking.
//   - A request missing the trailing slash (e.g. `/dashboard`) gets a
//     301 redirect to the slashed clean URL.
//
// HOW TO ADD A NEW CLEAN URL:
//   Add one line below: '/new-page/': '/new-page.html'
//   That's it — the legacy-redirect map is derived automatically, and
//   nothing else in the codebase needs to change. If the target file
//   doesn't exist yet (e.g. a page that's still being built), the route
//   simply 404s until the file is added — nothing breaks in the
//   meantime and it starts working the moment the file is deployed.
//
//   NOTE: for the redirect-from-legacy-URL half of this to fire, the
//   legacy path (the value on the right) must also be listed in
//   `run_worker_first` in wrangler.jsonc — see the comment there.
// ═══════════════════════════════════════════════════════════════════════

export const CLEAN_ROUTES = Object.freeze({
  '/dashboard/':          '/dashboard.html',
  '/marketplace/':        '/marketplace.html',
  '/community/':          '/community.html',
  '/leaderboard/':        '/leaderboard.html',
  '/account/':            '/account.html',
  '/settings/':           '/settings.html',
  '/contact/':            '/contact.html',
  '/profile/':            '/profile.html',
  '/feedback/':           '/feedback.html',
  '/chat/':               '/chat.html',
  '/map/':                '/map.html',
  '/tr/':                 '/tr.html',
  '/cr/':                 '/cr.html',
  '/ea-section/':         '/ea-selection.html',
  // Not built yet (Phase 4 — development workspace). Routes are wired
  // now so nothing needs to change here once those files land.
  '/develop/ea/':         '/develop/ea.html',
  '/develop/automation/': '/develop/automation.html',
});

/** Derived automatically — old `.html` path → its new clean equivalent. */
export const LEGACY_REDIRECTS = Object.freeze(
  Object.fromEntries(
    Object.entries(CLEAN_ROUTES).map(([clean, legacy]) => [legacy, clean])
  )
);
