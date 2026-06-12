# 11 — Dokumentasi Backup & Pemulihan

## Strategi
- **RPO** (Recovery Point Objective): ≤ 24 jam (backup harian) + PITR bila tersedia.
- **RTO** (Recovery Time Objective): ≤ 1 jam.

## Backup Database (PostgreSQL/Neon)
1. **Neon**: aktifkan **Point-in-Time Restore** (default retensi sesuai paket). Buat **branch** untuk uji restore tanpa mengganggu produksi.
2. **Logical backup terjadwal** (cron eksternal / GitHub Action harian):
```bash
pg_dump "$DIRECT_URL" --no-owner --format=custom --file=backup_$(date +%F).dump
# unggah ke object storage (S3/GCS) terenkripsi
```
3. Simpan minimal 7 backup harian + 4 mingguan + 3 bulanan (kebijakan 7-4-3).

## Restore
```bash
# Buat database kosong, lalu:
pg_restore --no-owner --clean --if-exists -d "$DIRECT_URL" backup_YYYY-MM-DD.dump
# Verifikasi: npm run prisma:generate && jalankan smoke test
```

## Backup Aplikasi & Konfigurasi
- Kode: GitHub (sumber kebenaran).
- Environment variables: simpan di vault/secret manager; jangan commit `.env`.
- Artefak ekspor (PDF/Excel) bersifat turunan; tidak perlu di-backup.

## Uji Pemulihan
- Lakukan **restore drill** triwulanan ke environment staging.
- Catat hasil pada activity log operasional.
