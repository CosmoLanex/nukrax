// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/ui/reveal.js
// Phase 3 — the SAME scroll-reveal architecture already proven on
// index.html, generalized so other pages (marketplace, product, docs)
// don't re-implement their own IntersectionObserver logic:
//
//   .nkx-reveal          → one-shot: fades in once, then stops observing
//                           (headlines, paragraphs — content shouldn't
//                           disappear again just because it scrolled out)
//   .nkx-reveal-toggle    → reversible: adds/removes `.visible` every time
//                           it enters/exits the viewport (decorative cards,
//                           images — the "reverses on scroll up" requirement)
//
// Respects prefers-reduced-motion AND the in-app nkx-reduce-motion class
// (assets/membership/motion.js) — reveals everything instantly, no
// animation, exactly like index.html's forceRevealAll() fallback.
// ═══════════════════════════════════════════════════════════════════════

const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  || document.documentElement.classList.contains('nkx-reduce-motion');

/** @param {ParentNode} [root] scope to search within — defaults to the whole document. */
export function initScrollReveal(root = document) {
  const oneShot = root.querySelectorAll('.nkx-reveal');
  const toggle = root.querySelectorAll('.nkx-reveal-toggle');

  if (REDUCE_MOTION) {
    oneShot.forEach(el => el.classList.add('visible'));
    toggle.forEach(el => el.classList.add('visible'));
    return;
  }

  const oneShotIO = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  oneShot.forEach(el => oneShotIO.observe(el));

  const toggleIO = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('visible', entry.isIntersecting));
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  toggle.forEach(el => toggleIO.observe(el));

  return { oneShotIO, toggleIO };
}
