"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Header from "@/components/Header"
import RiskBadge from "@/components/RiskBadge"
import { api } from "@/lib/http"
import { EPDS_QUESTIONS } from "@/lib/epds"

type Patient = { id: string; fullName: string; mrn: string }
type Answers = Array<number | null>

export default function ScreeningPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientId, setPatientId] = useState("")
  const [answers, setAnswers] = useState<Answers>(Array(10).fill(null))
  const [draftId, setDraftId] = useState<string | undefined>()
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [result, setResult] = useState<null | { result: { total: number; riskLevel: string; highAlert: boolean; label: string }; cdss: { summary: string; actions: string[]; urgency: string } }>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    api.get<{ items: Patient[] }>("/api/patients?pageSize=100").then((d) => setPatients(d.items)).catch(() => {})
  }, [])

  const answered = useMemo(() => answers.filter((a) => a !== null).length, [answers])

  // Auto-save debounce 1.2s setiap perubahan jawaban.
  function setAnswer(idx: number, value: number) {
    const next = [...answers]
    next[idx] = value
    setAnswers(next)
    if (!patientId) return
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await api.post<{ id: string; savedAt: string }>("/api/screenings/draft", { patientId, answers: next, screeningId: draftId })
        setDraftId(res.id)
        setSavedAt(res.savedAt)
      } catch { /* diam: auto-save best-effort */ }
    }, 1200)
  }

  async function submit() {
    if (answers.some((a) => a === null)) return
    const res = await api.post<typeof result>("/api/screenings", { patientId, answers })
    setResult(res)
  }

  return (
    <>
      <Header title="Skrining EPDS Digital" />
      <main className="flex-1 space-y-5 p-5">
        <div className="surface flex flex-wrap items-center gap-3 rounded-xl p-4">
          <label className="text-sm font-medium">Pasien</label>
          <select className="input max-w-xs" value={patientId} onChange={(e) => { setPatientId(e.target.value); setDraftId(undefined); setResult(null) }}>
            <option value="">Pilih pasien…</option>
            {patients.map((p) => <option key={p.id} value={p.id}>{p.fullName} ({p.mrn})</option>)}
          </select>
          <span className="text-muted text-sm">Terjawab {answered}/10</span>
          {savedAt ? <span className="text-risk-low text-xs">✓ Tersimpan otomatis {new Date(savedAt).toLocaleTimeString("id-ID")}</span> : null}
        </div>

        {result ? (
          <div className="surface space-y-3 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">Skor: {result.result.total}/30</h2>
              <RiskBadge level={result.result.riskLevel} highAlert={result.result.highAlert} />
            </div>
            <p className="text-muted">{result.cdss.summary}</p>
            <div>
              <p className="mb-1 text-sm font-semibold">Rekomendasi tindakan (urgensi: {result.cdss.urgency}):</p>
              <ul className="list-inside list-disc text-sm">
                {result.cdss.actions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </div>
            <button className="btn-primary" onClick={() => { setAnswers(Array(10).fill(null)); setResult(null); setDraftId(undefined); setSavedAt(null) }}>Skrining baru</button>
          </div>
        ) : (
          <div className="space-y-3">
            {EPDS_QUESTIONS.map((q, idx) => (
              <div key={idx} className="surface rounded-xl p-4">
                <p className="mb-2 text-sm font-medium">{idx + 1}. {q.text}</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {q.options.map((opt, oi) => (
                    <label key={oi} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${answers[idx] === opt.value ? "border-brand bg-brand-subtle" : "border-[var(--border)]"}`}>
                      <input type="radio" name={`q${idx}`} checked={answers[idx] === opt.value} onChange={() => setAnswer(idx, opt.value)} />
                      {opt.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
            <button className="btn-primary" disabled={!patientId || answered < 10} onClick={submit}>
              Hitung skor &amp; rekomendasi CDSS
            </button>
          </div>
        )}
      </main>
    </>
  )
}
