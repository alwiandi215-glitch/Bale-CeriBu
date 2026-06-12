export type CdssOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in';
export type CdssField =
  | 'total_score'
  | 'risk_level'
  | 'q10'
  | 'phase'
  | 'age'
  | 'gestational_week'
  | 'has_prev_depression';

export interface CdssCondition {
  field: CdssField;
  operator: CdssOperator;
  value: string | number | boolean | Array<string | number>;
}

export interface CdssActionDef {
  type: 'intervention' | 'referral' | 'education' | 'visit_schedule' | 'notify';
  label: string;
  target?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  meta?: Record<string, unknown>;
}

export interface CdssRule {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  priority: number;
  match: 'all' | 'any';
  conditions: CdssCondition[];
  actions: CdssActionDef[];
  stop_on_match: boolean;
}

export interface CdssContext {
  total_score: number;
  risk_level: 'rendah' | 'sedang' | 'tinggi';
  q10: number;
  phase: 'antenatal' | 'postpartum';
  age?: number;
  gestational_week?: number;
  has_prev_depression?: boolean;
}
