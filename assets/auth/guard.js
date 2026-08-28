// ═══════════════════════════════════════════════
// NUKRAX — guard.js
// Include on any page that must require a logged-in account.
// Pairs with the inline `body{visibility:hidden}` style added to
// that page's <head> so there's no flash of content before the
// redirect happens.
//
//   In <head>:  <style>body{visibility:hidden}</style>
//   Before </body>:
//     <script type="module" src="assets/auth/guard.js"></script>
//     (from /ea/, use "../assets/auth/guard.js")
// ═══════════════════════════════════════════════

import { supabase } from './auth-widget.js';

// Absolute path — works correctly regardless of how deep/rewritten the
// current URL is (clean `/page/` URLs are served via a proxy rewrite,
// so a relative 'index.html' here would resolve to e.g.
// '/dashboard/index.html' instead of the real homepage).
const HOME_URL = '/';

const { data } = await supabase.auth.getSession();

if (!data.session) {
  window.location.replace(`${HOME_URL}?authRequired=1`);
} else {
  document.body.style.visibility = 'visible';
}
