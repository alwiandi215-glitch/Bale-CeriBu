// ============================================================
// MODUL 6 — Clinical Decision Support System (CDSS) + rule engine.
// Memetakan hasil EPDS menjadi: tingkat urgensi, rekomendasi tindakan,
// kebutuhan rujukan, materi edukasi, dan SLA tindak lanjut.
// Bukan pengganti penilaian klinis; bersifat pendukung keputusan.
// ============================================================

import type { EpdsResult, RiskLevel } from "./epds"

export const CDSS_VERSION = "1.0.0"

export type Urgency = "ROUTINE" | "PRIORITY" | "EMERGENCY"

export type CdssRecommendation = {
  version: string
  urgency: Urgency
  riskLevel: RiskLevel
  highAlert: boolean
  // SLA tindak lanjut dalam jam.
  followUpSlaHours: number
  // Apakah wajib rujukan ke faskes lanjutan.
  referralRequired: boolean
  // Ringkasan keputusan untuk klinisi.
  summary: string
  // Daftar tindakan yang disarankan.
  actions: string[]
  // Slug materi edukasi yang relevan.
  educationSlugs: string[]
  // Tipe intervensi yang disarankan (untuk auto-create draft intervensi).
  suggestedInterventions: Array<{ type: string; title: string }>
}

type Rule = {
  id: string
  when: (r: EpdsResult) => boolean
  apply: (acc: CdssRecommendation, r: EpdsResult) => void
}

// Aturan dievaluasi berurutan; aturan high-alert menimpa keputusan lain.
const RULES: Rule[] = [
  {
    id: "BASE_LOW",
    when: (r) => r.riskLevel === "LOW" && !r.highAlert,
    apply: (acc) => {
      acc.urgency = "ROUTINE"
      acc.followUpSlaHours = 24 * 30 // skrining ulang ~1 bulan
      acc.referralRequired = false
      acc.summary =
        "Risiko rendah. Lanjutkan pemantauan rutin dan psikoedukasi pencegahan."
      acc.actions.push(
        "Berikan psikoedukasi pencegahan & dukungan keluarga",
        "Jadwalkan skrining ulang EPDS pada kunjungan berikutnya",
      )
      acc.educationSlugs.push("pencegahan-baby-blues", "dukungan-keluarga")
    },
  },
  {
    id: "BASE_MEDIUM",
    when: (r) => r.riskLevel === "MEDIUM" && !r.highAlert,
    apply: (acc) => {
      acc.urgency = "PRIORITY"
      acc.followUpSlaHours = 24 * 7 // tindak lanjut dalam 7 hari
      acc.referralRequired = false
      acc.summary =
        "Risiko sedang. Lakukan konseling suportif dan pantau ketat; pertimbangkan rujukan bila tidak membaik."
      acc.actions.push(
        "Lakukan konseling suportif oleh bidan/perawat terlatih",
        "Evaluasi faktor risiko psikososial",
        "Jadwalkan skrining ulang dalam 2 minggu",
      )
      acc.educationSlugs.push("mengelola-kecemasan", "teknik-relaksasi")
      acc.suggestedInterventions.push({
        type: "KONSELING",
        title: "Konseling suportif lanjutan",
      })
    },
  },
  {
    id: "BASE_HIGH",
    when: (r) => r.riskLevel === "HIGH" && !r.highAlert,
    apply: (acc) => {
      acc.urgency = "PRIORITY"
      acc.followUpSlaHours = 48
      acc.referralRequired = true
      acc.summary =
        "Risiko tinggi berdasarkan total skor. Rujuk ke layanan kesehatan jiwa untuk asesmen lanjutan."
      acc.actions.push(
        "Rujuk ke psikolog/psikiater atau poli jiwa faskes lanjutan",
        "Aktifkan rencana tindak lanjut & libatkan keluarga",
      )
      acc.educationSlugs.push("mengenali-depresi-postpartum", "kapan-mencari-bantuan")
      acc.suggestedInterventions.push({
        type: "KUNJUNGAN_RUMAH",
        title: "Kunjungan rumah & asesmen lanjutan",
      })
    },
  },
  {
    id: "HIGH_ALERT_OVERRIDE",
    when: (r) => r.highAlert,
    apply: (acc, r) => {
      acc.urgency = "EMERGENCY"
      acc.followUpSlaHours = 24
      acc.referralRequired = true
      acc.highAlert = true
      acc.summary =
        `HIGH ALERT: indikasi pikiran menyakiti diri (item-10 = ${r.item10Score}). ` +
        "Wajib penanganan segera dan jangan tinggalkan pasien sendirian."
      // High alert menggantikan daftar tindakan agar prioritas keselamatan di atas.
      acc.actions = [
        "JANGAN tinggalkan pasien sendirian; pastikan keselamatan segera",
        "Hubungi dokter/psikiater on-call dan aktifkan protokol krisis",
        "Rujuk segera (urgent) ke faskes lanjutan dengan layanan jiwa",
        "Libatkan keluarga/pendamping dan dokumentasikan rencana keselamatan",
      ]
      acc.educationSlugs = ["rencana-keselamatan", "kapan-mencari-bantuan"]
      acc.suggestedInterventions = [
        { type: "KRISIS", title: "Penanganan krisis & rencana keselamatan" },
      ]
    },
  },
]

export function runCdss(result: EpdsResult): CdssRecommendation {
  const acc: CdssRecommendation = {
    version: CDSS_VERSION,
    urgency: "ROUTINE",
    riskLevel: result.riskLevel,
    highAlert: result.highAlert,
    followUpSlaHours: 24 * 30,
    referralRequired: false,
    summary: "",
    actions: [],
    educationSlugs: [],
    suggestedInterventions: [],
  }
  for (const rule of RULES) {
    if (rule.when(result)) rule.apply(acc, result)
  }
  // Dedup arrays.
  acc.actions = [...new Set(acc.actions)]
  acc.educationSlugs = [...new Set(acc.educationSlugs)]
  return acc
}

// Hitung deadline tindak lanjut dari waktu skrining.
export function followUpDeadline(from: Date, slaHours: number): Date {
  return new Date(from.getTime() + slaHours * 60 * 60 * 1000)
}
