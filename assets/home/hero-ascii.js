/* ═══════════════════════════════════════════════════════════════════════
   NUKRAX — assets/home/hero-ascii.js
   Animation A: a field of monospace glyphs whose density/opacity ripples
   across a slow layered-sine field, brightening further where the
   pointer sits. Vanilla canvas, no dependencies.

   Respects prefers-reduced-motion (renders one static frame and stops),
   pauses via IntersectionObserver when scrolled off-screen, and pauses
   while the tab is hidden — all to keep this a restrained, cheap effect
   rather than a runaway animation loop.
   ═══════════════════════════════════════════════════════════════════════ */

const GLYPHS = ['·', '∙', '•', '◦', '○', '◉', '●'];

export function initHeroAscii({ canvasId, wrapId }) {
  const canvas = document.getElementById(canvasId);
  const wrap = document.getElementById(wrapId);
  if (!canvas || !wrap) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w = 0, h = 0, dpr = 1;
  let cols = 0, rows = 0, cell = 16;
  let pointer = { x: -9999, y: -9999 };
  let running = false;
  let rafId = null;
  let startTime = null;

  function resize() {
    const rect = wrap.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cell = w < 420 ? 9 : 11;
    cols = Math.ceil(w / cell) + 1;
    rows = Math.ceil(h / cell) + 1;
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const px = x * cell;
        const py = y * cell;
        // Layered-sine pseudo-noise field, cheap and dependency-free.
        const n =
          Math.sin(x * 0.35 + t * 0.6) * 0.5 +
          Math.sin(y * 0.45 - t * 0.4) * 0.5 +
          Math.sin((x + y) * 0.2 + t * 0.3) * 0.4;
        const dist = Math.hypot(px - pointer.x, py - pointer.y);
        const pointerBoost = Math.max(0, 1 - dist / 220);
        let intensity = (n + 1.4) / 2.8;
        intensity = Math.max(0, Math.min(1, intensity + pointerBoost * 0.6));
        const glyphIndex = Math.min(GLYPHS.length - 1, Math.floor(intensity * GLYPHS.length));
        const alpha = 0.4 + intensity * 0.55 + pointerBoost * 0.3;
        const rgb = pointerBoost > 0.35 ? '242,245,245' : '143,184,196';
        ctx.fillStyle = `rgba(${rgb},${Math.min(1, alpha).toFixed(3)})`;
        ctx.font = `${cell * 0.82}px "Space Mono", monospace`;
        ctx.textBaseline = 'middle';
        ctx.fillText(GLYPHS[glyphIndex], px, py);
      }
    }
  }

  function frame(now) {
    if (!running) return;
    if (startTime === null) startTime = now;
    draw((now - startTime) / 1000);
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  resize();
  if (reduceMotion) {
    draw(0); // single static frame, no loop
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && document.visibilityState === 'visible') start();
        else stop();
      });
    }, { threshold: 0.05 });
    io.observe(wrap);

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') stop();
      else if (wrap.getBoundingClientRect().top < window.innerHeight) start();
    });

    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
      });
      canvas.addEventListener('mouseleave', () => {
        pointer.x = -9999;
        pointer.y = -9999;
      });
    }
  }

  let resizeTicking = false;
  window.addEventListener('resize', () => {
    if (resizeTicking) return;
    resizeTicking = true;
    requestAnimationFrame(() => {
      resize();
      if (reduceMotion) draw(0);
      resizeTicking = false;
    });
  }, { passive: true });
}
