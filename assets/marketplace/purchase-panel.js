// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/marketplace/purchase-panel.js
// THE purchase/commerce UI component. Rendered on the generic product
// page AND injected into every EA page — one implementation, not
// duplicated per page. Reads price from assets/data/pricing.js, checks
// membership access via assets/membership/access.js, and wires Get Now →
// Key modal → crypto checkout (cr.html) → contact-before-payment, all in
// one place.
// ═══════════════════════════════════════════════════════════════════════

import { supabase } from '../auth/auth-widget.js';
import { getProductPrice } from '../data/pricing.js';
import { hasAccess } from '../membership/access.js';
import { getMembershipProfile } from '../membership/store.js';
import { getTier } from '../membership/tiers.js';
import { openKeyModal } from './key-modal.js';
import { createOrder } from './orders.js';
import { mailtoLink } from '../data/contacts.js';
import { getList, toggleListItem } from './favorites.js';
import { track } from '../analytics/track.js';

const SUPPORT_EMAIL = 'support@nukrax.com'; // kept as a named export for anything still importing it — points at the general Support inbox

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s ?? '';
  return d.innerHTML;
}

/**
 * @param {HTMLElement} container
 * @param {import('../data/products/products.js').PRODUCTS[number]} product
 */
export async function renderPurchasePanel(container, product) {
  const price = getProductPrice(product.id);
  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user || null;
  const membership = user ? await getMembershipProfile(user).catch(() => null) : null;

  const requiresTier = product.membershipTier; // null = public, or 'pro'/'advanced'
  const gated = requiresTier && !hasAccess(membership, requiresTier);
  const wishlist = user ? await getList(user.id, 'wishlist').catch(() => []) : [];
  const inWishlist = wishlist.includes(product.id);

  container.innerHTML = `
    <div class="nkx-purchase-panel">
      ${gated ? `
        <div class="nkx-pp-upgrade-banner">
          This product requires <strong>${esc(getTier(requiresTier).label)}</strong> membership or a direct purchase.
        </div>
      ` : ''}
      <div class="nkx-pp-price">
        <span class="amount">${price.display}</span>
        ${price.displayOriginal ? `<span class="original">${price.displayOriginal}</span>` : ''}
      </div>
      <p class="nkx-pp-membership-note">One-time purchase &middot; instant Key issuance after payment is verified.</p>
      <div class="nkx-pp-btn-row">
        <button class="nkx-pp-btn primary" id="ppGetNow">Get Now</button>
        <button class="nkx-pp-btn secondary" id="ppCrypto">Pay with Crypto</button>
        <a class="nkx-pp-btn secondary" id="ppContact" href="${mailtoLink('contact', 'Before I purchase ' + product.name)}">Contact Before Payment</a>
        <button class="nkx-pp-btn secondary" id="ppWishlist" aria-pressed="${inWishlist}">${inWishlist ? '\u2665 Saved to Wishlist' : '\u2661 Save to Wishlist'}</button>
      </div>
    </div>
  `;

  container.querySelector('#ppGetNow').addEventListener('click', () => {
    openKeyModal(product.id, {
      onUnlocked: () => {
        window.dispatchEvent(new CustomEvent('nkx:license-unlocked', { detail: { productId: product.id } }));
      },
      onNeedsPurchase: () => container.querySelector('#ppCrypto').scrollIntoView({ behavior: 'smooth', block: 'center' }),
    });
  });

  container.querySelector('#ppCrypto').addEventListener('click', async () => {
    if (!user) {
      window.location.href = `/?authRequired=1&redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    const btn = container.querySelector('#ppCrypto');
    btn.disabled = true;
    btn.textContent = 'Starting order\u2026';
    const { order, error } = await createOrder({
      userId: user.id,
      productId: product.id,
      amount: price.onSale ? price.salePrice : price.price,
    });
    if (error || !order) {
      btn.disabled = false;
      btn.textContent = 'Pay with Crypto';
      alert('Could not start the order — please try again or use Contact Before Payment.');
      return;
    }
    track('purchase_started', { product_id: product.id, order_id: order.id });
    window.location.href = `/cr?order=${order.id}&product=${encodeURIComponent(product.id)}`;
  });

  container.querySelector('#ppWishlist').addEventListener('click', async () => {
    if (!user) {
      window.location.href = `/?authRequired=1&redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    const btn = container.querySelector('#ppWishlist');
    const currentlyIn = btn.getAttribute('aria-pressed') === 'true';
    btn.disabled = true;
    const { inList, error } = await toggleListItem(user.id, product.id, 'wishlist', currentlyIn);
    btn.disabled = false;
    if (!error) {
      btn.setAttribute('aria-pressed', String(inList));
      btn.textContent = inList ? '\u2665 Saved to Wishlist' : '\u2661 Save to Wishlist';
    }
  });
}

export { SUPPORT_EMAIL };
