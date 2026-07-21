// ═══════════════════════════════════════════════
// NUKRAX — auth-widget.js
//
// Self-contained module. Include on ANY page with just:
//   <script type="module" src="assets/auth/auth-widget.js"></script>
//   (from inside /ea/, use "../assets/auth/auth-widget.js")
//
// It injects a Login/Avatar button + Menu button into the page's existing
// nav (inside .nav-right, right before the Market Map button if present) so
// it sits in-line with Systems Online / Market Map instead of overlapping
// them. On pages with no matching nav structure, it falls back to a small
// fixed widget in the bottom-right corner instead, so it never overlaps
// whatever that page already has at the top.
//
// Other pages import { supabase } from this file when they need the
// client directly (profile.html, guard.js).
// ═══════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Are we inside /ea/*.html? Affects relative link paths.
const IN_EA_FOLDER = window.location.pathname.includes('/ea/');
const BASE = IN_EA_FOLDER ? '../' : '';
const PROFILE_URL = `${BASE}profile.html`;
const HOME_URL = `${BASE}index.html`;

const SITE_LINKS = [
  { label: 'Home', href: `${BASE}index.html` },
  { label: 'Expert Advisors', href: `${BASE}ea-selection.html` },
  { label: 'AI Assistant', href: `${BASE}chat.html` },
  { label: 'Market Map', href: `${BASE}map.html` },
  { label: 'Feedback', href: `${BASE}feedback.html` },
];

