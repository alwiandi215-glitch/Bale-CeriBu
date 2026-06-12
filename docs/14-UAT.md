# 14 — User Acceptance Testing (UAT)

Format: setiap kasus diuji oleh peran terkait. Status: ☐ Belum / ☑ Lulus / ☒ Gagal.

## A. Autentikasi & Keamanan
| ID | Skenario | Langkah | Hasil diharapkan | Status |
|---|---|---|---|---|
| UAT-A1 | Login valid | Masukkan kredensial benar | Masuk ke dashboard | ☐ |
| UAT-A2 | Login salah | Salah sandi | Pesan kredensial salah | ☐ |
| UAT-A3 | Lockout | Salah 5x | Akun terkunci 15 menit (423) | ☐ |
| UAT-A4 | Logout | Klik logout | Sesi direvoke, redirect login | ☐ |

## B. Manajemen Pengguna
| UAT-B1 | Buat user | Admin buat user bidan | User muncul di daftar | ☐ |
| UAT-B2 | Larangan akses | Bidan buka menu pengguna | Ditolak (403) | ☐ |

## C. Pasien
| UAT-C1 | Tambah pasien | Isi form | Pasien tersimpan | ☐ |
| UAT-C2 | Cari pasien | Ketik nama/RM | Hasil terfilter | ☐ |
| UAT-C3 | Scoping faskes | Login faskes A | Hanya lihat pasien faskes A | ☐ |

## D. Skrining EPDS + Auto-save
| UAT-D1 | Auto-save | Jawab sebagian | Status “Tersimpan otomatis”, DRAFT tersimpan | ☐ |
| UAT-D2 | Submit final | Jawab 10 item | Skor & CDSS muncul | ☐ |
| UAT-D3 | Skor benar | Semua 0 | Skor 0, risiko rendah | ☐ |

## E. Skor, Klasifikasi & CDSS
| UAT-E1 | Ambang batas | Skor 10 | MEDIUM | ☐ |
| UAT-E2 | HIGH ALERT | item 10 > 0 | EMERGENCY + rujukan mendesak | ☐ |
| UAT-E3 | Intervensi otomatis | Submit HIGH | Intervensi & follow-up dibuat | ☐ |

## F. Edukasi / Intervensi / Rujukan
| UAT-F1 | Materi sesuai risiko | Buka edukasi | Materi relevan tampil | ☐ |
| UAT-F2 | Selesaikan intervensi | Tandai selesai | Status COMPLETED | ☐ |
| UAT-F3 | Closed-loop rujukan | SENT→ACCEPTED→CLOSED | Status berubah benar | ☐ |

## G. Monitoring & Reminder
| UAT-G1 | Jadwalkan reminder | Buat reminder | Muncul di monitoring | ☐ |
| UAT-G2 | Cron kirim | Panggil cron | Status SENT (mode mock) | ☐ |

## H. Dashboard & Laporan
| UAT-H1 | KPI real-time | Buka dashboard | Angka sesuai data | ☐ |
| UAT-H2 | Ekspor PDF | Unduh | File PDF valid | ☐ |
| UAT-H3 | Ekspor Excel | Unduh | File XLSX valid | ☐ |
| UAT-H4 | Dinas anonim | Login Dinas | Tanpa identitas pasien | ☐ |

## I. Audit & Pengaturan
| UAT-I1 | Audit tercatat | Lakukan aksi | Muncul di audit log | ☐ |
| UAT-I2 | Ubah pengaturan | Simpan setting | Nilai ter-update | ☐ |

## J. Integrasi
| UAT-J1 | SATUSEHAT (mock) | Push observation | Log sukses | ☐ |
| UAT-J2 | BPJS (mock) | Cek peserta | Respons mock | ☐ |
| UAT-J3 | WhatsApp (mock) | Kirim pesan | Log sukses | ☐ |

## Otomasi
Unit & integration test domain dijalankan via `npm test` (Vitest), mencakup skoring EPDS, CDSS, RBAC, dan alur skrining end-to-end.
