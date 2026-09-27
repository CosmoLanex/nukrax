/* ═══════════════════════════════════════════════════════════════════════
   NUKRAX — assets/home/ticker-pulse.js
   Animation E: a full-width band of vertical pulse lines whose heights
   trace a slow travelling wave, with a soft light band sweeping across
   them left-to-right. Vanilla canvas, no dependencies.

   Respects prefers-reduced-motion (static wave, no sweep/travel),
   pauses via IntersectionObserver when off-screen and while the tab is
   hidden.
   ═══════════════════════════════════════════════════════════════════════ */

export function initTickerPulse({ canvasId, wrapId }) {
  const canvas = document.getElementById(canvasId);
  const wrap = document.getElementById(wrapId);
  if (!canvas || !wrap) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w = 0, h = 0, dpr = 1;
  let gap = 10;
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
    gap = w < 480 ? 8 : 10;
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    const mid = h / 2;
    const count = Math.floor(w / gap);
    // Sweep band travels once across the width every 5.5s, then loops.
    const sweepX = reduceMotion ? -1 : ((t / 5.5) % 1) * (w + 240) - 120;

    for (let i = 0; i < count; i++) {
      const x = i * gap + gap / 2;
      const wave = reduceMotion
        ? Math.sin(i * 0.35) * 0.5 + 0.5
        : Math.sin(i * 0.35 + t * 0.8) * 0.5 + 0.5;
      const lineH = 4 + wave * (h * 0.6);
      const distFromSweep = Math.abs(x - sweepX);
      const sweepBoost = reduceMotion ? 0 : Math.max(0, 1 - distFromSweep / 160);
      const alpha = 0.16 + wave * 0.22 + sweepBoost * 0.55;

      ctx.strokeStyle = `rgba(143,184,196,${Math.min(1, alpha).toFixed(3)})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(x, mid - lineH / 2);
      ctx.lineTo(x, mid + lineH / 2);
      ctx.stroke();

      // Bright tip dot, echoing the reference wave-of-dots composition.
      ctx.fillStyle = `rgba(242,245,245,${Math.min(1, alpha + 0.15).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, mid - lineH / 2, 1.4, 0, Math.PI * 2);
      ctx.fill();
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
    draw(0);
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
