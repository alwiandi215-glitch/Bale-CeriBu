// ============================================================
// MODUL 4 & 5 — Logika klinis EPDS + rule engine skoring.
// Aturan klinis (Cox dkk., 1987; pedoman skrining perinatal):
//   total 0–9   = LOW (Risiko Rendah)
//   total 10–12 = MEDIUM (Risiko Sedang)
//   total >= 13 = HIGH (Risiko Tinggi)
//   OVERRIDE: jika jawaban item-10 (pikiran menyakiti diri) != "Tidak pernah"
//   (nilai > 0), status menjadi HIGH ALERT terlepas dari total skor.
// ============================================================

export type EpdsOption = { label: string; value: number }
export type EpdsQuestion = { id: number; text: string; options: EpdsOption[] }

export const EPDS_QUESTIONS: EpdsQuestion[] = [
  {
    id: 1,
    text: "Saya mampu tertawa dan melihat sisi lucu dari berbagai hal",
    options: [
      { label: "Sebanyak yang selalu saya bisa", value: 0 },
      { label: "Tidak terlalu banyak sekarang", value: 1 },
      { label: "Jelas tidak sebanyak sekarang", value: 2 },
      { label: "Tidak sama sekali", value: 3 },
    ],
  },
  {
    id: 2,
    text: "Saya menanti-nantikan berbagai hal dengan rasa senang",
    options: [
      { label: "Sebanyak biasanya", value: 0 },
      { label: "Agak berkurang dari biasanya", value: 1 },
      { label: "Jelas berkurang dari biasanya", value: 2 },
      { label: "Hampir tidak sama sekali", value: 3 },
    ],
  },
  {
    id: 3,
    text: "Saya menyalahkan diri sendiri secara tidak perlu ketika ada yang salah",
    options: [
      { label: "Ya, hampir selalu", value: 3 },
      { label: "Ya, kadang-kadang", value: 2 },
      { label: "Tidak terlalu sering", value: 1 },
      { label: "Tidak pernah", value: 0 },
    ],
  },
  {
    id: 4,
    text: "Saya merasa cemas atau khawatir tanpa alasan yang jelas",
    options: [
      { label: "Tidak sama sekali", value: 0 },
      { label: "Hampir tidak pernah", value: 1 },
      { label: "Ya, kadang-kadang", value: 2 },
      { label: "Ya, sangat sering", value: 3 },
    ],
  },
  {
    id: 5,
    text: "Saya merasa takut atau panik tanpa alasan yang jelas",
    options: [
      { label: "Ya, cukup sering", value: 3 },
      { label: "Ya, kadang-kadang", value: 2 },
      { label: "Tidak, tidak terlalu", value: 1 },
      { label: "Tidak sama sekali", value: 0 },
    ],
  },
  {
    id: 6,
    text: "Berbagai hal terasa membebani saya",
    options: [
      { label: "Ya, sebagian besar saya tidak mampu mengatasinya", value: 3 },
      { label: "Ya, kadang saya kurang mampu mengatasinya", value: 2 },
      { label: "Tidak, sebagian besar saya mampu mengatasinya", value: 1 },
      { label: "Tidak, saya mengatasinya seperti biasa", value: 0 },
    ],
  },
  {
    id: 7,
    text: "Saya merasa tidak bahagia sehingga sulit tidur",
    options: [
      { label: "Ya, hampir sepanjang waktu", value: 3 },
      { label: "Ya, kadang-kadang", value: 2 },
      { label: "Tidak terlalu sering", value: 1 },
      { label: "Tidak sama sekali", value: 0 },
    ],
  },
  {
    id: 8,
    text: "Saya merasa sedih atau susah",
    options: [
      { label: "Ya, hampir sepanjang waktu", value: 3 },
      { label: "Ya, cukup sering", value: 2 },
      { label: "Tidak terlalu sering", value: 1 },
      { label: "Tidak sama sekali", value: 0 },
    ],
  },
  {
    id: 9,
    text: "Saya merasa tidak bahagia sehingga sampai menangis",
    options: [
      { label: "Ya, hampir sepanjang waktu", value: 3 },
      { label: "Ya, cukup sering", value: 2 },
      { label: "Hanya sesekali", value: 1 },
      { label: "Tidak pernah", value: 0 },
    ],
  },
  {
    id: 10,
    text: "Muncul pikiran untuk menyakiti diri sendiri",
    options: [
      { label: "Ya, cukup sering", value: 3 },
      { label: "Kadang-kadang", value: 2 },
      { label: "Hampir tidak pernah", value: 1 },
      { label: "Tidak pernah", value: 0 },
    ],
  },
]

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH"

export type EpdsResult = {
  total: number
  riskLevel: RiskLevel
  highAlert: boolean
  item10Score: number
  label: string
}

export const EPDS_MAX_SCORE = 30
export const EPDS_ITEM_COUNT = 10

export function classifyByScore(total: number): RiskLevel {
  if (total >= 13) return "HIGH"
  if (total >= 10) return "MEDIUM"
  return "LOW"
}

export function riskLabel(level: RiskLevel): string {
  switch (level) {
    case "HIGH":
      return "Risiko Tinggi"
    case "MEDIUM":
      return "Risiko Sedang"
    default:
      return "Risiko Rendah"
  }
}

// Validasi satu jawaban: integer 0..3.
export function isValidAnswer(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= 0 && v <= 3
}

// answers: array 10 nilai 0–3 (urut item 1..10).
export function evaluateEpds(answers: number[]): EpdsResult {
  if (answers.length !== EPDS_ITEM_COUNT) {
    throw new Error("EPDS membutuhkan tepat 10 jawaban")
  }
  for (const a of answers) {
    if (!isValidAnswer(a)) throw new Error("Nilai jawaban EPDS harus 0–3")
  }
  const total = answers.reduce((a, b) => a + b, 0)
  const item10Score = answers[9] ?? 0
  const highAlert = item10Score > 0
  const riskLevel: RiskLevel = highAlert ? "HIGH" : classifyByScore(total)
  return { total, riskLevel, highAlert, item10Score, label: riskLabel(riskLevel) }
}

// Hitung progres auto-save (jumlah item terjawab) dari array yang boleh berisi null.
export function answeredCount(answers: Array<number | null>): number {
  return answers.filter((a) => a !== null && a !== undefined).length
}
