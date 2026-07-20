// ═══════════════════════════════════════════════
// NUKRAX — auth-widget.js
// One shared module that:
//   1. Creates the Supabase client
//   2. Renders a "Login" button (or avatar + logout once signed in)
//      into any element with id="nkx-auth-slot"
//   3. Provides a quick login/signup modal (email+password, Google, GitHub)
//
// Include on any page with:
//   <div id="nkx-auth-slot"></div>          <!-- inside your nav -->
//   <script type="module" src="assets/auth/auth-widget.js"></script>
//
// Nothing else needs to change. This file is the only place Supabase
// is talked to on the frontend.
// ═══════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Always land OAuth redirects back on one page, so only ONE redirect
// URL ever needs to be whitelisted in Supabase / Google / GitHub.
const OAUTH_REDIRECT = `${window.location.origin}/account.html`;

// ── styles (injected once) ──────────────────────────────
function injectStyles() {
  if (document.getElementById('nkx-auth-styles')) return;
  const s = document.createElement('style');
  s.id = 'nkx-auth-styles';
  s.textContent = `
    .nkx-auth-btn{font-family:var(--font-m,monospace);font-size:11px;letter-spacing:.08em;text-transform:uppercase;
      background:transparent;border:1px solid var(--line,#1B2328);color:var(--text,#D3DBDD);padding:8px 16px;
      border-radius:4px;cursor:pointer;transition:.25s var(--ease,ease);white-space:nowrap}
    .nkx-auth-btn:hover{border-color:var(--accent,#8FB8C4);color:var(--white,#F2F5F5)}
    .nkx-auth-user{display:flex;align-items:center;gap:10px;cursor:pointer;position:relative;font-family:var(--font-b,sans-serif)}
    .nkx-auth-avatar{width:28px;height:28px;border-radius:50%;background:var(--accent,#8FB8C4);color:var(--black,#030507);
      display:flex;align-items:center;justify-content:center;font-family:var(--font-m,monospace);font-size:12px;font-weight:700;
      overflow:hidden;flex-shrink:0}
    .nkx-auth-avatar img{width:100%;height:100%;object-fit:cover}
    .nkx-auth-name{font-size:13px;color:var(--text,#D3DBDD)}
    .nkx-auth-dropdown{position:absolute;top:calc(100% + 10px);right:0;background:var(--panel,#0A0F13);
      border:1px solid var(--line,#1B2328);border-radius:6px;min-width:160px;padding:6px;display:none;z-index:400}
    .nkx-auth-dropdown.open{display:block}
    .nkx-auth-dropdown a,.nkx-auth-dropdown button{display:block;width:100%;text-align:left;background:none;border:none;
      color:var(--text,#D3DBDD);font-family:var(--font-b,sans-serif);font-size:13px;padding:9px 10px;border-radius:4px;
      cursor:pointer;text-decoration:none}
    .nkx-auth-dropdown a:hover,.nkx-auth-dropdown button:hover{background:var(--line,#1B2328);color:var(--white,#F2F5F5)}
    .nkx-auth-overlay{position:fixed;inset:0;background:rgba(3,5,7,.75);backdrop-filter:blur(6px);
      display:flex;align-items:center;justify-content:center;z-index:900;opacity:0;pointer-events:none;transition:opacity .25s}
    .nkx-auth-overlay.open{opacity:1;pointer-events:auto}
    .nkx-auth-modal{background:var(--panel,#0A0F13);border:1px solid var(--line,#1B2328);border-radius:8px;
      width:min(360px,90vw);padding:28px;position:relative;font-family:var(--font-b,sans-serif)}
    .nkx-auth-modal h3{font-family:var(--font-m,monospace);font-size:13px;letter-spacing:.1em;text-transform:uppercase;
      color:var(--white,#F2F5F5);margin-bottom:18px}
    .nkx-auth-tabs{display:flex;gap:4px;margin-bottom:18px;border:1px solid var(--line,#1B2328);border-radius:6px;padding:3px}
    .nkx-auth-tab{flex:1;text-align:center;padding:8px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;
      font-family:var(--font-m,monospace);color:var(--muted,#8A9BA3);background:none;border:none;border-radius:4px;cursor:pointer}
    .nkx-auth-tab.active{background:var(--line,#1B2328);color:var(--white,#F2F5F5)}
    .nkx-auth-modal input{width:100%;background:var(--black,#030507);border:1px solid var(--line,#1B2328);
      color:var(--text,#D3DBDD);padding:11px 12px;border-radius:5px;font-family:var(--font-b,sans-serif);font-size:13px;
      margin-bottom:10px;outline:none}
    .nkx-auth-modal input:focus{border-color:var(--accent,#8FB8C4)}
    .nkx-auth-submit{width:100%;background:var(--accent,#8FB8C4);color:var(--black,#030507);border:none;padding:12px;
      border-radius:5px;font-family:var(--font-m,monospace);font-size:11px;letter-spacing:.08em;text-transform:uppercase;
      cursor:pointer;margin-top:4px}
    .nkx-auth-submit:hover{opacity:.9}
    .nkx-auth-divider{display:flex;align-items:center;gap:10px;margin:16px 0;color:var(--muted,#8A9BA3);font-size:10px;
      text-transform:uppercase;letter-spacing:.08em}
    .nkx-auth-divider::before,.nkx-auth-divider::after{content:'';flex:1;height:1px;background:var(--line,#1B2328)}
    .nkx-auth-oauth{display:flex;flex-direction:column;gap:8px}
    .nkx-auth-oauth button{display:flex;align-items:center;justify-content:center;gap:8px;background:transparent;
      border:1px solid var(--line,#1B2328);color:var(--text,#D3DBDD);padding:10px;border-radius:5px;font-size:13px;
      cursor:pointer;font-family:var(--font-b,sans-serif)}
    .nkx-auth-oauth button:hover{border-color:var(--accent,#8FB8C4);color:var(--white,#F2F5F5)}
    .nkx-auth-close{position:absolute;top:14px;right:16px;background:none;border:none;color:var(--muted,#8A9BA3);
      font-size:18px;cursor:pointer;line-height:1}
    .nkx-auth-close:hover{color:var(--white,#F2F5F5)}
    .nkx-auth-msg{font-size:12px;margin-bottom:10px;min-height:16px}
    .nkx-auth-msg.err{color:#D98787}
    .nkx-auth-msg.ok{color:var(--accent,#8FB8C4)}
    .nkx-auth-signup-link{text-align:center;margin-top:14px;font-size:12px;color:var(--muted,#8A9BA3)}
    .nkx-auth-signup-link a{color:var(--accent,#8FB8C4);text-decoration:none}
  `;
  document.head.appendChild(s);
}

