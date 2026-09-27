/* ═══════════════════════════════════════════════════════════════════════
   NUKRAX — assets/home/megamenu.js
   Logged-out homepage navbar: desktop hover/click dropdowns + mobile
   off-canvas drawer. Vanilla, dependency-free, keyboard accessible.

   Markup contract (see index.html #nkx-mm-list):
     .nkx-mm-item > .nkx-mm-trigger[aria-expanded] + .nkx-mm-panel.open
     .nkx-mm-item > .nkx-mm-link            (plain, single-destination items)
   Mobile drawer toggle: #nkx-mm-toggle, body.nkx-mm-drawer-open
   ═══════════════════════════════════════════════════════════════════════ */

export function initMegaMenu() {
  const items = document.querySelectorAll('.nkx-mm-item');
  if (!items.length) return;

  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function closeAll(except) {
    items.forEach((item) => {
      if (item === except) return;
      const trigger = item.querySelector('.nkx-mm-trigger');
      const panel = item.querySelector('.nkx-mm-panel');
      if (!trigger || !panel) return;
      trigger.setAttribute('aria-expanded', 'false');
      panel.classList.remove('open');
    });
  }

  items.forEach((item) => {
    const trigger = item.querySelector('.nkx-mm-trigger');
    const panel = item.querySelector('.nkx-mm-panel');
    if (!trigger || !panel) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (canHover && e.detail > 0) {
        // Real mouse click on a hover-capable device — mouseenter already
        // opened this panel; without this branch, the click that follows
        // the hover would immediately toggle it shut again. Hover owns
        // open/close here, so a click just confirms it stays open.
        closeAll(item);
        trigger.setAttribute('aria-expanded', 'true');
        panel.classList.add('open');
        return;
      }
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      closeAll(isOpen ? null : item);
      trigger.setAttribute('aria-expanded', String(!isOpen));
      panel.classList.toggle('open', !isOpen);
    });

    if (canHover) {
      let closeTimer = null;
      item.addEventListener('mouseenter', () => {
        clearTimeout(closeTimer);
        closeAll(item);
        trigger.setAttribute('aria-expanded', 'true');
        panel.classList.add('open');
      });
      item.addEventListener('mouseleave', () => {
        closeTimer = setTimeout(() => {
          trigger.setAttribute('aria-expanded', 'false');
          panel.classList.remove('open');
        }, 140);
      });
      // Keep it open while focus/hover is inside the panel itself.
      panel.addEventListener('mouseenter', () => clearTimeout(closeTimer));
      panel.addEventListener('mouseleave', () => {
        closeTimer = setTimeout(() => {
          trigger.setAttribute('aria-expanded', 'false');
          panel.classList.remove('open');
        }, 140);
      });
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nkx-mm-item')) closeAll();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAll();
      closeDrawer();
    }
  });

  // ── Mobile off-canvas drawer ──
  const toggle = document.getElementById('nkx-mm-toggle');
  const list = document.getElementById('nkx-mm-list');

  function openDrawer() {
    document.body.classList.add('nkx-mm-drawer-open');
    toggle?.setAttribute('aria-expanded', 'true');
  }
  function closeDrawer() {
    document.body.classList.remove('nkx-mm-drawer-open');
    toggle?.setAttribute('aria-expanded', 'false');
  }
  if (toggle && list) {
    toggle.addEventListener('click', () => {
      const isOpen = document.body.classList.contains('nkx-mm-drawer-open');
      if (isOpen) { closeDrawer(); } else { openDrawer(); }
    });
    // Plain (non-dropdown) links close the drawer once followed.
    list.querySelectorAll('.nkx-mm-link').forEach((a) => {
      a.addEventListener('click', closeDrawer);
    });
    list.querySelectorAll('.nkx-mm-panel a').forEach((a) => {
      a.addEventListener('click', closeDrawer);
    });
  }

  // Collapsing back to desktop width with the drawer open would otherwise
  // leave body.nkx-mm-drawer-open stuck and the (desktop-hidden) toggle's
  // aria-expanded stale.
  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) closeDrawer();
  });
}
