// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/marketplace/key-modal.js
// The "Get Now" → enter your Key modal. One implementation, reused by
// every product page and every EA page — never duplicated per page.
// Pair with assets/data/licenses/styles.css.
// ═══════════════════════════════════════════════════════════════════════

import { validateKey } from '../data/licenses/validator.js';
import { KEY_LABEL } from '../data/licenses/config.js';

let overlay = null;

function ensureModal() {
  if (overlay) return overlay;
  overlay = document.createElement('div');
  overlay.className = 'nkx-key-overlay';
  overlay.innerHTML = `
    <div class="nkx-key-modal">
      <button class="nkx-key-close" aria-label="Close" type="button">&times;</button>
      <h3>Enter your ${KEY_LABEL}</h3>
      <p id="nkxKeyModalDesc">Unlock your download by entering the ${KEY_LABEL} you received after purchase.</p>
      <input class="nkx-key-input" id="nkxKeyInput" placeholder="NKX-XXXX-XXXX-XXXX" autocomplete="off" spellcheck="false"/>
      <div class="nkx-key-error" id="nkxKeyError"></div>
      <div class="nkx-key-actions">
        <button class="nkx-key-btn primary" id="nkxKeySubmit" type="button">Unlock</button>
        <button class="nkx-key-btn" id="nkxKeyPurchase" type="button" hidden>See purchase options</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('.nkx-key-close').addEventListener('click', closeKeyModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeKeyModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && overlay.classList.contains('open')) closeKeyModal(); });
  return overlay;
}

export function closeKeyModal() {
  if (overlay) overlay.classList.remove('open');
}

/**
 * @param {string} productId
 * @param {{ onUnlocked?: () => void, onNeedsPurchase?: () => void }} [handlers]
 */
export function openKeyModal(productId, handlers = {}) {
  const modal = ensureModal();
  const input = modal.querySelector('#nkxKeyInput');
  const err = modal.querySelector('#nkxKeyError');
  const submit = modal.querySelector('#nkxKeySubmit');
  const purchaseBtn = modal.querySelector('#nkxKeyPurchase');

  input.value = '';
  err.textContent = '';
  purchaseBtn.hidden = true;
  modal.classList.add('open');
  setTimeout(() => input.focus(), 50);

  const doValidate = async () => {
    err.textContent = '';
    submit.disabled = true;
    submit.textContent = 'Checking\u2026';
    const result = await validateKey(productId, input.value);
    submit.disabled = false;
    submit.textContent = 'Unlock';
    if (result.valid) {
      closeKeyModal();
      handlers.onUnlocked?.();
    } else {
      err.textContent = result.error || 'That Key isn\u2019t valid.';
      purchaseBtn.hidden = false;
    }
  };

  submit.onclick = doValidate;
  input.onkeydown = e => { if (e.key === 'Enter') doValidate(); };
  purchaseBtn.onclick = () => { closeKeyModal(); handlers.onNeedsPurchase?.(); };
}
