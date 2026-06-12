import { useFieldArray, useForm } from 'react-hook-form';
import { cdssService } from '@/services/cdss.service';
import toast from 'react-hot-toast';
import type { CdssRule } from '../cdss.types';

const FIELDS = ['total_score', 'risk_level', 'q10', 'phase', 'age', 'gestational_week', 'has_prev_depression'];
const OPS = ['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'between', 'in'];

export function RuleBuilder({ initial }: { initial?: Partial<CdssRule> }) {
  const { register, control, handleSubmit } = useForm<CdssRule>({
    defaultValues: initial ?? { match: 'all', priority: 10, is_active: true, conditions: [], actions: [] },
  });
  const conds = useFieldArray({ control, name: 'conditions' });
  useFieldArray({ control, name: 'actions' });

  async function onSubmit(values: CdssRule) {
    const { error } = await cdssService.upsertRule(values);
    if (error) return toast.error(error.message);
    toast.success('Aturan CDSS disimpan');
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-3xl">
      <input {...register('name')} placeholder="Nama aturan" className="w-full rounded-xl border px-3 py-2" />
      <div className="flex gap-3">
        <select {...register('match')} className="rounded-xl border px-3 py-2">
          <option value="all">Semua kondisi (AND)</option>
          <option value="any">Salah satu (OR)</option>
        </select>
        <input type="number" {...register('priority')} placeholder="Prioritas" className="w-28 rounded-xl border px-3 py-2" />
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register('stop_on_match')} /> Stop on match
        </label>
      </div>

      <div className="space-y-2">
        <p className="font-medium">Kondisi</p>
        {conds.fields.map((f, i) => (
          <div key={f.id} className="flex gap-2">
            <select {...register(`conditions.${i}.field`)} className="rounded-lg border px-2 py-1">
              {FIELDS.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <select {...register(`conditions.${i}.operator`)} className="rounded-lg border px-2 py-1">
              {OPS.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
            <input {...register(`conditions.${i}.value`)} placeholder="nilai" className="rounded-lg border px-2 py-1" />
            <button type="button" onClick={() => conds.remove(i)} className="text-red-500">
              ×
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => conds.append({ field: 'risk_level', operator: 'eq', value: '' } as any)}
          className="text-emerald-600 text-sm"
        >
          + Tambah kondisi
        </button>
      </div>

      {/* Aksi (intervention / referral / education / visit_schedule / notify) mengikuti pola di atas */}
      <button type="submit" className="rounded-xl bg-emerald-600 text-white px-5 py-2.5">
        Simpan Aturan
      </button>
    </form>
  );
}
