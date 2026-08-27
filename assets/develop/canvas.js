// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/develop/canvas.js
// The block-based visual canvas shared by develop/ea.html and
// develop/automation.html — one engine, fed a different block registry
// (assets/develop/blocks.js) by each page. Deliberately built on plain
// HTML5 drag/drop + absolutely-positioned divs + a couple of SVG lines
// for connections, rather than pulling in a full node-graph library —
// this is a real, working, from-scratch visual builder sized to what the
// brief actually needs (place blocks, connect them, configure them,
// produce a structured project file), not a general-purpose IDE.
// ═══════════════════════════════════════════════════════════════════════

let state = null; // set by initCanvas()

function uid() {
  return 'b' + Math.random().toString(36).slice(2, 10);
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s ?? '';
  return d.innerHTML;
}

function fieldInputHtml(block, field) {
  const val = block.config[field.key] ?? '';
  if (field.type === 'select') {
    return `<select data-field="${field.key}">${(field.options || []).map(o =>
      `<option value="${esc(o)}" ${o === val ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
  }
  if (field.type === 'textarea') {
    return `<textarea data-field="${field.key}" placeholder="${esc(field.placeholder || '')}" rows="2">${esc(val)}</textarea>`;
  }
  return `<input type="text" data-field="${field.key}" placeholder="${esc(field.placeholder || '')}" value="${esc(val)}"/>`;
}

function blockDef(id) {
  return state.registry.find(b => b.id === id);
}

function render() {
  const { canvasEl, connectionsSvg } = state;
  canvasEl.querySelectorAll('.nkx-cv-block').forEach(el => el.remove());

  state.blocks.forEach(block => {
    const def = blockDef(block.typeId);
    if (!def) return;
    const open = state.expandedId === block.id;
    const el = document.createElement('div');
    el.className = 'nkx-cv-block' + (state.connectingFrom === block.id ? ' nkx-cv-connecting-from' : '');
    el.style.left = block.x + 'px';
    el.style.top = block.y + 'px';
    el.style.setProperty('--nkx-block-color', def.color);
    el.dataset.blockId = block.id;
    el.innerHTML = `
      <div class="nkx-cv-block-head" data-drag-handle>
        <span class="nkx-cv-block-dot"></span>
        <span class="nkx-cv-block-name">${esc(def.name)}</span>
        <button type="button" class="nkx-cv-block-connect" title="Connect to another block" data-connect>${ICON_CONNECT}</button>
        <button type="button" class="nkx-cv-block-configure" title="Configure" data-configure>${ICON_CONFIGURE}</button>
        <button type="button" class="nkx-cv-block-delete" title="Delete" data-delete>${ICON_DELETE}</button>
      </div>
      ${open ? `
        <div class="nkx-cv-block-body">
          <p class="nkx-cv-block-desc">${esc(def.description)}</p>
          ${(def.fields || []).map(f => `
            <label class="nkx-cv-field">
              <span>${esc(f.label)}</span>
              ${fieldInputHtml(block, f)}
            </label>
          `).join('')}
        </div>
      ` : ''}
    `;
    canvasEl.appendChild(el);
    wireBlockElement(el, block);
  });

  drawConnections();
  renderPalette(); // category counts / used-state, cheap to redo
  state.onChange?.(serializeProject());
}

function wireBlockElement(el, block) {
  const head = el.querySelector('[data-drag-handle]');
  let dragging = false, startX = 0, startY = 0, origX = 0, origY = 0;

  head.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    origX = block.x; origY = block.y;
    head.setPointerCapture(e.pointerId);
  });
  head.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    block.x = Math.max(0, origX + (e.clientX - startX));
    block.y = Math.max(0, origY + (e.clientY - startY));
    el.style.left = block.x + 'px';
    el.style.top = block.y + 'px';
    drawConnections();
  });
  head.addEventListener('pointerup', () => { if (dragging) { dragging = false; state.onChange?.(serializeProject()); } });

  el.querySelector('[data-delete]').addEventListener('click', () => {
    state.blocks = state.blocks.filter(b => b.id !== block.id);
    state.connections = state.connections.filter(c => c.from !== block.id && c.to !== block.id);
    render();
  });
  el.querySelector('[data-configure]').addEventListener('click', () => {
    state.expandedId = state.expandedId === block.id ? null : block.id;
    render();
  });
  el.querySelectorAll('[data-field]').forEach(input => {
    input.addEventListener('input', () => { block.config[input.dataset.field] = input.value; state.onChange?.(serializeProject()); });
  });
  el.querySelector('[data-connect]').addEventListener('click', () => {
    if (state.connectingFrom && state.connectingFrom !== block.id) {
      const exists = state.connections.some(c => c.from === state.connectingFrom && c.to === block.id);
      if (!exists) state.connections.push({ from: state.connectingFrom, to: block.id });
      state.connectingFrom = null;
    } else {
      state.connectingFrom = state.connectingFrom === block.id ? null : block.id;
    }
    render();
  });
}

