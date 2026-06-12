# 03 — Business Process & BPMN

## 3.1 Proses Bisnis Inti
1. Kader/Bidan mendaftarkan ibu (consent).
2. Petugas melakukan skrining EPDS (auto-save).
3. Sistem menghitung skor & menjalankan CDSS.
4. Berdasarkan risiko: edukasi (LOW), intervensi + follow-up (MEDIUM), rujukan (HIGH), atau respons darurat (HIGH ALERT).
5. Rujukan dilacak hingga closed-loop.
6. Reminder follow-up dikirim otomatis.
7. Data teragregasi ke dashboard & laporan; opsi push ke SATUSEHAT.

## 3.2 Diagram BPMN (alur skrining → keputusan)
```mermaid
flowchart TD
    A([Mulai]) --> B["Daftarkan/identifikasi pasien + consent"]
    B --> C["Isi kuesioner EPDS (auto-save draft)"]
    C --> D["Submit skrining"]
    D --> E["Hitung skor 0-30 (rule engine)"]
    E --> F{"Item 10 > 0?"}
    F -- "Ya" --> G["HIGH ALERT: respons darurat"]
    G --> H["Buat rujukan mendesak + tindakan keselamatan (SLA 24 jam)"]
    F -- "Tidak" --> I{"Klasifikasi skor"}
    I -- "0-9 LOW" --> J["Edukasi + jadwal skrining ulang"]
    I -- "10-12 MEDIUM" --> K["Intervensi + follow-up 7 hari"]
    I -- ">=13 HIGH" --> L["Rujukan ke faskes lanjutan (48 jam)"]
    H --> M["Monitoring & reminder"]
    J --> M
    K --> M
    L --> M
    M --> N["Update dashboard + audit log"]
    N --> O([Selesai])
```

## 3.3 Sub-proses Rujukan (closed-loop)
```mermaid
flowchart LR
    S1([SENT]) --> S2{Diterima faskes tujuan?}
    S2 -- Ya --> S3([ACCEPTED])
    S2 -- Tidak --> S4([REJECTED])
    S3 --> S5["Penanganan + feedback"]
    S5 --> S6([CLOSED])
```
