// ═══════════════════════════════════════════════
// NUKRAX — worker.js
// Static site assets are served automatically by the `assets` binding
// for any request that matches a file. This handler runs for:
//   1. POST /api/chat  — the AI chat proxy (unchanged, see below).
//   2. Clean `/page/` URLs that don't match a static file directly —
//      these get invisibly served from the real `page.html` file.
//   3. Legacy `/page.html` URLs for pages that now have a clean `/page/`
//      URL — these are the ONE case that needs `run_worker_first` in
//      wrangler.jsonc, because they DO match a static file, so the
//      Worker has to be given first refusal in order to redirect them
//      before the static-asset match would otherwise win.
//
// Everything about which URL maps to which file lives in ONE place —
// assets/data/routes.js — so adding a new clean URL later never
// requires touching this file.
//
// The AI reply comes from Anthropic's API (Claude Sonnet 5) when a
// key is configured. If ANTHROPIC_API_KEY isn't set yet, or the API
// call fails for any reason, this falls back to the same local,
// offline answer engine that powers Nukrax Assistant mode — so the
// person chatting always gets a real, considered reply and never an
// error message or a "something went wrong" dead end, whether or not
// the key has been added yet.
//
// That's the ONLY place the key ever goes — a single Worker secret.
// Nothing else in this codebase needs to be touched or edited. See
// the setup notes at the bottom of this file.
// ═══════════════════════════════════════════════

import { buildSystemPrompt } from './assets/ai/ai-data.js';
import { getNukraxResponse } from './assets/ai/responder.js';
import { CLEAN_ROUTES, LEGACY_REDIRECTS } from './assets/data/routes.js';

const MODEL = 'claude-sonnet-5';
const MAX_TOKENS = 700;
const SUPABASE_URL = 'https://gxmpaurwuiaxurqnxeck.supabase.co';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/api/chat' && request.method === 'POST') {
      return handleChat(request, env);
    }

    // ── Clean URL routing ──────────────────────────────────────────
    // 1) Old `.html` URL for a page that now has a clean `/name/` URL:
    //    permanent redirect so old bookmarks/links/search results still
    //    resolve, instead of breaking.
    const cleanEquivalent = LEGACY_REDIRECTS[path];
    if (cleanEquivalent) {
      return Response.redirect(cleanEquivalent + url.search, 301);
    }

    // 2) Clean URL missing its trailing slash (`/dashboard` instead of
    //    `/dashboard/`): redirect to the canonical slashed form.
    if (CLEAN_ROUTES[path + '/']) {
      return Response.redirect(path + '/' + url.search, 301);
    }

    // 3) Clean URL itself: invisibly serve the real file's content
    //    without changing what the browser shows in the address bar —
    //    no client-side redirect, works on direct load/refresh/deep-link.
    const realFile = CLEAN_ROUTES[path];
    if (realFile && env.ASSETS) {
      const assetUrl = new URL(realFile + url.search, url.origin);
      const assetRequest = new Request(assetUrl.toString(), request);
      return env.ASSETS.fetch(assetRequest);
    }

    // Anything else with no matching static asset: 404.
    if (env.ASSETS) return env.ASSETS.fetch(request);
    return new Response('Not found', { status: 404 });
  }
};

async function handleChat(request, env) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: 'Invalid request body.' }, 400);
  }

  const mode = body.mode === 'general' ? 'general' : 'nukrax';
  const messages = Array.isArray(body.messages) ? body.messages : [];

  if (!messages.length) {
    return json({ error: 'No messages provided.' }, 400);
  }
  if (messages.length > 30) {
    return json({ error: 'Conversation too long for this request.' }, 400);
  }

  const cleanMessages = messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (!cleanMessages.length) {
    return json({ error: 'No valid messages provided.' }, 400);
  }

  const lastUserMessage = [...cleanMessages].reverse().find(m => m.role === 'user')?.content || '';

  // No key configured yet — answer locally instead of erroring out.
  if (!env.ANTHROPIC_API_KEY) {
    return json({ reply: getNukraxResponse(lastUserMessage), source: 'local' });
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: buildSystemPrompt(mode),
        messages: cleanMessages
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Anthropic API error:', res.status, errText);
      // API call failed (bad key, rate limit, outage, etc.) — fall back locally.
      return json({ reply: getNukraxResponse(lastUserMessage), source: 'local' });
    }

    const data = await res.json();
    const reply = (data.content || [])
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('\n')
      .trim() || getNukraxResponse(lastUserMessage);

    return json({ reply, source: 'claude' });
  } catch (err) {
    console.error('Chat proxy error:', err);
    // Network-level failure reaching Anthropic — fall back locally.
    return json({ reply: getNukraxResponse(lastUserMessage), source: 'local' });
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// ═══════════════════════════════════════════════
// SETUP — do this once, nothing else to edit:
//
// 1. Get a key at console.anthropic.com → Settings → API Keys
// 2. In your project folder, run:
//      wrangler secret put ANTHROPIC_API_KEY
//    and paste the key when prompted.
// 3. Run: wrangler deploy
//
// That's it. The key lives only in Cloudflare's encrypted secret
// store — never in a file, never in the repo, never committed to
// GitHub. To change the key later, just re-run step 2.
//
// Until step 2 is done (or if the API ever has an outage), General
// AI mode automatically answers using the same local engine as
// Nukrax Assistant, so it never shows a broken/error state.
// ═══════════════════════════════════════════════
