// ============================================================
// MODUL 1 — Autentikasi & keamanan.
// JWT (jose) + bcrypt password hashing + lockout brute-force.
// ============================================================
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { randomUUID } from "node:crypto"
import { cookies } from "next/headers"
import { env } from "./env"
import type { Role } from "@prisma/client"

export const AUTH_COOKIE = "bc_session"
export const MAX_FAILED_LOGINS = 5
export const LOCK_MINUTES = 15

const secret = new TextEncoder().encode(env.JWT_SECRET)

export type JwtPayload = {
  sub: string // user id
  role: Role
  facilityId: string | null
  email: string
  jti: string
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, env.BCRYPT_ROUNDS)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export async function signToken(
  payload: Omit<JwtPayload, "jti">,
): Promise<{ token: string; jti: string; expiresAt: Date }> {
  const jti = randomUUID()
  const token = await new SignJWT({ ...payload, jti })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(env.JWT_EXPIRES_IN)
    .setJti(jti)
    .sign(secret)
  // Hitung expiry untuk disimpan pada Session.
  const { payload: decoded } = await jwtVerify(token, secret)
  const expiresAt = new Date((decoded.exp ?? 0) * 1000)
  return { token, jti, expiresAt }
}

export async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JwtPayload
  } catch {
    return null
  }
}

// Helper cookie (Next.js App Router).
export async function setSessionCookie(token: string, expiresAt: Date) {
  const store = await cookies()
  store.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  })
}

export async function clearSessionCookie() {
  const store = await cookies()
  store.delete(AUTH_COOKIE)
}

export async function readSessionToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(AUTH_COOKIE)?.value ?? null
}
