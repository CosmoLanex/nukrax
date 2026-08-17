// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/marketplace/checkout-context.js
// Order-aware banner + contact block, shared by cr.html and crypto.html
// so the "you're paying for X" summary and the Email/Telegram/Request
// Phone Support block exist in exactly one place. Uses assets/auth/
// client.js (not auth-widget.js) so it never triggers the site-wide nav
// injection — cr.html/crypto.html keep their own minimal custom nav.
// ═══════════════════════════════════════════════════════════════════════

import { supabase } from '../auth/client.js';
import { getProduct } from '../data/products/products.js';
import { formatPrice } from '../data/pricing.js';
import { getContact, TELEGRAM_HANDLE, TELEGRAM_URL } from '../data/contacts.js';

function esc(s) { const d = document.createElement('div'); d.textContent = s ?? ''; return d.innerHTML; }

export function getCheckoutParams() {
  const params = new URLSearchParams(window.location.search);
  return { orderId: params.get('order'), productId: params.get('product') };
}

/** Appends the current order/product query params onto a relative URL, if present. */
export function withCheckoutParams(url) {
  const { orderId, productId } = getCheckoutParams();
  if (!orderId) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}order=${encodeURIComponent(orderId)}${productId ? `&product=${encodeURIComponent(productId)}` : ''}`;
}

function contactBlockHtml(order) {
  // This banner only ever renders on the checkout/payment pages
  // (cr.html, crypto.html), so it always routes to Billing — the address
  // the person wrote for exactly this context.
  const billing = getContact('billing');
  const subject = encodeURIComponent(`NUKRAX Order ${order ? order.id.slice(0, 8) : ''} — Payment Support`);
  return `
    <div class="nkx-checkout-contact">
      <div class="nkx-cc-title">Need help, or want to confirm before sending?</div>
      <div class="nkx-cc-row">
        <a href="mailto:${billing.email}?subject=${subject}">${billing.email}</a>
        <a href="${TELEGRAM_URL}" target="_blank" rel="noopener">${TELEGRAM_HANDLE}</a>
        <a href="mailto:${billing.email}?subject=${encodeURIComponent('Request Phone Support')}">Request Phone Support</a>
      </div>
    </div>
  `;
}

/**
 * @param {HTMLElement} container
 * @param {{ showConfirmButton?: boolean }} [opts]
 */
export async function renderCheckoutContext(container, opts = {}) {
  const { orderId, productId } = getCheckoutParams();
  if (!orderId) { container.hidden = true; return; }

  const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
  const product = productId ? getProduct(productId) : (order?.product_id ? getProduct(order.product_id) : null);

  container.hidden = false;
  container.innerHTML = `
    <div class="nkx-checkout-banner">
      <div class="nkx-cb-row">
        <span class="nkx-cb-label">Order</span>
        <span class="nkx-cb-value">${product ? esc(product.name) : (order?.membership_tier ? esc(order.membership_tier) + ' membership' : 'NUKRAX purchase')}</span>
      </div>
      <div class="nkx-cb-row">
        <span class="nkx-cb-label">Amount</span>
        <span class="nkx-cb-value">${order?.amount != null ? formatPrice(order.amount) : 'Confirm with support'}</span>
      </div>
      <div class="nkx-cb-row">
        <span class="nkx-cb-label">Status</span>
        <span class="nkx-cb-value nkx-cb-status">${order ? esc(order.status.replace('_', ' ')) : '—'}</span>
      </div>
      ${opts.showConfirmButton && order?.status === 'pending' ? `
        <button class="nkx-cb-confirm-btn" id="nkxConfirmSentBtn" type="button">I've Sent the Payment</button>
        <p class="nkx-cb-confirm-note">This flags your order for manual review — your Key is issued once payment is verified.</p>
      ` : ''}
      ${order?.status === 'under_review' ? `<p class="nkx-cb-confirm-note">Marked as sent — under review. We'll be in touch once it's verified.</p>` : ''}
    </div>
    ${contactBlockHtml(order)}
  `;

  const confirmBtn = container.querySelector('#nkxConfirmSentBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', async () => {
      confirmBtn.disabled = true;
      confirmBtn.textContent = 'Marking as sent\u2026';
      const { data: ok } = await supabase.rpc('mark_order_awaiting_review', { p_order_id: orderId });
      if (ok) {
        renderCheckoutContext(container, opts);
      } else {
        confirmBtn.disabled = false;
        confirmBtn.textContent = "I've Sent the Payment";
        alert('Could not update your order — please contact support directly.');
      }
    });
  }
}
