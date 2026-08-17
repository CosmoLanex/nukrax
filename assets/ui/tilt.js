// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/ui/tilt.js
// Phase 3 — the exact subtle 3D mouse-parallax tilt already proven on
// index.html's .ea-preview-card, generalized into one reusable function so
// marketplace/product/dashboard cards get the SAME NUKRAX interaction
// instead of a re-implementation. Same guards as the original: skipped
// entirely on reduced-motion and on touch/coarse-pointer devices (no
// mousemove there anyway, but this avoids ever attaching dead listeners).
// ═══════════════════════════════════════════════════════════════════════

const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  || document.documentElement.classList.contains('nkx-reduce-motion');

/**
 * @param {string|NodeListOf<HTMLElement>} target CSS selector or element list
 * @param {{ strength?: number, lift?: number }} [opts]
 */
export function initTilt(target, opts = {}) {
  if (REDUCE_MOTION || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const strength = opts.strength ?? 3;
  const lift = opts.lift ?? 4;
  const els = typeof target === 'string' ? document.querySelectorAll(target) : target;

  els.forEach(card => {
    let ticking = false;
    let pendingX = 0, pendingY = 0;
    card.addEventListener('mousemove', e => {
      pendingX = e.clientX; pendingY = e.clientY;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const px = (pendingX - rect.left) / rect.width - 0.5;
        const py = (pendingY - rect.top) / rect.height - 0.5;
        const rx = (-py * strength).toFixed(2);
        const ry = (px * strength).toFixed(2);
        card.style.transform = `translateY(-${lift}px) scale(1.008) rotateX(${rx}deg) rotateY(${ry}deg)`;
        ticking = false;
      });
    }, { passive: true });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/**
 * Re-runs initTilt on elements added after initial page load (e.g. a
 * marketplace grid re-rendered after a filter change) — call this instead
 * of re-attaching listeners manually every time a grid re-renders.
 */
export function retilt(target, opts) {
  initTilt(target, opts);
}
