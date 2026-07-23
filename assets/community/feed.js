// ═══════════════════════════════════════════════
// NUKRAX Community — feed.js
// Renders the Home feed (or a single user's posts, via ?user=username).
// ═══════════════════════════════════════════════
import { supabase } from '../auth/auth-widget.js';

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

let _ownUsernameCache = null;
async function getOwnUsername(currentUser) {
  if (_ownUsernameCache) return _ownUsernameCache;
  const { data } = await supabase.from('profiles').select('username').eq('id', currentUser.id).maybeSingle();
  _ownUsernameCache = data?.username || null;
  return _ownUsernameCache;
}

export async function renderFeed(container, currentUser, filterUsername = null) {
  container.innerHTML = `<div class="cm-loading">Loading...</div>`;

  let profileFilterId = null;
  if (filterUsername) {
    const { data: p } = await supabase.from('profiles').select('id').ilike('username', filterUsername).maybeSingle();
    if (!p) { container.innerHTML = `<div class="cm-empty">No one goes by @${escapeHtml(filterUsername)}.</div>`; return; }
    profileFilterId = p.id;
  }

  let query = supabase.from('posts').select('*').order('created_at', { ascending: false }).limit(50);
  if (profileFilterId) query = query.eq('user_id', profileFilterId);
  const { data: posts, error } = await query;

  if (error) { container.innerHTML = `<div class="cm-empty">Couldn't load posts.</div>`; return; }
  if (!posts || !posts.length) { container.innerHTML = `<div class="cm-empty">No posts yet. Be the first to post something.</div>`; return; }

  const userIds = [...new Set(posts.map(p => p.user_id))];
  const { data: profiles } = await supabase.from('profiles').select('*').in('id', userIds);
  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));

  const postIds = posts.map(p => p.id);
  const { data: likes } = await supabase.from('likes').select('*').in('post_id', postIds);
  const likesByPost = {};
  (likes || []).forEach(l => { (likesByPost[l.post_id] ||= []).push(l.user_id); });

  let followingSet = new Set();
  if (currentUser) {
    const { data: myFollows } = await supabase.from('follows').select('following_id').eq('follower_id', currentUser.id);
    followingSet = new Set((myFollows || []).map(f => f.following_id));
  }

  container.innerHTML = posts.map(post => {
    const author = profileMap[post.user_id];
    const authorName = author?.display_name || author?.username || 'Unknown';
    const authorHandle = author?.username ? '@' + author.username : '';
    const avatarUrl = author?.avatar_url || '';
    const initial = (authorName || '?').charAt(0).toUpperCase();
    const likeIds = likesByPost[post.id] || [];
    const isLiked = currentUser && likeIds.includes(currentUser.id);
    const isOwn = currentUser && post.user_id === currentUser.id;
    const isFollowing = followingSet.has(post.user_id);

    return `
      <article class="cm-post" data-post-id="${post.id}" data-author-id="${post.user_id}">
        <div class="cm-post-avatar cm-clickable-profile" data-username="${escapeHtml(author?.username || '')}">${avatarUrl ? `<img src="${escapeHtml(avatarUrl)}" alt="">` : initial}</div>
        <div class="cm-post-body">
          <div class="cm-post-head">
            <span class="cm-post-name cm-clickable-profile" data-username="${escapeHtml(author?.username || '')}">${escapeHtml(authorName)}</span>
            <span class="cm-post-handle cm-clickable-profile" data-username="${escapeHtml(author?.username || '')}">${escapeHtml(authorHandle)}</span>
            <span class="cm-post-time">· ${timeAgo(post.created_at)}</span>
            ${!isOwn && currentUser ? `<button class="cm-follow-btn ${isFollowing ? 'following' : ''}" data-follow-target="${post.user_id}">${isFollowing ? 'Following' : 'Follow'}</button>` : ''}
            ${isOwn ? `<button class="cm-post-delete" data-delete-post="${post.id}" title="Delete">×</button>` : ''}
          </div>
          ${post.content ? `<div class="cm-post-text">${escapeHtml(post.content)}</div>` : ''}
          ${post.image_url ? `<img class="cm-post-image" src="${escapeHtml(post.image_url)}" alt="">` : ''}
          <div class="cm-post-actions">
            <button class="cm-like-btn ${isLiked ? 'liked' : ''}" data-like-post="${post.id}">
              <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 000-7.8z"/></svg>
              <span class="cm-like-count">${likeIds.length}</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Wire up likes
  container.querySelectorAll('.cm-like-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!currentUser) return;
      const postId = btn.dataset.likePost;
      const isLiked = btn.classList.contains('liked');
      const countEl = btn.querySelector('.cm-like-count');
      if (isLiked) {
        await supabase.from('likes').delete().eq('post_id', postId).eq('user_id', currentUser.id);
        btn.classList.remove('liked');
        btn.querySelector('svg').setAttribute('fill', 'none');
        countEl.textContent = Math.max(0, parseInt(countEl.textContent) - 1);
      } else {
        await supabase.from('likes').insert({ post_id: postId, user_id: currentUser.id });
        btn.classList.add('liked');
        btn.querySelector('svg').setAttribute('fill', 'currentColor');
        countEl.textContent = parseInt(countEl.textContent) + 1;
        const article = btn.closest('.cm-post');
        const authorId = article?.dataset.authorId;
        if (authorId && authorId !== currentUser.id) {
          await supabase.from('notifications').insert({ user_id: authorId, actor_id: currentUser.id, type: 'like', post_id: postId });
        }
      }
    });
  });

  // Wire up follow/unfollow
  container.querySelectorAll('.cm-follow-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!currentUser) return;
      const targetId = btn.dataset.followTarget;
      const isFollowing = btn.classList.contains('following');
      if (isFollowing) {
        await supabase.from('follows').delete().eq('follower_id', currentUser.id).eq('following_id', targetId);
        btn.classList.remove('following');
        btn.textContent = 'Follow';
      } else {
        await supabase.from('follows').insert({ follower_id: currentUser.id, following_id: targetId });
        btn.classList.add('following');
        btn.textContent = 'Following';
        await supabase.from('notifications').insert({ user_id: targetId, actor_id: currentUser.id, type: 'follow' });
      }
    });
  });

  // Wire up clicking an author to view their profile
  const selfUsername = currentUser ? await getOwnUsername(currentUser) : null;
  container.querySelectorAll('.cm-clickable-profile').forEach(el => {
    const username = el.dataset.username;
    if (!username) return;
    el.style.cursor = 'pointer';
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (selfUsername && username.toLowerCase() === selfUsername.toLowerCase()) {
        window.location.href = 'profile.html';
      } else {
        window.location.href = `u.html?u=${encodeURIComponent(username)}`;
      }
    });
  });

  // Wire up delete
  container.querySelectorAll('.cm-post-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this post?')) return;
      const postId = btn.dataset.deletePost;
      await supabase.from('posts').delete().eq('id', postId);
      btn.closest('.cm-post')?.remove();
    });
  });
}
