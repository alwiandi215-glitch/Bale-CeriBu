import { describe, it, expect } from 'vitest';
import { totalScore, interpret, needsEws } from '@/features/epds/epds.schema';

describe('EPDS scoring', () => {
  const ans = (v: number) =>
    Object.fromEntries(Array.from({ length: 10 }, (_, i) => [`q${i + 1}`, v])) as any;
  it('menjumlahkan 10 item (maks 30)', () => {
    expect(totalScore(ans(3))).toBe(30);
    expect(totalScore(ans(0))).toBe(0);
  });
  it('interpretasi ambang', () => {
    expect(interpret(8).level).toBe('rendah');
    expect(interpret(11).level).toBe('sedang');
    expect(interpret(13).level).toBe('tinggi');
  });
  it('EWS oleh Q10>0', () => {
    const a = { ...ans(0), q10: 1 };
    expect(needsEws(a, totalScore(a))).toBe(true);
  });
  it('EWS oleh skor>=13', () => {
    expect(needsEws(ans(0), 13)).toBe(true);
  });
});
