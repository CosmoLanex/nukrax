// ═══════════════════════════════════════════════
// assets/cube/cube.js
// Recreation of the reference cube.mp4: a single solid rounded cube
// (NOT exploded pieces), matte charcoal material with a very fine
// procedural micro-grid on every face, soft studio lighting that
// produces a bright sweeping highlight as the cube turns, and a
// steady, constant-speed turntable rotation — matching the reference
// animation's loop length (300 frames @ 30fps = 10s per revolution).
//
// Everything for the cube lives in this one file + cube.css, per spec.
// ═══════════════════════════════════════════════

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { RoundedBoxGeometry } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/geometries/RoundedBoxGeometry.js';

// ── procedural micro-grid texture (very fine, barely visible squares,
// matching the faint mesh/grid visible on the reference cube's faces) ──
function makeMicroGridTexture() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#242628';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 1;
  const step = 10; // fine grid — many small squares per face
  for (let i = 0; i <= size; i += step) {
    ctx.beginPath(); ctx.moveTo(i + 0.5, 0); ctx.lineTo(i + 0.5, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i + 0.5); ctx.lineTo(size, i + 0.5); ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  texture.anisotropy = 8;
  return texture;
}

// A matching (very subtle) roughness map so the fine grid lines read as
// a slightly different micro-surface rather than a flat printed pattern.
function makeMicroRoughnessMap() {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#8a8a8a';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1;
  const step = 10;
  for (let i = 0; i <= size; i += step) {
    ctx.beginPath(); ctx.moveTo(i + 0.5, 0); ctx.lineTo(i + 0.5, size); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i + 0.5); ctx.lineTo(size, i + 0.5); ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}

export function initCube({ canvasId, hostId, wrapId }) {
  const canvas = document.getElementById(canvasId);
  const host = document.getElementById(hostId);
  const wrap = document.getElementById(wrapId);
  if (!canvas || !host) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── scene / camera / renderer ──
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  // Slight downward viewing angle onto the cube, matching the reference's
  // fixed camera framing. Camera never moves.
  camera.position.set(0, 1.35, 6.2);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  // ── the cube itself: one solid rounded box, real bevel ──
  const geometry = new RoundedBoxGeometry(2, 2, 2, 6, 0.16);
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x26282b,
    map: makeMicroGridTexture(),
    roughnessMap: makeMicroRoughnessMap(),
    roughness: 0.6,
    metalness: 0.12,
    clearcoat: 0.22,
    clearcoatRoughness: 0.45,
  });

  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // ── soft studio lighting: ambient fill + one key light (produces the
  // bright sweeping edge highlight as the cube turns) + a soft opposite
  // fill + a faint cool-toned rim, echoing the reference's lighting. ──
  scene.add(new THREE.AmbientLight(0x3a3d40, 0.85));

  const key = new THREE.DirectionalLight(0xf2f4f5, 2.1);
  key.position.set(3.4, 4.6, 4.2);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x4b5a60, 0.5);
  fill.position.set(-3.6, -1, 2.4);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0x8fb8c4, 0.4);
  rim.position.set(-2.4, 2.2, -3.8);
  scene.add(rim);

  // ── resize ──
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

  // ── animation: steady, constant-speed turntable rotation — one full
  // revolution every 10 seconds, matching the reference clip's loop
  // length (300 frames at 30fps). No easing/acceleration on the primary
  // spin, since the reference reads as a clean constant-speed loop. ──
  const REVOLUTION_SECONDS = 10;
  const ANGULAR_SPEED = (Math.PI * 2) / REVOLUTION_SECONDS;
  const BASE_TILT_X = -0.32; // fixed downward camera-relative tilt, matches reference framing

  cube.rotation.x = BASE_TILT_X;

  let running = true;
  let lastTime = performance.now();

  function render() {
    renderer.render(scene, camera);
  }

  function tick(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    if (!reduceMotion) {
      cube.rotation.y += ANGULAR_SPEED * dt;
    }
    render();
    requestAnimationFrame(tick);
  }

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) {
      lastTime = performance.now();
      requestAnimationFrame(tick);
    }
  });

  requestAnimationFrame(() => wrap && wrap.classList.add('active'));
  render();
  lastTime = performance.now();
  requestAnimationFrame(tick);
}
