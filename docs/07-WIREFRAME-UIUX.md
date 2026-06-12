# 07 — Wireframe & Desain UI/UX (Seluruh Halaman)

## Prinsip Desain
- Bahasa Indonesia, nuansa tenang & suportif (kesehatan jiwa ibu).
- Token warna: brand `#2563EB`, sekunder `#0E9F6E`, aksen `#7C5CFC`; risiko low `#0E9F6E`, medium `#D97706`, high `#DC2626`, alert `#B91C1C`.
- Mode terang/gelap, layout responsif (sidebar md+).
- Aksesibilitas: kontras AA, label form eksplisit, target sentuh besar.

## Peta Halaman
| Rute | Halaman | Komponen kunci |
|---|---|---|
| `/` | Login | Form, ThemeToggle |
| `/app/dashboard` | Dashboard | KpiCard, RiskDistribution, HighAlertBanner |
| `/app/patients` | Daftar pasien | Tabel, cari, form tambah |
| `/app/patients/[id]` | Detail pasien | Identitas, riwayat skrining, RiskBadge |
| `/app/screening` | Skrining EPDS | 10 pertanyaan, auto-save, hasil + CDSS |
| `/app/interventions` | Intervensi | Tabel, aksi selesai |
| `/app/referrals` | Rujukan | Tabel, transisi closed-loop |
| `/app/monitoring` | Monitoring & reminder | Tabel jadwal |
| `/app/education` | Edukasi | Kartu materi |
| `/app/reports` | Laporan | Unduh PDF/Excel |
| `/app/users` | Pengguna | Tabel, form peran |
| `/app/audit` | Audit & activity | Tab, tabel/linimasa |
| `/app/settings` | Pengaturan | Key-value editor |

## Wireframe (ASCII)

### Login
```
+---------------------------------------+
|              🤰 BALE CERIBU            |
|   Balai Edukasi, Cegah, Risiko ...    |
|  Email    [____________________]      |
|  Sandi    [____________________]      |
|           [        Masuk       ]      |
|              🌙 Gelap                 |
+---------------------------------------+
```

### Dashboard
```
+--------+------------------------------------------+
| Sidebar| Header: Dashboard            🌙  [User] X |
|  📊    | [⚠ HIGH ALERT: n kasus ...]   [Tinjau]    |
|  👩‍🍼   | [Total][Skrining][Follow-up%][Closed%]    |
|  📝    | [ Distribusi Risiko ] [ Aktivitas ]       |
+--------+------------------------------------------+
```

### Skrining EPDS
```
 Pasien [v]   Terjawab 7/10   ✓ Tersimpan 10:21
 +-----------------------------------------------+
 | 1. Saya dapat tertawa ...                     |
 |  ( ) Sebanyak biasanya   ( ) Agak berkurang   |
 |  ( ) Jelas berkurang     ( ) Tidak sama sekali|
 +-----------------------------------------------+
 ... (10 item) ...
 [ Hitung skor & rekomendasi CDSS ]
```

### Hasil + CDSS
```
 Skor: 16/30   [Tinggi]
 Ringkasan CDSS ...
 - Tindakan 1
 - Tindakan 2
 [Skrining baru]
```

Catatan: wireframe ini terealisasi 1:1 pada komponen di `components/` dan halaman `app/app/*`.
