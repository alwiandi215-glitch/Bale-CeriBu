import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { ok, handle, requirePermission } from "@/lib/api"
import { screeningDraftSchema } from "@/lib/validation"
import { answeredCount } from "@/lib/epds"

export const runtime = "nodejs"

// POST /api/screenings/draft — Modul 4: auto-save jawaban parsial.
// Idempotent per (patient, screeningId opsional). Mengembalikan id draft.
export function POST(req: NextRequest) {
  return handle(async () => {
    const auth = await requirePermission("screening:write")
    const body = await req.json()
    const { patientId, answers } = screeningDraftSchema.parse(body)
    const draftId: string | undefined = body.screeningId

    const data = { answers: answers as never, status: "DRAFT" as const }
    const draft = draftId
      ? await prisma.screening.update({ where: { id: draftId }, data })
      : await prisma.screening.create({
          data: { ...data, patientId, screenedById: auth.sub },
        })
    return ok({ id: draft.id, answered: answeredCount(answers), savedAt: new Date().toISOString() })
  })
}
