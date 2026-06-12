# 13 — Manual Pengguna

## Masuk (Login)
1. Buka aplikasi, masukkan email & kata sandi.
2. Saat pertama kali, sistem meminta ganti kata sandi.
3. Jika salah 5 kali, akun terkunci 15 menit.
4. Setelah masuk, **Ibu** diarahkan otomatis ke **Portal Ibu** (`/portal`); tenaga kesehatan & admin diarahkan ke area klinis (`/app`).

---

## A. Panduan untuk Ibu (Hamil & Postpartum) — Portal Ibu

### Beranda
- Menampilkan kondisi terkini Anda (tingkat risiko & skor skrining terakhir) serta riwayat skrining.
- Bila hasil menunjukkan perlu perhatian segera, muncul pesan dukungan dan kontak darurat.

### Mengisi Skrining EPDS
1. Menu **Skrining EPDS**.
2. Jawab 10 pertanyaan sesuai perasaan Anda dalam **7 hari terakhir**. Jawaban **tersimpan otomatis**.
3. Setelah semua terjawab, tekan **Kirim skrining** untuk melihat hasil.
4. Hasil Anda otomatis diteruskan ke bidan/perawat untuk ditindaklanjuti.

### Edukasi & Notifikasi
- **Edukasi**: baca materi kesehatan jiwa ibu sesuai kategori.
- **Notifikasi**: lihat pengingat skrining ulang dan tindak lanjut.

> EPDS adalah alat bantu skrining, bukan diagnosis. Jika Anda merasa ingin menyakiti diri sendiri, segera hubungi petugas faskes atau layanan darurat 112.

---

## B. Panduan untuk Tenaga Kesehatan & Admin (area klinis)

## Dashboard
- Menampilkan KPI: total pasien, jumlah skrining, distribusi risiko, kepatuhan follow-up, dan closed-loop rujukan.
- **Banner HIGH ALERT** muncul bila ada kasus pikiran menyakiti diri yang belum ditangani — klik untuk menindaklanjuti.

## Mendaftarkan Pasien (Kader/Bidan)
1. Menu **Pasien → + Pasien**.
2. Isi No. RM, nama, kontak WhatsApp, status (Hamil/Pascapersalinan).
3. Simpan. Pastikan consent pasien sudah diperoleh.

## Melakukan Skrining EPDS
1. Menu **Skrining EPDS**, pilih pasien.
2. Jawab 10 pertanyaan. **Jawaban tersimpan otomatis** (lihat “✓ Tersimpan otomatis”).
3. Setelah 10 terjawab, klik **Hitung skor & rekomendasi CDSS**.
4. Sistem menampilkan skor, tingkat risiko, dan rekomendasi tindakan.

## Interpretasi Risiko
| Skor | Risiko | Tindakan umum |
|---|---|---|
| 0–9 | Rendah | Edukasi + skrining ulang |
| 10–12 | Sedang | Intervensi + follow-up 7 hari |
| ≥13 | Tinggi | Rujukan ke faskes lanjutan |
| item 10 > 0 | HIGH ALERT | Respons darurat + rujukan mendesak |

## Intervensi & Rujukan
- **Intervensi**: pantau daftar, tandai selesai bila sudah dilakukan.
- **Rujukan**: lacak status SENT → ACCEPTED → CLOSED.

## Monitoring & Reminder
- Lihat jadwal reminder; pengiriman WhatsApp berjalan otomatis oleh sistem.

## Edukasi
- Akses materi edukasi sesuai tingkat risiko untuk dibagikan ke pasien.

## Laporan
- Menu **Laporan**: unduh **PDF** (ringkasan) atau **Excel** (rekap).
- Untuk Petugas Dinas, data ditampilkan **agregat/anonim**.

## Pengguna & Pengaturan (Admin)
- **Pengguna**: tambah/atur peran.
- **Pengaturan**: ubah parameter sistem (nama app, SLA, mode integrasi).

## Audit
- **Audit & Activity**: telusuri seluruh aktivitas dan perubahan data.
