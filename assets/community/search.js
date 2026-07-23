// ═══════════════════════════════════════════════
// NUKRAX Community — search.js
// ═══════════════════════════════════════════════
import { supabase } from '../auth/auth-widget.js';

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

export function renderSearchShell(container) {
  container.innerHTML = `
    <div class="cm-search-bar">
      <input type="text" id="cm-search-input" placeholder="Search by username..." autocomplete="off"/>
    </div>
    <div id="cm-search-results"></div>
  `;

  const input = container.querySelector('#cm-search-input');
  const results = container.querySelector('#cm-search-results');
  let timer = null;

  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (!q) { results.innerHTML = ''; return; }
    timer = setTimeout(() => runSearch(q, results), 300);
  });

  input.focus();
}

async function runSearch(query, resultsEl) {
  resultsEl.innerHTML = `<div class="cm-loading">Searching...</div>`;
  const { data: session } = await supabase.auth.getSession();
  const currentUser = session.session?.user || null;

  const { data: people, error } = await supabase
    .from('profiles')
    .select('*')
    .ilike('username', `%${query}%`)
    .limit(20);

  if (error || !people || !people.length) {
    resultsEl.innerHTML = `<div class="cm-empty">No one found.</div>`;
    return;
  }

  let followingSet = new Set();
  if (currentUser) {
    const { data: myFollows } = await supabase.from('follows').select('following_id').eq('follower_id', currentUser.id);
    followingSet = new Set((myFollows || []).map(f => f.following_id));
  }

  resultsEl.innerHTML = people.map(p => {
    const initial = (p.display_name || p.username || '?').charAt(0).toUpperCase();
    const isSelf = currentUser && p.id === currentUser.id;
    const isFollowing = followingSet.has(p.id);
    return `
      <div class="cm-user-row" data-username="${escapeHtml(p.username)}">
        <div class="cm-post-avatar">${p.avatar_url ? `<img src="${escapeHtml(p.avatar_url)}" alt="">` : initial}</div>
        <div class="cm-user-row-text">
          <div class="cm-post-name">${escapeHtml(p.display_name || p.username)}</div>
          <div class="cm-post-handle">@${escapeHtml(p.username)}</div>
        </div>
        ${!isSelf && currentUser ? `<button class="cm-follow-btn ${isFollowing ? 'following' : ''}" data-follow-target="${p.id}">${isFollowing ? 'Following' : 'Follow'}</button>` : ''}
      </div>
    `;
  }).join('');

  resultsEl.querySelectorAll('.cm-follow-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!currentUser) return;
      const targetId = btn.dataset.followTarget;
      const isFollowing = btn.classList.contains('following');
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', targetId);
        btn.classList.remove('following'); btn.textContent = 'Follow';
      } else {
        await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: targetId });
        btn.classList.add('following'); btn.textContent = 'Following';
        await supabase.from('notifications').insert({ user_id: targetId, actor_id: currentUser.id, type: 'follow' });
      }
    });
  });

  resultsEl.querySelectorAll('.cm-user-row').forEach(row => {
    row.addEventListener('click', () => {
      const username = row.dataset.username;
      if (currentUser && username.toLowerCase() === (currentUser.user_metadata?.username || '').toLowerCase()) {
        window.location.href = 'profile.html';
      } else {
        window.location.href = `u.html?u=${encodeURIComponent(username)}`;
      }
    });
  });
}
