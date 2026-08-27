// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/develop/submissions.js
// Data-access for E.A/Automation project submissions (section 30) —
// same pattern as assets/marketplace/orders.js: one file, one shape,
// nothing else hand-rolls this query. Statuses are real and honest
// (submitted by default) — nothing here ever claims a status the admin
// hasn't actually set via the admin panel.
// ═══════════════════════════════════════════════════════════════════════

import { supabase } from '../auth/auth-widget.js';

export const SUBMISSION_STATUS_LABEL = Object.freeze({
  submitted: 'Submitted',
  under_review: 'Under Review',
  in_development: 'In Development',
  ready_for_payment: 'Ready for Payment',
  payment_confirmed: 'Payment Confirmed',
  ready: 'Ready',
  delivered: 'Delivered',
});

export async function createSubmission({ userId, projectType, projectName, idea, blockCount }) {
  const { data, error } = await supabase
    .from('dev_submissions')
    .insert({
      user_id: userId,
      project_type: projectType,
      project_name: projectName,
      idea: idea || null,
      block_count: blockCount || 0,
    })
    .select()
    .single();
  return { submission: data, error: error?.message };
}

export async function getMySubmissions(userId, limit = 50) {
  if (!userId) return [];
  const { data } = await supabase
    .from('dev_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}
