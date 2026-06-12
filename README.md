# 🤰 BALE CERIBU
**Balai Edukasi, Cegah, Risiko & Intervensi Kesehatan Jiwa Ibu**

Platform skrining & manajemen kesehatan jiwa ibu hamil dan pascapersalinan berbasis **EPDS** (Edinburgh Postnatal Depression Scale), dengan CDSS, intervensi, rujukan closed-loop, monitoring, analitik real-time, dan integrasi SATUSEHAT/BPJS/WhatsApp.

## Tech Stack
- **Next.js 15** (App Router) — frontend + backend (Route Handlers)
- **React 19**, **TypeScript**, **Tailwind CSS**
- **Prisma 6** + **PostgreSQL** (Neon-ready)
- **JWT (jose)** + **bcryptjs**, **zod**, **ExcelJS**, **PDFKit**
- Deploy: **GitHub → Netlify** (`@netlify/plugin-nextjs`)
- Test: **Vitest**

## Fitur (15 Modul)
1. Autentikasi & keamanan (JWT, RBAC, lockout, audit)
2. Manajemen pengguna (7 peran, termasuk akun mandiri Ibu untuk Portal Ibu)
3. Manajemen data pasien
4. Skrining EPDS digital **dengan auto-save**
5. Mesin perhitungan skor & rule engine
6. Klasifikasi risiko & CDSS
7. Edukasi pasien
8. Rekomendasi intervensi & tindak lanjut
9. Rujukan ke faskes lanjutan (closed-loop)
10. Monitoring & reminder
11. Dashboard analitik real-time
12. Laporan PDF & Excel
13. Audit log & activity log
14. Pengaturan sistem
15. API integrasi SATUSEHAT, BPJS, WhatsApp Gateway

## Mulai Cepat
```bash
npm install
cp .env.example .env   # isi DATABASE_URL, DIRECT_URL, JWT_SECRET
npm run prisma:generate
npm run db:push
npm run db:seed
npm run dev            # http://localhost:3000
```
Login demo: `admin@baleceribu.id` / `Admin#12345` (lihat `docs/09-INSTALLATION.md`).

## Pengujian
```bash
npm test               # Vitest: EPDS, CDSS, RBAC, alur skrining
```

## Dokumentasi (folder `docs/`)
| No | Dokumen |
|---|---|
| 01 | Analisis Kebutuhan Sistem |
| 02 | SRS (IEEE 830) |
| 03 | Business Process & BPMN |
| 04 | Use Case, Activity & Sequence Diagram |
| 05 | Class Diagram & ERD |
| 06 | Desain REST API Lengkap |
| 07 | Wireframe & UI/UX |
| 08 | Struktur Proyek Frontend & Backend |
| 09 | Instalasi |
| 10 | Deployment (GitHub → Netlify) |
| 11 | Backup & Pemulihan |
| 12 | Keamanan |
| 13 | Manual Pengguna |
| 14 | UAT |

_Skema database PostgreSQL: `prisma/schema.prisma`. Deliverable diagram menggunakan Mermaid (dirender otomatis di GitHub)._

## Lisensi
© 2026 BALE CERIBU. Hak cipta dilindungi.

> Catatan klinis: EPDS adalah alat **skrining**, bukan diagnosis. Keputusan akhir tetap pada tenaga kesehatan.
