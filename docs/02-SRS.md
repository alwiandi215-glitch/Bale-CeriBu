# 02 — Software Requirement Specification (SRS)

_Standar acuan: IEEE 830. Sistem: BALE CERIBU v1.0._

## 1. Pendahuluan
### 1.1 Tujuan
Dokumen ini menetapkan kebutuhan perangkat lunak BALE CERIBU untuk skrining dan manajemen kesehatan jiwa ibu berbasis EPDS.
### 1.2 Lingkup Produk
Aplikasi web full-stack (Next.js App Router + PostgreSQL) dengan REST API, mencakup 15 modul fungsional dan integrasi SATUSEHAT/BPJS/WhatsApp.
### 1.3 Definisi
- **EPDS**: Edinburgh Postnatal Depression Scale, 10 item, skor 0–30.
- **HIGH ALERT**: item 10 (pikiran menyakiti diri) bernilai > 0.
- **CDSS**: Clinical Decision Support System berbasis aturan.

## 2. Deskripsi Umum
### 2.1 Perspektif Produk
Sistem berdiri sendiri namun interoperable dengan ekosistem kesehatan nasional (SATUSEHAT, BPJS) dan kanal komunikasi (WhatsApp).
### 2.2 Kelas Pengguna
Tiga kelompok pengguna utama: (a) **Ibu Hamil & Postpartum** sebagai pengguna mandiri Portal Ibu (skrining EPDS mandiri, edukasi, notifikasi, monitor diri); (b) **Bidan & Perawat** (pantau skrining, tindak lanjut, edukasi, monitoring pasien); (c) **Administrator Fasilitas Kesehatan** (kelola data sistem, laporan pelayanan, monitoring program). Lihat tabel peran lengkap pada dokumen 01 (RBAC 7 peran, termasuk peran perluasan KADER, PETUGAS_DINAS, SUPER_ADMIN).
### 2.3 Lingkungan Operasi
Browser modern; backend Node.js 20 (serverless Netlify); DB PostgreSQL 14+.

## 3. Kebutuhan Antarmuka Eksternal
- **SATUSEHAT**: OAuth2 client-credentials, FHIR R4 `Observation`.
- **BPJS**: VClaim REST, signature HMAC-SHA256 + timestamp.
- **WhatsApp**: Meta Cloud API `/{phoneNumberId}/messages` Bearer token.

## 4. Kebutuhan Fungsional Rinci
### FR-1 Autentikasi & Keamanan
- FR-1.1 Sistem memvalidasi email & kata sandi; kata sandi disimpan ter-hash bcrypt (≥12 rounds).
- FR-1.2 Setelah 5 kegagalan berturut, akun terkunci 15 menit.
- FR-1.3 Sesi menggunakan JWT (exp 8 jam) + tabel `Session` (revokable, `tokenId`=jti).
- FR-1.4 Logout merevoke sesi.
### FR-2 Manajemen Pengguna
- FR-2.1 SUPER_ADMIN/ADMIN_FASKES membuat, memperbarui, menonaktifkan pengguna.
- FR-2.2 Pengguna baru wajib ganti kata sandi pertama kali (`mustChangePassword`).
### FR-3 Manajemen Pasien
- FR-3.1 CRUD pasien; pencarian per nama/No. RM; pembatasan per faskes.
- FR-3.2 Pencatatan consent dan data kebidanan (usia kehamilan, taksiran/realisasi persalinan).
### FR-4 Skrining EPDS + Auto-save
- FR-4.1 Form 10 item dengan opsi berskor.
- FR-4.2 Jawaban parsial disimpan otomatis sebagai DRAFT (debounce 1,2 dtk).
- FR-4.3 Submit final menghitung skor + menjalankan CDSS dalam satu transaksi.
### FR-5 Mesin Skor & Rule Engine
- FR-5.1 Skor total = penjumlahan 10 item dengan reverse-scoring sesuai instrumen EPDS.
### FR-6 Klasifikasi Risiko & CDSS
- FR-6.1 LOW 0–9, MEDIUM 10–12, HIGH ≥13.
- FR-6.2 HIGH ALERT meng-override urgensi menjadi EMERGENCY (SLA 24 jam, rujukan mendesak, tindakan keselamatan).
- FR-6.3 CDSS versioned (`cdssVersion`) dan output tersimpan (`cdssOutput`).
### FR-7 Edukasi
- FR-7.1 Materi tertaut tingkat risiko/slug; dapat dikelola admin.
### FR-8 Intervensi & Tindak Lanjut
- FR-8.1 Intervensi otomatis dibuat dari rekomendasi CDSS dengan tenggat sesuai SLA.
- FR-8.2 Status: PLANNED→IN_PROGRESS→COMPLETED/CANCELLED.
### FR-9 Rujukan
- FR-9.1 Closed-loop: SENT→ACCEPTED→CLOSED dengan feedback.
### FR-10 Monitoring & Reminder
- FR-10.1 Reminder terjadwal; pemroses cron mengirim via WhatsApp Gateway.
### FR-11 Dashboard Analitik
- FR-11.1 KPI: total pasien, skrining, distribusi risiko, HIGH ALERT terbuka, kepatuhan follow-up, closed-loop rujukan.
### FR-12 Laporan
- FR-12.1 Ekspor PDF (ringkasan) & Excel (rekap); versi Dinas anonim/agregat.
### FR-13 Audit & Activity
- FR-13.1 Audit immutable untuk aksi data; activity untuk lini masa.
### FR-14 Pengaturan Sistem
- FR-14.1 Key-value berkategori; dapat di-upsert admin.
### FR-15 Integrasi
- FR-15.1 Mode mock/live; semua panggilan dicatat di `IntegrationLog`.

## 5. Kebutuhan Non-Fungsional
Lihat dokumen 01 §6 (keamanan, privasi, kinerja, ketersediaan, skalabilitas, auditabilitas, aksesibilitas).

## 6. Matriks Ketertelusuran (ringkas)
| Modul | Endpoint utama | Berkas kode |
|---|---|---|
| Auth | /api/auth/* | lib/auth.ts, app/api/auth/* |
| Skrining | /api/screenings, /draft | lib/epds.ts, app/api/screenings/* |
| CDSS | /api/cdss | lib/cdss.ts |
| Analitik | /api/analytics | lib/analytics.ts |
| Laporan | /api/reports/* | app/api/reports/* |
| Integrasi | /api/integrations/* | lib/integrations/* |
