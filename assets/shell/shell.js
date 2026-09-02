// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/shell/shell.js
// Builds the logged-in app UI shell (top nav + main nav pill + right
// panel + Dashboard rail + mobile bottom nav) from ui(1).zip and injects
// it into whichever app page includes this file. One module, reused
// unchanged everywhere — same pattern as assets/auth/auth-widget.js,
// which this module reuses directly for the Supabase client rather than
// duplicating that logic.
//
// USAGE — add to any app page's <head>, after tokens.css/theme.css:
//   <script type="module" src="assets/shell/shell.js" data-page="dashboard"></script>
//   (from inside /ea/, use "../assets/shell/shell.js")
// The `data-page` attribute is there for readability/documentation on
// each page, but isn't actually read at runtime: `document.currentScript`
// is spec'd to always be null for `type="module"` scripts, so shell.js
// instead infers the current page directly from the URL every time via
// inferPageKey() below — which works reliably because it's driven by the
// same `.html` paths (`/dashboard.html`, `/marketplace.html`, ...) the
// rest of the site uses, so it's never out of sync with what's actually
// being viewed. Pass `{ page: 'x' }` to initShell() directly if you ever
// need to override it programmatically.
//
// WHY THIS HIDES (NOT REMOVES) EACH PAGE'S OLD NAV:
// Every app page currently ships its own bespoke top nav (db-nav, mp-nav,
// cm-nav, ...) that all happen to share one common mount point,
// `.nav-right`, which auth-widget.js already targets. That shared mount
// point is what lets this file find "the old nav" generically on any
// page without needing a per-page selector list: `.nav-right`'s closest
// `<nav>` ancestor IS that page's old top bar. It's hidden via a CSS
// class (not deleted) so nothing that references those old elements by
// ID elsewhere on the page breaks.
// ═══════════════════════════════════════════════════════════════════════

import { supabase } from '../auth/client.js';
import { toggleTheme, getTheme } from '../colour/theme.js';
import { getMembershipProfile } from '../membership/store.js';

const IN_EA_FOLDER = window.location.pathname.includes('/ea/');
const B = IN_EA_FOLDER ? '../' : '';

