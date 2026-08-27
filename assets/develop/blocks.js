// ═══════════════════════════════════════════════════════════════════════
// NUKRAX — assets/develop/blocks.js
// The reusable block palette for both workspaces. Each block: name, icon,
// category, color (visual identity), description, and configurable fields
// (rendered generically by canvas.js — adding a field here needs no
// canvas.js changes). One registry per workspace type; develop/ea.html and
// develop/automation.html each import only the one they need.
// ═══════════════════════════════════════════════════════════════════════

function field(key, label, type, opts = {}) {
  return { key, label, type, ...opts };
}

export const EA_BLOCKS = Object.freeze([
  { id: 'entry', name: 'Entry', category: 'Trade Logic', color: '#7FBF8F', description: 'Defines the condition(s) that open a new position.',
    fields: [field('direction', 'Direction', 'select', { options: ['Buy', 'Sell', 'Both'] }), field('logic', 'Entry logic notes', 'textarea')] },
  { id: 'exit', name: 'Exit', category: 'Trade Logic', color: '#D9667A', description: 'Defines the condition(s) that close an open position.',
    fields: [field('logic', 'Exit logic notes', 'textarea')] },
  { id: 'tp', name: 'Take Profit', category: 'Trade Logic', color: '#8FB8C4', description: 'Take-profit placement rule.',
    fields: [field('mode', 'Mode', 'select', { options: ['Fixed pips', 'R-multiple', 'Structure-based'] }), field('value', 'Value', 'text')] },
  { id: 'sl', name: 'Stop Loss', category: 'Trade Logic', color: '#D9A15C', description: 'Stop-loss placement rule.',
    fields: [field('mode', 'Mode', 'select', { options: ['Fixed pips', 'ATR-based', 'Structure-based'] }), field('value', 'Value', 'text')] },
  { id: 'execution', name: 'Execution', category: 'Trade Logic', color: '#7FBF8F', description: 'How and when orders are actually sent.',
    fields: [field('orderType', 'Order type', 'select', { options: ['Market', 'Limit', 'Stop'] })] },
  { id: 'risk', name: 'Risk', category: 'Risk Management', color: '#D9667A', description: 'Overall account risk boundaries.',
    fields: [field('maxRiskPct', 'Max risk per trade (%)', 'text'), field('maxDailyLossPct', 'Max daily loss (%)', 'text')] },
  { id: 'position-size', name: 'Position Size', category: 'Risk Management', color: '#D9A15C', description: 'How lot/contract size is calculated.',
    fields: [field('mode', 'Mode', 'select', { options: ['Fixed lots', '% of equity', 'Risk-based'] }), field('value', 'Value', 'text')] },
  { id: 'trade-management', name: 'Trade Management', category: 'Risk Management', color: '#8FB8C4', description: 'Rules applied to a trade after it opens (trailing, partials, breakeven).',
    fields: [field('logic', 'Management notes', 'textarea')] },
  { id: 'condition', name: 'Condition', category: 'Logic', color: '#8FB8C4', description: 'A boolean gate other blocks connect through.',
    fields: [field('expression', 'Condition', 'textarea')] },
  { id: 'indicator', name: 'Indicator', category: 'Logic', color: '#7FBF8F', description: 'A technical indicator feeding a condition.',
    fields: [field('type', 'Indicator', 'text', { placeholder: 'e.g. EMA 200, RSI 14' }), field('params', 'Parameters', 'text')] },
  { id: 'market-filter', name: 'Market Filter', category: 'Filters', color: '#D9A15C', description: 'Restricts trading to certain instruments/conditions.',
    fields: [field('symbols', 'Symbols', 'text', { placeholder: 'e.g. EURUSD, XAUUSD' })] },
  { id: 'time-filter', name: 'Time Filter', category: 'Filters', color: '#D9A15C', description: 'Restricts trading to certain sessions/times.',
    fields: [field('sessions', 'Sessions', 'text', { placeholder: 'e.g. London, New York' })] },
  { id: 'order', name: 'Order', category: 'Execution', color: '#7FBF8F', description: 'A specific order sent to the broker.',
    fields: [field('notes', 'Notes', 'textarea')] },
]);

export const AUTOMATION_BLOCKS = Object.freeze([
  { id: 'trigger', name: 'Trigger', category: 'Flow', color: '#7FBF8F', description: 'What starts this automation.',
    fields: [field('type', 'Trigger type', 'select', { options: ['Schedule', 'Webhook', 'File change', 'Manual'] }), field('value', 'Value', 'text')] },
  { id: 'input', name: 'Input', category: 'Flow', color: '#8FB8C4', description: 'Data coming into the automation.',
    fields: [field('source', 'Source', 'text')] },
  { id: 'condition', name: 'Condition', category: 'Logic', color: '#8FB8C4', description: 'A boolean gate.',
    fields: [field('expression', 'Condition', 'textarea')] },
  { id: 'action', name: 'Action', category: 'Flow', color: '#7FBF8F', description: 'Something the automation does.',
    fields: [field('description', 'What it does', 'textarea')] },
  { id: 'delay', name: 'Delay', category: 'Flow', color: '#D9A15C', description: 'Waits before continuing.',
    fields: [field('duration', 'Duration', 'text', { placeholder: 'e.g. 5m, 1h' })] },
  { id: 'api', name: 'API', category: 'Integration', color: '#D9667A', description: 'Calls an external API.',
    fields: [field('endpoint', 'Endpoint', 'text'), field('method', 'Method', 'select', { options: ['GET', 'POST', 'PUT', 'DELETE'] })] },
  { id: 'file', name: 'File', category: 'Integration', color: '#D9667A', description: 'Reads or writes a file.',
    fields: [field('path', 'Path', 'text'), field('mode', 'Mode', 'select', { options: ['Read', 'Write', 'Append'] })] },
  { id: 'data', name: 'Data', category: 'Integration', color: '#8FB8C4', description: 'A data source or store.',
    fields: [field('description', 'Description', 'textarea')] },
  { id: 'transform', name: 'Transform', category: 'Logic', color: '#D9A15C', description: 'Reshapes data from one step for the next.',
    fields: [field('logic', 'Transform logic', 'textarea')] },
  { id: 'output', name: 'Output', category: 'Flow', color: '#7FBF8F', description: 'Where results go.',
    fields: [field('destination', 'Destination', 'text')] },
]);
