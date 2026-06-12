import type { CdssRule, CdssCondition, CdssContext, CdssActionDef } from './cdss.types';

function evalCondition(c: CdssCondition, ctx: CdssContext): boolean {
  const actual = (ctx as Record<string, unknown>)[c.field];
  const v = c.value;
  switch (c.operator) {
    case 'eq':
      return actual === v;
    case 'neq':
      return actual !== v;
    case 'gt':
      return Number(actual) > Number(v);
    case 'gte':
      return Number(actual) >= Number(v);
    case 'lt':
      return Number(actual) < Number(v);
    case 'lte':
      return Number(actual) <= Number(v);
    case 'in':
      return Array.isArray(v) && v.includes(actual as never);
    case 'between': {
      const [min, max] = v as [number, number];
      return Number(actual) >= min && Number(actual) <= max;
    }
    default:
      return false;
  }
}

function ruleMatches(rule: CdssRule, ctx: CdssContext): boolean {
  if (!rule.conditions.length) return false;
  return rule.match === 'all'
    ? rule.conditions.every((c) => evalCondition(c, ctx))
    : rule.conditions.some((c) => evalCondition(c, ctx));
}

export interface CdssResult {
  matchedRuleIds: string[];
  actions: CdssActionDef[];
}

export function resolveCdss(rules: CdssRule[], ctx: CdssContext): CdssResult {
  const ordered = [...rules].filter((r) => r.is_active).sort((a, b) => a.priority - b.priority);
  const matchedRuleIds: string[] = [];
  const actions: CdssActionDef[] = [];
  const seen = new Set<string>();
  for (const rule of ordered) {
    if (!ruleMatches(rule, ctx)) continue;
    matchedRuleIds.push(rule.id);
    for (const a of rule.actions) {
      const key = `${a.type}:${a.target ?? a.label}`;
      if (!seen.has(key)) {
        seen.add(key);
        actions.push(a);
      }
    }
    if (rule.stop_on_match) break;
  }
  const rank = { critical: 0, high: 1, medium: 2, low: 3 } as const;
  actions.sort((a, b) => rank[a.priority] - rank[b.priority]);
  return { matchedRuleIds, actions };
}