// ── styles ───────────────────────────────────────────────
function injectStyles() {
  if (document.getElementById('nkx-auth-styles')) return;
  const s = document.createElement('style');
  s.id = 'nkx-auth-styles';
  s.textContent = `
    #nkx-auth-widget{position:fixed;bottom:16px;right:16px;z-index:600;display:flex;align-items:center;gap:8px;
      font-family:var(--font-b,sans-serif)}
    @media(max-width:560px){#nkx-auth-widget{bottom:10px;right:10px}}
    #nkx-w-login-wrap,#nkx-w-menu-wrap{display:flex;align-items:center}
    .nkx-w-dropdown{right:0}
    #nkx-auth-widget .nkx-w-dropdown{top:auto;bottom:calc(100% + 10px)}

    .nkx-w-btn{width:38px;height:38px;border-radius:50%;background:rgba(10,15,19,.9);border:1px solid var(--line,#1B2328);
      backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;cursor:pointer;
      color:var(--text,#D3DBDD);transition:.2s ease;flex-shrink:0}
    .nkx-w-btn:hover{border-color:var(--accent,#8FB8C4);color:var(--white,#F2F5F5)}
    .nkx-w-btn svg{width:16px;height:16px}

    body.nkx-light-mode{background:#ffffff!important}

    .nkx-w-login{font-family:var(--font-m,monospace);font-size:11px;letter-spacing:.08em;text-transform:uppercase;
      background:var(--accent,#8FB8C4);border:1px solid var(--accent,#8FB8C4);color:var(--black,#030507);
      padding:9px 16px;border-radius:20px;cursor:pointer;white-space:nowrap;transition:.2s ease;
      box-shadow:0 0 8px 1px var(--accent,#8FB8C4),0 0 2px var(--accent,#8FB8C4);
      animation:nkx-login-glow 2.4s ease-in-out infinite}
    .nkx-w-login:hover{box-shadow:0 0 14px 3px var(--accent,#8FB8C4),0 0 4px var(--accent,#8FB8C4)}
    @keyframes nkx-login-glow{
      0%,100%{box-shadow:0 0 8px 1px var(--accent,#8FB8C4),0 0 2px var(--accent,#8FB8C4)}
      50%{box-shadow:0 0 16px 4px var(--accent,#8FB8C4),0 0 5px var(--accent,#8FB8C4)}
    }

    .nkx-w-avatar{width:38px;height:38px;border-radius:50%;background:var(--accent,#8FB8C4);color:var(--black,#030507);
      display:flex;align-items:center;justify-content:center;font-family:var(--font-m,monospace);font-size:14px;
      font-weight:700;cursor:pointer;overflow:hidden;flex-shrink:0;border:1px solid var(--line,#1B2328)}
    .nkx-w-avatar img{width:100%;height:100%;object-fit:cover}

    .nkx-w-dropdown{position:absolute;top:calc(100% + 10px);right:0;background:var(--panel,#0A0F13);
      border:1px solid var(--line,#1B2328);border-radius:8px;min-width:190px;padding:6px;display:none;z-index:610}
    .nkx-w-dropdown.open{display:block}
    .nkx-w-dropdown a,.nkx-w-dropdown button{display:block;width:100%;text-align:left;background:none;border:none;
      color:var(--text,#D3DBDD);font-family:var(--font-b,sans-serif);font-size:13.5px;padding:10px 11px;border-radius:5px;
      cursor:pointer;text-decoration:none}
    .nkx-w-dropdown a:hover,.nkx-w-dropdown button:hover{background:var(--line,#1B2328);color:var(--white,#F2F5F5)}
    .nkx-w-dropdown .nkx-w-divider{height:1px;background:var(--line,#1B2328);margin:5px 2px}
    .nkx-w-dropdown .nkx-w-logout{color:#D98787}

    .nkx-auth-overlay{position:fixed;inset:0;background:rgba(3,5,7,.75);backdrop-filter:blur(6px);
      display:flex;align-items:center;justify-content:center;z-index:900;opacity:0;pointer-events:none;transition:opacity .25s;
      padding:20px}
    .nkx-auth-overlay.open{opacity:1;pointer-events:auto}
    .nkx-auth-modal{background:var(--panel,#0A0F13);border:1px solid var(--line,#1B2328);border-radius:8px;
      width:min(380px,100%);padding:28px;position:relative;font-family:var(--font-b,sans-serif);max-height:88vh;overflow-y:auto}
    .nkx-auth-modal h3{font-family:var(--font-m,monospace);font-size:13px;letter-spacing:.1em;text-transform:uppercase;
      color:var(--white,#F2F5F5);margin-bottom:6px}
    .nkx-auth-modal p.nkx-sub{font-size:12.5px;color:var(--muted,#8A9BA3);margin-bottom:18px}
    .nkx-auth-tabs{display:flex;gap:4px;margin-bottom:18px;border:1px solid var(--line,#1B2328);border-radius:6px;padding:3px}
    .nkx-auth-tab{flex:1;text-align:center;padding:8px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;
      font-family:var(--font-m,monospace);color:var(--muted,#8A9BA3);background:none;border:none;border-radius:4px;cursor:pointer}
    .nkx-auth-tab.active{background:var(--line,#1B2328);color:var(--white,#F2F5F5)}
    .nkx-field{position:relative;margin-bottom:10px}
    .nkx-auth-modal input{width:100%;background:var(--black,#030507);border:1px solid var(--line,#1B2328);
      color:var(--text,#D3DBDD);padding:11px 12px;border-radius:5px;font-family:var(--font-b,sans-serif);font-size:13px;
      outline:none}
    .nkx-auth-modal input:focus{border-color:var(--accent,#8FB8C4)}
    .nkx-field input{padding-right:40px}
    .nkx-eye{position:absolute;right:4px;top:4px;bottom:4px;width:32px;background:none;border:none;cursor:pointer;
      color:var(--muted,#8A9BA3);display:flex;align-items:center;justify-content:center}
    .nkx-eye:hover{color:var(--accent,#8FB8C4)}
    .nkx-eye svg{width:16px;height:16px}
    .nkx-auth-submit{width:100%;background:var(--accent,#8FB8C4);color:var(--black,#030507);border:none;padding:12px;
      border-radius:5px;font-family:var(--font-m,monospace);font-size:11px;letter-spacing:.08em;text-transform:uppercase;
      cursor:pointer;margin-top:4px}
    .nkx-auth-submit:hover{opacity:.9}
    .nkx-auth-submit:disabled{opacity:.5;cursor:default}
    .nkx-forgot-link{display:block;text-align:right;font-size:12px;color:var(--muted,#8A9BA3);margin:-2px 0 14px;
      background:none;border:none;cursor:pointer;width:100%;text-decoration:none}
    .nkx-forgot-link:hover{color:var(--accent,#8FB8C4)}
    .nkx-auth-divider{display:flex;align-items:center;gap:10px;margin:16px 0;color:var(--muted,#8A9BA3);font-size:10px;
      text-transform:uppercase;letter-spacing:.08em}
    .nkx-auth-divider::before,.nkx-auth-divider::after{content:'';flex:1;height:1px;background:var(--line,#1B2328)}
    .nkx-auth-oauth{display:flex;flex-direction:column;gap:8px}
    .nkx-auth-oauth button{display:flex;align-items:center;justify-content:center;gap:8px;background:transparent;
      border:1px solid var(--line,#1B2328);color:var(--text,#D3DBDD);padding:10px;border-radius:5px;font-size:13px;
      cursor:pointer;font-family:var(--font-b,sans-serif)}
    .nkx-auth-oauth button:hover{border-color:var(--accent,#8FB8C4);color:var(--white,#F2F5F5)}
    .nkx-auth-close{position:absolute;top:14px;right:16px;background:none;border:none;color:var(--muted,#8A9BA3);
      font-size:20px;cursor:pointer;line-height:1}
    .nkx-auth-close:hover{color:var(--white,#F2F5F5)}
    .nkx-auth-back{background:none;border:none;color:var(--muted,#8A9BA3);font-size:12px;cursor:pointer;margin-bottom:14px;
      padding:0;font-family:var(--font-b,sans-serif)}
    .nkx-auth-back:hover{color:var(--accent,#8FB8C4)}
    .nkx-auth-msg{font-size:12px;margin-bottom:10px;min-height:16px}
    .nkx-auth-msg.err{color:#D98787}
    .nkx-auth-msg.ok{color:var(--accent,#8FB8C4)}
    .nkx-otp-input{text-align:center;letter-spacing:.5em;font-family:var(--font-m,monospace);font-size:18px!important}
    .nkx-resend{text-align:center;margin-top:14px;font-size:12px;color:var(--muted,#8A9BA3)}
    .nkx-resend button{background:none;border:none;color:var(--accent,#8FB8C4);cursor:pointer;font-size:12px;padding:0}
  `;
  document.head.appendChild(s);
}

