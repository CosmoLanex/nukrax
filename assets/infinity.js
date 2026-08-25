// ═══════════════════════════════════════════════
// assets/infinity/infinity.js
// The hero animation: a spinning torus-knot (solid + wireframe overlay)
// surrounded by a soft particle cloud. Ported from the reference
// index.html#manifesto animation Cosmo built — same geometry, material
// values, particle counts, and rotation speeds — adapted to run as an
// ES module against the project's existing three@0.160.0 import (the
// reference used a classic r128 global-script include; the visuals are
// unaffected by that difference, TorusKnotGeometry/materials/lights
// used here are the same stable core-Three.js API in both versions).
//
// Replaces assets/cube/cube.js in the hero slot. Same call signature
// (canvasId/hostId/wrapId) so the swap in index.html is a one-line
// change. Everything for this animation lives in this one file, same
// as cube.js/cube.css did for the cube.
// ═══════════════════════════════════════════════

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

export function initInfinity({ canvasId, hostId, wrapId }) {
  const canvas = document.getElementById(canvasId);
  const host = document.getElementById(hostId);
  const wrap = document.getElementById(wrapId);
  if (!canvas || !host) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IS_MOBILE = window.innerWidth < 768;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !IS_MOBILE });
  } catch (e) {
    return;
  }
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, IS_MOBILE ? 1.5 : 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  camera.position.z = 4.2;

  scene.add(new THREE.AmbientLight(0x666666, 0.55));
  const key = new THREE.DirectionalLight(0xdddddd, 0.95);
  key.position.set(3, 5, 4);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x223366, 0.4);
  rim.position.set(-4, -2, -3);
  scene.add(rim);

  // Solid torus knot.
  const geo = new THREE.TorusKnotGeometry(1.1, 0.3, 140, 18, 2, 3);
  const mat = new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.45, metalness: 0.78 });
  const mesh = new THREE.Mesh(geo, mat);
  scene.add(mesh);

  // Wireframe overlay.
  const matW = new THREE.MeshBasicMaterial({ color: 0x8fb8c4, wireframe: true, transparent: true, opacity: 0.4 });
  const meshW = new THREE.Mesh(geo, matW);
  scene.add(meshW);

  // Particle cloud, scaled down on mobile — same as the reference and
  // consistent with cube.js's own mobile-scaling convention.
  const PARTICLE_COUNT = IS_MOBILE ? 180 : 420;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const r = 2.2 + Math.random() * 2;
    const t = Math.random() * Math.PI * 2;
    const p = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(p) * Math.cos(t);
    positions[i * 3 + 1] = r * Math.sin(p) * Math.sin(t);
    positions[i * 3 + 2] = r * Math.cos(p);
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({ color: 0x8fb8c4, size: 0.02, transparent: true, opacity: 0.55 });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  function resize() {
    const rect = host.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize, { passive: true });
  resize();

  // ── render loop — paused when the tab is hidden or the person has
  // "reduce motion" on, same convention as cube.js. ──
  let running = true;
  const clock = new THREE.Clock();

  function render() {
    renderer.render(scene, camera);
  }

  function tick() {
    if (!running) return;
    if (!reduceMotion) {
      const t = clock.getElapsedTime();
      mesh.rotation.x = t * 0.18;
      mesh.rotation.y = t * 0.33;
      meshW.rotation.x = mesh.rotation.x;
      meshW.rotation.y = mesh.rotation.y;
      particles.rotation.y += 0.001;
    }
    render();
    requestAnimationFrame(tick);
  }

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) requestAnimationFrame(tick);
  });

  requestAnimationFrame(() => wrap && wrap.classList.add('active'));
  render();
  requestAnimationFrame(tick);
}
