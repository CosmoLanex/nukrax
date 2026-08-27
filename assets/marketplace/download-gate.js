// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/marketplace/download-gate.js
// Bridges two things that already existed but weren't connected:
//   - purchase-panel.js dispatches `nkx:license-unlocked` once the Key
//     modal confirms a valid, owned license (via validate_license_key).
//   - Nothing was listening for it to actually hand over a file.
//
// This module is that listener. It does NOT re-implement the license
// check — by the time this fires, validate_license_key() has already
// confirmed ownership server-side. This module's job is just: ask
// Supabase Storage for a short-lived signed URL (private bucket, RLS
// re-checks the SAME license ownership independently — see
// supabase/migrations/0002_marketplace.sql), log the download via
// log_download(), and trigger the browser download.
//
// USAGE — add once per product page, after purchase-panel.js renders:
//   import { wireDownloadGate } from '../marketplace/download-gate.js';
//   wireDownloadGate({ productId: product.id, kind: 'ea' }); // or 'automation'
// ═══════════════════════════════════════════════════════════════════════

import { supabase } from '../auth/auth-widget.js';
import { LOG_DOWNLOAD_RPC } from '../data/licenses/config.js';

const BUCKET_BY_KIND = {
  ea: 'ea-downloads',
  automation: 'automation-downloads',
};
const EXT_BY_KIND = {
  ea: 'mq5',
  automation: 'zip',
};

// Signed URLs expire quickly on purpose — this is a "download it now"
// link, not something meant to be saved/shared/reused later.
const SIGNED_URL_TTL_SECONDS = 60;

/**
 * @param {{ productId: string, kind: 'ea'|'automation', onError?: (msg: string) => void }} opts
 */
export function wireDownloadGate({ productId, kind = 'ea', onError }) {
  window.addEventListener('nkx:license-unlocked', async (e) => {
    if (e.detail?.productId !== productId) return; // a different product's modal fired, ignore

    const bucket = BUCKET_BY_KIND[kind];
    const ext = EXT_BY_KIND[kind];
    if (!bucket) return;

    try {
      const { data: userLicense } = await supabase
        .from('licenses')
        .select('id')
        .eq('product_id', productId)
        .eq('status', 'active')
        .maybeSingle();

      if (userLicense?.id) {
        // Best-effort activity log — a failure here should never block
        // the actual download the person is entitled to.
        await supabase.rpc(LOG_DOWNLOAD_RPC, { p_license_id: userLicense.id }).catch(() => {});
      }

      const path = `${productId}.${ext}`;
      const { data: signed, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

      if (error || !signed?.signedUrl) {
        onError?.('Your Key is valid, but the download file isn\u2019t available yet — contact support and we\u2019ll get it to you directly.');
        return;
      }

      const a = document.createElement('a');
      a.href = signed.signedUrl;
      a.download = path;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      onError?.('Something went wrong starting your download — try again in a moment.');
    }
  });
}
