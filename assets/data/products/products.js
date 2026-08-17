// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/products/products.js
// The single product registry. Every product page, marketplace card,
// dashboard "Recommended", search index, and related-products list reads
// from PRODUCTS — nothing hardcodes a product's name/description/etc
// anywhere else.
//
// To add a product: add one object below (any category), register its
// price in assets/data/pricing.js, and it appears everywhere
// automatically — marketplace grid, search, filters, related products.
//
// version/releaseDate/changelog are architecture placeholders for the 3
// existing EAs (no version-tracking existed before Phase 2) — update them
// as real releases happen; they are NOT prices, so they're filled with
// sensible v1.0 defaults rather than left blank.
// ═══════════════════════════════════════════════════════════════════════

export const PRODUCTS = Object.freeze([
  {
    id: 'apex',
    name: 'APEX HFT',
    categoryId: 'expert-advisors',
    tagline: 'High-frequency MT5 execution built on a 6-timeframe confluence engine.',
    description: 'APEX HFT scores every potential trade against a minimum confluence threshold pulled from HTF bias, break of structure, liquidity sweeps, order blocks, fair value gaps, CRT/TBS setups, and price-action patterns — all simultaneously — before it will fire an entry.',
    features: [
      '6-timeframe confluence scoring engine',
      'Five distinct entry models (CRT, TBS, OB+FVG, Liquidity Sweep+CHoCH, Price Action)',
      'Structural trailing stop with partial take-profit',
      'Built-in capital protection / risk circuit breaker',
    ],
    techSpecs: { platform: 'MetaTrader 5', language: 'MQL5', executionModel: 'Tick-based, HFT' },
    compatibility: ['MetaTrader 5 (Windows/VPS)', 'ECN/Raw spread brokers recommended'],
    requirements: ['MT5 build 3800+', 'VPS with < 20ms broker latency recommended', 'Minimum $500 account balance'],
    installSteps: [
      'Download the .ex5 file from your Downloads page',
      'Copy it into MT5\u2019s MQL5/Experts folder',
      'Restart MT5 and drag APEX HFT onto your chart',
      'Enter your license Key when prompted',
      'Enable AutoTrading',
    ],
    docsUrl: '/ea/apex.html',
    page: '/ea/apex.html',
    version: '1.0.0',
    releaseDate: '2026-05-01',
    changelog: [{ version: '1.0.0', date: '2026-05-01', notes: 'Initial release.' }],
    faq: [
      { q: 'What timeframe does APEX HFT trade on?', a: 'It analyzes 6 timeframes simultaneously but places entries down to M1 confirmation.' },
      { q: 'Do I need a VPS?', a: 'Strongly recommended given the execution speed the confluence engine relies on.' },
    ],
    membershipTier: null,
    tags: ['mt5', 'hft', 'smc', 'ict', 'expert-advisor'],
    relatedProductIds: ['aurum', 'smc-ict'],
  },
  {
    id: 'aurum',
    name: 'AURUM HFT',
    categoryId: 'expert-advisors',
    tagline: 'A 7-timeframe SMC/ICT/CRT engine tuned for precision entries.',
    description: 'AURUM HFT extends the same confluence-scoring philosophy across a 7-timeframe read, combining Smart Money Concepts, ICT, CRT, and price-action confirmation into a single automated execution system.',
    features: [
      '7-timeframe structural analysis',
      'SMC + ICT + CRT + Price Action confluence',
      'Automated risk management with partials',
    ],
    techSpecs: { platform: 'MetaTrader 5', language: 'MQL5', executionModel: 'Tick-based, HFT' },
    compatibility: ['MetaTrader 5 (Windows/VPS)', 'ECN/Raw spread brokers recommended'],
    requirements: ['MT5 build 3800+', 'VPS with < 20ms broker latency recommended', 'Minimum $500 account balance'],
    installSteps: [
      'Download the .ex5 file from your Downloads page',
      'Copy it into MT5\u2019s MQL5/Experts folder',
      'Restart MT5 and drag AURUM HFT onto your chart',
      'Enter your license Key when prompted',
      'Enable AutoTrading',
    ],
    docsUrl: '/ea/aurum.html',
    page: '/ea/aurum.html',
    version: '1.0.0',
    releaseDate: '2026-05-15',
    changelog: [{ version: '1.0.0', date: '2026-05-15', notes: 'Initial release.' }],
    faq: [
      { q: 'How is AURUM different from APEX?', a: 'AURUM reads one additional timeframe and weights CRT setups more heavily in its confluence score.' },
    ],
    membershipTier: null,
    tags: ['mt5', 'hft', 'smc', 'ict', 'crt', 'expert-advisor'],
    relatedProductIds: ['apex', 'smc-ict'],
  },
  {
    id: 'smc-ict',
    name: 'SMC ICT Elite EA',
    categoryId: 'expert-advisors',
    tagline: 'Institutional-grade automation built on Smart Money Concepts and ICT.',
    description: 'An automated trading system engineered to identify high-probability setups where banks and institutions leave their footprints — combining structure breaks, liquidity sweeps, order blocks, and fair value gaps into a single confluence-filtered execution model.',
    features: [
      '4 confluence filters',
      'Default 1:2 risk-to-reward targeting',
      'Liquidity sweep + CHoCH detection',
      'Order block and FVG mapping',
    ],
    techSpecs: { platform: 'MetaTrader 5', language: 'MQL5', executionModel: 'Structure-based, swing-to-intraday' },
    compatibility: ['MetaTrader 5 (Windows/VPS)'],
    requirements: ['MT5 build 3800+', 'Minimum $500 account balance'],
    installSteps: [
      'Download the .ex5 file from your Downloads page',
      'Copy it into MT5\u2019s MQL5/Experts folder',
      'Restart MT5 and drag SMC ICT Elite EA onto your chart',
      'Enter your license Key when prompted',
      'Enable AutoTrading',
    ],
    docsUrl: '/ea/smc-ict.html',
    page: '/ea/smc-ict.html',
    version: '1.0.0',
    releaseDate: '2026-04-20',
    changelog: [{ version: '1.0.0', date: '2026-04-20', notes: 'Initial release.' }],
    faq: [
      { q: 'Is this beginner-friendly?', a: 'It\u2019s built for people already comfortable with SMC/ICT terminology — CHoCH, BOS, order blocks, FVGs.' },
    ],
    membershipTier: null,
    tags: ['mt5', 'smc', 'ict', 'expert-advisor'],
    relatedProductIds: ['apex', 'aurum'],
  },

  // ── Automation Tools — 7 example automations demonstrating the product
  //    architecture. Pricing intentionally left as placeholders in
  //    assets/data/pricing.js (never invented here) — edit prices there.
  {
    id: 'auto-trade-journal-sync',
    name: 'Trade Journal Sync',
    categoryId: 'automation-tools',
    tagline: 'Automatically logs every closed trade from MT5 into a structured journal.',
    description: 'Watches your MT5 trade history and mirrors every closed position into a clean, filterable journal — no manual entry, no missed trades.',
    features: ['Automatic trade capture on close', 'Tags trades by symbol and session', 'CSV export', 'Works alongside any EA or manual trading'],
    techSpecs: { platform: 'MetaTrader 5', language: 'MQL5', runsAs: 'Background script' },
    compatibility: ['MetaTrader 5 (Windows/VPS)'],
    requirements: ['MT5 build 3800+'],
    installSteps: ['Download the script from your Downloads page', 'Copy it into MQL5/Scripts', 'Run once to start background logging', 'Enter your license Key when prompted'],
    docsUrl: '/docs/introduction.html',
    page: '/product.html?id=auto-trade-journal-sync',
    version: '1.0.0',
    releaseDate: '2026-06-01',
    changelog: [{ version: '1.0.0', date: '2026-06-01', notes: 'Initial release.' }],
    faq: [{ q: 'Does it slow down my terminal?', a: 'No — it reads closed-trade history only, no chart or tick processing.' }],
    membershipTier: null,
    tags: ['automation', 'journal', 'mt5'],
    relatedProductIds: ['auto-risk-guard'],
  },
  {
    id: 'auto-risk-guard',
    name: 'Risk Guard',
    categoryId: 'automation-tools',
    tagline: 'Automatically pauses trading when your daily loss limit is hit.',
    description: 'A watchdog that monitors floating and closed P/L across your account and disables new order placement once a configurable daily loss threshold is crossed.',
    features: ['Configurable daily loss %', 'Auto-disables new entries, doesn\u2019t touch open trades', 'Telegram alert on trigger', 'Resets automatically at your broker\u2019s day rollover'],
    techSpecs: { platform: 'MetaTrader 5', language: 'MQL5', runsAs: 'Background EA' },
    compatibility: ['MetaTrader 5 (Windows/VPS)'],
    requirements: ['MT5 build 3800+'],
    installSteps: ['Download the script from your Downloads page', 'Copy it into MQL5/Experts', 'Attach to any chart — it monitors the whole account', 'Enter your license Key when prompted'],
    docsUrl: '/docs/introduction.html',
    page: '/product.html?id=auto-risk-guard',
    version: '1.0.0',
    releaseDate: '2026-06-05',
    changelog: [{ version: '1.0.0', date: '2026-06-05', notes: 'Initial release.' }],
    faq: [{ q: 'Does it close my open trades?', a: 'No — it only blocks new entries once your limit is hit.' }],
    membershipTier: null,
    tags: ['automation', 'risk-management', 'mt5'],
    relatedProductIds: ['auto-trade-journal-sync'],
  },
  {
    id: 'auto-news-filter',
    name: 'News Filter',
    categoryId: 'automation-tools',
    tagline: 'Automatically blocks new trade entries around high-impact news events.',
    description: 'Pulls a high-impact economic calendar and enforces a configurable no-trade window before and after each release, so your EAs never open positions into a news spike.',
    features: ['High-impact event calendar', 'Configurable pre/post buffer window', 'Per-symbol filtering', 'Works alongside any EA'],
    techSpecs: { platform: 'MetaTrader 5', language: 'MQL5', runsAs: 'Background script' },
    compatibility: ['MetaTrader 5 (Windows/VPS)'],
    requirements: ['MT5 build 3800+', 'Internet access for calendar sync'],
    installSteps: ['Download the script from your Downloads page', 'Copy it into MQL5/Scripts', 'Configure your buffer window', 'Enter your license Key when prompted'],
    docsUrl: '/docs/introduction.html',
    page: '/product.html?id=auto-news-filter',
    version: '1.0.0',
    releaseDate: '2026-06-10',
    changelog: [{ version: '1.0.0', date: '2026-06-10', notes: 'Initial release.' }],
    faq: [{ q: 'Which events does it track?', a: 'High-impact releases only by default (NFP, CPI, rate decisions) — configurable.' }],
    membershipTier: null,
    tags: ['automation', 'news', 'mt5'],
    relatedProductIds: ['auto-risk-guard'],
  },
  {
    id: 'auto-multi-account-copier',
    name: 'Multi-Account Copier',
    categoryId: 'automation-tools',
    tagline: 'Mirrors trades from one master account across unlimited follower accounts.',
    description: 'A lightweight local trade copier for running the same strategy across multiple accounts — prop firm evaluations, personal accounts, or client accounts — with per-account lot scaling.',
    features: ['Unlimited follower accounts', 'Per-account lot multiplier', 'Local-network or same-machine copying', 'Symbol mapping for different broker suffixes'],
    techSpecs: { platform: 'MetaTrader 5', language: 'MQL5', runsAs: 'Master + follower EA pair' },
    compatibility: ['MetaTrader 5 (Windows/VPS)'],
    requirements: ['MT5 build 3800+ on every account', 'Accounts must be reachable on the same machine or local network'],
    installSteps: ['Download both master and follower EAs', 'Attach the master EA on your source account', 'Attach the follower EA on each destination account', 'Enter your license Key on each'],
    docsUrl: '/docs/introduction.html',
    page: '/product.html?id=auto-multi-account-copier',
    version: '1.0.0',
    releaseDate: '2026-06-15',
    changelog: [{ version: '1.0.0', date: '2026-06-15', notes: 'Initial release.' }],
    faq: [{ q: 'Does it work across different brokers?', a: 'Yes, with symbol-suffix mapping configured per follower.' }],
    membershipTier: 'pro',
    tags: ['automation', 'copier', 'mt5'],
    relatedProductIds: ['auto-risk-guard'],
  },
  {
    id: 'auto-session-scheduler',
    name: 'Session Scheduler',
    categoryId: 'automation-tools',
    tagline: 'Automatically enables and disables EAs based on trading session.',
    description: 'Turns your EAs on only during the sessions you actually want to trade (London, New York, Asia — or a custom window), and flat-disables them the rest of the day.',
    features: ['Preset London/NY/Asia sessions', 'Fully custom time windows', 'Per-symbol session rules', 'Timezone-aware, DST-safe'],
    techSpecs: { platform: 'MetaTrader 5', language: 'MQL5', runsAs: 'Background script' },
    compatibility: ['MetaTrader 5 (Windows/VPS)'],
    requirements: ['MT5 build 3800+'],
    installSteps: ['Download the script from your Downloads page', 'Copy it into MQL5/Scripts', 'Configure your session windows', 'Enter your license Key when prompted'],
    docsUrl: '/docs/introduction.html',
    page: '/product.html?id=auto-session-scheduler',
    version: '1.0.0',
    releaseDate: '2026-06-18',
    changelog: [{ version: '1.0.0', date: '2026-06-18', notes: 'Initial release.' }],
    faq: [{ q: 'Does it handle daylight saving automatically?', a: 'Yes, session windows are broker-time aware and adjust for DST.' }],
    membershipTier: null,
    tags: ['automation', 'scheduler', 'mt5'],
    relatedProductIds: ['auto-news-filter'],
  },
  {
    id: 'auto-equity-alert',
    name: 'Equity Alert',
    categoryId: 'automation-tools',
    tagline: 'Sends real-time Telegram alerts on equity milestones and drawdown.',
    description: 'A lightweight monitor that pushes a Telegram message whenever your account equity crosses a milestone you set — new high, drawdown threshold, or daily P/L target.',
    features: ['Custom equity milestones', 'Drawdown alerts', 'Daily P/L target notifications', 'Telegram delivery'],
    techSpecs: { platform: 'MetaTrader 5', language: 'MQL5', runsAs: 'Background script' },
    compatibility: ['MetaTrader 5 (Windows/VPS)'],
    requirements: ['MT5 build 3800+', 'A Telegram bot token (setup guide included)'],
    installSteps: ['Download the script from your Downloads page', 'Copy it into MQL5/Scripts', 'Add your Telegram bot token', 'Enter your license Key when prompted'],
    docsUrl: '/docs/introduction.html',
    page: '/product.html?id=auto-equity-alert',
    version: '1.0.0',
    releaseDate: '2026-06-22',
    changelog: [{ version: '1.0.0', date: '2026-06-22', notes: 'Initial release.' }],
    faq: [{ q: 'Is my Telegram token stored anywhere but my machine?', a: 'No — it stays local to your MT5 terminal config.' }],
    membershipTier: null,
    tags: ['automation', 'alerts', 'telegram'],
    relatedProductIds: ['auto-equity-dashboard'],
  },
  {
    id: 'auto-equity-dashboard',
    name: 'Equity Dashboard',
    categoryId: 'automation-tools',
    tagline: 'A live on-chart dashboard summarizing account health at a glance.',
    description: 'An always-on overlay showing equity curve, today\u2019s P/L, open exposure, and win rate directly on your chart — no need to dig through the terminal\u2019s history tab.',
    features: ['Live equity mini-chart', 'Today\u2019s realized + floating P/L', 'Open exposure by symbol', 'Rolling win-rate stat'],
    techSpecs: { platform: 'MetaTrader 5', language: 'MQL5', runsAs: 'Indicator' },
    compatibility: ['MetaTrader 5 (Windows/VPS)'],
    requirements: ['MT5 build 3800+'],
    installSteps: ['Download the indicator from your Downloads page', 'Copy it into MQL5/Indicators', 'Attach to any chart', 'Enter your license Key when prompted'],
    docsUrl: '/docs/introduction.html',
    page: '/product.html?id=auto-equity-dashboard',
    version: '1.0.0',
    releaseDate: '2026-06-25',
    changelog: [{ version: '1.0.0', date: '2026-06-25', notes: 'Initial release.' }],
    faq: [{ q: 'Does it affect chart performance?', a: 'No — it redraws on tick using lightweight object updates only.' }],
    membershipTier: null,
    tags: ['automation', 'dashboard', 'mt5'],
    relatedProductIds: ['auto-equity-alert'],
  },

  // Every other category (AI Models, APIs, Datasets,
  // Python/JS Projects, HTML/CSS Templates, Developer Tools, Utilities,
  // Prompt Packs) is fully wired into the marketplace's browsing, search,
  // filter, and product-page architecture — it just has zero real
  // products listed yet. Add one here with any categoryId above and it
  // appears immediately with no other code changes.
  //
  // `techSpecs` is a plain key/value object rendered generically on
  // product.html — no category-specific UI needed. Suggested keys per
  // category (purely convention, not enforced):
  //   API products      → { authMethod, rateLimit, versioning }
  //   Dataset products   → { license, format, rows }
  //   AI Model products  → { modelType, contextWindow, inference }
]);

export function getProduct(id) {
  return PRODUCTS.find(p => p.id === id) || null;
}

export function getProductsByCategory(categoryId) {
  return PRODUCTS.filter(p => p.categoryId === categoryId);
}

export function getRelatedProducts(product) {
  if (!product) return [];
  return (product.relatedProductIds || []).map(getProduct).filter(Boolean);
}

/** Same-category products excluding itself — used for "Similar products". */
export function getSimilarProducts(product, limit = 4) {
  if (!product) return [];
  return PRODUCTS.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, limit);
}
