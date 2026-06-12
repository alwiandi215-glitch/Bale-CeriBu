import { z } from 'zod';

export const epdsAnswersSchema = z.object(
  Object.fromEntries(
    Array.from({ length: 10 }, (_, i) => [`q${i + 1}`, z.number().int().min(0).max(3)]),
  ),
) as z.ZodObject<Record<string, z.ZodNumber>>;

export type EpdsAnswers = Record<`q${number}`, number>;

export function interpret(score: number): { level: 'rendah' | 'sedang' | 'tinggi'; label: string } {
  if (score >= 13) return { level: 'tinggi', label: 'Risiko tinggi depresi — rujukan & evaluasi klinis' };
  if (score >= 10) return { level: 'sedang', label: 'Kemungkinan depresi — evaluasi lanjutan' };
  return { level: 'rendah', label: 'Risiko rendah — pemantauan rutin' };
}

export function needsEws(answers: EpdsAnswers, score: number): boolean {
  return score >= 13 || (answers.q10 ?? 0) > 0;
}

export const totalScore = (a: EpdsAnswers) =>
  Array.from({ length: 10 }, (_, i) => a[`q${i + 1}` as keyof EpdsAnswers] ?? 0).reduce(
    (s, v) => s + v,
    0,
  );
