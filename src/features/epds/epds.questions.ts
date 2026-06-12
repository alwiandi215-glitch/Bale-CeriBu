export interface EpdsOption {
  label: string;
  value: 0 | 1 | 2 | 3;
}
export interface EpdsQuestion {
  no: number;
  text: string;
  reverse: boolean;
  options: EpdsOption[];
}

const FORWARD = (o: string[]): EpdsOption[] =>
  o.map((label, i) => ({ label, value: i as 0 | 1 | 2 | 3 }));
const REVERSE = (o: string[]): EpdsOption[] =>
  o.map((label, i) => ({ label, value: (3 - i) as 0 | 1 | 2 | 3 }));

export const EPDS_QUESTIONS: EpdsQuestion[] = [
  { no: 1, reverse: false, text: 'Saya mampu tertawa dan melihat sisi lucu dari sesuatu', options: FORWARD(['Sebanyak biasanya', 'Tidak terlalu banyak', 'Jelas tidak sebanyak dulu', 'Tidak sama sekali']) },
  { no: 2, reverse: false, text: 'Saya menantikan sesuatu dengan penuh kegembiraan', options: FORWARD(['Seperti biasanya', 'Agak kurang dari biasanya', 'Jelas kurang dari biasanya', 'Hampir tidak pernah']) },
  { no: 3, reverse: true, text: 'Saya menyalahkan diri sendiri secara tidak perlu ketika ada yang salah', options: REVERSE(['Ya, hampir sepanjang waktu', 'Ya, kadang-kadang', 'Tidak terlalu sering', 'Tidak, tidak pernah']) },
  { no: 4, reverse: false, text: 'Saya merasa cemas atau khawatir tanpa alasan yang jelas', options: FORWARD(['Tidak, sama sekali tidak', 'Hampir tidak pernah', 'Ya, kadang-kadang', 'Ya, sangat sering']) },
  { no: 5, reverse: true, text: 'Saya merasa takut atau panik tanpa alasan yang jelas', options: REVERSE(['Ya, cukup sering', 'Ya, kadang-kadang', 'Tidak, tidak terlalu', 'Tidak, sama sekali tidak']) },
  { no: 6, reverse: true, text: 'Banyak hal terasa menumpuk dan membebani saya', options: REVERSE(['Ya, hampir selalu tidak bisa mengatasinya', 'Ya, kadang sulit mengatasinya', 'Tidak, biasanya bisa mengatasinya', 'Tidak, saya mengatasinya dengan baik']) },
  { no: 7, reverse: true, text: 'Saya merasa sangat tidak bahagia sehingga sulit tidur', options: REVERSE(['Ya, hampir sepanjang waktu', 'Ya, kadang-kadang', 'Tidak terlalu sering', 'Tidak, sama sekali tidak']) },
  { no: 8, reverse: true, text: 'Saya merasa sedih atau susah', options: REVERSE(['Ya, hampir sepanjang waktu', 'Ya, cukup sering', 'Tidak terlalu sering', 'Tidak, sama sekali tidak']) },
  { no: 9, reverse: true, text: 'Saya merasa sangat tidak bahagia sehingga menangis', options: REVERSE(['Ya, hampir sepanjang waktu', 'Ya, cukup sering', 'Hanya sesekali', 'Tidak, sama sekali tidak']) },
  { no: 10, reverse: true, text: 'Pikiran untuk menyakiti diri sendiri pernah muncul', options: REVERSE(['Ya, cukup sering', 'Kadang-kadang', 'Hampir tidak pernah', 'Tidak pernah']) },
];
