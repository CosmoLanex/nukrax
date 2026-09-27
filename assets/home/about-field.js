/* ═══════════════════════════════════════════════════════════════════════
   NUKRAX — assets/home/about-field.js
   Animation B: "Reactive Intelligence Field" — a borderless field of
   luminous points and fine flowing lines that drift through a slow
   wave-like formation, occasionally converging into denser streams
   before dispersing again. Cursor proximity gently displaces nearby
   particles (restrained, not playful). Vanilla canvas, no dependencies.

   Per spec: abstract and technological, not a literal network/brain
   graphic — accomplished here by keeping links only between genuinely
   close particles (a real proximity graph, not a decorative mesh) and
   letting density come from flow-field clustering rather than a fixed
   lattice.

   Respects prefers-reduced-motion (single static frame, no drift, no
   cursor reactivity), pauses via IntersectionObserver when scrolled
   off-screen and while the tab is hidden.
   ═══════════════════════════════════════════════════════════════════════ */

const LINK_DIST = 68;
const PARTICLE_COLOR = '171,190,211'; // #ABBED3 — locked NUKRAX accent family

export function initAboutField({ canvasId, wrapId }) {
  const canvas = document.getElementById(canvasId);
  const wrap = document.getElementById(wrapId);
  if (!canvas || !wrap) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w = 0, h = 0, dpr = 1;
  let particles = [];
  let pointer = { x: -9999, y: -9999 };
  let running = false;
  let rafId = null;

  function particleCount() {
    // Density scales with area but is capped — the canvas here is modest
    // (a few hundred px on a side), so a fairly dense field is still
    // cheap: n^2 proximity checks at ~350 particles is well under budget
    // for a single rAF pass.
    const area = w * h;
    return Math.max(140, Math.min(360, Math.round(area / 620)));
  }

  function seedParticles() {
    const n = particleCount();
    particles = new Array(n).fill(0).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: 0, vy: 0,
      phase: Math.random() * Math.PI * 2,
      r: 0.6 + Math.random() * 1.2,
      baseAlpha: 0.25 + Math.random() * 0.55,
    }));
  }

  function resize() {
    const rect = wrap.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = Math.max(1, Math.round(rect.width));
    h = Math.max(1, Math.round(rect.height));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seedParticles();
  }

  function step(p, t) {
    // Cheap flow field (layered sine, no external noise lib) — gives the
    // "particles subtly converge, separate and bend" behaviour from the
    // spec without any per-frame allocation.
    const angle =
      Math.sin(p.x * 0.006 + t * 0.15) * Math.PI +
      Math.cos(p.y * 0.008 - t * 0.1) * 0.6 +
      p.phase;
    const speed = 0.22;
    p.vx += Math.cos(angle) * speed * 0.04;
    p.vy += Math.sin(angle) * speed * 0.04;

    // Gentle cursor-proximity displacement — restrained, not playful.
    const dx = p.x - pointer.x;
    const dy = p.y - pointer.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 130 && dist > 0.01) {
      const push = (1 - dist / 130) * 0.55;
      p.vx += (dx / dist) * push;
      p.vy += (dy / dist) * push;
    }

    // Drag keeps drift slow and prevents runaway velocity accumulation.
    p.vx *= 0.94;
    p.vy *= 0.94;
    p.x += p.vx;
    p.y += p.vy;

    // Wrap at the edges — the mask (CSS) fades them out visually, so a
    // wrap-around here reads as continuous flow, not a reset.
    if (p.x < -20) p.x = w + 20;
    if (p.x > w + 20) p.x = -20;
    if (p.y < -20) p.y = h + 20;
    if (p.y > h + 20) p.y = -20;
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);

    particles.forEach((p) => step(p, t));

    // Proximity lines — a real distance graph, not a decorative lattice.
    for (let i = 0; i < particles.length; i++) {
      const a = particles[i];
      for (let j = i + 1; j < particles.length; j++) {
        const b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < LINK_DIST) {
          const alpha = (1 - d / LINK_DIST) * 0.22;
          ctx.strokeStyle = `rgba(${PARTICLE_COLOR},${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    particles.forEach((p) => {
      ctx.fillStyle = `rgba(${PARTICLE_COLOR},${p.baseAlpha.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  let startTime = null;
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
    draw(0); // single static frame, no loop, no cursor reactivity
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
      window.addEventListener('mousemove', (e) => {
        const rect = wrap.getBoundingClientRect();
        pointer.x = e.clientX - rect.left;
        pointer.y = e.clientY - rect.top;
      }, { passive: true });
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
