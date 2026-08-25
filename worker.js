// ═══════════════════════════════════════════════
// NUKRAX — worker.js
// Main Worker entry. Static site assets are served automatically by
// the `assets` binding for any request that matches a file. This
// handler only runs for requests with no matching static asset —
// in practice, just POST /api/chat.
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

const MODEL = 'claude-sonnet-5';
const MAX_TOKENS = 700;
const SUPABASE_URL = 'https://gxmpaurwuiaxurqnxeck.supabase.co';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/chat' && request.method === 'POST') {
      return handleChat(request, env);
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

