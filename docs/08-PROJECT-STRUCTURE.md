# 08 — Struktur Proyek (Frontend & Backend)

Arsitektur: **monolit full-stack Next.js 15 (App Router)**. Frontend (React Server/Client Components) dan backend (Route Handlers `app/api/*`) berada dalam satu proyek, di-deploy ke Netlify via `@netlify/plugin-nextjs`.

```
bale-ceribu/
  app/
    layout.tsx                # Root layout
    globals.css               # Token tema + utilitas
    page.tsx                  # Halaman Login (publik)
    app/                      # Area terproteksi ("/app/*")
      layout.tsx              # Shell (Sidebar)
      dashboard/page.tsx
      patients/page.tsx
      patients/[id]/page.tsx
      screening/page.tsx
      interventions/page.tsx
      referrals/page.tsx
      monitoring/page.tsx
      education/page.tsx
      reports/page.tsx
      users/page.tsx
      audit/page.tsx
      settings/page.tsx
    api/                      # BACKEND (REST)
      auth/{login,logout,me}/route.ts
      users/route.ts, users/[id]/route.ts
      patients/route.ts, patients/[id]/route.ts
      screenings/route.ts, screenings/draft/route.ts, screenings/[id]/route.ts
      cdss/route.ts
      education/route.ts
      interventions/route.ts
      referrals/route.ts, referrals/[id]/route.ts
      reminders/route.ts
      analytics/route.ts
      reports/{pdf,excel}/route.ts
      audit/route.ts
      settings/route.ts
      integrations/{satusehat,bpjs,whatsapp}/route.ts
      cron/reminders/route.ts
  components/                 # UI reusable (Sidebar, Header, KpiCard, RiskBadge, ...)
  lib/                        # Core logic (backend services)
    prisma.ts                 # Prisma client singleton
    env.ts                    # Validasi env (zod)
    auth.ts                   # JWT + bcrypt + cookie
    rbac.ts                   # Permission per role
    api.ts                    # Helper response + guard
    audit.ts                  # Audit & activity
    validation.ts             # Skema zod
    epds.ts                   # Instrumen + skoring
    cdss.ts                   # Rule engine CDSS
    analytics.ts              # Agregasi KPI
    reminder-service.ts       # Pemroses reminder
    http.ts                   # Klien fetch (client-side)
    integrations/{satusehat,bpjs,whatsapp}.ts
  prisma/
    schema.prisma             # Skema PostgreSQL
    seed.ts                   # Data awal
  tests/                      # Vitest (unit + integration)
  docs/                       # Dokumentasi (file ini & lainnya)
  middleware.ts               # Proteksi rute /app/*
  netlify.toml                # Konfigurasi deploy Netlify
  next.config.mjs, tsconfig.json, tailwind.config.ts, postcss.config.mjs
  package.json, .env.example, vitest.config.ts
```

## Lapisan (layering)
- **Presentation**: `app/**/page.tsx`, `components/*`.
- **API/transport**: `app/api/**/route.ts` + `lib/api.ts`.
- **Domain/service**: `lib/epds.ts`, `lib/cdss.ts`, `lib/analytics.ts`, `lib/reminder-service.ts`, `lib/integrations/*`.
- **Data**: Prisma (`lib/prisma.ts`, `prisma/schema.prisma`).
- **Cross-cutting**: `auth.ts`, `rbac.ts`, `audit.ts`, `validation.ts`, `env.ts`.
