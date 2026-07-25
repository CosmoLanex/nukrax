// ═══════════════════════════════════════════════
// assets/cube/cube.js
// Recreation of the reference cube.mp4: a real 3×3×3 grid of 27
// individual small rounded cubies with genuine gaps between them (a
// real Rubik's-cube structure, not a texture on a single box), matte
// material, soft studio lighting, and a steady, constant-speed
// turntable rotation matching the reference clip's loop length
// (300 frames @ 30fps = 10s per revolution).
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
// texture rather than a plain surface, so a few cubies get it too. ──
function makeMeshTexture() {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#232629';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#0c0e10';
  const step = 15;
  for (let y = step / 2; y < size; y += step) {
    for (let x = step / 2; x < size; x += step) {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
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
  camera.position.set(0, 1.6, 8.8);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  // ── the cube itself: a REAL 3×3×3 grid of 27 individual small rounded
  // cubies sitting together with genuine gaps between them (a real
  // Rubik's-cube structure), NOT a single smooth box and NOT a texture —
  // this is what the reference frames actually show: each small square
  // is its own piece catching light separately. Positions are fixed,
  // identical spacing, no randomness. Matte material only (no clearcoat/
  // metal sheen) — highlights come from real geometry catching the key
  // light, not from a glossy surface. ──
  const CUBIE_SIZE = 0.62;
  const CUBIE_GAP = 0.045;
  const CUBIE_BEVEL = 0.05;
  const STEP = CUBIE_SIZE + CUBIE_GAP;

  const cubieGeometry = createRoundedBoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE, CUBIE_BEVEL, 3);
  const meshTexture = makeMeshTexture();

  // A little more visual richness than flat-matte (subtle specular
  // response), but still not glossy/chrome — plus one mesh-textured
  // variant, matching the handful of perforated-looking pieces visible
  // in the reference.
  const materials = [
    new THREE.MeshPhysicalMaterial({ color: 0x24272a, roughness: 0.62, metalness: 0.15, clearcoat: 0.15, clearcoatRoughness: 0.5 }),
    new THREE.MeshPhysicalMaterial({ color: 0x2c2f33, roughness: 0.58, metalness: 0.18, clearcoat: 0.18, clearcoatRoughness: 0.45 }),
    new THREE.MeshPhysicalMaterial({ color: 0x1c1e21, roughness: 0.65, metalness: 0.12, clearcoat: 0.12, clearcoatRoughness: 0.55 }),
    new THREE.MeshStandardMaterial({ map: meshTexture, color: 0x33383c, roughness: 0.7, metalness: 0.15 }),
  ];

  // Deterministic (not random) variant per slot — three tonal variants
  // plus the mesh-texture variant on specific fixed positions only.
  const MESH_TEXTURE_SLOTS = new Set(['0,1,0', '1,0,-1', '-1,1,1']);

  function variantForSlot(i, j, k) {
    if (MESH_TEXTURE_SLOTS.has(`${i},${j},${k}`)) return 3;
    return ((i + j + k + 3) * 7) % 3;
  }

  const slots = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      for (let k = -1; k <= 1; k++) {
        slots.push([i, j, k]);
      }
    }
  }

  const buckets = [[], [], [], []];
  slots.forEach(([i, j, k]) => buckets[variantForSlot(i, j, k)].push([i, j, k]));

  const cube = new THREE.Group();
  const dummy = new THREE.Object3D();

  buckets.forEach((bucketSlots, variantIndex) => {
    if (!bucketSlots.length) return;
    const mesh = new THREE.InstancedMesh(cubieGeometry, materials[variantIndex], bucketSlots.length);
    bucketSlots.forEach(([i, j, k], idx) => {
      dummy.position.set(i * STEP, j * STEP, k * STEP);
      dummy.rotation.set(0, 0, 0);
      dummy.updateMatrix();
      mesh.setMatrixAt(idx, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    cube.add(mesh);
  });

  // Bigger overall presence on desktop — the whole assembled cube is
  // scaled up as one unit (piece proportions/gaps stay identical).
  cube.scale.setScalar(1.35);

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

  // ── animation: real multi-axis tumbling (like a hand turning the
  // cube through space), not a single-axis left-right spin. Three
  // independent, continuously-accumulating rotations at different,
  // non-matching speeds on X/Y/Z produce a natural tumble that moves
  // up/down and side to side over time, matching the reference. ──
  const SPEED_X = (Math.PI * 2) / 14;   // slower tumble on X (up/down feel)
  const SPEED_Y = (Math.PI * 2) / 10;   // primary turn speed
  const SPEED_Z = (Math.PI * 2) / 22;   // slow roll for extra dimensionality
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
      cube.rotation.x = BASE_TILT_X + Math.sin((now / 1000) * SPEED_X) * 0.55;
      cube.rotation.y += SPEED_Y * dt;
      cube.rotation.z = Math.sin((now / 1000) * SPEED_Z + 1.4) * 0.35;
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
