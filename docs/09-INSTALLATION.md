# 09 — Dokumentasi Instalasi

## Prasyarat
- Node.js 20 LTS, npm 10+
- PostgreSQL 14+ (lokal) atau akun Neon (managed)
- Git

## Langkah Instalasi (Lokal)
```bash
# 1) Pasang dependensi
npm install

# 2) Salin environment
cp .env.example .env
# Isi DATABASE_URL, DIRECT_URL, JWT_SECRET, dst.

# 3) Generate Prisma Client
npm run prisma:generate

# 4) Migrasi schema ke database
npm run db:migrate     # dev: prisma migrate dev
# atau untuk DB kosong cepat: npm run db:push

# 5) Seed data awal (faskes, user per peran, pasien contoh, edukasi, settings)
npm run db:seed

# 6) Jalankan dev server
npm run dev            # http://localhost:3000
```

## Variabel Lingkungan Penting (.env)
| Var | Wajib | Contoh/Default |
|---|---|---|
| DATABASE_URL | ya | postgres://user:pass@host/db?sslmode=require (pooled) |
| DIRECT_URL | ya | postgres://... (koneksi langsung utk migrate) |
| JWT_SECRET | ya | string acak ≥32 karakter |
| JWT_EXPIRES_IN | tidak | 8h |
| BCRYPT_ROUNDS | tidak | 12 |
| INTEGRATION_MODE | tidak | mock \| live |
| CRON_SECRET | tidak | string acak (pengaman cron) |
| SATUSEHAT_* / BPJS_* / WHATSAPP_* | bila live | kredensial integrasi |

## Akun Demo (setelah seed)
| Peran | Email | Sandi |
|---|---|---|
| Super Admin | admin@baleceribu.id | Admin#12345 |
| Admin Faskes | adminfaskes@baleceribu.id | Faskes#12345 |
| Dokter | dokter@baleceribu.id | Dokter#12345 |
| Bidan | bidan@baleceribu.id | Bidan#12345 |
| Kader | kader@baleceribu.id | Kader#12345 |
| Dinas | dinas@baleceribu.id | Dinas#12345 |
| Ibu (Portal Ibu) | ibu@baleceribu.id | Ibu#12345 |

> Ganti seluruh sandi demo sebelum produksi.
