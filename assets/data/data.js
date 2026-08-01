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
}

export default NUKRAX;
