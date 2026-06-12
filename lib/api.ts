// ============================================================
// Helper request/response untuk Route Handlers (REST API).
// Standarisasi format sukses/galat, auth guard, RBAC guard,
// dan penanganan error Zod/Prisma terpusat.
// ============================================================
import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { prisma } from "./prisma"
import { readSessionToken, verifyToken, type JwtPayload } from "./auth"
import { can, type Permission } from "./rbac"

export type ApiError = { code: string; message: string; details?: unknown }

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, init)
}

export function created<T>(data: T) {
  return NextResponse.json({ success: true, data }, { status: 201 })
}

export function fail(status: number, error: ApiError) {
  return NextResponse.json({ success: false, error }, { status })
}

export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string, public details?: unknown) {
    super(message)
  }
}

// Bungkus handler untuk menangkap error umum secara konsisten.
export function handle(fn: () => Promise<Response>): Promise<Response> {
  return fn().catch((err) => {
    if (err instanceof HttpError) {
      return fail(err.status, { code: err.code, message: err.message, details: err.details })
    }
    if (err instanceof ZodError) {
      return fail(422, { code: "VALIDATION_ERROR", message: "Input tidak valid", details: err.flatten() })
    }
    // Prisma known errors
    const code = (err as { code?: string })?.code
    if (code === "P2002") {
      return fail(409, { code: "CONFLICT", message: "Data sudah ada (unik dilanggar)" })
    }
    if (code === "P2025") {
      return fail(404, { code: "NOT_FOUND", message: "Data tidak ditemukan" })
    }
    console.error("[API_ERROR]", err)
    return fail(500, { code: "INTERNAL", message: "Terjadi kesalahan internal" })
  })
}

// Ambil user terautentikasi dari cookie + cek sesi belum direvoke.
export async function getAuth(): Promise<JwtPayload> {
  const token = await readSessionToken()
  if (!token) throw new HttpError(401, "UNAUTHENTICATED", "Sesi tidak ditemukan, silakan login")
  const payload = await verifyToken(token)
  if (!payload) throw new HttpError(401, "UNAUTHENTICATED", "Sesi tidak valid atau kedaluwarsa")
  const session = await prisma.session.findUnique({ where: { tokenId: payload.jti } })
  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    throw new HttpError(401, "UNAUTHENTICATED", "Sesi telah berakhir")
  }
  return payload
}

// Pastikan user punya permission tertentu.
export async function requirePermission(permission: Permission): Promise<JwtPayload> {
  const auth = await getAuth()
  if (!can(auth.role, permission)) {
    throw new HttpError(403, "FORBIDDEN", "Anda tidak memiliki izin untuk tindakan ini")
  }
  return auth
}

// Parse query pagination standar.
export function parsePagination(url: string) {
  const { searchParams } = new URL(url)
  const page = Math.max(1, Number(searchParams.get("page") ?? 1))
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? 20)))
  const q = searchParams.get("q") ?? undefined
  return { page, pageSize, q, skip: (page - 1) * pageSize, take: pageSize }
}
