// ═══════════════════════════════════════════════
// NUKRAX Community — notifications.js
// ═══════════════════════════════════════════════
import { supabase } from '../auth/auth-widget.js';
import { avatarHtml } from '../shell/avatar.js';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return `${Math.max(1, Math.floor(diff))}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

export async function renderNotifications(container, currentUser) {
  if (!currentUser) { container.innerHTML = `<div class="cm-empty">Log in to see notifications.</div>`; return; }
  container.innerHTML = `<div class="cm-loading">Loading...</div>`;

  const { data: notifs, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', currentUser.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !notifs || !notifs.length) {
    container.innerHTML = `<div class="cm-empty">Nothing yet — likes and new followers show up here.</div>`;
    return;
  }

  // actor_id is null for system-generated notifications (purchase updates,
  // account/membership changes, security alerts, announcements — see
  // supabase/migrations/0001_membership_platform.sql), so only look up
  // profiles for the ones that actually have a human actor.
  const actorIds = [...new Set(notifs.map(n => n.actor_id).filter(Boolean))];
  const { data: profiles } = actorIds.length
    ? await supabase.from('profiles').select('*').in('id', actorIds)
    : { data: [] };
  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));

  const SYSTEM_ICONS = {
    purchase: '▤', account: '◇', membership: '★', security: '⛨', announcement: '⚑',
    achievement: '\u2726', reward: '\u25c6', marketplace: '\u25a6', automation: '\u2699',
    ai: '\u25c8', download: '\u2193',
  };

  container.innerHTML = notifs.map(n => {
    if (!n.actor_id) {
      // System notification: title/body set directly on the row, no actor.
      const icon = SYSTEM_ICONS[n.type] || '•';
      return `
        <div class="cm-notif-row ${n.read ? '' : 'unread'}">
          <div class="cm-post-avatar">${icon}</div>
          <div class="cm-notif-text">
            <strong>${escapeHtml(n.title || 'Update')}</strong>${n.body ? ` — ${escapeHtml(n.body)}` : ''}
            <div class="cm-post-time">${timeAgo(n.created_at)}</div>
          </div>
        </div>
      `;
    }
    const actor = profileMap[n.actor_id];
    const actorName = actor?.display_name || actor?.username || 'Someone';
    const verb = n.type === 'like' ? 'liked your post' : 'started following you';
    return `
      <div class="cm-notif-row ${n.read ? '' : 'unread'}">
        <div class="cm-post-avatar">${avatarHtml(actor, escapeHtml)}</div>
        <div class="cm-notif-text">
          <strong>${escapeHtml(actorName)}</strong> ${verb}
          <div class="cm-post-time">${timeAgo(n.created_at)}</div>
        </div>
      </div>
    `;
  }).join('');

  const unreadIds = notifs.filter(n => !n.read).map(n => n.id);
  if (unreadIds.length) {
    await supabase.from('notifications').update({ read: true }).in('id', unreadIds);
  }
}
