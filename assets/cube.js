// ═══════════════════════════════════════════════
// assets/cube/cube.js
// Recreation of the reference cube.mp4: a real 3×3×3 grid of 27
// individual small rounded cubies with genuine gaps between them, matte
// material with visible tonal/texture variation per piece, soft studio
// lighting, a slow whole-cube tumble through space, AND a real
// scramble animation — individual layers twist 90° at a time, like an
// actual Rubik's cube being scrambled, following a fixed scripted move
// sequence (not random).
//
// Everything for the cube lives in this one file + cube.css, per spec.
// ═══════════════════════════════════════════════

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

// ── self-contained rounded-box geometry (no addon dependency) ──
// Built from a rounded-rectangle 2D profile, extruded with a bevel on
// both caps — this rounds all 12 edges using only core Three.js classes
// (Shape + ExtrudeGeometry), avoiding the examples/jsm RoundedBoxGeometry
// addon entirely, since that addon's bare "three" import breaks when
// loaded directly from jsdelivr/unpkg without an import map.
function createRoundedBoxGeometry(width, height, depth, radius, smoothness = 6) {
  const shape = new THREE.Shape();
  const x = -width / 2, y = -height / 2, w = width, h = height, r = radius;

  shape.moveTo(x, y + r);
  shape.lineTo(x, y + h - r);
  shape.quadraticCurveTo(x, y + h, x + r, y + h);
  shape.lineTo(x + w - r, y + h);
  shape.quadraticCurveTo(x + w, y + h, x + w, y + h - r);
  shape.lineTo(x + w, y + r);
  shape.quadraticCurveTo(x + w, y, x + w - r, y);
  shape.lineTo(x + r, y);
  shape.quadraticCurveTo(x, y, x, y + r);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.001, depth - radius * 2),
    bevelEnabled: true,
    bevelThickness: radius,
    bevelSize: radius,
    bevelSegments: smoothness,
    curveSegments: smoothness,
  });
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

