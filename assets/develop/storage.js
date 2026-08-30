// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/develop/storage.js
// One shared localStorage abstraction for both the EA and Automation
// creators, instead of each page reading/writing raw localStorage keys
// of its own. Two kinds of state, kept deliberately separate:
//
//   DRAFT  — the current unfinished, in-progress creation for a given
//            project type ('ea' | 'automation'). Autosaved on every
//            canvas change. Restored automatically on page load, so a
//            refresh/close/reopen never loses work.
//   SAVED  — a named, explicit save the user chose to keep. Multiple can
//            exist per project type. Never touched by autosave.
//
// Every record carries a `version` field (SCHEMA_VERSION) so a future
// change to the shape can detect and skip/migrate old records instead
// of crashing on them. Every read is defensive: malformed JSON, wrong
// version, or an unexpected shape all just resolve to "nothing here"
// rather than throwing — a corrupted localStorage entry must never
// break the creator page.
//
// Nothing sensitive lives here — only project name/idea/blocks/
// connections. No auth tokens, no credentials, ever.
// ═══════════════════════════════════════════════════════════════════════

const SCHEMA_VERSION = 1;
const NS = 'nukrax.creator.';

function safeParse(raw) {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return (v && typeof v === 'object') ? v : null;
  } catch (e) {
    return null; // malformed JSON — treat as absent, never throw
  }
}

function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    // Storage full, disabled, or in a context (e.g. private browsing in
    // some browsers) that throws on write — the creator keeps working,
    // it just won't persist. Not fatal.
    return false;
  }
}

function uid() {
  return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function draftKey(projectType) { return `${NS}draft.${projectType}`; }
function savedKey(projectType) { return `${NS}saved.${projectType}`; }

/** Returns the current draft for this project type, or null if there isn't
 *  a valid one (nothing saved yet, or the record was malformed/stale). */
export function loadDraft(projectType) {
  const v = safeParse(localStorage.getItem(draftKey(projectType)));
  if (!v || v.version !== SCHEMA_VERSION || !v.project) return null;
  return v;
}

/** Autosave hook — call on every canvas change. Silently no-ops on
 *  failure (see safeSet) rather than surfacing an error to the user
 *  for what is, functionally, a background convenience save. */
export function saveDraft(projectType, { projectName, idea, project }) {
  return safeSet(draftKey(projectType), {
    version: SCHEMA_VERSION,
    updatedAt: Date.now(),
    projectName: projectName || '',
    idea: idea || '',
    project,
  });
}

export function clearDraft(projectType) {
  try { localStorage.removeItem(draftKey(projectType)); } catch (e) { /* ignore */ }
}

/** All explicitly-saved creations for this project type, newest first. */
export function listSaved(projectType) {
  const v = safeParse(localStorage.getItem(savedKey(projectType)));
  if (!Array.isArray(v)) return [];
  return v
    .filter(item => item && item.version === SCHEMA_VERSION && item.project && item.id)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

/** Save (or update, if `id` matches an existing entry) a named creation.
 *  Returns the saved entry, including its id. */
export function saveNamed(projectType, { id, name, idea, project }) {
  const list = listSaved(projectType);
  const entryId = id || uid();
  const entry = {
    version: SCHEMA_VERSION,
    id: entryId,
    name: (name || 'Untitled').trim() || 'Untitled',
    idea: idea || '',
    project,
    updatedAt: Date.now(),
  };
  const idx = list.findIndex(x => x.id === entryId);
  if (idx >= 0) list[idx] = entry; else list.unshift(entry);
  safeSet(savedKey(projectType), list);
  return entry;
}

export function deleteSaved(projectType, id) {
  const list = listSaved(projectType).filter(x => x.id !== id);
  safeSet(savedKey(projectType), list);
}

export function getSaved(projectType, id) {
  return listSaved(projectType).find(x => x.id === id) || null;
}
