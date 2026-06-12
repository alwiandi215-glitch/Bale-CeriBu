// ============================================================
// Skema validasi (Zod) dipakai bersama oleh API & form.
// ============================================================
import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
})

export const roleEnum = z.enum([
  "SUPER_ADMIN", "ADMIN_FASKES", "DOKTER", "BIDAN", "KADER", "PETUGAS_DINAS", "IBU",
])

// Skrining mandiri oleh Ibu (tanpa patientId; diturunkan dari akun login).
// finalize=false => simpan DRAFT (auto-save); finalize=true => skoring + CDSS.
export const selfScreeningSchema = z.object({
  answers: z.array(z.union([z.number().int().min(0).max(3), z.null()])).length(10),
  finalize: z.boolean().default(false),
})

export const createUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  password: z.string().min(8),
  role: roleEnum,
  phone: z.string().optional(),
  facilityId: z.string().optional(),
})

export const updateUserSchema = createUserSchema.partial().extend({
  status: z.enum(["ACTIVE", "INACTIVE", "LOCKED"]).optional(),
})

export const patientSchema = z.object({
  mrn: z.string().min(1),
  nik: z.string().length(16).optional().or(z.literal("").transform(() => undefined)),
  fullName: z.string().min(2),
  birthDate: z.coerce.date().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  district: z.string().optional(),
  city: z.string().optional(),
  status: z.enum(["PREGNANT", "POSTPARTUM", "INACTIVE"]).default("PREGNANT"),
  gestationalAge: z.coerce.number().int().min(0).max(45).optional(),
  expectedDelivery: z.coerce.date().optional(),
  deliveryDate: z.coerce.date().optional(),
  facilityId: z.string().optional(),
  bpjsNumber: z.string().optional(),
  consentGiven: z.boolean().default(false),
})

// Auto-save: jawaban boleh sebagian (null untuk yang belum dijawab).
export const screeningDraftSchema = z.object({
  patientId: z.string().min(1),
  answers: z.array(z.union([z.number().int().min(0).max(3), z.null()])).length(10),
})

export const screeningSubmitSchema = z.object({
  patientId: z.string().min(1),
  answers: z.array(z.number().int().min(0).max(3)).length(10),
})

export const interventionSchema = z.object({
  patientId: z.string().min(1),
  screeningId: z.string().optional(),
  type: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  assignedToId: z.string().optional(),
  dueDate: z.coerce.date().optional(),
})

export const referralSchema = z.object({
  patientId: z.string().min(1),
  screeningId: z.string().optional(),
  destinationFacilityId: z.string().optional(),
  reason: z.string().min(1),
  urgent: z.boolean().default(false),
})

export const reminderSchema = z.object({
  patientId: z.string().min(1),
  channel: z.enum(["WHATSAPP", "SMS", "EMAIL", "IN_APP"]).default("WHATSAPP"),
  title: z.string().min(1),
  message: z.string().min(1),
  scheduledAt: z.coerce.date(),
})

export const settingSchema = z.object({
  key: z.string().min(1),
  value: z.any(),
  category: z.string().default("general"),
})