// ── procedural perforated-mesh texture (speaker-grille dot pattern) —
// a handful of the reference's 27 pieces clearly show this fine dot
// texture rather than a plain surface. Higher-contrast than before so
// it actually reads at a glance rather than needing to squint. ──
function makeMeshTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#2a2e32';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#050607';
  const step = 14;
  for (let y = step / 2; y < size; y += step) {
    for (let x = step / 2; x < size; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// A fixed, hand-scripted sequence of layer twists — a genuine scramble
// pattern (not randomly generated at runtime). Cycles forever.
// axis: which world axis the layer spins around. layer: which slice
// (-1 / 0 / 1) along that axis. dir: +1 or -1 turn direction.
const MOVE_SEQUENCE = [
  { axis: 'y', layer: 1, dir: 1 },
  { axis: 'x', layer: -1, dir: -1 },
  { axis: 'z', layer: 1, dir: 1 },
  { axis: 'y', layer: -1, dir: -1 },
  { axis: 'x', layer: 1, dir: 1 },
  { axis: 'z', layer: -1, dir: -1 },
  { axis: 'y', layer: 0, dir: 1 },
  { axis: 'x', layer: 0, dir: -1 },
  { axis: 'z', layer: 1, dir: -1 },
  { axis: 'y', layer: 1, dir: -1 },
  { axis: 'x', layer: -1, dir: 1 },
  { axis: 'z', layer: -1, dir: 1 },
];

const TWIST_DURATION = 1.2;  // seconds per 90° twist
const PAUSE_DURATION = 0.9;  // pause between twists

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
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
  camera.position.set(0, 1.6, 8.8);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  // ── the cube itself: 27 individual small rounded cubies (not
  // instanced — each one needs to be independently regrouped into a
  // "layer" for the scramble twists), sitting with genuine gaps
  // between them. Positions are fixed, identical spacing, no
  // randomness. ──
  const CUBIE_SIZE = 0.62;
  const CUBIE_GAP = 0.05;
  const CUBIE_BEVEL = 0.05;
  const STEP = CUBIE_SIZE + CUBIE_GAP;

  const cubieGeometry = createRoundedBoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE, CUBIE_BEVEL, 3);
  const meshTexture = makeMeshTexture();

  // More visibly distinct tonal variants than before, plus the
  // mesh-texture variant on more pieces so the texture actually reads.
  const materials = [
    new THREE.MeshPhysicalMaterial({ color: 0x2b2f34, roughness: 0.55, metalness: 0.18, clearcoat: 0.2, clearcoatRoughness: 0.45 }),
    new THREE.MeshPhysicalMaterial({ color: 0x3a3f45, roughness: 0.5, metalness: 0.22, clearcoat: 0.25, clearcoatRoughness: 0.4 }),
    new THREE.MeshPhysicalMaterial({ color: 0x16181b, roughness: 0.62, metalness: 0.14, clearcoat: 0.15, clearcoatRoughness: 0.5 }),
    new THREE.MeshStandardMaterial({ map: meshTexture, color: 0x3d434a, roughness: 0.68, metalness: 0.16 }),
  ];

  const MESH_TEXTURE_SLOTS = new Set(['0,1,0', '1,0,-1', '-1,1,1', '0,-1,1', '1,1,0', '-1,0,-1']);

  function variantForSlot(i, j, k) {
    if (MESH_TEXTURE_SLOTS.has(`${i},${j},${k}`)) return 3;
    return ((i + j + k + 3) * 7) % 3;
  }

  const cube = new THREE.Group();
  const cubies = []; // { mesh, gx, gy, gz } — gx/gy/gz = logical grid coords, updated after each twist

  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      for (let k = -1; k <= 1; k++) {
        const material = materials[variantForSlot(i, j, k)];
        const mesh = new THREE.Mesh(cubieGeometry, material);
        mesh.position.set(i * STEP, j * STEP, k * STEP);
        cube.add(mesh);
        cubies.push({ mesh, gx: i, gy: j, gz: k });
      }
    }
  }

  // Bigger overall presence on desktop.
  cube.scale.setScalar(1.35);
  scene.add(cube);

  // ── soft studio lighting ──
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

  // ── whole-cube tumble (slow, independent of the layer scramble) ──
  const SPEED_X = (Math.PI * 2) / 14;
  const SPEED_Y = (Math.PI * 2) / 10;
  const SPEED_Z = (Math.PI * 2) / 22;
  // Slow, independent envelopes (well under one cycle per minute) that
  // modulate emphasis/direction over time — so the tumble genuinely
  // varies between "mostly up-down" and "mostly left-right" phases,
  // including real reversals, rather than one fixed repeating loop.
  const ENV_X = (Math.PI * 2) / 51;
  const ENV_Y = (Math.PI * 2) / 67;
  const BASE_TILT_X = -0.32;
  cube.rotation.x = BASE_TILT_X;

  // ── scramble state machine ──
  const pivot = new THREE.Group();
  cube.add(pivot);

  let moveIndex = 0;
  let phase = 'pause'; // 'pause' | 'twisting'
  let phaseStart = performance.now();
  let activeMove = null;
  let activeLayerCubies = [];

  const AXIS_VECTOR = {
    x: new THREE.Vector3(1, 0, 0),
    y: new THREE.Vector3(0, 1, 0),
    z: new THREE.Vector3(0, 0, 1),
  };

  function startTwist(move) {
    activeMove = move;
    activeLayerCubies = cubies.filter(c => {
      if (move.axis === 'x') return c.gx === move.layer;
      if (move.axis === 'y') return c.gy === move.layer;
      return c.gz === move.layer;
    });
    pivot.rotation.set(0, 0, 0);
    pivot.position.set(0, 0, 0);
    activeLayerCubies.forEach(c => pivot.attach(c.mesh));
  }

  function finishTwist(move) {
    // Snap to the exact final angle, then bake the rotation into each
    // piece permanently and update its logical grid coordinate.
    activeLayerCubies.forEach(c => cube.attach(c.mesh));

    const sign = move.dir;
    activeLayerCubies.forEach(c => {
      let { gx, gy, gz } = c;
      if (move.axis === 'x') {
        const ny = sign > 0 ? -gz : gz;
        const nz = sign > 0 ? gy : -gy;
        gy = ny; gz = nz;
      } else if (move.axis === 'y') {
        const nx = sign > 0 ? gz : -gz;
        const nz = sign > 0 ? -gx : gx;
        gx = nx; gz = nz;
      } else {
        const nx = sign > 0 ? -gy : gy;
        const ny = sign > 0 ? gx : -gx;
        gx = nx; gy = ny;
      }
      c.gx = gx; c.gy = gy; c.gz = gz;
      // Position is re-derived exactly from the (now-updated) logical
      // grid coordinate, so it can never drift. Rotation is left as
      // whatever attach() just computed — that's already the correct,
      // properly-composed orientation; manually "rounding" it per-axis
      // would only be valid for a single isolated rotation and breaks
      // once a piece has been twisted around more than one axis.
      c.mesh.position.set(gx * STEP, gy * STEP, gz * STEP);
      c.mesh.quaternion.normalize();
    });
  }

  function updateScramble(nowSeconds) {
    const elapsed = nowSeconds - phaseStart;

    if (phase === 'pause') {
      if (elapsed >= PAUSE_DURATION) {
        startTwist(MOVE_SEQUENCE[moveIndex]);
        phase = 'twisting';
        phaseStart = nowSeconds;
      }
      return;
    }

    // twisting
    const t = Math.min(1, elapsed / TWIST_DURATION);
    const eased = easeInOutCubic(t);
    const angle = (Math.PI / 2) * activeMove.dir * eased;
    pivot.setRotationFromAxisAngle(AXIS_VECTOR[activeMove.axis], angle);

    if (t >= 1) {
      finishTwist(activeMove);
      moveIndex = (moveIndex + 1) % MOVE_SEQUENCE.length;
      phase = 'pause';
      phaseStart = nowSeconds;
    }
  }

  // ── render loop ──
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
      const envX = Math.sin((now / 1000) * ENV_X);          // -1..1, slow — up/down emphasis + occasional reversal
      const envY = Math.sin((now / 1000) * ENV_Y + 2.3);    // -1..1, slow, offset — left/right spin direction + occasional reversal
      cube.rotation.x = BASE_TILT_X + Math.sin((now / 1000) * SPEED_X) * (0.3 + 0.4 * Math.abs(envX)) * Math.sign(envX || 1);
      cube.rotation.y += SPEED_Y * dt * envY;
      cube.rotation.z = Math.sin((now / 1000) * SPEED_Z + 1.4) * 0.35;
      updateScramble(now / 1000);
    }
    render();
    requestAnimationFrame(tick);
  }

  document.addEventListener('visibilitychange', () => {
    running = !document.hidden;
    if (running) {
      lastTime = performance.now();
      phaseStart = performance.now() / 1000;
      requestAnimationFrame(tick);
    }
  });

  requestAnimationFrame(() => wrap && wrap.classList.add('active'));
  phaseStart = performance.now() / 1000;
  render();
  lastTime = performance.now();
  requestAnimationFrame(tick);
}
