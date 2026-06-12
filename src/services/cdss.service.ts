import { supabase } from '@/lib/supabase';
import { resolveCdss } from '@/features/cdss/resolveCdss';
import type { CdssRule, CdssContext } from '@/features/cdss/cdss.types';

export const cdssService = {
  async loadRules(): Promise<CdssRule[]> {
    const { data, error } = await supabase
      .from('cdss_rules')
      .select('*, cdss_actions(*)')
      .eq('is_active', true)
      .order('priority');
    if (error) throw new Error(error.message);
    return (data ?? []).map((r: any) => ({
      ...r,
      conditions: r.conditions ?? [],
      actions: (r.cdss_actions ?? []).map((a: any) => ({
        type: a.type,
        label: a.label,
        target: a.target,
        priority: a.priority,
        meta: a.meta,
      })),
    })) as CdssRule[];
  },

  async recommend(screeningId: string, ctx: CdssContext) {
    const rules = await this.loadRules();
    const result = resolveCdss(rules, ctx);
    const { error } = await supabase.from('cdss_recommendations').insert({
      screening_id: screeningId,
      matched_rule_ids: result.matchedRuleIds,
      actions: result.actions,
    });
    if (error) throw new Error(error.message);
    return result;
  },

  upsertRule: (rule: Partial<CdssRule>) =>
    supabase.from('cdss_rules').upsert(rule).select().single(),
  toggleRule: (id: string, active: boolean) =>
    supabase.from('cdss_rules').update({ is_active: active }).eq('id', id),
};
