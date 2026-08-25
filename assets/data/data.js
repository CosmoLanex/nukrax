// ═══════════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/data.js
// Central entry point for the site's shared responsive architecture and
// configuration. Every page links this as a module script so any current
// or future script on the page can import shared breakpoints, device
// detection, responsive math, layout tokens, constants, and utilities from
// ONE place instead of re-implementing them per page.
//
//   import NUKRAX, { BREAKPOINTS, getDeviceClass } from "/assets/data/data.js";
//   // or, from a page in a subfolder (e.g. /ea/apex.html):
//   import NUKRAX from "../assets/data/data.js";
//
// This file does not change any page's visual output on its own — it only
// makes shared logic available. Nothing here runs automatically except:
//  (a) exposing `window.NUKRAX` as a convenience bridge for classic
//      (non-module) inline scripts, and
//  (b) setting the `--vh` fix variable is NOT auto-installed — call
//      `installViewportHeightFix()` explicitly from a page if it needs it.
//
// Ordering note: this is loaded as `type="module"`, which the browser
// always defers until after HTML parsing completes (same timing as a
// classic `defer` script), executing in source order relative to other
// module scripts. `window.NUKRAX` will exist for any code that runs on
// DOMContentLoaded/load or later (event handlers, most of this project's
// interactive JS). A handful of pages have very small classic inline
// `<script>` blocks that run synchronously during parsing — those won't
// see `window.NUKRAX` yet unless their logic is wrapped in a
// `DOMContentLoaded` listener, so nothing that currently runs immediately
// was rewired to depend on it.
// ═══════════════════════════════════════════════════════════════════════════

export * from "./breakpoints.js";
export * from "./device.js";
export * from "./responsive.js";
export * from "./layout.js";
export * from "./constants.js";
export * from "./utils.js";

import * as breakpoints from "./breakpoints.js";
import * as device from "./device.js";
import * as responsive from "./responsive.js";
import * as layout from "./layout.js";
import * as constants from "./constants.js";
import * as utils from "./utils.js";

// Strip each module's `default` export before merging — we only want the
// named exports combined; the `default` key would otherwise get silently
// overwritten module-by-module and leave a confusing leftover value.
function namedOnly(mod) {
  const { default: _default, ...named } = mod;
  return named;
}

/** Everything, bundled under one namespace — the default export. */
const NUKRAX = {
  ...namedOnly(breakpoints),
  ...namedOnly(device),
  ...namedOnly(responsive),
  ...namedOnly(layout),
  ...namedOnly(constants),
  ...namedOnly(utils),
  version: "1.0.0",
};

if (typeof window !== "undefined") {
  // Bridge for classic/non-module scripts and quick console debugging.
  // Does not overwrite anything if some other script already claimed it.
  window.NUKRAX = window.NUKRAX || NUKRAX;

  // ── Safe-reveal watchdog ──────────────────────────────────────────
  // A number of pages use a `<style>body{visibility:hidden}</style>` +
  // "reveal once auth/init finishes" pattern (guard.js, dashboard.html's
  // init(), etc.) to avoid flashing content before an auth check or
  // first data load completes. That pattern had no fallback: if any
  // step in the init chain threw (a Supabase call failing on a flaky
  // mobile connection, a missing element, any uncaught error) or just
  // never resolved, `body.style.visibility` was never set back to
  // 'visible' and the page stayed permanently blank — this is the
  // direct cause of the blank/white Dashboard reported on mobile.
  //
  // This does not change the normal/fast path for ANY page at all —
  // it only ever acts as a last-resort fallback:
  //   1. A hard timeout: nothing on this site legitimately needs the
  //      body hidden this long, so if it's still hidden after 6s,
  //      something failed silently — reveal it rather than leave the
  //      person on a blank screen.
  //   2. Immediately on any uncaught error or rejected promise, if the
  //      body is still hidden at that moment — this is what actually
  //      fixes the dashboard case, since a thrown error mid-init
  //      previously meant the `visibility = 'visible'` line further
  //      down that same script simply never ran.
  const REVEAL_TIMEOUT_MS = 6000;
  let nkxRevealed = false;
  function nkxIsHidden() {
    return document.body && getComputedStyle(document.body).visibility === "hidden";
  }
  function nkxReveal() {
    if (nkxRevealed || !document.body) return;
    nkxRevealed = true;
    document.body.style.visibility = "visible";
  }
  setTimeout(() => { if (nkxIsHidden()) nkxReveal(); }, REVEAL_TIMEOUT_MS);
  window.addEventListener("error", () => { if (nkxIsHidden()) nkxReveal(); });
  window.addEventListener("unhandledrejection", () => { if (nkxIsHidden()) nkxReveal(); });
}

export default NUKRAX;
