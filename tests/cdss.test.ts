import { describe, it, expect } from "vitest"
import { runCdss, followUpDeadline } from "@/lib/cdss"
import { evaluateEpds } from "@/lib/epds"

describe("CDSS rule engine", () => {
  it("risiko rendah -> rutin, tanpa rujukan", () => {
    const c = runCdss(evaluateEpds(Array(10).fill(0)))
    expect(c.urgency).toBe("ROUTINE")
    expect(c.referralRequired).toBe(false)
  })

  it("risiko sedang -> prioritas", () => {
    const answers = [2, 2, 2, 1, 1, 1, 1, 0, 0, 0] // total 10 => MEDIUM
    const c = runCdss(evaluateEpds(answers))
    expect(c.urgency).toBe("PRIORITY")
  })

  it("risiko tinggi -> wajib rujukan", () => {
    const c = runCdss(evaluateEpds(Array(10).fill(2))) // total 20 => HIGH
    expect(c.referralRequired).toBe(true)
  })

  it("HIGH ALERT -> darurat, rujukan mendesak, SLA 24 jam", () => {
    const answers = Array(10).fill(0)
    answers[9] = 2
    const c = runCdss(evaluateEpds(answers))
    expect(c.urgency).toBe("EMERGENCY")
    expect(c.referralRequired).toBe(true)
    expect(c.followUpSlaHours).toBe(24)
    expect(c.actions.join(" ")).toMatch(/keselamatan|krisis|segera/i)
  })

  it("followUpDeadline menambah jam dengan benar", () => {
    const from = new Date("2026-01-01T00:00:00.000Z")
    const due = followUpDeadline(from, 24)
    expect(due.toISOString()).toBe("2026-01-02T00:00:00.000Z")
  })
})
