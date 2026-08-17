// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/search/docs-index.js
// A static, hand-curated index of every docs page (title + description,
// pulled straight from each page's own <title>/<meta description>) so
// global search can match documentation without fetching 22 pages over
// the network. Add a new docs page here when one is created — one line.
// ═══════════════════════════════════════════════════════════════════════

export const DOCS_INDEX = Object.freeze([
  { url: 'docs/introduction.html', title: 'Introduction', description: 'The starting point for NUKRAX documentation: product overview, platform architecture, and links into every section.' },
  { url: 'docs/getting-started.html', title: 'Getting Started', description: 'How to create a NUKRAX account, navigate the platform, and choose your first Expert Advisor.' },
  { url: 'docs/quick-start.html', title: 'Quick Start', description: 'A condensed, five-step path from creating a NUKRAX account to running your first Expert Advisor.' },
  { url: 'docs/installation.html', title: 'Installation', description: 'How to install and attach a NUKRAX Expert Advisor (.ex5) to a MetaTrader 5 chart.' },
  { url: 'docs/configuration.html', title: 'Configuration', description: 'How to configure NUKRAX Expert Advisor inputs and account settings.' },
  { url: 'docs/customization.html', title: 'Customization', description: 'What can be customized on a NUKRAX account: profile, avatar, and Expert Advisor inputs.' },
  { url: 'docs/features.html', title: 'Features', description: "A complete tour of NUKRAX's features: Expert Advisors, the trading terminal, community, and account system." },
  { url: 'docs/components.html', title: 'Components', description: 'The three NUKRAX Expert Advisors and the shared UI components (auth widget, AI assistant, community composer) used across the site.' },
  { url: 'docs/api.html', title: 'API & Integrations', description: 'The services behind NUKRAX (Supabase, Cloudflare Workers, Resend) and the current state of API access.' },
  { url: 'docs/css.html', title: 'CSS & Design System', description: 'The CSS design system behind NUKRAX: shared color/type tokens, the fluid type scale, and component patterns.' },
  { url: 'docs/javascript.html', title: 'JavaScript Architecture', description: 'The JavaScript architecture behind NUKRAX: the assets/data/ shared modules, feature-scoped scripts, and performance conventions.' },
  { url: 'docs/layout.html', title: 'Layout System', description: 'The layout system behind NUKRAX: container width, gutter, spacing scale, z-index scale, and common grid patterns.' },
  { url: 'docs/responsive.html', title: 'Responsive Design', description: "How NUKRAX's responsive architecture works: the shared breakpoint scale, device detection, and fluid sizing helpers." },
  { url: 'docs/animations.html', title: 'Animations', description: 'How animation is used across NUKRAX: reveal-on-scroll, the hero cube, live data motion, and reduced-motion support.' },
  { url: 'docs/accessibility.html', title: 'Accessibility', description: 'Accessibility support on NUKRAX: reduced motion, keyboard/focus handling, semantic structure, and known gaps.' },
  { url: 'docs/performance.html', title: 'Performance', description: 'Performance optimizations on NUKRAX: scroll handler patterns, will-change management, and per-frame layout reads.' },
  { url: 'docs/project-structure.html', title: 'Project Structure', description: 'How the NUKRAX codebase is organized: pages, shared assets, and the no-build-step deployment model.' },
  { url: 'docs/deployment.html', title: 'Deployment', description: 'How NUKRAX is deployed: Cloudflare Workers hosting, Supabase backend, and the no-build-step model.' },
  { url: 'docs/faq.html', title: 'FAQ', description: 'Frequently asked questions about NUKRAX accounts, Expert Advisors, the community, and the platform.' },
  { url: 'docs/troubleshooting.html', title: 'Troubleshooting', description: 'Troubleshooting guide for common NUKRAX issues: EA setup, sign-in, and the community feed.' },
  { url: 'docs/changelog.html', title: 'Changelog', description: 'Recent updates to the NUKRAX platform: the documentation system, performance work, and architecture changes.' },
  { url: 'docs/contributing.html', title: 'Feedback & Contributing', description: 'How to give feedback, report bugs, and suggest features for the NUKRAX platform.' },
]);
