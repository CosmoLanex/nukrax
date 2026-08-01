// ═══════════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/constants.js
// Shared, mostly-static configuration and reusable data: site metadata, the
// JS-side mirror of the brand color tokens (for canvas/SVG/JS work that
// can't just write `var(--accent)`), and a light product registry.
//
// Note: product cards on ea-selection.html and the individual EA pages are
// hand-authored markup, not rendered from data — centralizing that would
// mean rewriting how those pages render, which is out of scope for a
// visual-parity pass. This registry exists as a single source of truth for
// *new* code (structured data, meta tags, the AI assistant, future pages)
// that needs basic facts about the products without hunting through markup.
// ═══════════════════════════════════════════════════════════════════════════

export const SITE = Object.freeze({
  name: "NUKRAX",
  domain: "nukrax.com",
  url: "https://nukrax.com",
  tagline: "Algorithmic trading systems for MetaTrader 5",
});

/**
 * JS mirror of the primary color tokens in assets/css/tokens.css
 * (`:root` — the --black/--panel/--accent naming scheme used by most
 * pages). Use for canvas, SVG, or WebGL/Three.js code that can't consume
 * CSS custom properties directly. Keep in sync with tokens.css by hand.
 */
export const COLORS = Object.freeze({
  black: "#07090B",
  panel: "#0A0F13",
  line: "#1B2328",
  lineLit: "#2A353C",
  muted: "#8A9BA3",
  text: "#D3DBDD",
  white: "#F2F5F5",
  accent: "#8FB8C4",
  accentDim: "#46626B",
});

export const FONTS = Object.freeze({
  logo: "'NKX Display', 'Outfit', sans-serif",
  mono: "'Space Mono', monospace",
  body: "'Outfit', sans-serif",
});

/** Light registry of the three EA products — facts only, no markup/rendering. */
export const EA_PRODUCTS = Object.freeze([
  {
    id: "apex",
    name: "APEX HFT",
    category: "High-frequency trading",
    page: "/ea/apex.html",
  },
  {
    id: "aurum",
    name: "AURUM HFT",
    category: "High-frequency trading",
    page: "/ea/aurum.html",
  },
  {
    id: "smc-ict",
    name: "SMC ICT",
    category: "Smart Money Concepts / ICT",
    page: "/ea/smc-ict.html",
  },
]);

export default {
  SITE,
  COLORS,
  FONTS,
  EA_PRODUCTS,
};
