/* ═══════════════════════════════════════════════════════════════════════
   NUKRAX — assets/docs/docs.js
   Shared interactive behavior for every docs/*.html page: mobile drawer,
   sidebar search filter, copy-to-clipboard on code blocks, scroll-synced
   TOC/sidebar highlighting, and the site-wide page-transition curtain.
   Linked once from every docs page instead of duplicating this logic.
   ═══════════════════════════════════════════════════════════════════════ */

/* ── Mobile drawer ── */
const sidebar = document.querySelector('[data-sidebar]');
const overlay = document.querySelector('[data-sidebar-overlay]');
const toggleBtn = document.querySelector('[data-sidebar-toggle]');

function openDrawer(){
  if(!sidebar) return;
  sidebar.classList.add('is-open');
  overlay?.classList.add('is-open');
  document.body.classList.add('docs-drawer-open');
  toggleBtn?.setAttribute('aria-expanded', 'true');
}
function closeDrawer(){
  if(!sidebar) return;
  sidebar.classList.remove('is-open');
  overlay?.classList.remove('is-open');
  document.body.classList.remove('docs-drawer-open');
  toggleBtn?.setAttribute('aria-expanded', 'false');
}
toggleBtn?.addEventListener('click', () => {
  if(sidebar?.classList.contains('is-open')) closeDrawer();
  else openDrawer();
});
overlay?.addEventListener('click', closeDrawer);
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape') closeDrawer();
});
// Close the drawer automatically when a nav link is tapped (mobile only).
sidebar?.querySelectorAll('.docs-nav-link').forEach(a => {
  a.addEventListener('click', () => { if(window.innerWidth <= 860) closeDrawer(); });
});

/* ── Sidebar search filter ── */
const searchInput = document.querySelector('[data-docs-search]');
if(searchInput){
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    document.querySelectorAll('.docs-nav-group').forEach(group => {
      let anyVisible = false;
      group.querySelectorAll('.docs-nav-link').forEach(link => {
        const match = !q || link.textContent.toLowerCase().includes(q);
        link.classList.toggle('is-search-hidden', !match);
        if(match) anyVisible = true;
      });
      group.classList.toggle('is-search-hidden', !anyVisible);
    });
  });
  // "/" focuses the search box, like most docs sites — unless the user is
  // already typing in a field.
  document.addEventListener('keydown', (e) => {
    if(e.key !== '/' ) return;
    const tag = document.activeElement?.tagName;
    if(tag === 'INPUT' || tag === 'TEXTAREA') return;
    e.preventDefault();
    searchInput.focus();
  });
}

/* ── Copy-to-clipboard for code blocks ── */
document.querySelectorAll('[data-copy-target]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const targetId = btn.getAttribute('data-copy-target');
    const codeEl = document.getElementById(targetId);
    if(!codeEl) return;
    const text = codeEl.textContent;
    try {
      if(navigator.clipboard?.writeText){
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      const label = btn.querySelector('.docs-copy-label');
      const original = label ? label.textContent : '';
      btn.classList.add('copied');
      if(label) label.textContent = 'Copied';
      setTimeout(() => {
        btn.classList.remove('copied');
        if(label) label.textContent = original;
      }, 1600);
    } catch {
      /* clipboard unavailable — silently no-op, button just doesn't confirm */
    }
  });
});

/* ── Active TOC + sidebar highlight on scroll ──
   Same cached-offset + rAF-throttled pattern used across the rest of the
   site (see index.html / feedback.html / ea/*.html scroll handlers). */
const docsSections = document.querySelectorAll('.docs-section[id]');
const tocLinks = document.querySelectorAll('.docs-toc-link');

let sectionOffsets = Array.from(docsSections).map(sec => ({ id: sec.id, top: sec.offsetTop }));
window.addEventListener('resize', () => {
  sectionOffsets = Array.from(docsSections).map(sec => ({ id: sec.id, top: sec.offsetTop }));
}, { passive: true });

function syncActive(){
  if(!sectionOffsets.length) return;
  let current = sectionOffsets[0].id;
  const scrollPos = window.scrollY + 120;
  sectionOffsets.forEach(sec => { if(sec.top <= scrollPos) current = sec.id; });
  tocLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
}
let syncTicking = false;
document.addEventListener('scroll', () => {
  if(syncTicking) return;
  syncTicking = true;
  requestAnimationFrame(() => { syncActive(); syncTicking = false; });
}, { passive: true });
syncActive();

/* ── Footer copyright year — same pattern used site-wide ── */
(function(){
  const yearEl = document.getElementById('copyright-year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
})();

/* ── Page transitions — same pattern used across the rest of the site ── */
const curtain = document.getElementById('page-curtain');
document.querySelectorAll('a[href]:not([href^="#"]):not([target="_blank"])').forEach(a => {
  a.addEventListener('click', function(e){
    if(e.defaultPrevented || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const href = this.getAttribute('href');
    if(!href || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    e.preventDefault();
    sessionStorage.setItem('nukrax_from_docs', 'true');
    curtain?.classList.add('leaving');
    setTimeout(() => { window.location.href = href; }, 480);
  });
});
if(sessionStorage.getItem('nukrax_from_docs')){
  sessionStorage.removeItem('nukrax_from_docs');
  curtain?.classList.add('entering');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => { curtain?.classList.remove('entering'); curtain?.classList.add('entered'); });
  });
}
window.addEventListener('pageshow', (e) => {
  if(e.persisted){ curtain?.classList.remove('leaving', 'entering'); }
});
