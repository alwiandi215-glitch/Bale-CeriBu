# 06 — Desain REST API Lengkap

Base URL: `/api`. Semua respons berformat:
```json
{ "success": true, "data": { } }
{ "success": false, "error": { "code": "", "message": "", "details": {} } }
```
Autentikasi: cookie `bc_session` (JWT HttpOnly). Otorisasi: RBAC per permission.

## Konvensi
- Pagination: `?page=1&pageSize=20&q=...`
- Status kode: 200/201 sukses, 401 belum auth, 403 tanpa izin, 404 tidak ada, 409 konflik, 422 validasi, 423 terkunci, 500 internal.

## Modul 1 — Autentikasi
| Method | Path | Izin | Body | Keterangan |
|---|---|---|---|---|
| POST | /auth/login | publik | {email,password} | Login, set cookie |
| POST | /auth/logout | auth | — | Revoke sesi |
| GET | /auth/me | auth | — | Profil + permission |

## Modul 2 — Pengguna
| GET | /users | user:manage | — | List + cari |
| POST | /users | user:manage | {email,fullName,password,role,...} | Buat |
| GET | /users/:id | user:manage | — | Detail |
| PUT | /users/:id | user:manage | partial | Update (+reset password) |
| DELETE | /users/:id | user:manage | — | Nonaktifkan (soft) |

## Modul 3 — Pasien
| GET | /patients | patient:read | — | List/cari (scoped faskes) |
| POST | /patients | patient:write | patientSchema | Daftar |
| GET | /patients/:id | patient:read | — | Detail + riwayat |
| PUT | /patients/:id | patient:write | partial | Update |

## Modul 4-6 — Skrining, Skor, CDSS
| GET | /screenings | screening:read | — | List (filter risk,highAlert,status) |
| POST | /screenings | screening:write | {patientId,answers[10]} | Submit final + CDSS |
| POST | /screenings/draft | screening:write | {patientId,answers,screeningId?} | Auto-save DRAFT |
| GET | /screenings/:id | screening:read | — | Detail |
| PATCH | /screenings/:id | screening:review | — | Tandai REVIEWED |
| POST | /cdss | cdss:read | {answers[10]} | Preview rekomendasi (tanpa simpan) |

## Modul 7 — Edukasi
| GET | /education | auth | — | List (filter slugs,risk,category) |
| POST | /education | education:manage | material | Buat |

## Modul 8 — Intervensi
| GET | /interventions | screening:read | — | List (patientId,status) |
| POST | /interventions | intervention:write | interventionSchema | Buat |
| PATCH | /interventions?id= | intervention:write | {status,outcome} | Update |

## Modul 9 — Rujukan
| GET | /referrals | screening:read | — | List |
| POST | /referrals | referral:write | referralSchema | Buat (SENT) |
| PATCH | /referrals/:id | referral:write | {status,feedback} | Transisi closed-loop |

## Modul 10 — Reminder
| GET | /reminders | reminder:write | — | List |
| POST | /reminders | reminder:write | reminderSchema | Jadwalkan |
| POST | /cron/reminders | header x-cron-secret | — | Proses antrian (cron) |

## Modul 11-12 — Analitik & Laporan
| GET | /analytics | analytics:read | — | Ringkasan KPI (Dinas: agregat) |
| GET | /reports/pdf | report:export | — | Unduh PDF |
| GET | /reports/excel | report:export | — | Unduh Excel (Dinas: anonim) |

## Modul 13-14 — Audit & Pengaturan
| GET | /audit | audit:read | — | Audit/Activity (?type=activity) |
| GET | /settings | auth | — | List pengaturan |
| PUT | /settings | settings:manage | {key,value,category} | Upsert |

## Modul 15 — Integrasi
| POST | /integrations/satusehat | integration:manage | {screeningId} | Push FHIR Observation |
| GET | /integrations/bpjs?nokartu= | integration:manage | — | Cek peserta |
| POST | /integrations/whatsapp | integration:manage | {phone,message} | Kirim pesan uji |

### Contoh
```bash
curl -X POST /api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"bidan@baleceribu.id","password":"Bidan#12345"}' -c cookie.txt

curl -X POST /api/screenings -b cookie.txt -H 'Content-Type: application/json' \
  -d '{"patientId":"...","answers":[0,1,2,1,0,0,1,0,0,0]}'
```