const EYE_OPEN = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
const EYE_OFF = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a21.6 21.6 0 015.06-6.44M9.9 4.24A10.4 10.4 0 0112 4c7 0 11 8 11 8a21.6 21.6 0 01-2.61 3.68M1 1l22 22"/><path d="M14.12 14.12a3 3 0 11-4.24-4.24"/></svg>`;

function passwordField(id, placeholder, autocomplete) {
  return `<div class="nkx-field">
    <input type="password" id="${id}" placeholder="${placeholder}" required minlength="6" autocomplete="${autocomplete}"/>
    <button type="button" class="nkx-eye" data-target="${id}">${EYE_OPEN}</button>
  </div>`;
}

function wireEyeToggles(root) {
  root.querySelectorAll('.nkx-eye').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = root.querySelector('#' + btn.dataset.target);
      const isPw = input.type === 'password';
      input.type = isPw ? 'text' : 'password';
      btn.innerHTML = isPw ? EYE_OFF : EYE_OPEN;
    });
  });
}

// ── modal ────────────────────────────────────────────────
let pendingEmail = '';
let pendingOtpType = 'email'; // 'email' (login) or 'signup'

function ensureOverlay() {
  if (document.getElementById('nkx-auth-overlay')) return document.getElementById('nkx-auth-overlay');
  const overlay = document.createElement('div');
  overlay.className = 'nkx-auth-overlay';
  overlay.id = 'nkx-auth-overlay';
  overlay.innerHTML = `<div class="nkx-auth-modal" id="nkx-auth-modal"></div>`;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  return overlay;
}

function openModal(view = 'login', opts = {}) {
  ensureOverlay();
  document.getElementById('nkx-auth-overlay').classList.add('open');
  renderView(view, opts);
}
function closeModal() {
  const o = document.getElementById('nkx-auth-overlay');
  if (o) o.classList.remove('open');
}

