// ============================================================
// MODUL 1/2 — Role-Based Access Control (RBAC).
// Mendefinisikan permission per role dan helper pengecekan.
// ============================================================
import type { Role } from "@prisma/client"

export type Permission =
  | "user:manage"
  | "patient:read"
  | "patient:write"
  | "screening:read"
  | "screening:write"
  | "screening:review"
  | "cdss:read"
  | "education:manage"
  | "intervention:write"
  | "referral:write"
  | "reminder:write"
  | "analytics:read"
  | "analytics:aggregate_only"
  | "report:export"
  | "audit:read"
  | "settings:manage"
  | "integration:manage"
  // Permission self-service untuk Ibu (portal pasien).
  | "self:screening"
  | "self:education"
  | "self:notification"
  | "self:monitoring"

const ALL: Permission[] = [
  "user:manage", "patient:read", "patient:write", "screening:read",
  "screening:write", "screening:review", "cdss:read", "education:manage",
  "intervention:write", "referral:write", "reminder:write", "analytics:read",
  "report:export", "audit:read", "settings:manage", "integration:manage",
]

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: ALL,
  ADMIN_FASKES: [
    "user:manage", "patient:read", "patient:write", "screening:read",
    "screening:write", "screening:review", "cdss:read", "education:manage",
    "intervention:write", "referral:write", "reminder:write", "analytics:read",
    "report:export", "audit:read", "settings:manage",
  ],
  DOKTER: [
    "patient:read", "patient:write", "screening:read", "screening:write",
    "screening:review", "cdss:read", "intervention:write", "referral:write",
    "reminder:write", "analytics:read", "report:export",
  ],
  BIDAN: [
    "patient:read", "patient:write", "screening:read", "screening:write",
    "cdss:read", "intervention:write", "referral:write", "reminder:write",
    "analytics:read", "report:export",
  ],
  KADER: [
    "patient:read", "patient:write", "screening:read", "screening:write",
    "cdss:read",
  ],
  PETUGAS_DINAS: [
    "analytics:read", "analytics:aggregate_only", "report:export",
  ],
  // Ibu Hamil & Postpartum — akun mandiri, hanya data dirinya sendiri.
  IBU: [
    "self:screening", "self:education", "self:notification", "self:monitoring",
  ],
}

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function roleLabel(role: Role): string {
  const map: Record<Role, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN_FASKES: "Admin Faskes",
    DOKTER: "Dokter / Psikolog",
    BIDAN: "Bidan / Perawat",
    KADER: "Kader Kesehatan",
    PETUGAS_DINAS: "Petugas Dinas Kesehatan",
    IBU: "Ibu (Hamil/Postpartum)",
  }
  return map[role] ?? role
}