// ── Icons — inlined so they inherit color via currentColor and never
// need a network request. Sourced 1:1 from the provided icon pack; three
// (marketplace/leaderboard/payment) had no dedicated icon supplied, so
// these three are hand-built to match the pack's own stroke weight/style
// (1.5px round-cap outline) rather than pulled from an unrelated library
// — flagged here and in the Phase 2 notes.
const ICON = {
  dashboard: '<svg viewBox="0 0 14 14"><path fill="currentColor" fill-rule="evenodd" d="M7.207.478a.5.5 0 0 0-.414 0L4.17 1.672L6.998 2.96l2.83-1.289zM3.7 5.61V2.556l2.8 1.275v3.375L3.991 6.065a.5.5 0 0 1-.293-.455m3.8 6.712v-3.34l2.652 1.208v3.375l-2.506-1.141a.5.5 0 0 1-.147-.102m3.652 1.245V10.19l2.803-1.276v3.055a.5.5 0 0 1-.293.455zM6.498 8.982v3.344a.5.5 0 0 1-.143.098l-2.51 1.143V10.19zM2.845 10.19v3.375L.34 12.424a.5.5 0 0 1-.293-.455V8.915zm4.653-2.982V3.83l2.803-1.276V5.61a.5.5 0 0 1-.293.455zm2.948-.37a.5.5 0 0 1 .414 0l2.62 1.192l-2.83 1.289L7.825 8.03zm-7.306 0a.5.5 0 0 1 .414 0l2.62 1.192l-2.829 1.29L.518 8.03z" clip-rule="evenodd"/></svg>',
  marketplace: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5 5 4h14l1 5.5"/><path d="M4 9.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0 5 0"/><path d="M5 9.8V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.8"/><path d="M9.5 20v-5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5v5"/></svg>',
  community: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18v-1a5 5 0 0 1 5-5v0a5 5 0 0 1 5 5v1M1 18v-1a3 3 0 0 1 3-3v0m19 4v-1a3 3 0 0 0-3-3v0m-8-2a3 3 0 1 0 0-6a3 3 0 0 0 0 6m-8 2a2 2 0 1 0 0-4a2 2 0 0 0 0 4m16 0a2 2 0 1 0 0-4a2 2 0 0 0 0 4"/></svg>',
  leaderboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4"/><path d="M7 4h10v6a5 5 0 0 1-10 0z"/><path d="M7 6H4.5A1.5 1.5 0 0 0 3 7.5 3.5 3.5 0 0 0 6.5 11H7M17 6h2.5A1.5 1.5 0 0 1 21 7.5 3.5 3.5 0 0 1 17.5 11H17"/></svg>',
  terminal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="m8 9l3 3l-3 3m5 0h3"/><path d="M3 9.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C6.04 3 7.16 3 9.4 3h5.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C21 6.04 21 7.16 21 9.4v5.2c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C17.96 21 16.84 21 14.6 21H9.4c-2.24 0-3.36 0-4.216-.436a4 4 0 0 1-1.748-1.748C3 17.96 3 16.84 3 14.6z"/></svg>',
  ea: '<svg viewBox="0 0 12 12"><path fill="currentColor" d="M8.5 6A1.5 1.5 0 0 1 10 7.5c0 1.116-.459 2.01-1.212 2.615c-.649.52-1.49.808-2.396.871a6 6 0 0 1-.784 0c-.905-.063-1.747-.35-2.396-.87C2.459 9.51 2 8.615 2 7.5a1.5 1.5 0 0 1 1.347-1.492L3.5 6zM6 0a.5.5 0 0 1 .5.5V1h1A1.5 1.5 0 0 1 9 2.5v1A1.5 1.5 0 0 1 7.5 5h-3A1.5 1.5 0 0 1 3 3.5v-1A1.5 1.5 0 0 1 4.5 1h1V.5A.5.5 0 0 1 6 0"/></svg>',
  payment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><circle cx="16.5" cy="14.5" r="1.25" fill="currentColor" stroke="none"/></svg>',
  account: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="m22.9 21.2l-4.1-4.1c.4-1 .2-2.3-.7-3.1c-.9-.9-2.2-1.1-3.3-.6l1.9 1.9l-1.4 1.4l-2-2c-.5 1.1-.3 2.4.6 3.4c.9.9 2.1 1.1 3.1.7l4.1 4.1c.2.2.5.2.6 0l1-1c.3-.3.3-.6.2-.7M10 12c2.2 0 4-1.8 4-4s-1.8-4-4-4s-4 1.8-4 4s1.8 4 4 4m0-6c1.1 0 2 .9 2 2s-.9 2-2 2s-2-.9-2-2s.9-2 2-2m3 14H2v-3c0-2.7 5.3-4 8-4c.5 0 1.2.1 1.9.2c-.4.5-.6 1.1-.8 1.8c-.4 0-.7-.1-1.1-.1c-3 0-6.1 1.5-6.1 2.1v1.1h7.6c.3.8.9 1.4 1.5 1.9"/></svg>',
  ai: '<svg viewBox="0 0 1254 1254"><path fill="currentColor" d="M687,251 671,243 645,236 623,235 595,240 570,251 557,260 539,278 530,291 464,413 236,825 229,852 229,877 234,900 243,919 253,933 265,945 281,956 297,963 314,967 334,968 350,966 578,898 532,869 513,849 503,831 498,815 497,784 501,767 508,752 543,690 589,603 604,586 615,580 626,577 644,578 660,586 672,599 678,615 678,633 674,645 615,753 612,764 611,782 615,799 622,813 636,828 653,838 686,852 900,952 916,957 930,959 951,958 978,949 999,934 1009,923 1018,909 1027,883 1028,854 1024,834 1014,811 906,618 727,291 717,277 700,260Z"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16V8c0-.943 0-1.414-.293-1.707S12.943 6 12 6s-1.414 0-1.707.293S10 7.057 10 8v8c0 .943 0 1.414.293 1.707S11.057 18 12 18s1.414 0 1.707-.293S14 16.943 14 16m7-7V7c0-.943 0-1.414-.293-1.707S19.943 5 19 5s-1.414 0-1.707.293S17 6.057 17 7v2c0 .943 0 1.414.293 1.707S18.057 11 19 11s1.414 0 1.707-.293S21 9.943 21 9M7 14v-2c0-.943 0-1.414-.293-1.707S5.943 10 5 10s-1.414 0-1.707.293S3 11.057 3 12v2c0 .943 0 1.414.293 1.707S4.057 16 5 16s1.414 0 1.707-.293S7 14.943 7 14m5 7v-3m7-5v-2m-7-5V3m7 2V3M5 18v-2m0-6V8"/></svg>',
  feedback: '<svg viewBox="0 0 16 16"><path fill="currentColor" d="M9.5 1A1.5 1.5 0 0 0 8 2.5v2a1.5 1.5 0 0 0 1 1.414V7a.5.5 0 0 0 .82.384L11.48 6h2.02A1.5 1.5 0 0 0 15 4.5v-2A1.5 1.5 0 0 0 13.5 1zM9 2.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-2.2a.5.5 0 0 0-.32.116l-.98.816V5.5a.5.5 0 0 0-.5-.5a.5.5 0 0 1-.5-.5zM3 6a2 2 0 1 1 4 0a2 2 0 0 1-4 0m2-1a1 1 0 1 0 0 2a1 1 0 0 0 0-2M2.5 9h5A1.5 1.5 0 0 1 9 10.5c0 1.116-.459 2.01-1.212 2.615C7.047 13.71 6.053 14 5 14s-2.047-.29-2.788-.885C1.46 12.51 1 11.616 1 10.5A1.5 1.5 0 0 1 2.5 9m5 1h-5a.5.5 0 0 0-.5.5c0 .817.325 1.423.838 1.835C3.364 12.757 4.12 13 5 13s1.636-.243 2.162-.665C7.675 11.923 8 11.317 8 10.5a.5.5 0 0 0-.5-.5"/></svg>',
  support: '<svg viewBox="0 0 512 512"><path fill="currentColor" fill-rule="evenodd" d="M422.401 217.174c-6.613-67.84-46.72-174.507-170.666-174.507c-123.947 0-164.054 106.667-170.667 174.507c-23.2 8.805-38.503 31.079-38.4 55.893v29.867c0 32.99 26.744 59.733 59.733 59.733c32.99 0 59.734-26.744 59.734-59.733v-29.867c-.108-24.279-14.848-46.095-37.334-55.253c4.267-39.254 25.174-132.48 126.934-132.48s122.453 93.226 126.72 132.48c-22.44 9.178-37.106 31.009-37.12 55.253v29.867a59.95 59.95 0 0 0 33.92 53.76c-8.96 16.853-31.787 39.68-87.894 46.506c-11.215-17.03-32.914-23.744-51.788-16.023c-18.873 7.72-29.646 27.717-25.71 47.725s21.48 34.432 41.872 34.432a42.67 42.67 0 0 0 37.973-23.68c91.52-10.454 120.747-57.6 129.92-85.334c24.817-8.039 41.508-31.301 41.173-57.386v-29.867c.103-24.814-15.2-47.088-38.4-55.893m-302.933 85.76c0 9.425-7.641 17.066-17.067 17.066s-17.066-7.64-17.066-17.066v-29.867a17.067 17.067 0 1 1 34.133 0zm264.533-29.867c0-9.426 7.641-17.067 17.067-17.067s17.067 7.641 17.067 17.067v29.867c0 9.425-7.641 17.066-17.067 17.066s-17.067-7.64-17.067-17.066z"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path stroke-linecap="round" d="M3.66 10.64C4.13 10.94 4.44 11.44 4.44 12S4.13 13.06 3.66 13.36c-.32.2-.53.36-.68.55-.32.42-.47.95-.4 1.48.05.39.29.8.75 1.6.47.81.7 1.21 1.02 1.46.42.32.95.47 1.48.4.24-.03.48-.13.82-.3.49-.26 1.08-.27 1.57.01.49.28.77.8.79 1.35.02.38.05.64.15.87.2.49.6.88 1.09 1.08.37.15.83.15 1.76.15s1.4 0 1.76-.15c.5-.2.89-.59 1.09-1.08.09-.22.13-.48.14-.86.02-.56.31-1.07.79-1.35.48-.28 1.07-.27 1.56.01.34.18.58.28.82.31.53.07 1.06-.07 1.48-.4.32-.24.55-.65 1.02-1.46.21-.36.37-.64.49-.87M20.34 13.36c-.47-.3-.77-.8-.78-1.36s.3-1.06.78-1.36c.32-.2.53-.36.68-.55.32-.42.47-.95.4-1.48-.05-.4-.29-.8-.75-1.6-.47-.81-.7-1.21-1.02-1.46-.42-.32-.95-.47-1.48-.4-.24.03-.48.13-.82.3-.49.26-1.08.27-1.56-.01-.49-.28-.77-.8-.79-1.35-.01-.38-.05-.64-.14-.86-.2-.49-.6-.88-1.09-1.08C13.4 2 12.93 2 12 2s-1.4 0-1.76.15c-.5.2-.89.59-1.09 1.08-.09.22-.13.48-.14.86-.02.56-.31 1.07-.79 1.35-.48.28-1.07.27-1.56-.01-.34-.18-.58-.28-.82-.31-.53-.07-1.06.07-1.48.4-.32.24-.55.65-1.02 1.46-.21.36-.37.64-.49.87"/></svg>',
  logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15.5 8.04c-.041-1.16-.178-1.885-.636-2.453c-.653-.812-1.77-1.066-4.004-1.576l-1-.228c-3.395-.774-5.092-1.161-6.226-.27C2.5 4.405 2.5 6.126 2.5 9.568v4.864c0 3.442 0 5.164 1.134 6.055s2.83.504 6.225-.27l1.002-.228c2.233-.51 3.35-.764 4.003-1.576c.458-.567.595-1.293.636-2.453m3-6.948s3 2.21 3 3s-3 3-3 3m2.5-3H8.5"/></svg>',
  profile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path stroke-linejoin="round" d="M4 18a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><circle cx="12" cy="7" r="3"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12.2C2 9.9 2 8.8 2.5 7.8C3 6.9 4 6.3 5.9 5.1L7.9 3.9C9.9 2.6 10.9 2 12 2s2.1.6 4.1 1.9l2 1.2c1.9 1.2 2.9 1.8 3.4 2.7c.5 1 .5 2.1.5 4.4v1.5c0 3.9 0 5.9-1.2 7.1S17.8 22 14 22h-4c-3.8 0-5.7 0-6.9-1.2S2 17.6 2 13.7z"/><path stroke-linecap="round" d="M15 18H9"/></svg>',
  docs: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 4.3V6H5.1C4.5 6 4 5.5 4 4.9C4 4.4 4.4 3.9 4.9 3.9L15.7 2.3C16.9 2.2 18 3.1 18 4.3Z"/><path stroke-linecap="round" d="M8 12H16M8 15.5H13.5"/><path stroke-linecap="round" d="M4 6V19C4 20.7 5.3 22 7 22H17C18.7 22 20 20.7 20 19V14M4 6V5M4 6H17C18.7 6 20 7.3 20 9V10"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17h8m-8-5h14m-8-5h8"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M16.066 8.995a.75.75 0 1 0-1.06-1.061L12 10.939L8.995 7.934a.75.75 0 1 0-1.06 1.06L10.938 12l-3.005 3.005a.75.75 0 0 0 1.06 1.06L12 13.06l3.005 3.006a.75.75 0 0 0 1.06-1.06L13.062 12z"/></svg>',
  panel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M14.5 4.5v15"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.4 14.7A8.5 8.5 0 1 1 9.3 3.6a7 7 0 0 0 11.1 11.1"/></svg>',
  avatar: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 12.25a3.75 3.75 0 1 1 3.75-3.75A3.75 3.75 0 0 1 12 12.25m0-6a2.25 2.25 0 1 0 2.25 2.25A2.25 2.25 0 0 0 12 6.25m7 13a.76.76 0 0 1-.75-.75c0-1.95-1.06-3.25-6.25-3.25s-6.25 1.3-6.25 3.25a.75.75 0 0 1-1.5 0c0-4.75 5.43-4.75 7.75-4.75s7.75 0 7.75 4.75a.76.76 0 0 1-.75.75"/></svg>',
};