function renderView(view, opts = {}) {
  const modal = document.getElementById('nkx-auth-modal');

  if (view === 'login' || view === 'signup') {
    modal.innerHTML = `
      <button class="nkx-auth-close" id="nkx-c">×</button>
      <h3>Access Nukrax</h3>
      ${opts.note ? `<p class="nkx-sub">${opts.note}</p>` : ''}
      <div class="nkx-auth-tabs">
        <button class="nkx-auth-tab ${view === 'login' ? 'active' : ''}" data-tab="login">Log In</button>
        <button class="nkx-auth-tab ${view === 'signup' ? 'active' : ''}" data-tab="signup">Sign Up</button>
      </div>
      <div class="nkx-auth-msg" id="nkx-msg"></div>
      <form id="nkx-form">
        <div class="nkx-field"><input type="email" id="nkx-email" placeholder="Email" required autocomplete="email"/></div>
        ${passwordField('nkx-pw', 'Password', view === 'login' ? 'current-password' : 'new-password')}
        ${view === 'signup' ? passwordField('nkx-pw2', 'Confirm password', 'new-password') : ''}
        ${view === 'login' ? `<button type="button" class="nkx-forgot-link" id="nkx-forgot">Forgot password?</button>` : ''}
        <button type="submit" class="nkx-auth-submit" id="nkx-submit">${view === 'login' ? 'Log In' : 'Sign Up'}</button>
      </form>
      <div class="nkx-auth-divider">or continue with</div>
      <div class="nkx-auth-oauth">
        <button id="nkx-github">GitHub</button>
      </div>
    `;
    wireEyeToggles(modal);
    modal.querySelector('#nkx-c').addEventListener('click', closeModal);
    modal.querySelectorAll('.nkx-auth-tab').forEach(tab => {
      tab.addEventListener('click', () => renderView(tab.dataset.tab));
    });
    if (view === 'login') {
      modal.querySelector('#nkx-forgot').addEventListener('click', () => renderView('forgot'));
    }
    modal.querySelector('#nkx-github').addEventListener('click', () => {
      supabase.auth.signInWithOAuth({ provider: 'github', options: { redirectTo: window.location.origin + HOME_URL } });
    });

    const msg = modal.querySelector('#nkx-msg');
    const setMsg = (t, isErr) => { msg.textContent = t || ''; msg.className = 'nkx-auth-msg' + (t ? (isErr ? ' err' : ' ok') : ''); };
    const submitBtn = modal.querySelector('#nkx-submit');

    modal.querySelector('#nkx-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = modal.querySelector('#nkx-email').value.trim();
      const password = modal.querySelector('#nkx-pw').value;
      submitBtn.disabled = true;

      if (view === 'signup') {
        const pw2 = modal.querySelector('#nkx-pw2').value;
        if (password !== pw2) { setMsg("Passwords don't match.", true); submitBtn.disabled = false; return; }
        setMsg('Creating account...', false);
        const { error } = await supabase.auth.signUp({ email, password });
        submitBtn.disabled = false;
        if (error) return setMsg(error.message, true);
        pendingEmail = email; pendingOtpType = 'signup';
        renderView('otp');
        return;
      }

      // login: verify password, then require a fresh email OTP as a second check
      setMsg('Checking credentials...', false);
      const { error: pwError } = await supabase.auth.signInWithPassword({ email, password });
      if (pwError) { submitBtn.disabled = false; return setMsg(pwError.message, true); }

      await supabase.auth.signOut(); // don't finalize session until OTP is verified
      const { error: otpError } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
      submitBtn.disabled = false;
      if (otpError) return setMsg(otpError.message, true);
      pendingEmail = email; pendingOtpType = 'email';
      renderView('otp');
    });
    return;
  }

  if (view === 'otp') {
    modal.innerHTML = `
      <button class="nkx-auth-close" id="nkx-c">×</button>
      <button class="nkx-auth-back" id="nkx-back">← Back</button>
      <h3>Verify it's you</h3>
      <p class="nkx-sub">Enter the 6-digit code we sent to ${pendingEmail}.</p>
      <div class="nkx-auth-msg" id="nkx-msg"></div>
      <form id="nkx-otp-form">
        <div class="nkx-field"><input type="text" id="nkx-otp" class="nkx-otp-input" placeholder="000000" required maxlength="6" inputmode="numeric" autocomplete="one-time-code"/></div>
        <button type="submit" class="nkx-auth-submit" id="nkx-submit">Verify</button>
      </form>
      <div class="nkx-resend">Didn't get a code? <button id="nkx-resend">Resend</button></div>
    `;
    modal.querySelector('#nkx-c').addEventListener('click', closeModal);
    modal.querySelector('#nkx-back').addEventListener('click', () => renderView(pendingOtpType === 'signup' ? 'signup' : 'login'));

    const msg = modal.querySelector('#nkx-msg');
    const setMsg = (t, isErr) => { msg.textContent = t || ''; msg.className = 'nkx-auth-msg' + (t ? (isErr ? ' err' : ' ok') : ''); };

    modal.querySelector('#nkx-otp-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = modal.querySelector('#nkx-otp').value.trim();
      setMsg('Verifying...', false);
      const { error } = await supabase.auth.verifyOtp({ email: pendingEmail, token, type: pendingOtpType });
      if (error) return setMsg(error.message, true);
      setMsg('Verified.', false);
      setTimeout(closeModal, 400);
    });

    modal.querySelector('#nkx-resend').addEventListener('click', async () => {
      setMsg('Sending a new code...', false);
      const { error } = pendingOtpType === 'signup'
        ? await supabase.auth.resend({ type: 'signup', email: pendingEmail })
        : await supabase.auth.signInWithOtp({ email: pendingEmail, options: { shouldCreateUser: false } });
      setMsg(error ? error.message : 'New code sent.', !!error);
    });
    return;
  }

  if (view === 'forgot') {
    modal.innerHTML = `
      <button class="nkx-auth-close" id="nkx-c">×</button>
      <button class="nkx-auth-back" id="nkx-back">← Back</button>
      <h3>Reset password</h3>
      <p class="nkx-sub">We'll email you a link to set a new password.</p>
      <div class="nkx-auth-msg" id="nkx-msg"></div>
      <form id="nkx-forgot-form">
        <div class="nkx-field"><input type="email" id="nkx-femail" placeholder="Email" required autocomplete="email"/></div>
        <button type="submit" class="nkx-auth-submit">Send reset link</button>
      </form>
    `;
    modal.querySelector('#nkx-c').addEventListener('click', closeModal);
    modal.querySelector('#nkx-back').addEventListener('click', () => renderView('login'));
    const msg = modal.querySelector('#nkx-msg');
    const setMsg = (t, isErr) => { msg.textContent = t || ''; msg.className = 'nkx-auth-msg' + (t ? (isErr ? ' err' : ' ok') : ''); };

    modal.querySelector('#nkx-forgot-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = modal.querySelector('#nkx-femail').value.trim();
      setMsg('Sending...', false);
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + HOME_URL });
      setMsg(error ? error.message : 'Check your email for a reset link.', !!error);
    });
    return;
  }

  if (view === 'reset') {
    modal.innerHTML = `
      <h3>Set a new password</h3>
      <p class="nkx-sub">You're verified — choose a new password.</p>
      <div class="nkx-auth-msg" id="nkx-msg"></div>
      <form id="nkx-reset-form">
        ${passwordField('nkx-newpw', 'New password', 'new-password')}
        ${passwordField('nkx-newpw2', 'Confirm new password', 'new-password')}
        <button type="submit" class="nkx-auth-submit">Set password</button>
      </form>
    `;
    wireEyeToggles(modal);
    const msg = modal.querySelector('#nkx-msg');
    const setMsg = (t, isErr) => { msg.textContent = t || ''; msg.className = 'nkx-auth-msg' + (t ? (isErr ? ' err' : ' ok') : ''); };

    modal.querySelector('#nkx-reset-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const pw1 = modal.querySelector('#nkx-newpw').value;
      const pw2 = modal.querySelector('#nkx-newpw2').value;
      if (pw1 !== pw2) return setMsg("Passwords don't match.", true);
      setMsg('Saving...', false);
      const { error } = await supabase.auth.updateUser({ password: pw1 });
      if (error) return setMsg(error.message, true);
      setMsg('Password updated.', false);
      setTimeout(closeModal, 700);
    });
    return;
  }
}