function drawConnections() {
  const { connectionsSvg, canvasEl } = state;
  connectionsSvg.innerHTML = '';
  state.connections.forEach(conn => {
    const fromEl = canvasEl.querySelector(`[data-block-id="${conn.from}"]`);
    const toEl = canvasEl.querySelector(`[data-block-id="${conn.to}"]`);
    if (!fromEl || !toEl) return;
    const x1 = fromEl.offsetLeft + fromEl.offsetWidth;
    const y1 = fromEl.offsetTop + 24;
    const x2 = toEl.offsetLeft;
    const y2 = toEl.offsetTop + 24;
    const midX = (x1 + x2) / 2;
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`);
    path.setAttribute('class', 'nkx-cv-connection');
    connectionsSvg.appendChild(path);
  });
}

function renderPalette() {
  const { paletteEl, registry } = state;
  const categories = [...new Set(registry.map(b => b.category))];
  paletteEl.innerHTML = categories.map(cat => `
    <div class="nkx-cv-palette-cat">
      <div class="nkx-cv-palette-cat-label">${esc(cat)}</div>
      ${registry.filter(b => b.category === cat).map(b => `
        <div class="nkx-cv-palette-item" draggable="true" data-type-id="${b.id}" style="--nkx-block-color:${b.color}">
          <span class="nkx-cv-block-dot"></span>${esc(b.name)}
        </div>
      `).join('')}
    </div>
  `).join('');

  paletteEl.querySelectorAll('.nkx-cv-palette-item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/nkx-block-type', item.dataset.typeId);
      e.dataTransfer.effectAllowed = 'copy';
    });
    // Click-to-add fallback (touch devices / accessibility — drag isn't
    // the only way in).
    item.addEventListener('click', () => addBlock(item.dataset.typeId, 40 + Math.random() * 60, 40 + Math.random() * 60));
  });
}

function addBlock(typeId, x, y) {
  if (!blockDef(typeId)) return;
  state.blocks.push({ id: uid(), typeId, x: Math.round(x), y: Math.round(y), config: {} });
  render();
}

function serializeProject() {
  return {
    blocks: state.blocks.map(b => ({ id: b.id, typeId: b.typeId, x: b.x, y: b.y, config: b.config })),
    connections: state.connections.slice(),
  };
}

const ICON_CONNECT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="12" r="2.5"/><path d="M8.5 12h7"/></svg>';
const ICON_CONFIGURE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="3"/><path d="M4 12h2m12 0h2M12 4v2m0 12v2M6.3 6.3l1.4 1.4m8.6 8.6l1.4 1.4M6.3 17.7l1.4-1.4m8.6-8.6l1.4-1.4"/></svg>';
const ICON_DELETE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12"/></svg>';

/**
 * @param {{ canvasEl: HTMLElement, connectionsSvg: SVGElement,
 *   paletteEl: HTMLElement, registry: object[], onChange?: (project) => void,
 *   initialProject?: { blocks: object[], connections: object[] } }} opts
 */
export function initCanvas(opts) {
  state = {
    canvasEl: opts.canvasEl,
    connectionsSvg: opts.connectionsSvg,
    paletteEl: opts.paletteEl,
    registry: opts.registry,
    onChange: opts.onChange,
    blocks: (opts.initialProject?.blocks || []).map(b => ({ ...b })),
    connections: (opts.initialProject?.connections || []).slice(),
    expandedId: null,
    connectingFrom: null,
  };

  opts.canvasEl.addEventListener('dragover', (e) => e.preventDefault());
  opts.canvasEl.addEventListener('drop', (e) => {
    e.preventDefault();
    const typeId = e.dataTransfer.getData('text/nkx-block-type');
    if (!typeId) return;
    const rect = opts.canvasEl.getBoundingClientRect();
    addBlock(typeId, e.clientX - rect.left - 90, e.clientY - rect.top - 20);
  });

  render();
  return {
    getProject: serializeProject,
    clear: () => { state.blocks = []; state.connections = []; render(); },
  };
}
