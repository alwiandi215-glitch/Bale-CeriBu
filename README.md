# BALE CERI_BU

Sistem skrining kesehatan mental maternal (EPDS — Edinburgh Postnatal Depression Scale) untuk puskesmas. Multi-tenant per-puskesmas dengan Supabase + RLS, CDSS rule engine, Early Warning System (EWS) realtime, intervensi, rujukan, telehealth, edukasi, laporan, dan audit log.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Data/Auth:** Supabase (PostgreSQL + RLS + Realtime + Storage + Edge Functions)
- **State/Query:** TanStack Query, Zustand
- **Form/Validasi:** React Hook Form + Zod
- **UI:** Tailwind CSS, Framer Motion, react-icons, react-hot-toast
- **Chart/Export:** Chart.js, jsPDF + autotable, xlsx
- **PWA:** vite-plugin-pwa
- **Testing:** Vitest + Testing Library

## Menjalankan Lokal

```bash
npm install
cp .env.example .env      # isi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY
npm run dev
```

Perintah lain:

```bash
npm run build       # build produksi (vite build)
npm run preview     # preview hasil build
npm run test        # unit test (vitest)
npm run lint        # type-check (tsc --noEmit)
```

## Variabel Lingkungan

| Variabel | Dipakai di | Keterangan |
|---|---|---|
| `VITE_SUPABASE_URL` | Client | URL project Supabase |
| `VITE_SUPABASE_ANON_KEY` | Client | Anon/public key |
| `SUPABASE_URL` | Edge Function | URL project (server) |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Function | **Service role key — JANGAN pernah diekspos ke client** |

## Struktur Folder

```
src/
  components/        # common, dashboard, charts (reusable)
  context/           # AuthContext, ThemeContext
  features/
    dashboard/       # pages + hooks
    patients/        # pages + components + hooks
    epds/            # questions, schema, form, autosave draft
    cdss/            # rule engine (resolveCdss), types, RuleBuilder
    monitoring/      # EWS realtime
    reports/         # rekap & export PDF/Excel
    interventions/   # tracker intervensi
    referrals/       # timeline rujukan
    education/        # konten edukasi
    notifications/   # notifikasi realtime
    settings/        # profil, password, tema
    admin/           # master data, user admin, audit log
  lib/               # supabase, queryClient, excel, pdf
  hooks/             # useDebounce
  types/             # database.types (regenerate via Supabase CLI)
  styles/            # print.css
supabase/functions/  # admin-create-user (Edge Function)
tests/unit/          # epds & resolveCdss
```

## Skoring EPDS

- 10 item, skor maksimum 30.
- Item reverse-scored: 3, 5, 6, 7, 8, 9, 10.
- Interpretasi: 0–9 **rendah**, 10–12 **sedang**, ≥13 **tinggi**.
- EWS aktif bila skor ≥13 **atau** jawaban Q10 (self-harm) > 0.

## Catatan Penting

1. **`src/types/database.types.ts`** saat ini berupa stub. Regenerate dari skema asli:
   `npx supabase gen types typescript --project-id <id> > src/types/database.types.ts`
2. **SQL/migrasi/seed** (tabel, view `v_dashboard_summary` & `v_screening_monthly`, RLS, trigger skor & EWS) ada di halaman fase Notion — jalankan sebelum aplikasi dipakai.
3. Edge Function memakai **service role key**; deploy hanya via `supabase functions deploy admin-create-user` dan set secret di sisi Supabase, bukan di client.
4. Beberapa file (AuthContext, ThemeContext, komponen common, ActivityFeed, router) ditambahkan sebagai kerangka agar proyek dapat di-build; sesuaikan dengan implementasi Auth/RLS Anda.
