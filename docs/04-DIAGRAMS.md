# 04 — Use Case, Activity & Sequence Diagram

## 4.1 Use Case Diagram
```mermaid
flowchart LR
    subgraph Aktor
      KADER([Kader])
      BIDAN([Bidan/Perawat])
      DOKTER([Dokter/Psikolog])
      ADMIN([Admin Faskes])
      SUPER([Super Admin])
      DINAS([Petugas Dinas])
    end
    subgraph Sistem BALE CERIBU
      UC1((Login))
      UC2((Kelola Pengguna))
      UC3((Kelola Pasien))
      UC4((Skrining EPDS))
      UC5((Lihat CDSS))
      UC6((Review Skrining))
      UC7((Kelola Intervensi))
      UC8((Buat Rujukan))
      UC9((Kelola Reminder))
      UC10((Lihat Dashboard))
      UC11((Ekspor Laporan))
      UC12((Lihat Audit))
      UC13((Pengaturan))
      UC14((Integrasi Eksternal))
    end
    KADER --> UC1 & UC3 & UC4 & UC5
    BIDAN --> UC1 & UC3 & UC4 & UC5 & UC7 & UC8 & UC9 & UC10 & UC11
    DOKTER --> UC1 & UC4 & UC5 & UC6 & UC7 & UC8 & UC9 & UC10 & UC11
    ADMIN --> UC1 & UC2 & UC3 & UC10 & UC11 & UC12 & UC13
    SUPER --> UC1 & UC2 & UC10 & UC12 & UC13 & UC14
    DINAS --> UC1 & UC10 & UC11
```

## 4.2 Activity Diagram — Skrining EPDS dengan Auto-save
```mermaid
flowchart TD
    A([Mulai]) --> B[Pilih pasien]
    B --> C[Jawab pertanyaan ke-n]
    C --> D["Debounce 1.2s"]
    D --> E["POST /api/screenings/draft (DRAFT)"]
    E --> F{"Semua 10 item terjawab?"}
    F -- Tidak --> C
    F -- Ya --> G["Klik Hitung skor"]
    G --> H["POST /api/screenings"]
    H --> I["evaluateEpds -> runCdss"]
    I --> J["Simpan COMPLETED + buat intervensi"]
    J --> K[Tampilkan skor + rekomendasi]
    K --> L([Selesai])
```

## 4.3 Sequence Diagram — Submit Skrining
```mermaid
sequenceDiagram
    actor Bidan
    participant UI as Next.js Client
    participant API as Route Handler /api/screenings
    participant ENG as EPDS+CDSS Engine
    participant DB as PostgreSQL (Prisma)
    participant AUD as Audit
    Bidan->>UI: Isi 10 jawaban + submit
    UI->>API: POST { patientId, answers }
    API->>API: getAuth + requirePermission(screening:write)
    API->>ENG: evaluateEpds(answers)
    ENG-->>API: { total, riskLevel, highAlert }
    API->>ENG: runCdss(result)
    ENG-->>API: rekomendasi CDSS
    API->>DB: tx: create Screening + interventions
    DB-->>API: screening
    API->>AUD: writeAudit + writeActivity
    API-->>UI: 201 { screening, result, cdss }
    UI-->>Bidan: Tampilkan skor & rekomendasi
```

## 4.4 Sequence Diagram — Login + Lockout
```mermaid
sequenceDiagram
    actor User
    participant API as /api/auth/login
    participant DB as PostgreSQL
    User->>API: POST { email, password }
    API->>DB: findUnique(user)
    alt akun terkunci
      API-->>User: 423 LOCKED
    else valid
      API->>API: verifyPassword (bcrypt)
      API->>DB: create Session + reset failedLoginCount
      API-->>User: 200 set-cookie bc_session (JWT)
    else gagal
      API->>DB: failedLoginCount++ (lock bila >=5)
      API-->>User: 401 INVALID_CREDENTIALS
    end
```

## 4.5 Sequence Diagram — Reminder via WhatsApp (cron)
```mermaid
sequenceDiagram
    participant CRON as Netlify Scheduled Fn
    participant API as /api/cron/reminders
    participant SVC as reminder-service
    participant DB as PostgreSQL
    participant WA as WhatsApp Gateway
    CRON->>API: POST (x-cron-secret)
    API->>SVC: processDueReminders()
    SVC->>DB: find reminders due (SCHEDULED)
    loop tiap reminder
      SVC->>WA: sendWhatsApp(phone, message)
      WA-->>SVC: { ok, externalId }
      SVC->>DB: update status SENT/FAILED
    end
    SVC-->>API: { processed, sent, failed }
```
