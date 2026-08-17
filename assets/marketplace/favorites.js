// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/marketplace/favorites.js
// Favorites/Wishlist — real per-user data (must sync across devices and
// isn't purely local view-state), so per the Phase 1 storage rule this
// goes to Supabase (`product_lists`), not localStorage.
// ═══════════════════════════════════════════════════════════════════════

import { supabase } from '../auth/auth-widget.js';

export async function getList(userId, listType) {
  if (!userId) return [];
  const { data } = await supabase.from('product_lists').select('product_id').eq('user_id', userId).eq('list_type', listType);
  return (data || []).map(r => r.product_id);
}

export async function toggleListItem(userId, productId, listType, currentlyIn) {
  if (!userId) return { error: 'Sign in to save products.' };
  if (currentlyIn) {
    const { error } = await supabase.from('product_lists').delete().eq('user_id', userId).eq('product_id', productId).eq('list_type', listType);
    return { error: error?.message, inList: false };
  }
  const { error } = await supabase.from('product_lists').insert({ user_id: userId, product_id: productId, list_type: listType });
  return { error: error?.message, inList: true };
}
