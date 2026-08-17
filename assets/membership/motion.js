// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/membership/motion.js
// Applies the user's "Reduce motion" preference (settings.html → Appearance)
// site-wide by toggling `html.nkx-reduce-motion` (see the matching global
// override block in assets/css/tokens.css). This is IN ADDITION to the
// OS-level `prefers-reduced-motion` media query every page already
// respects — this covers people who want reduced motion on NUKRAX
// specifically without changing their whole system setting.
//
// Reads `profiles.settings.reduce_motion` (the same jsonb column
// settings.html already writes to) — one flag, one source of truth, no
// separate preference store.
//
// Booted once from assets/auth/auth-widget.js (which every page already
// loads and which owns the single shared `supabase` client) rather than
// importing its own client here — avoids a circular import between the
// two modules and keeps exactly one auth-state listener driving this.
// ═══════════════════════════════════════════════════════════════════════

export async function applyMotionPreference(supabase, user) {
  if (!user) { document.documentElement.classList.remove('nkx-reduce-motion'); return; }
  try {
    const { data: profile } = await supabase.from('profiles').select('settings').eq('id', user.id).maybeSingle();
    document.documentElement.classList.toggle('nkx-reduce-motion', !!profile?.settings?.reduce_motion);
  } catch {
    /* non-critical preference — fail silently, OS-level prefers-reduced-motion still applies */
  }
}
