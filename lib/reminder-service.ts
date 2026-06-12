// ============================================================
// MODUL 10 — Service monitoring & reminder.
// Memproses antrian reminder terjadwal dan mengirim via gateway.
// Dipanggil oleh endpoint cron (Netlify Scheduled Functions).
// ============================================================
import { prisma } from "./prisma"
import { sendWhatsApp } from "./integrations/whatsapp"

export async function processDueReminders(now: Date = new Date()): Promise<{
  processed: number
  sent: number
  failed: number
}> {
  const due = await prisma.reminder.findMany({
    where: { status: "SCHEDULED", scheduledAt: { lte: now } },
    include: { patient: true },
    take: 100,
  })
  let sent = 0
  let failed = 0
  for (const r of due) {
    if (r.channel !== "WHATSAPP" || !r.patient.phone) {
      // Channel lain / tanpa nomor: tandai terkirim in-app saja.
      await prisma.reminder.update({ where: { id: r.id }, data: { status: "SENT", sentAt: now } })
      sent++
      continue
    }
    const res = await sendWhatsApp({ phone: r.patient.phone, message: r.message, reminderId: r.id })
    if (res.ok) {
      await prisma.reminder.update({
        where: { id: r.id },
        data: { status: "SENT", sentAt: now, externalId: res.externalId },
      })
      sent++
    } else {
      await prisma.reminder.update({
        where: { id: r.id },
        data: { status: "FAILED", error: res.error ?? "unknown" },
      })
      failed++
    }
  }
  return { processed: due.length, sent, failed }
}