/** Default avatar for any user without a custom profile picture (section 6). */
export const DEFAULT_AVATAR_SVG = ICON.avatar;
export function defaultAvatarDataUri() {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(
    ICON.avatar.replace('currentColor', '#8FB8C4').replace('<svg ', '<svg style="background:#0A0F13" ')
  );
}

const MAIN_NAV = [
  { key: 'dashboard',   label: 'Dashboard',   href: '/dashboard.html',   icon: ICON.dashboard },
  { key: 'marketplace', label: 'Marketplace', href: '/marketplace.html', icon: ICON.marketplace },
  { key: 'community',   label: 'Community',   href: '/community.html',   icon: ICON.community },
  { key: 'leaderboard', label: 'Leaderboard', href: '/leaderboard.html', icon: ICON.leaderboard },
  { key: 'terminal',    label: 'Terminal',    href: '/tr.html',          icon: ICON.terminal },
  { key: 'ea',          label: 'E.A',         href: '/ea-selection.html',  icon: ICON.ea },
  { key: 'payment',     label: 'Payment',     href: '/cr.html',          icon: ICON.payment },
];

const RIGHT_PANEL = [
  { key: 'account',  label: 'Account',           href: '/account.html',  icon: ICON.account },
  { key: 'chat',     label: 'AI',                href: '/chat.html',     icon: ICON.ai },
  { key: 'map',      label: 'Market Map',        href: '/map.html',      icon: ICON.map },
  { key: 'feedback', label: 'Feedback',          href: '/feedback.html', icon: ICON.feedback },
  { key: 'contact',  label: 'Support',           href: '/contact.html',  icon: ICON.support },
  { key: 'settings', label: 'Settings',          href: '/settings.html', icon: ICON.settings },
  { key: 'logout',   label: 'Log Out',           href: null,         icon: ICON.logout, action: 'logout' },
];

