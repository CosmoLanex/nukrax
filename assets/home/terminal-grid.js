/* ═══════════════════════════════════════════════════════════════════════
   NUKRAX — assets/home/terminal-grid.js
   Animation D: "Prism Grid" — a 3D-tilted grid of boxes (the whole grid
   plane is tilted via CSS, see .prism-grid) where each cell instantly
   fills with a color from the locked NUKRAX blue-grey palette on hover
   and fades back out over ~1s. Reproduces the supplied spec's Prism
   Grid concept (cursor-reactive per-cell fill, smooth 1s fade, X/Y
   tilt, customizable palette) using the project's own architecture —
   plain DOM cells + CSS transitions + mouseenter/mouseleave — rather
   than pulling in the referenced third-party component.

   No animation loop: the fill/fade is a single CSS transition per cell,
   triggered only on pointer enter/leave, so there is nothing to pause
   for off-screen/hidden-tab cases and no per-frame cost at all.

   Respects prefers-reduced-motion: instead of a blank grid, a fixed set
   of cells is pre-lit in a static wavy pattern (echoing the supplied
   reference image) and no hover listeners are attached.
   ═══════════════════════════════════════════════════════════════════════ */

const BOX_SIZE = 24; // spec default
const PALETTE = ['#ABBED3', '#B0BFD1', '#B9C3D0', '#CFDEEA']; // locked NUKRAX blue-grey family

export function initTerminalGrid({ wrapId, gridId }) {
  const wrap = document.getElementById(wrapId);
  const grid = document.getElementById(gridId);
  if (!wrap || !grid) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function buildGrid() {
    const rect = wrap.getBoundingClientRect();
    const cols = Math.max(1, Math.round(rect.width / BOX_SIZE));
    const rows = Math.max(1, Math.round(rect.height / BOX_SIZE));
    grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
    grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
    grid.textContent = '';

    const frag = document.createDocumentFragment();
    const cellCount = cols * rows;
    for (let i = 0; i < cellCount; i++) {
      const cell = document.createElement('div');
      cell.className = 'prism-cell';
      frag.appendChild(cell);
    }
    grid.appendChild(frag);
    return { cols, rows };
  }

  function wireHover() {
    grid.querySelectorAll('.prism-cell').forEach((cell) => {
      cell.addEventListener('mouseenter', () => {
        const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        cell.style.backgroundColor = color;
        cell.style.opacity = '0.85';
      });
      cell.addEventListener('mouseleave', () => {
        cell.style.backgroundColor = 'transparent';
        cell.style.opacity = '1';
      });
    });
  }

  function paintStaticTrail(cols, rows) {
    // Fixed, deterministic pre-lit pattern — reduced-motion gets a
    // readable static frame rather than an empty grid, and no hover
    // listeners are attached so nothing depends on live pointer input.
    const cells = grid.querySelectorAll('.prism-cell');
    const midRow = Math.floor(rows / 2);
    for (let x = 0; x < cols; x++) {
      const wobble = Math.round(Math.sin(x * 0.5) * 2);
      const y = Math.max(0, Math.min(rows - 1, midRow + wobble));
      const i = y * cols + x;
      const cell = cells[i];
      if (!cell) continue;
      const color = PALETTE[x % PALETTE.length];
      cell.style.backgroundColor = color;
      cell.style.opacity = (0.25 + 0.35 * (0.5 + 0.5 * Math.sin(x * 0.35))).toFixed(3);
    }
  }

  function setup() {
    const { cols, rows } = buildGrid();
    if (reduceMotion) {
      paintStaticTrail(cols, rows);
    } else if (canHover) {
      wireHover();
    }
  }

  setup();

  let resizeTicking = false;
  window.addEventListener('resize', () => {
    if (resizeTicking) return;
    resizeTicking = true;
    requestAnimationFrame(() => {
      setup();
      resizeTicking = false;
    });
  }, { passive: true });
}
