import { describe, it, expect } from "vitest"
import { evaluateEpds, classifyByScore, isValidAnswer, answeredCount, EPDS_QUESTIONS, EPDS_MAX_SCORE } from "@/lib/epds"

describe("EPDS scoring engine", () => {
  it("memiliki 10 pertanyaan dengan 4 opsi masing-masing", () => {
    expect(EPDS_QUESTIONS).toHaveLength(10)
    for (const q of EPDS_QUESTIONS) expect(q.options).toHaveLength(4)
  })

  it("skor minimum 0 = risiko rendah", () => {
    const r = evaluateEpds(Array(10).fill(0))
    expect(r.total).toBe(0)
    expect(r.riskLevel).toBe("LOW")
    expect(r.highAlert).toBe(false)
  })

  it("klasifikasi ambang batas benar (0-9 LOW, 10-12 MEDIUM, >=13 HIGH)", () => {
    expect(classifyByScore(9)).toBe("LOW")
    expect(classifyByScore(10)).toBe("MEDIUM")
    expect(classifyByScore(12)).toBe("MEDIUM")
    expect(classifyByScore(13)).toBe("HIGH")
  })

  it("menandai HIGH ALERT jika item-10 (indeks 9) > 0", () => {
    const answers = Array(10).fill(0)
    answers[9] = 1
    const r = evaluateEpds(answers)
    expect(r.item10Score).toBe(1)
    expect(r.highAlert).toBe(true)
  })

  it("skor maksimum = 30", () => {
    const r = evaluateEpds(Array(10).fill(3))
    expect(r.total).toBe(EPDS_MAX_SCORE)
    expect(r.riskLevel).toBe("HIGH")
  })

  it("validasi jawaban hanya menerima 0..3", () => {
    expect(isValidAnswer(0)).toBe(true)
    expect(isValidAnswer(3)).toBe(true)
    expect(isValidAnswer(4)).toBe(false)
    expect(isValidAnswer(-1)).toBe(false)
  })

  it("answeredCount mengabaikan null (auto-save parsial)", () => {
    expect(answeredCount([0, 1, null, null, 2, null, null, null, null, null])).toBe(3)
  })
})