// ── modal ────────────────────────────────────────────────
function buildModal() {
  if (document.getElementById('nkx-auth-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'nkx-auth-overlay';
  overlay.id = 'nkx-auth-overlay';
  overlay.innerHTML = `
    <div class="nkx-auth-modal">
      <button class="nkx-auth-close" id="nkx-auth-close">×</button>
      <h3>Access Nukrax</h3>
      <div class="nkx-auth-tabs">
        <button class="nkx-auth-tab active" data-tab="login">Log In</button>
        <button class="nkx-auth-tab" data-tab="signup">Sign Up</button>
      </div>
      <div class="nkx-auth-msg" id="nkx-auth-msg"></div>
      <form id="nkx-auth-form">
        <input type="email" id="nkx-auth-email" placeholder="Email" required autocomplete="email" />
        <input type="password" id="nkx-auth-password" placeholder="Password" required autocomplete="current-password" minlength="6" />
        <button type="submit" class="nkx-auth-submit" id="nkx-auth-submit-btn">Log In</button>
      </form>
      <div class="nkx-auth-divider">or continue with</div>
      <div class="nkx-auth-oauth">
        <button id="nkx-auth-google">Google</button>
        <button id="nkx-auth-github">GitHub</button>
      </div>
      <div class="nkx-auth-signup-link">Need the full sign-up page? <a href="account.html">Go here</a></div>
    </div>
  `;
  document.body.appendChild(overlay);

  let mode = 'login';
  const msg = overlay.querySelector('#nkx-auth-msg');
  const setMsg = (text, isErr) => {
    msg.textContent = text || '';
    msg.className = 'nkx-auth-msg' + (text ? (isErr ? ' err' : ' ok') : '');
  };

  overlay.querySelectorAll('.nkx-auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      overlay.querySelectorAll('.nkx-auth-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      mode = tab.dataset.tab;
      overlay.querySelector('#nkx-auth-submit-btn').textContent = mode === 'login' ? 'Log In' : 'Sign Up';
      setMsg('');
    });
  });

  overlay.querySelector('#nkx-auth-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });

  overlay.querySelector('#nkx-auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = overlay.querySelector('#nkx-auth-email').value.trim();
    const password = overlay.querySelector('#nkx-auth-password').value;
    setMsg('Working...', false);

    const { error } = mode === 'login'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: OAUTH_REDIRECT } });

    if (error) {
      setMsg(error.message, true);
    } else if (mode === 'signup') {
      setMsg('Check your email to confirm your account.', false);
    } else {
      setMsg('Logged in.', false);
      setTimeout(closeModal, 400);
    }
  });

  overlay.querySelector('#nkx-auth-google').addEventListener('click', () => {
    supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: OAUTH_REDIRECT } });
  });
  overlay.querySelector('#nkx-auth-github').addEventListener('click', () => {
    supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: OAUTH_REDIRECT } });
  });
}

