// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/home/home.js
// Homepage-specific behavior: the logged-in Welcome Panel (personalized
// greeting, continue-where-left-off, notification-aware subtext) and the
// magnetic-button hover effect used on primary CTAs. Split out from
// index.html's inline scripts to keep that file from growing further,
// following the same feature-folder pattern as assets/cube/, assets/docs/.
// ═══════════════════════════════════════════════════════════════════════

import { supabase } from '../auth/auth-widget.js';

const LAST_VIEWED_KEY = 'nkx_last_viewed_ea';
const LAST_VIEWED_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/* ── Welcome Panel ── */
async function renderWelcomePanel(session) {
  const greetingEl = document.getElementById('welcome-heading');
  const subEl = document.getElementById('welcomeSub');
  const continueEl = document.getElementById('welcomeContinue');
  const continueTitleEl = document.getElementById('welcomeContinueTitle');
  if (!greetingEl || !subEl) return;

  const user = session?.user;
  if (!user) return; // logged-out visitors never see this panel (CSS-hidden anyway)

  const meta = user.user_metadata || {};
  const displayName = meta.username || meta.full_name || meta.user_name || meta.name || (user.email ? user.email.split('@')[0] : 'trader');
  greetingEl.textContent = `Welcome back, ${displayName}`;

  // Unread notification count — same table/columns already used by
  // assets/community/notifications.js, just a lightweight head-count query.
  try {
    const { count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('read', false);
    if (count && count > 0) {
      subEl.textContent = `You have ${count} new notification${count === 1 ? '' : 's'} in the community.`;
    } else {
      subEl.textContent = "Here's what's waiting for you.";
    }
  } catch {
    subEl.textContent = "Here's what's waiting for you.";
  }

  // Continue where you left off — read from localStorage (set by the EA
  // product pages on view), no backend tracking required.
  if (continueEl && continueTitleEl) {
    try {
      const raw = localStorage.getItem(LAST_VIEWED_KEY);
      if (raw) {
        const last = JSON.parse(raw);
        const age = Date.now() - (last.ts || 0);
        if (last.title && last.href && age < LAST_VIEWED_MAX_AGE_MS) {
          continueTitleEl.textContent = last.title;
          continueEl.href = last.href;
          continueEl.hidden = false;
        }
      }
    } catch {
      /* malformed localStorage value — ignore, keep the card hidden */
    }
  }
}

supabase.auth.getSession().then(({ data }) => renderWelcomePanel(data.session));
supabase.auth.onAuthStateChange((_event, session) => renderWelcomePanel(session));

/* ── Magnetic buttons ──
   A small, capped pull toward the cursor on primary CTAs — reads as
   premium weight rather than a gimmick because the travel distance is
   small and eases back out on leave. Skipped entirely for touch/coarse
   pointers and prefers-reduced-motion, where it would add nothing. */
function initMagneticButtons() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduceMotion || !canHover) return;

  const MAX_PULL = 10; // px — deliberately small, this is weight not a chase
  document.querySelectorAll('.btn-magnetic').forEach(btn => {
    let raf = null;
    btn.addEventListener('mouseenter', () => btn.classList.add('magnetic-active'));
    btn.addEventListener('mousemove', (e) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = btn.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        btn.style.setProperty('--mx', `${relX * MAX_PULL}px`);
        btn.style.setProperty('--my', `${relY * MAX_PULL}px`);
      });
    }, { passive: true });
    btn.addEventListener('mouseleave', () => {
      btn.classList.remove('magnetic-active');
      btn.style.setProperty('--mx', '0px');
      btn.style.setProperty('--my', '0px');
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initMagneticButtons);
} else {
  initMagneticButtons();
}