// ── theme (background-only dark/light toggle) ───────────
function applyTheme(theme) {
  document.body.classList.toggle('nkx-light-mode', theme === 'light');
}
function toggleTheme() {
  const next = document.body.classList.contains('nkx-light-mode') ? 'dark' : 'light';
  localStorage.setItem('nkx-theme', next);
  applyTheme(next);
}

// ── floating widget (menu + avatar/login) ───────────────
function initials(nameOrEmail) {
  if (!nameOrEmail) return '?';
  return nameOrEmail.trim().charAt(0).toUpperCase();
}

const MENU_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;

function closeAllDropdowns() {
  document.querySelectorAll('.nkx-w-dropdown').forEach(d => d.classList.remove('open'));
}

function buildLoginWrap(user) {
  const wrap = document.createElement('div');
  wrap.id = 'nkx-w-login-wrap';
  wrap.style.position = 'relative';

  if (user) {
    const meta = user.user_metadata || {};
    const displayName = meta.username || meta.full_name || meta.user_name || meta.name || user.email;
    const avatarUrl = meta.avatar_url || meta.picture || '';
    wrap.innerHTML = `
      <div class="nkx-w-avatar" id="nkx-w-avatar-btn">${avatarUrl ? `<img src="${avatarUrl}" alt="">` : initials(displayName)}</div>
      <div class="nkx-w-dropdown" id="nkx-w-avatar-dd">
        <a href="${PROFILE_URL}">Profile</a>
        <div class="nkx-w-divider"></div>
        <button class="nkx-w-logout" id="nkx-w-logout">Log Out</button>
      </div>
    `;
  } else {
    wrap.innerHTML = `<button class="nkx-w-login" id="nkx-w-login-btn">Log In</button>`;
  }

  if (user) {
    wrap.querySelector('#nkx-w-avatar-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      const dd = wrap.querySelector('#nkx-w-avatar-dd');
      const isOpen = dd.classList.contains('open');
      closeAllDropdowns();
      if (!isOpen) dd.classList.add('open');
    });
    wrap.querySelector('#nkx-w-logout').addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = HOME_URL;
    });
  } else {
    wrap.querySelector('#nkx-w-login-btn').addEventListener('click', () => openModal('login'));
  }

  return wrap;
}