function normalizePath(p) {
  let path = p.split('?')[0].split('#')[0].replace(/index\.html$/, '');
  path = path.replace(/\.html$/, '');
  if (path.length > 1) path = path.replace(/\/$/, '');
  if (!path.startsWith('/')) path = '/' + path.replace(/^(\.\.\/)+/, '');
  return path || '/';
}

function inferPageKey() {
  const norm = normalizePath(window.location.pathname);
  const all = MAIN_NAV.concat(RIGHT_PANEL);
  const hit = all.find(i => i.href && normalizePath(i.href) === norm);
  return hit ? hit.key : (norm.replace(/^\//, '') || 'dashboard');
}

async function doLogout() {
  try { await supabase.auth.signOut(); } catch (e) { /* ignore */ }
  try { sessionStorage.removeItem('nkx_home_redirect_done'); } catch (e) { /* ignore */ }
  window.location.href = '/';
}

function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function navLinkHtml(item, currentKey, { withLabel = true } = {}) {
  const active = item.key === currentKey ? ' nkx-active' : '';
  if (item.action === 'logout') {
    return `<button type="button" class="nkx-rp-logout" data-nkx-action="logout" title="${item.label}" aria-label="${item.label}">${item.icon}${withLabel ? `<span>${item.label}</span>` : ''}</button>`;
  }
  return `<a href="${item.href}" class="${active.trim()}" title="${item.label}" aria-label="${item.label}">${item.icon}${withLabel ? `<span>${item.label}</span>` : ''}</a>`;
}

export function initShell(opts = {}) {
  const currentKey = opts.page || inferPageKey();

  // ── Hide the page's own old nav (find it via the shared .nav-right
  // mount point auth-widget.js already uses — see file header). ──
  // Most app pages share a `.nav-right` mount point (see file header).
  // Product pages (ea/*.html) use a different, older nav structure with
  // no `.nav-right` at all — but each has exactly one <nav> on the page,
  // so it's still findable and hideable the same way. The fallback
  // explicitly skips role="tablist" navs (e.g. dashboard.html's own
  // .db-mobile-tabs) — those are real in-page section switchers, never
  // legacy branding chrome, so they should never be a hide candidate.
  const oldNavRight = document.querySelector('.nav-right');
  const oldNav = oldNavRight ? oldNavRight.closest('nav') : document.querySelector('nav:not([role="tablist"])');
  if (oldNav) oldNav.classList.add('nkx-shell-old-nav-hidden');

  // ── Top bar ──
  const top = el(`
    <div class="nkx-shell-top">
      <a href="/dashboard.html" class="nkx-shell-logo"><span>nukrax</span><svg class="nkx-shell-logo-notch" viewBox="0 0 156 19" preserveAspectRatio="none" aria-hidden="true"><path d="M0,0 L156,0 L140.7,18.2 L14.9,18.2 Z" style="fill:var(--black);stroke:var(--line);stroke-width:1"/></svg></a>
      <nav class="nkx-shell-mainnav" aria-label="Main">
        ${MAIN_NAV.map(i => navLinkHtml(i, currentKey)).join('')}
      </nav>
      <div class="nkx-shell-quick">
        <a href="/feedback.html" class="nkx-shell-iconbtn" title="Feedback" aria-label="Feedback">${ICON.feedback}</a>
        <button type="button" class="nkx-shell-iconbtn" id="nkxShellProfileBtn" title="Profile" aria-label="Profile menu">${ICON.avatar}</button>
        <button type="button" class="nkx-shell-iconbtn nkx-ghost" id="nkxShellMenuBtn" title="Menu" aria-label="Open menu">${ICON.menu}</button>
      </div>
    </div>
  `);
  document.body.prepend(top);

  // ── Profile dropdown ──
  const profileMenu = el(`
    <div class="nkx-shell-profilemenu" id="nkxShellProfileMenu">
      <div class="nkx-shell-profilemenu-head">
        <div class="nkx-name" id="nkxShellProfileName">Loading…</div>
        <div class="nkx-tier" id="nkxShellProfileTier"></div>
      </div>
      <a href="/profile.html">${ICON.profile}<span>View Profile</span></a>
      <a href="/account.html">${ICON.account}<span>Account</span></a>
      <a href="/settings.html">${ICON.settings}<span>Settings</span></a>
      <button type="button" data-nkx-action="logout">${ICON.logout}<span>Log Out</span></button>
    </div>
  `);
  document.body.appendChild(profileMenu);

  // ── Right-side fixed panel (desktop) ──
  const rightPanel = el(`
    <div class="nkx-shell-rightpanel" aria-label="Quick actions">
      ${RIGHT_PANEL.map(i => navLinkHtml(i, currentKey, { withLabel: false })).join('')}
    </div>
  `);
  document.body.appendChild(rightPanel);

  // ── Mobile bottom nav (main nav, icon-only) ──
  const bottomNav = el(`
    <nav class="nkx-shell-bottomnav" aria-label="Main">
      ${MAIN_NAV.map(i => navLinkHtml(i, currentKey, { withLabel: false })).join('')}
    </nav>
  `);
  document.body.appendChild(bottomNav);

  // ── Mobile secondary panel (account/ai/map/feedback/support/settings/
  // logout), collapsed behind a toggle floating just above the bottom
  // nav so the two never compete for the same thumb-reach space. ──
  const mobToggle = el(`<button type="button" class="nkx-shell-mobtoggle" id="nkxShellMobToggle" aria-label="More actions">${ICON.panel}</button>`);
  const mobPanel = el(`
    <div class="nkx-shell-mobpanel" id="nkxShellMobPanel">
      ${RIGHT_PANEL.map(i => navLinkHtml(i, currentKey, { withLabel: false })).join('')}
    </div>
  `);
  document.body.appendChild(mobToggle);
  document.body.appendChild(mobPanel);
  mobToggle.addEventListener('click', () => mobPanel.classList.toggle('nkx-open'));

  // ── Full menu overlay (hamburger) — everything in one accessible list,
  // also serves as the mobile drawer. ──
  const overlay = el(`
    <div class="nkx-shell-overlay" id="nkxShellOverlay">
      <div class="nkx-shell-overlay-panel">
        <button type="button" class="nkx-shell-overlay-close" id="nkxShellOverlayClose" aria-label="Close menu">${ICON.close}</button>
        <div class="nkx-shell-overlay-section-label">Navigate</div>
        ${MAIN_NAV.map(i => navLinkHtml(i, currentKey)).join('')}
        <div class="nkx-shell-overlay-section-label">Account</div>
        ${RIGHT_PANEL.map(i => navLinkHtml(i, currentKey)).join('')}
        <div class="nkx-shell-overlay-section-label">Theme</div>
        <button type="button" id="nkxShellThemeToggle">${getTheme() === 'light' ? ICON.moon : ICON.sun}<span>${getTheme() === 'light' ? 'Switch to Dark' : 'Switch to Light'}</span></button>
      </div>
    </div>
  `);
  document.body.appendChild(overlay);

  // ── Dashboard menu toggle (Dashboard page only, section 13) ──
  // dashboard.html already has a real, working sidebar (`.db-sidebar`,
  // 16 real panels wired up via its own switchPanel()) — the brief's
  // "Dashboard menu button that slides open/closed" is a collapse
  // toggle for that EXISTING sidebar, not a second parallel nav. Adding
  // our own separate set of nav buttons here would either duplicate or
  // fight with the real one, so instead this just adds the toggle button
  // from ui(1).zip and a `.nkx-collapsed` class shell.css knows how to
  // animate — the sidebar's own content/behavior is untouched.
  if (currentKey === 'dashboard') {
    const dbSidebar = document.querySelector('.db-sidebar');
    if (dbSidebar) {
      const toggleBtn = el(`<button type="button" class="nkx-shell-dashrail-toggle" id="nkxShellDashRailToggle" aria-label="Toggle dashboard menu">${ICON.panel}</button>`);
      dbSidebar.prepend(toggleBtn);
      toggleBtn.addEventListener('click', () => dbSidebar.classList.toggle('nkx-collapsed'));
    }
  }

  // ── Wiring ──
  document.body.addEventListener('click', (e) => {
    if (e.target.closest('[data-nkx-action="logout"]')) doLogout();
  });
  document.getElementById('nkxShellProfileBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    profileMenu.classList.toggle('nkx-open');
  });
  document.addEventListener('click', (e) => {
    if (!profileMenu.contains(e.target) && !e.target.closest('#nkxShellProfileBtn')) {
      profileMenu.classList.remove('nkx-open');
    }
  });
  document.getElementById('nkxShellMenuBtn').addEventListener('click', () => overlay.classList.add('nkx-open'));
  document.getElementById('nkxShellOverlayClose').addEventListener('click', () => overlay.classList.remove('nkx-open'));
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('nkx-open'); });
  document.getElementById('nkxShellThemeToggle').addEventListener('click', () => {
    const next = toggleTheme();
    const btn = document.getElementById('nkxShellThemeToggle');
    btn.innerHTML = `${next === 'light' ? ICON.moon : ICON.sun}<span>${next === 'light' ? 'Switch to Dark' : 'Switch to Light'}</span>`;
  });

  // ── Populate profile name/tier + avatar from the session, reusing the
  // site's one shared membership data-access layer (getMembershipProfile
  // in assets/membership/store.js) so this never drifts out of sync with
  // what Account/Settings/Dashboard show for the same user. ──
  supabase.auth.getSession().then(async ({ data }) => {
    const user = data.session?.user;
    if (!user) return;
    const nameEl = document.getElementById('nkxShellProfileName');
    const tierEl = document.getElementById('nkxShellProfileTier');
    const displayName = user.user_metadata?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Member';
    if (nameEl) nameEl.textContent = displayName;
    try {
      const profile = await getMembershipProfile(user);
      if (tierEl) tierEl.textContent = (profile?.membership_tier || 'free').toUpperCase() + ' MEMBER';
      // Default avatar (section 6) for anyone without a custom picture.
      const btn = document.getElementById('nkxShellProfileBtn');
      if (btn) {
        btn.innerHTML = profile?.avatar_url
          ? `<img src="${profile.avatar_url}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`
          : ICON.avatar;
      }
    } catch (e) { if (tierEl) tierEl.textContent = 'FREE MEMBER'; }
  });

  return { currentKey };
}

// Auto-run on import — every consuming page just adds the <script> tag,
// no inline call needed.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => initShell());
} else {
  initShell();
}
