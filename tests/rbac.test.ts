import { describe, it, expect } from "vitest"
import { can, ROLE_PERMISSIONS } from "@/lib/rbac"

describe("RBAC", () => {
  it("SUPER_ADMIN punya semua izin termasuk integrasi", () => {
    expect(can("SUPER_ADMIN", "integration:manage")).toBe(true)
    expect(can("SUPER_ADMIN", "user:manage")).toBe(true)
  })

  it("KADER tidak boleh mengelola pengguna atau integrasi", () => {
    expect(can("KADER", "user:manage")).toBe(false)
    expect(can("KADER", "integration:manage")).toBe(false)
    expect(can("KADER", "screening:write")).toBe(true)
  })

  it("PETUGAS_DINAS hanya analitik agregat + ekspor laporan", () => {
    expect(can("PETUGAS_DINAS", "analytics:read")).toBe(true)
    expect(can("PETUGAS_DINAS", "analytics:aggregate_only")).toBe(true)
    expect(can("PETUGAS_DINAS", "patient:read")).toBe(false)
  })

  it("BIDAN tidak boleh me-review skrining (kewenangan klinisi/dokter)", () => {
    expect(can("BIDAN", "screening:write")).toBe(true)
    expect(can("BIDAN", "screening:review")).toBe(false)
    expect(can("DOKTER", "screening:review")).toBe(true)
  })

  it("IBU hanya boleh layanan mandiri, bukan data pasien lain", () => {
    expect(can("IBU", "self:screening")).toBe(true)
    expect(can("IBU", "self:education")).toBe(true)
    expect(can("IBU", "self:monitoring")).toBe(true)
    expect(can("IBU", "patient:read")).toBe(false)
    expect(can("IBU", "screening:read")).toBe(false)
  })

  it("setiap peran terdefinisi", () => {
    expect(Object.keys(ROLE_PERMISSIONS)).toHaveLength(7)
  })
})
