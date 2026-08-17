// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/products/categories.js
// The full category catalog for the marketplace. Adding a 12th category
// later means adding one object here — nothing else in the marketplace
// architecture (browsing, filters, product pages) needs to change.
// ═══════════════════════════════════════════════════════════════════════

export const CATEGORIES = Object.freeze([
  { id: 'expert-advisors',   label: 'Expert Advisors',       icon: '◆', description: 'Automated MT5 trading systems.' },
  { id: 'automation-tools',  label: 'Automation Tools',      icon: '⚙', description: 'Scripts and tools that automate repetitive work.' },
  { id: 'ai-models',         label: 'AI Models',             icon: '◈', description: 'Trained models and inference tools.' },
  { id: 'apis',              label: 'APIs',                  icon: '⇄', description: 'Hosted and self-hosted API products.' },
  { id: 'datasets',          label: 'Datasets',               icon: '▦', description: 'Structured data for research and backtesting.' },
  { id: 'python-projects',   label: 'Python Projects',       icon: '⌘', description: 'Ready-to-run Python codebases.' },
  { id: 'javascript-projects', label: 'JavaScript Projects', icon: '⌘', description: 'Ready-to-run JS/TS codebases.' },
  { id: 'html-css-templates', label: 'HTML/CSS Templates',   icon: '▤', description: 'Frontend templates and starter kits.' },
  { id: 'developer-tools',   label: 'Developer Tools',       icon: '⛭', description: 'Tooling that speeds up development.' },
  { id: 'utilities',         label: 'Utilities',              icon: '✦', description: 'Small focused utilities and helpers.' },
  { id: 'prompt-packs',      label: 'Prompt Packs',          icon: '✎', description: 'Curated prompt collections.' },
]);

export function getCategory(id) {
  return CATEGORIES.find(c => c.id === id) || null;
}
