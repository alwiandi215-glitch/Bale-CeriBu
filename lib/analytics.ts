// ============================================================
// MODUL 11 — Agregasi analitik dipakai oleh dashboard & laporan.
// ============================================================
import { prisma } from "./prisma"

export type AnalyticsSummary = {
  totalPatients: number
  totalScreenings: number
  riskDistribution: { LOW: number; MEDIUM: number; HIGH: number }
  openHighAlerts: number
  followUpCompliancePct: number
  referralClosedLoopPct: number
  recentActivities: Array<{ type: string; message: string; createdAt: Date }>
}

export async function getAnalyticsSummary(facilityId?: string | null): Promise<AnalyticsSummary> {
  const patientWhere = facilityId ? { facilityId } : {}
  const screeningWhere = facilityId ? { patient: { facilityId } } : {}

  const [totalPatients, totalScreenings, low, medium, high, openHighAlerts, interventionsTotal, interventionsDone, referralsTotal, referralsClosed, recentActivities] =
    await Promise.all([
      prisma.patient.count({ where: patientWhere }),
      prisma.screening.count({ where: { ...screeningWhere, status: { not: "DRAFT" } } }),
      prisma.screening.count({ where: { ...screeningWhere, riskLevel: "LOW" } }),
      prisma.screening.count({ where: { ...screeningWhere, riskLevel: "MEDIUM" } }),
      prisma.screening.count({ where: { ...screeningWhere, riskLevel: "HIGH" } }),
      prisma.screening.count({ where: { ...screeningWhere, highAlert: true, status: { not: "REVIEWED" } } }),
      prisma.intervention.count({}),
      prisma.intervention.count({ where: { status: "COMPLETED" } }),
      prisma.referral.count({}),
      prisma.referral.count({ where: { status: "CLOSED" } }),
      prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { type: true, message: true, createdAt: true } }),
    ])

  return {
    totalPatients,
    totalScreenings,
    riskDistribution: { LOW: low, MEDIUM: medium, HIGH: high },
    openHighAlerts,
    followUpCompliancePct: interventionsTotal ? Math.round((interventionsDone / interventionsTotal) * 100) : 0,
    referralClosedLoopPct: referralsTotal ? Math.round((referralsClosed / referralsTotal) * 100) : 0,
    recentActivities,
  }
}
