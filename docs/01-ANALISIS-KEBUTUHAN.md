# 01 — Analisis Kebutuhan Sistem

## 1. Latar Belakang
BALE CERIBU (Balai Edukasi, Cegah, Risiko & Intervensi Kesehatan Jiwa Ibu) adalah platform digital untuk skrining dan manajemen kesehatan jiwa ibu hamil dan pascapersalinan, menggunakan instrumen **Edinburgh Postnatal Depression Scale (EPDS)**. Sasaran wilayah awal: NTB/Lombok, melalui Puskesmas, Posyandu, dan RS rujukan.

## 2. Tujuan
- Deteksi dini risiko depresi perinatal melalui skrining EPDS digital.
- Standarisasi pengambilan keputusan klinis melalui CDSS berbasis aturan.
- Mempercepat intervensi, rujukan, dan tindak lanjut.
- Menyediakan analitik real-time untuk faskes dan Dinas Kesehatan.
- Interoperabilitas dengan SATUSEHAT, BPJS, dan WhatsApp Gateway.

## 3. Ruang Lingkup (15 Modul Fungsional)
1. Autentikasi & keamanan (JWT, RBAC, lockout, audit).
2. Manajemen pengguna (7 peran, termasuk akun mandiri Ibu).
3. Manajemen data pasien (ibu hamil & postpartum).
4. Skrining EPDS digital dengan **auto-save**.
5. Mesin perhitungan skor & rule engine.
6. Klasifikasi risiko & CDSS.
7. Edukasi pasien.
8. Rekomendasi intervensi & tindak lanjut.
9. Rujukan ke fasilitas lanjutan (closed-loop).
10. Monitoring & reminder (WhatsApp/SMS/Email/in-app).
11. Dashboard analitik real-time.
12. Laporan PDF & Excel.
13. Audit log & activity log.
14. Pengaturan sistem.
15. API integrasi SATUSEHAT, BPJS, WhatsApp Gateway.

## 4. Sasaran Pengguna (Aktor)
BALE CERIBU digunakan oleh beberapa kelompok pengguna utama:

### a. Ibu Hamil & Ibu Postpartum (akun mandiri — Portal Ibu)
Mengakses **Portal Ibu** (`/portal`) untuk:
1. Mengisi skrining EPDS secara mandiri (dengan auto-save);
2. Melihat materi edukasi kesehatan;
3. Mendapatkan notifikasi & pengingat;
4. Memantau kondisi kesehatan mentalnya (riwayat skor & tingkat risiko).

### b. Bidan & Perawat (area klinis)
1. Memantau hasil skrining pasien;
2. Melakukan tindak lanjut (intervensi & rujukan);
3. Memberikan edukasi kepada pasien;
4. Melakukan pemantauan pasien (monitoring & reminder).

### c. Administrator Fasilitas Kesehatan
1. Mengelola data sistem (pengguna, pasien, pengaturan);
2. Mengelola laporan pelayanan (PDF/Excel);
3. Monitoring program kesehatan (dashboard analitik).

### Pemetaan ke peran sistem (RBAC, 7 peran)
| Peran | Kelompok pengguna | Hak utama |
|---|---|---|
| IBU | Ibu Hamil & Postpartum | Skrining mandiri, edukasi, notifikasi, monitor diri (hanya data sendiri) |
| BIDAN | Bidan & Perawat | Skrining, intervensi, rujukan, edukasi, monitoring pasien |
| DOKTER | Dokter/Psikolog/Psikiater | Bidan/Perawat + review skrining & CDSS |
| ADMIN_FASKES | Administrator Faskes | Kelola user faskes, data, laporan, pengaturan |
| KADER | Kader kesehatan (perluasan) | Daftar pasien, skrining dasar |
| PETUGAS_DINAS | Dinas Kesehatan (perluasan) | Analitik agregat & laporan (anonim) |
| SUPER_ADMIN | Administrator platform | Semua |

> Catatan: tiga kelompok pengguna utama (Ibu, Bidan/Perawat, Administrator Faskes) adalah sasaran inti. KADER, PETUGAS_DINAS, dan SUPER_ADMIN merupakan peran perluasan opsional untuk skenario program daerah.

## 5. Kebutuhan Fungsional (ringkas)
- KF-01 Login aman + penguncian setelah 5 kegagalan.
- KF-02 CRUD pengguna dengan peran.
- KF-03 CRUD pasien + persetujuan (consent).
- KF-04 Pengisian EPDS 10 item, auto-save draft.
- KF-05 Hitung skor 0–30 otomatis.
- KF-06 Klasifikasi LOW (0–9)/MEDIUM (10–12)/HIGH (≥13) + HIGH ALERT bila item 10 > 0.
- KF-07 CDSS menghasilkan urgensi, SLA, kebutuhan rujukan, tindakan, materi edukasi, dan intervensi.
- KF-08 Materi edukasi sesuai tingkat risiko.
- KF-09 Pembuatan & pelacakan intervensi.
- KF-10 Rujukan closed-loop.
- KF-11 Reminder terjadwal + pengiriman otomatis.
- KF-12 Dashboard KPI real-time.
- KF-13 Ekspor PDF & Excel (agregat untuk Dinas).
- KF-14 Audit & activity log seluruh aksi penting.
- KF-15 Pengaturan sistem dinamis.
- KF-16 Integrasi SATUSEHAT (FHIR), BPJS (VClaim), WhatsApp (Cloud API).

## 6. Kebutuhan Non-Fungsional
- **Keamanan**: enkripsi in-transit (HTTPS), hash kata sandi bcrypt, JWT short-lived, RBAC, audit immutable, prinsip least-privilege, anonimisasi data untuk Dinas.
- **Privasi**: kepatuhan UU PDP; consent tercatat; data sensitif kesehatan jiwa dibatasi per faskes.
- **Kinerja**: dashboard < 2 dtk untuk dataset puskesmas; auto-save debounce 1,2 dtk.
- **Ketersediaan**: deploy serverless Netlify; DB ter-managed (Neon) dengan backup.
- **Skalabilitas**: multi-faskes; stateless API.
- **Auditabilitas**: semua ekspor & perubahan tercatat.
- **Aksesibilitas**: UI responsif, mode terang/gelap, Bahasa Indonesia.

## 7. Asumsi & Batasan
- Mode integrasi dapat di-set `mock` (tanpa kredensial) atau `live`.
- EPDS adalah alat skrining, bukan diagnosis; keputusan akhir tetap pada klinisi.
