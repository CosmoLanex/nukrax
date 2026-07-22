// ═══════════════════════════════════════════════
// NUKRAX Community — chats.js
// ═══════════════════════════════════════════════
import { supabase } from '../auth/auth-widget.js';

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

let activeChannel = null;

export async function renderChatsList(container, currentUser, onOpenConversation) {
  if (!currentUser) { container.innerHTML = `<div class="cm-empty">Log in to use chats.</div>`; return; }
  container.innerHTML = `<div class="cm-loading">Loading...</div>`;

  const { data: msgs, error } = await supabase
    .from('messages')
    .select('*')
    .or(`sender_id.eq.${currentUser.id},recipient_id.eq.${currentUser.id}`)
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) { container.innerHTML = `<div class="cm-empty">Couldn't load chats.</div>`; return; }
  if (!msgs || !msgs.length) { container.innerHTML = `<div class="cm-empty">No conversations yet. Find someone in Search to say hi.</div>`; return; }

  const others = new Map();
  msgs.forEach(m => {
    const otherId = m.sender_id === currentUser.id ? m.recipient_id : m.sender_id;
    if (!others.has(otherId)) others.set(otherId, m);
  });

  const otherIds = [...others.keys()];
  const { data: profiles } = await supabase.from('profiles').select('*').in('id', otherIds);
  const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));

  container.innerHTML = [...others.entries()].map(([otherId, lastMsg]) => {
    const p = profileMap[otherId];
    const name = p?.display_name || p?.username || 'Unknown';
    const initial = (name || '?').charAt(0).toUpperCase();
    const unreadMark = (!lastMsg.read && lastMsg.recipient_id === currentUser.id) ? '<span class="cm-unread-dot"></span>' : '';
    return `
      <div class="cm-user-row" data-user-id="${otherId}" data-username="${escapeHtml(p?.username || '')}">
        <div class="cm-post-avatar">${p?.avatar_url ? `<img src="${escapeHtml(p.avatar_url)}" alt="">` : initial}</div>
        <div class="cm-user-row-text">
          <div class="cm-post-name">${escapeHtml(name)} ${unreadMark}</div>
          <div class="cm-post-handle">${escapeHtml(lastMsg.content.slice(0, 40))}</div>
        </div>
        <div class="cm-post-time">${timeAgo(lastMsg.created_at)}</div>
      </div>
    `;
  }).join('');

  container.querySelectorAll('.cm-user-row').forEach(row => {
    row.addEventListener('click', () => onOpenConversation(row.dataset.userId, row.dataset.username));
  });
}

export async function renderConversation(container, currentUser, otherId, otherUsername, onBack) {
  if (activeChannel) { supabase.removeChannel(activeChannel); activeChannel = null; }

  const { data: otherProfile } = await supabase.from('profiles').select('*').eq('id', otherId).maybeSingle();
  const otherName = otherProfile?.display_name || otherProfile?.username || otherUsername || 'User';

  container.innerHTML = `
    <div class="cm-convo-head">
      <button class="cm-convo-back" id="cm-convo-back">←</button>
      <span>${escapeHtml(otherName)}</span>
    </div>
    <div class="cm-convo-messages" id="cm-convo-messages"></div>
    <form class="cm-convo-form" id="cm-convo-form">
      <input type="text" id="cm-convo-input" placeholder="Message..." autocomplete="off" required/>
      <button type="submit">Send</button>
    </form>
  `;

  container.querySelector('#cm-convo-back').addEventListener('click', () => {
    if (activeChannel) { supabase.removeChannel(activeChannel); activeChannel = null; }
    onBack();
  });

  const messagesEl = container.querySelector('#cm-convo-messages');

  async function loadMessages() {
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${currentUser.id},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${currentUser.id})`)
      .order('created_at', { ascending: true })
      .limit(200);
    renderMessages(msgs || []);

    const unreadIds = (msgs || []).filter(m => !m.read && m.recipient_id === currentUser.id).map(m => m.id);
    if (unreadIds.length) await supabase.from('messages').update({ read: true }).in('id', unreadIds);
  }

  function renderMessages(msgs) {
    messagesEl.innerHTML = msgs.map(m => `
      <div class="cm-bubble ${m.sender_id === currentUser.id ? 'mine' : 'theirs'}">${escapeHtml(m.content)}</div>
    `).join('');
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  await loadMessages();

  container.querySelector('#cm-convo-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = container.querySelector('#cm-convo-input');
    const content = input.value.trim();
    if (!content) return;
    input.value = '';
    await supabase.from('messages').insert({ sender_id: currentUser.id, recipient_id: otherId, content });
  });

  activeChannel = supabase
    .channel(`dm-${[currentUser.id, otherId].sort().join('-')}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
      const m = payload.new;
      const isThisConvo = (m.sender_id === currentUser.id && m.recipient_id === otherId) ||
                           (m.sender_id === otherId && m.recipient_id === currentUser.id);
      if (isThisConvo) loadMessages();
    })
    .subscribe();
}
