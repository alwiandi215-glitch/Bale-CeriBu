"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { EPDS_QUESTIONS } from "@/lib/epds"
import { api } from "@/lib/http"

type Answers = Array<number | null>
type Me = { draft: { id: string } | null }
type FinalizeResult = {
  result: { total: number; riskLevel: "LOW" | "MEDIUM" | "HIGH"; highAlert: boolean; label: string }
  cdss: { summary: string; urgency: string; educationSlugs: string[] }
}

const RISK_CLASS: Record<string, string> = { LOW: "text-risk-low", MEDIUM: "text-risk-medium", HIGH: "text-risk-high" }

export default function PortalScreening() {
  const [answers, setAnswers] = useState<Answers>(Array(10).fill(null))
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle")
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<FinalizeResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Muat draft yang sedang berjalan (bila ada) cukup untuk menandai progres.
  useEffect(() => {
    api.get<Me>("/api/me").catch(() => {})
  }, [])

  const autosave = useCallback((next: Answers) => {
    if (timer.current) clearTimeout(timer.current)
    setSaveState("saving")
    timer.current = setTimeout(async () => {
      try {
        await api.post("/api/me/screenings", { answers: next, finalize: false })
        setSaveState("saved")
      } catch {
        setSaveState("idle")
      }
    }, 1200)
  }, [])

  function setAnswer(idx: number, value: number) {
    setAnswers((prev) => {
      const next = [...prev]
      next[idx] = value
      autosave(next)
      return next
    })
  }

  const answered = answers.filter((a) => a !== null).length
  const complete = answered === 10

  async function submit() {
    setError(null)
    setSubmitting(true)
    try {
      const res = await api.post<FinalizeResult>("/api/me/screenings", { answers, finalize: true })
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal mengirim skrining")
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    const r = result.result
    return (
      <div className="space-y-4">
        <div className="surface rounded-xl p-6 text-center">
          <p className="text-muted text-sm">Hasil skrining Anda</p>
          <p className={`mt-1 text-3xl font-bold ${RISK_CLASS[r.riskLevel]}`}>{r.label}</p>
          <p className="text-muted mt-1 text-sm">Skor total {r.total} dari 30</p>
        </div>
        {r.highAlert ? (
          <div className="rounded-xl border border-risk-high bg-risk-high/10 p-4 text-sm">
            Jawaban Anda menunjukkan perlunya perhatian segera. Tenaga kesehatan Anda telah diberi tahu. Jika Anda merasa ingin menyakiti diri sendiri, segera hubungi petugas faskes atau layanan darurat 112. Anda tidak sendirian.
          </div>
        ) : (
          <div className="surface rounded-xl p-4 text-sm">
            Terima kasih telah mengisi skrining. Bidan/perawat Anda akan meninjau hasil ini dan menindaklanjuti bila diperlukan. Tetap jaga kesehatan dan jangan ragu mencari dukungan.
          </div>
        )}
        <a href="/portal" className="btn-primary inline-block">Kembali ke beranda</a>
        <p className="text-muted text-xs">EPDS adalah alat bantu skrining, bukan diagnosis medis.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Skrining EPDS</h1>
        <p className="text-muted text-sm">
          Edinburgh Postnatal Depression Scale. Jawablah sesuai perasaan Anda dalam 7 hari terakhir (bukan hanya hari ini). Jawaban tersimpan otomatis.
        </p>
      </div>

      <div className="surface sticky top-[104px] z-10 flex items-center justify-between rounded-xl p-3 text-sm">
        <span>Terjawab {answered}/10</span>
        <span className="text-muted">
          {saveState === "saving" ? "Menyimpan..." : saveState === "saved" ? "Tersimpan otomatis" : ""}
        </span>
      </div>

      {EPDS_QUESTIONS.map((q, idx) => (
        <div key={idx} className="surface rounded-xl p-4">
          <p className="mb-2 text-sm font-medium">{idx + 1}. {q.text}</p>
          <div className="grid gap-2">
            {q.options.map((opt, oi) => (
              <label key={oi} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${answers[idx] === opt.value ? "border-brand bg-brand-subtle" : "border-[var(--border)]"}`}>
                <input type="radio" name={`q${idx}`} checked={answers[idx] === opt.value} onChange={() => setAnswer(idx, opt.value)} />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      ))}

      {error ? <p className="text-sm text-risk-high">{error}</p> : null}

      <button onClick={submit} disabled={!complete || submitting} className="btn-primary w-full disabled:opacity-50">
        {submitting ? "Mengirim..." : complete ? "Kirim skrining" : `Lengkapi semua pertanyaan (${answered}/10)`}
      </button>
    </div>
  )
}
