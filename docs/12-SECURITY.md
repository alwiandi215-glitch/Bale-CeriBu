# 12 — Dokumentasi Keamanan

## Autentikasi
- Kata sandi di-hash dengan **bcrypt** (≥12 rounds), tidak pernah disimpan/log dalam bentuk plaintext.
- Sesi memakai **JWT HS256** ber-`exp` (8 jam) disimpan pada cookie **HttpOnly, Secure, SameSite=Lax**.
- Tabel `Session` menyimpan `tokenId` (jti) agar sesi dapat **direvoke** (logout/penonaktifan).
- **Lockout**: 5 kegagalan → kunci 15 menit untuk mitigasi brute-force.

## Otorisasi (RBAC)
- 6 peran dengan daftar permission eksplisit (`lib/rbac.ts`).
- Setiap endpoint sensitif memanggil `requirePermission(...)`.
- Prinsip least-privilege: Kader hanya skrining dasar; Dinas hanya analitik agregat.

## Perlindungan Data
- Data pasien dibatasi **per faskes** (row scoping pada query).
- Laporan untuk Dinas Kesehatan **anonim/agregat** (tanpa identitas pasien).
- Consent pasien dicatat (`consentGiven`, `consentAt`).

## Audit & Akuntabilitas
- `AuditLog` mencatat aksi data (siapa, kapan, entitas, before/after, IP, user-agent).
- `ActivityLog` untuk linimasa operasional.
- Semua ekspor laporan tercatat sebagai event `EXPORT`.

## Keamanan Transport & Header
- HTTPS wajib (Netlify).
- Header keamanan di `netlify.toml`: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`, `Permissions-Policy`.

## Validasi Input
- Semua body API divalidasi **zod** (`lib/validation.ts`) → error 422 terstruktur.
- Prisma parametrized queries mencegah SQL injection.

## Integrasi
- Kredensial integrasi hanya via environment; mode `mock` default agar tidak ada panggilan eksternal tanpa konfigurasi.
- Endpoint cron dilindungi `CRON_SECRET`.
- BPJS memakai signature HMAC; SATUSEHAT memakai OAuth2 client-credentials.

## Rekomendasi Operasional
- Rotasi `JWT_SECRET` & kredensial integrasi berkala.
- Aktifkan 2FA pada akun GitHub/Netlify/Neon.
- Tinjau audit log HIGH ALERT setiap hari kerja.
- Kepatuhan UU PDP (Pelindungan Data Pribadi) untuk data kesehatan jiwa.
