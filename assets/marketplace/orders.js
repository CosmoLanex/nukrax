// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/marketplace/orders.js
// Creates and reads order records. Orders always start 'pending' (RLS
// enforces this — see supabase/migrations/0002_marketplace.sql) and can
// only move to paid/fulfilled via the admin panel after manual payment
// verification. This is the one place order-creation logic lives, used
// by both the product purchase panel and the membership upgrade flow.
// ═══════════════════════════════════════════════════════════════════════

import { supabase } from '../auth/auth-widget.js';

/**
 * @param {{ userId: string, productId?: string, membershipTier?: string,
 *   amount: number|null, cryptoAsset?: string, cryptoNetwork?: string, note?: string }} params
 */
export async function createOrder({ userId, productId, membershipTier, amount, cryptoAsset, cryptoNetwork, note }) {
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      product_id: productId || null,
      membership_tier: membershipTier || null,
      amount: amount ?? null,
      crypto_asset: cryptoAsset || null,
      crypto_network: cryptoNetwork || null,
      customer_note: note || null,
    })
    .select()
    .single();
  return { order: data, error: error?.message };
}

export async function getMyOrders(userId, limit = 50) {
  if (!userId) return [];
  const { data } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(limit);
  return data || [];
}

export async function getMyLicenses(userId) {
  if (!userId) return [];
  const { data } = await supabase.from('licenses').select('*').eq('user_id', userId).eq('status', 'active').order('issued_at', { ascending: false });
  return data || [];
}

export async function getMyDownloadEvents(userId, limit = 50) {
  if (!userId) return [];
  const { data } = await supabase.from('download_events').select('*, licenses(product_id)').eq('user_id', userId).order('downloaded_at', { ascending: false }).limit(limit);
  return data || [];
}
