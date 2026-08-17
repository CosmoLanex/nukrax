// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/auth/client.js
// The one place the Supabase client is created. assets/auth/auth-widget.js
// imports and re-exports `supabase` from here (so every existing
// `import { supabase } from '../auth/auth-widget.js'` across the site
// keeps working unchanged) — this file exists separately so pages that
// need the client WITHOUT auth-widget's automatic nav-injection side
// effect (e.g. cr.html, which has its own custom minimal nav) can import
// just the client.
// ═══════════════════════════════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
