-- ============================================================
-- BALE CERI_BU - Data Contoh (Demo) untuk mengisi semua menu
-- Membuat 6 pasien + skrining EPDS (skor dihitung otomatis oleh
-- trigger), sehingga Dashboard, Pasien, Monitoring, dan Laporan
-- langsung terisi.
-- Aman dijalankan ulang (dilewati jika data DEMO sudah ada).
-- Cara menghapus data contoh ada di bagian paling bawah.
-- ============================================================

do $$
declare
  v_pkm  uuid;
  v_user uuid;
  v_pid  uuid;
  v_sid  uuid;
  rec    record;
  ans    int[];
  i      int;
begin
  if exists (select 1 from public.patients where no_rm like 'DEMO-%') then
    raise notice 'Data contoh sudah ada - dilewati.';
    return;
  end if;

  select id into v_pkm  from public.puskesmas where name = 'Puskesmas Contoh' limit 1;
  select id into v_user from public.profiles  where email = 'difazurex@gmail.com' limit 1;

  for rec in
    select * from (values
      ('Siti Aminah',  'DEMO-001', 27, 28, 'antenatal',  array[1,1,0,1,0,1,0,1,0,0]::int[], '2026-02-10'::timestamptz),
      ('Dewi Lestari', 'DEMO-002', 31, 0,  'postpartum', array[1,1,1,1,1,1,1,1,0,0]::int[], '2026-03-05'::timestamptz),
      ('Rina Marlina', 'DEMO-003', 24, 34, 'antenatal',  array[2,2,1,1,1,1,1,1,1,0]::int[], '2026-04-12'::timestamptz),
      ('Nur Hayati',   'DEMO-004', 29, 0,  'postpartum', array[2,2,2,2,1,1,2,1,2,0]::int[], '2026-05-08'::timestamptz),
      ('Wulan Sari',   'DEMO-005', 22, 30, 'antenatal',  array[2,2,2,1,2,1,1,1,1,2]::int[], '2026-05-20'::timestamptz),
      ('Maya Putri',   'DEMO-006', 33, 0,  'postpartum', array[1,0,1,1,0,1,0,1,1,0]::int[], '2026-06-02'::timestamptz)
    ) as t(nama, rm, umur, uk, fase, jawaban, tgl)
  loop
    insert into public.patients(full_name, no_rm, age, gestational_week, status, puskesmas_id, created_by, created_at)
    values (rec.nama, rec.rm, rec.umur, nullif(rec.uk,0), 'aktif', v_pkm, v_user, rec.tgl)
    returning id into v_pid;

    insert into public.screenings(patient_id, phase, examiner_id, status, puskesmas_id, created_at)
    values (v_pid, rec.fase, v_user, 'draft', v_pkm, rec.tgl)
    returning id into v_sid;

    ans := rec.jawaban;
    for i in 1..10 loop
      insert into public.screening_answers(screening_id, question_no, answer_value)
      values (v_sid, i, ans[i]);
    end loop;

    -- submit => trigger menghitung skor, risiko, alert EWS, notifikasi, timeline
    update public.screenings set status = 'submitted' where id = v_sid;
  end loop;

  raise notice 'Data contoh berhasil dibuat.';
end $$;

-- ------------------------------------------------------------
-- (OPSIONAL) Hapus semua data contoh:
-- delete from public.patients where no_rm like 'DEMO-%';
-- ------------------------------------------------------------
