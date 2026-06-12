# 10 — Dokumentasi Deployment (GitHub → Netlify)

Stack mengikuti standar deploy GitHub → Netlify untuk Next.js.

## 1. Persiapan Repo
```bash
git init
git add .
git commit -m "feat: BALE CERIBU full-stack"
git branch -M main
git remote add origin https://github.com/<org>/bale-ceribu.git
git push -u origin main
```

## 2. Database (Neon)
1. Buat project PostgreSQL di Neon.
2. Salin **pooled connection** ke `DATABASE_URL` dan **direct** ke `DIRECT_URL`.
3. Jalankan migrasi produksi: `npm run db:deploy` (prisma migrate deploy) lalu `npm run db:seed`.

## 3. Netlify
1. **Add new site → Import from GitHub** → pilih repo.
2. Build command & publish sudah diatur di `netlify.toml`:
   - Build: `npm run build` (= `prisma generate && next build`)
   - Plugin: `@netlify/plugin-nextjs`
   - Node: 20
3. **Environment variables** (Site settings → Environment): isi `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `INTEGRATION_MODE`, `CRON_SECRET`, dan kredensial integrasi bila `live`.
4. **Deploy site**. Netlify akan auto-deploy setiap push ke `main`.

## 4. Scheduled Function (Reminder)
Tambahkan jadwal pada Netlify (Functions → Scheduled) atau gunakan layanan cron eksternal yang memanggil:
```
POST https://<site>.netlify.app/api/cron/reminders
Header: x-cron-secret: <CRON_SECRET>
```
Disarankan setiap 15 menit.

## 5. Verifikasi Pasca-Deploy
- Buka `/` → login dengan akun seed.
- Cek `/app/dashboard` memuat KPI.
- Lakukan 1 skrining uji → pastikan skor & CDSS muncul.
- Unduh laporan PDF & Excel.

## 6. Rollback
Netlify menyimpan setiap deploy; gunakan **Deploys → Publish deploy** pada versi sebelumnya untuk rollback instan.
