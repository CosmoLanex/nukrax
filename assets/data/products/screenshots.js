// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/data/products/screenshots.js
// Every product's screenshots live at a predictable path, keyed off its
// own categoryId + id from products.js:
//
//   assets/images/products/<categoryId>/<productId>/overview-01.png
//   assets/images/products/<categoryId>/<productId>/overview-02.png
//   assets/images/products/<categoryId>/<productId>/overview-03.png
//
// Dropping a new overview-0N.(png|jpg) file into a product's folder is
// the ONLY step needed — nothing here needs editing, and no product
// page needs new HTML/JS written for it.
//
// Since this is a static site (no server-side directory listing), "does
// this screenshot exist yet" is answered by actually trying to load it
// client-side and watching for onerror — see mountProductGallery().
// ═══════════════════════════════════════════════════════════════════════

const SLOTS = ['overview-01', 'overview-02', 'overview-03'];
const EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp'];

export function screenshotCandidates(product) {
  const base = `assets/images/products/${product.categoryId}/${product.id}`;
  return SLOTS.map(slot => EXTENSIONS.map(ext => `${base}/${slot}.${ext}`));
}

/** Tries loading a single <img> against a list of candidate URLs (same
 *  slot, different extensions) in order; resolves the first one that
 *  actually loads, or null if none exist. */
function probeImage(candidates) {
  return new Promise(resolve => {
    let i = 0;
    const tryNext = () => {
      if (i >= candidates.length) return resolve(null);
      const url = candidates[i++];
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = tryNext;
      img.src = url;
    };
    tryNext();
  });
}

/**
 * Mounts a product's screenshot gallery into `wrapEl` (the element with
 * a `.pd-gallery-thumbs` row and a `.pd-gallery-main img` inside it).
 * Only slots that actually resolve to a real file are shown — missing
 * ones are omitted entirely (no broken-image icon, no empty placeholder
 * box left behind). If NONE of the three exist yet, the whole gallery
 * section is hidden rather than showing an empty box.
 */
export async function mountProductGallery(wrapEl, product) {
  const thumbsEl = wrapEl.querySelector('.pd-gallery-thumbs');
  const mainImg = wrapEl.querySelector('.pd-gallery-main img');
  const groups = screenshotCandidates(product);
  const found = (await Promise.all(groups.map(probeImage))).filter(Boolean);
  if (!found.length) {
    wrapEl.hidden = true;
    return;
  }
  wrapEl.hidden = false;
  thumbsEl.innerHTML = found.map((url, i) =>
    `<button type="button" class="pd-gallery-thumb${i === 0 ? ' active' : ''}" data-full="${url}">
       <img src="${url}" alt="${(product.name || 'Product').replace(/"/g,'')} screenshot ${i + 1}" loading="lazy"/>
     </button>`
  ).join('');
  if (mainImg) mainImg.src = found[0];
  thumbsEl.querySelectorAll('.pd-gallery-thumb').forEach(btn => {
    btn.addEventListener('click', () => {
      thumbsEl.querySelectorAll('.pd-gallery-thumb').forEach(b => b.classList.toggle('active', b === btn));
      if (mainImg) mainImg.src = btn.dataset.full;
    });
  });
}
