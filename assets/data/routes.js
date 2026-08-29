// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/routes.js
// DEPRECATED — not imported anywhere in this codebase.
//
// This file described an earlier trailing-slash clean-URL scheme
// (`/dashboard/` → `/dashboard.html`) that depended on a
// `run_worker_first` entry in wrangler.jsonc which was never actually
// present there. The site's canonical URLs are the plain `.html`
// files (`/dashboard.html`, `/marketplace.html`, ...) — see
// assets/shell/shell.js and assets/auth/auth-widget.js for the real,
// in-use navigation tables.
//
// Left in place (rather than deleted) only as a historical marker in
// case anything still references this filename; safe to delete.
// ═══════════════════════════════════════════════════════════════════════

export const CLEAN_ROUTES = Object.freeze({});
export const LEGACY_REDIRECTS = Object.freeze({});
