import { describe, it, expect } from 'vitest';
import { resolveCdss } from '@/features/cdss/resolveCdss';
import type { CdssRule } from '@/features/cdss/cdss.types';

const rules: CdssRule[] = [
  {
    id: 'r1',
    name: 'self-harm',
    is_active: true,
    priority: 1,
    match: 'any',
    stop_on_match: true,
    description: null,
    conditions: [{ field: 'q10', operator: 'gt', value: 0 }],
    actions: [{ type: 'referral', label: 'Rujuk', priority: 'critical' }],
  },
  {
    id: 'r2',
    name: 'tinggi',
    is_active: true,
    priority: 2,
    match: 'all',
    stop_on_match: false,
    description: null,
    conditions: [{ field: 'risk_level', operator: 'eq', value: 'tinggi' }],
    actions: [{ type: 'intervention', label: 'Konseling', priority: 'high' }],
  },
];

describe('resolveCdss', () => {
  it('stop_on_match', () => {
    const res = resolveCdss(rules, { q10: 2, risk_level: 'tinggi', total_score: 20, phase: 'postpartum' });
    expect(res.matchedRuleIds).toEqual(['r1']);
    expect(res.actions[0].priority).toBe('critical');
  });
  it('tinggi tanpa self-harm', () => {
    const res = resolveCdss(rules, { q10: 0, risk_level: 'tinggi', total_score: 15, phase: 'antenatal' });
    expect(res.matchedRuleIds).toEqual(['r2']);
  });
});
