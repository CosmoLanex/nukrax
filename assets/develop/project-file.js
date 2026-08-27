// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/develop/project-file.js
// Builds the structured project file (section 28) and drives the "Send
// E.A" / "Send Automation" workflow (section 29): validate → generate
// file → confirm with the user → open their email client toward
// dev@nukrax.com. Also records a submission row via
// assets/develop/submissions.js so it shows up in Dashboard → Orders
// with a real, honest status instead of a fabricated "in development"
// state (section 30).
//
// Mailto cannot attach a file — no email client API can, from a web
// page, without server-side mail sending (which would need worker.js,
// deliberately off-limits here). So the workflow is: the full project
// file downloads as a .json file AND a readable summary is pre-filled
// into the email body, with a clear instruction to attach the
// downloaded file before sending. This is the honest, actually-workable
// version of "prepare the email and open the user's email workflow"
// without silently sending anything or pretending an attachment went
// through when it didn't.
// ═══════════════════════════════════════════════════════════════════════

import { createSubmission } from './submissions.js';

/**
 * @param {{ projectType: 'ea'|'automation', projectName: string, idea: string,
 *   user: { id: string, email: string, username?: string }, project: { blocks, connections } }} params
 */
export function buildProjectFile({ projectType, projectName, idea, user, project }) {
  return {
    meta: {
      version: 1,
      createdAt: new Date().toISOString(),
      projectType,
    },
    user: {
      id: user.id,
      email: user.email,
      username: user.username || null,
    },
    project: {
      name: projectName,
      idea,
      blocks: project.blocks,
      connections: project.connections,
    },
  };
}

function validate({ projectName, project }) {
  const errors = [];
  if (!projectName || !projectName.trim()) errors.push('Give your project a name before sending it.');
  if (!project.blocks.length) errors.push('Add at least one block to the canvas before sending.');
  return errors;
}

function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildMailtoBody(file) {
  const blockLines = file.project.blocks.map((b, i) => `  ${i + 1}. ${b.typeId}`).join('\n');
  return [
    `Project: ${file.project.name}`,
    `Type: ${file.meta.projectType === 'ea' ? 'Expert Advisor' : 'Automation'}`,
    `From: ${file.user.username || file.user.email}`,
    '',
    'Idea / description:',
    file.project.idea || '(none provided)',
    '',
    `Blocks used (${file.project.blocks.length}):`,
    blockLines,
    '',
    '— The full project file (with block configuration and connections) was',
    'downloaded to your device as a .json file — please attach it to this',
    'email before sending.',
  ].join('\n');
}

/**
 * Runs the full Send flow: validate → confirm with the user → download
 * the project file → record a submission → open the email client.
 * Never sends anything silently — the person still has to actually hit
 * Send in their own email client, and confirms once before any of this starts.
 */
export async function sendProject({ projectType, projectName, idea, user, project, confirmFn = window.confirm }) {
  const errors = validate({ projectName, project });
  if (errors.length) return { ok: false, errors };

  const confirmed = confirmFn(
    `Send this ${projectType === 'ea' ? 'E.A' : 'Automation'} project to the NUKRAX dev team?\n\n` +
    `This will download your project file and open your email app with dev@nukrax.com pre-filled — ` +
    `you'll still need to attach the downloaded file and hit Send yourself.`
  );
  if (!confirmed) return { ok: false, cancelled: true };

  const file = buildProjectFile({ projectType, projectName, idea, user, project });
  const filenameSafe = (projectName || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  downloadJson(`nukrax-${projectType}-${filenameSafe}.json`, file);

  const submission = await createSubmission({
    userId: user.id,
    projectType,
    projectName,
    idea,
    blockCount: project.blocks.length,
  }).catch(() => null);

  const subject = encodeURIComponent(`${projectType === 'ea' ? '[E.A Submission]' : '[Automation Submission]'} ${projectName}`);
  const body = encodeURIComponent(buildMailtoBody(file));
  window.location.href = `mailto:dev@nukrax.com?subject=${subject}&body=${body}`;

  return { ok: true, submission };
}
