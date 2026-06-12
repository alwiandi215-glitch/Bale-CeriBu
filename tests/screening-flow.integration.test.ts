import { describe, it, expect } from "vitest"
import { evaluateEpds } from "@/lib/epds"
import { runCdss, followUpDeadline } from "@/lib/cdss"

// Integration test pada level domain: mensimulasikan alur submit skrining
// (skoring -> klasifikasi -> CDSS -> pembuatan rekomendasi intervensi)
// tanpa bergantung pada database, agar deterministik di CI.
describe("Alur skrining EPDS end-to-end (domain)", () => {
  it("kasus risiko rendah menghasilkan rekomendasi rutin tanpa rujukan", () => {
    const result = evaluateEpds([0, 1, 0, 1, 0, 0, 1, 0, 0, 0])
    const cdss = runCdss(result)
    expect(result.riskLevel).toBe("LOW")
    expect(cdss.referralRequired).toBe(false)
    expect(cdss.suggestedInterventions.length).toBeGreaterThanOrEqual(0)
    expect(cdss.educationSlugs).toContain("pencegahan-baby-blues")
  })

  it("kasus HIGH ALERT menghasilkan intervensi keselamatan + tenggat 24 jam", () => {
    const answers = [3, 3, 2, 2, 2, 1, 1, 1, 1, 2] // tinggi + item10 positif
    const result = evaluateEpds(answers)
    const cdss = runCdss(result)
    const completedAt = new Date("2026-03-01T08:00:00.000Z")
    const due = followUpDeadline(completedAt, cdss.followUpSlaHours)

    expect(result.highAlert).toBe(true)
    expect(cdss.urgency).toBe("EMERGENCY")
    expect(cdss.referralRequired).toBe(true)
    expect(cdss.suggestedInterventions.length).toBeGreaterThan(0)
    expect(due.toISOString()).toBe("2026-03-02T08:00:00.000Z")
  })

  it("payload yang akan dikirim ke SATUSEHAT konsisten dengan hasil skoring", () => {
    const result = evaluateEpds([2, 2, 2, 2, 2, 1, 1, 1, 0, 0])
    expect(result.total).toBe(13)
    expect(result.riskLevel).toBe("HIGH")
  })
})