function buildMenuWrap(user) {
  const wrap = document.createElement('div');
  wrap.id = 'nkx-w-menu-wrap';
  wrap.style.position = 'relative';
  const menuLinksHtml = SITE_LINKS.map(l => `<a href="${l.href}">${l.label}</a>`).join('');

  const accountLinksHtml = user ? `
    <div class="nkx-w-divider"></div>
    <a href="${PROFILE_URL}">Profile</a>
    <a href="${PROFILE_URL}">Account</a>
    <a href="${PROFILE_URL}">Settings</a>
    <button id="nkx-w-menu-logout">Log Out</button>
  ` : '';

  wrap.innerHTML = `
    <div class="nkx-w-btn" id="nkx-w-menu-btn">${MENU_ICON}</div>
    <div class="nkx-w-dropdown" id="nkx-w-menu-dd">
      ${menuLinksHtml}
      ${accountLinksHtml}
      <div class="nkx-w-divider"></div>
      <button id="nkx-w-theme-toggle">Dark/Light</button>
    </div>
  `;
  wrap.querySelector('#nkx-w-menu-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const dd = wrap.querySelector('#nkx-w-menu-dd');
    const isOpen = dd.classList.contains('open');
    closeAllDropdowns();
    if (!isOpen) dd.classList.add('open');
  });
  wrap.querySelector('#nkx-w-theme-toggle').addEventListener('click', toggleTheme);
  if (user) {
    wrap.querySelector('#nkx-w-menu-logout').addEventListener('click', async () => {
      await supabase.auth.signOut();
      window.location.href = HOME_URL;
    });
  }
  return wrap;
}

function renderWidget(user) {
  // Remove any previously injected instances before re-rendering.
  document.getElementById('nkx-w-login-wrap')?.remove();
  document.getElementById('nkx-w-menu-wrap')?.remove();
  document.getElementById('nkx-auth-widget')?.remove();

  const navRight = document.querySelector('.nav-right');
  const loginWrap = buildLoginWrap(user);
  const menuWrap = buildMenuWrap(user);

  if (navRight) {
    // In-flow: sits alongside existing nav content, same order as the rest of the nav.
    // e.g. Systems Online → Log In/Avatar → Market Map → Menu
    const mapBtn = navRight.querySelector('.nav-map-btn');
    if (mapBtn) {
      navRight.insertBefore(loginWrap, mapBtn);
    } else {
      navRight.appendChild(loginWrap);
    }
    navRight.appendChild(menuWrap);
  } else {
    // No matching nav structure on this page — use a fixed widget tucked in the
    // bottom-right corner so it never sits on top of the page's own nav/header.
    const root = document.createElement('div');
    root.id = 'nkx-auth-widget';
    root.appendChild(menuWrap);
    root.appendChild(loginWrap);
    document.body.appendChild(root);
  }
}

document.addEventListener('click', closeAllDropdowns);

// ── boot ─────────────────────────────────────────────────
injectStyles();
applyTheme(localStorage.getItem('nkx-theme') || 'dark');

supabase.auth.getSession().then(({ data }) => {
  renderWidget(data.session?.user || null);
});

supabase.auth.onAuthStateChange((event, session) => {
  renderWidget(session?.user || null);
  if (event === 'PASSWORD_RECOVERY') {
    openModal('reset');
  }
});

// If redirected here because a gated page needs login, open the modal automatically
const params = new URLSearchParams(window.location.search);
if (params.get('authRequired') === '1') {
  openModal('login', { note: 'Please log in to continue — an account is required to use Nukrax.' });
  params.delete('authRequired');
  const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
  window.history.replaceState({}, '', newUrl);
}