function openModal() {
  buildModal();
  document.getElementById('nkx-auth-overlay').classList.add('open');
}
function closeModal() {
  const o = document.getElementById('nkx-auth-overlay');
  if (o) o.classList.remove('open');
}

// ── nav rendering ────────────────────────────────────────
function initials(nameOrEmail) {
  if (!nameOrEmail) return '?';
  return nameOrEmail.trim().charAt(0).toUpperCase();
}

function renderNav(user) {
  const slot = document.getElementById('nkx-auth-slot');
  if (!slot) return;

  if (!user) {
    slot.innerHTML = `<button class="nkx-auth-btn" id="nkx-auth-open">Log In</button>`;
    slot.querySelector('#nkx-auth-open').addEventListener('click', openModal);
    return;
  }

  const meta = user.user_metadata || {};
  const displayName = meta.full_name || meta.user_name || meta.name || user.email;
  const avatarUrl = meta.avatar_url || meta.picture || '';

  slot.innerHTML = `
    <div class="nkx-auth-user" id="nkx-auth-user-toggle">
      <div class="nkx-auth-avatar">${avatarUrl ? `<img src="${avatarUrl}" alt="">` : initials(displayName)}</div>
      <span class="nkx-auth-name">${displayName}</span>
      <div class="nkx-auth-dropdown" id="nkx-auth-dropdown">
        <a href="account.html">Account</a>
        <button id="nkx-auth-logout">Log Out</button>
      </div>
    </div>
  `;

  const toggle = slot.querySelector('#nkx-auth-user-toggle');
  const dropdown = slot.querySelector('#nkx-auth-dropdown');
  toggle.addEventListener('click', () => dropdown.classList.toggle('open'));
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target)) dropdown.classList.remove('open');
  });

  slot.querySelector('#nkx-auth-logout').addEventListener('click', async () => {
    await supabase.auth.signOut();
  });
}

// ── boot ─────────────────────────────────────────────────
injectStyles();

supabase.auth.getSession().then(({ data }) => {
  renderNav(data.session?.user || null);
});

supabase.auth.onAuthStateChange((_event, session) => {
  renderNav(session?.user || null);
});
