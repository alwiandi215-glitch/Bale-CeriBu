// ============================================================
// Seed data awal BALE CERIBU.
// Jalankan: npm run db:seed
// ============================================================
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const rounds = Number(process.env.BCRYPT_ROUNDS ?? 12)
  const pass = (p: string) => bcrypt.hash(p, rounds)

  // 1) Fasilitas kesehatan.
  const puskesmas = await prisma.facility.upsert({
    where: { code: "PKM-CAKRA" },
    update: {},
    create: { code: "PKM-CAKRA", name: "Puskesmas Cakranegara", type: "PUSKESMAS", city: "Mataram", district: "Cakranegara" },
  })
  const rs = await prisma.facility.upsert({
    where: { code: "RS-PROV-NTB" },
    update: {},
    create: { code: "RS-PROV-NTB", name: "RSUD Provinsi NTB", type: "RUMAH_SAKIT", city: "Mataram", district: "Selaparang" },
  })

  // 2) Pengguna per peran.
  const users: Array<{ email: string; fullName: string; role: any; password: string; facilityId?: string }> = [
    { email: "admin@baleceribu.id", fullName: "Super Administrator", role: "SUPER_ADMIN", password: "Admin#12345" },
    { email: "adminfaskes@baleceribu.id", fullName: "Admin Puskesmas Cakranegara", role: "ADMIN_FASKES", password: "Faskes#12345", facilityId: puskesmas.id },
    { email: "dokter@baleceribu.id", fullName: "dr. Sri Wahyuni, Sp.KJ", role: "DOKTER", password: "Dokter#12345", facilityId: puskesmas.id },
    { email: "bidan@baleceribu.id", fullName: "Bidan Ayu Lestari", role: "BIDAN", password: "Bidan#12345", facilityId: puskesmas.id },
    { email: "kader@baleceribu.id", fullName: "Kader Posyandu Melati", role: "KADER", password: "Kader#12345", facilityId: puskesmas.id },
    { email: "dinas@baleceribu.id", fullName: "Petugas Dinkes NTB", role: "PETUGAS_DINAS", password: "Dinas#12345" },
  ]
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { email: u.email, fullName: u.fullName, role: u.role, passwordHash: await pass(u.password), facilityId: u.facilityId, mustChangePassword: true },
    })
  }

  // 2b) Akun mandiri Ibu (role IBU) untuk portal pasien.
  const ibuUser = await prisma.user.upsert({
    where: { email: "ibu@baleceribu.id" },
    update: {},
    create: { email: "ibu@baleceribu.id", fullName: "Ibu Aminah", role: "IBU", passwordHash: await pass("Ibu#12345"), facilityId: puskesmas.id },
  })

  // 3) Pasien contoh. RM-0001 tertaut ke akun mandiri Ibu Aminah.
  await prisma.patient.upsert({
    where: { mrn: "RM-0001" },
    update: { userId: ibuUser.id },
    create: { mrn: "RM-0001", fullName: "Ibu Aminah", status: "POSTPARTUM", phone: "081900000001", city: "Mataram", district: "Cakranegara", facilityId: puskesmas.id, consentGiven: true, consentAt: new Date(), userId: ibuUser.id },
  })
  await prisma.patient.upsert({
    where: { mrn: "RM-0002" },
    update: {},
    create: { mrn: "RM-0002", fullName: "Ibu Sintia", status: "PREGNANT", phone: "081900000002", gestationalAge: 30, city: "Mataram", district: "Cakranegara", facilityId: puskesmas.id, consentGiven: true, consentAt: new Date() },
  })

  // 4) Materi edukasi (selaras slug rekomendasi CDSS).
  // Slug selaras dengan rekomendasi CDSS (lib/cdss.ts).
  const materials = [
    { slug: "pencegahan-baby-blues", title: "Pencegahan Baby Blues & Mengenali Depresi Pascapersalinan", category: "Pengetahuan Dasar", riskTarget: "LOW", summary: "Perbedaan baby blues yang umum dengan depresi pascapersalinan yang perlu penanganan." },
    { slug: "dukungan-keluarga", title: "Peran Dukungan Keluarga & Pasangan", category: "Dukungan Sosial", riskTarget: "LOW", summary: "Cara keluarga membantu pemulihan kesehatan jiwa ibu." },
    { slug: "mengelola-kecemasan", title: "Mengelola Kecemasan pada Ibu", category: "Self-care", riskTarget: "MEDIUM", summary: "Strategi praktis mengelola kecemasan dan stres selama masa perinatal." },
    { slug: "teknik-relaksasi", title: "Teknik Relaksasi & Pernapasan", category: "Self-care", riskTarget: "MEDIUM", summary: "Latihan relaksasi, pernapasan, dan tidur untuk menurunkan stres." },
    { slug: "mengenali-depresi-postpartum", title: "Mengenali Depresi Pascapersalinan", category: "Rujukan", riskTarget: "HIGH", summary: "Tanda bahaya depresi pascapersalinan dan pentingnya penanganan dini." },
    { slug: "kapan-mencari-bantuan", title: "Kapan Harus Mencari Bantuan Profesional", category: "Rujukan", riskTarget: "HIGH", summary: "Kapan dan ke mana mencari bantuan psikolog/psikiater." },
    { slug: "rencana-keselamatan", title: "Rencana Keselamatan & Bantuan Krisis", category: "Kegawatdaruratan", riskTarget: "HIGH", summary: "Langkah keselamatan segera dan kontak layanan krisis." },
  ]
  for (const m of materials) {
    await prisma.educationMaterial.upsert({ where: { slug: m.slug }, update: {}, create: { ...m, body: m.summary, published: true } })
  }

  // 5) Pengaturan sistem awal.
  const settings = [
    { key: "app.name", value: "BALE CERIBU", category: "general" },
    { key: "screening.reminderDays", value: 30, category: "screening" },
    { key: "integration.mode", value: process.env.INTEGRATION_MODE ?? "mock", category: "integration" },
    { key: "alert.highAlertSlaHours", value: 24, category: "clinical" },
  ]
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: { key: s.key, value: s.value as never, category: s.category } })
  }

  console.log("✅ Seed selesai. Login admin: admin@baleceribu.id / Admin#12345 | Login Ibu: ibu@baleceribu.id / Ibu#12345")
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
