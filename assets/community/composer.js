// ═══════════════════════════════════════════════
// NUKRAX Community — composer.js
// ═══════════════════════════════════════════════
import { supabase } from '../auth/auth-widget.js';

let pendingImageFile = null;

function ensureComposerModal() {
  if (document.getElementById('cm-composer-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'cm-composer-overlay';
  overlay.className = 'cm-composer-overlay';
  overlay.innerHTML = `
    <div class="cm-composer-modal">
      <button class="cm-composer-close" id="cm-composer-close">×</button>
      <h3>New Post</h3>
      <textarea id="cm-composer-text" placeholder="What's happening?" maxlength="500"></textarea>
      <div class="cm-composer-preview" id="cm-composer-preview"></div>
      <div class="cm-composer-msg" id="cm-composer-msg"></div>
      <div class="cm-composer-actions">
        <button class="cm-composer-photo-btn" id="cm-composer-photo-btn" title="Add photo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
        </button>
        <input type="file" id="cm-composer-file" accept="image/*" style="display:none"/>
        <button class="cm-composer-submit" id="cm-composer-submit">Post</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeComposer(); });
  document.getElementById('cm-composer-close').addEventListener('click', closeComposer);

  const fileInput = document.getElementById('cm-composer-file');
  document.getElementById('cm-composer-photo-btn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    pendingImageFile = fileInput.files[0] || null;
    const preview = document.getElementById('cm-composer-preview');
    preview.innerHTML = pendingImageFile ? `<img src="${URL.createObjectURL(pendingImageFile)}" alt="">` : '';
  });
}

export function openComposer(currentUser, onPosted, { openPhotoPicker = false } = {}) {
  ensureComposerModal();
  pendingImageFile = null;
  document.getElementById('cm-composer-text').value = '';
  document.getElementById('cm-composer-preview').innerHTML = '';
  document.getElementById('cm-composer-msg').textContent = '';
  document.getElementById('cm-composer-overlay').classList.add('open');

  const submitBtn = document.getElementById('cm-composer-submit');
  const newSubmit = submitBtn.cloneNode(true);
  submitBtn.replaceWith(newSubmit);

  newSubmit.addEventListener('click', async () => {
    const msg = document.getElementById('cm-composer-msg');
    const content = document.getElementById('cm-composer-text').value.trim();
    if (!content && !pendingImageFile) { msg.textContent = 'Write something or add a photo.'; return; }

    newSubmit.disabled = true;
    msg.textContent = 'Posting...';

    let imageUrl = null;
    if (pendingImageFile) {
      const ext = pendingImageFile.name.split('.').pop();
      const path = `${currentUser.id}/post-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('post-images').upload(path, pendingImageFile);
      if (upErr) { msg.textContent = upErr.message; newSubmit.disabled = false; return; }
      const { data: pub } = supabase.storage.from('post-images').getPublicUrl(path);
      imageUrl = pub.publicUrl;
    }

    const { error } = await supabase.from('posts').insert({ user_id: currentUser.id, content, image_url: imageUrl });
    newSubmit.disabled = false;
    if (error) { msg.textContent = error.message; return; }

    closeComposer();
    onPosted?.();
  });

  if (openPhotoPicker) {
    setTimeout(() => document.getElementById('cm-composer-file').click(), 150);
  } else {
    setTimeout(() => document.getElementById('cm-composer-text').focus(), 150);
  }
}

export function closeComposer() {
  document.getElementById('cm-composer-overlay')?.classList.remove('open');
}
