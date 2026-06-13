-- ============================================================
-- BALE CERI_BU - Fase 2: Skema DB, RLS, Trigger, View, Seed
-- Jalankan SEKALI di Supabase SQL Editor, atau via: supabase db push
-- Idempoten: aman dijalankan ulang.
-- ============================================================

create extension if not exists pgcrypto;

-- Nonaktifkan validasi body fungsi: helper di bawah merujuk tabel yang dibuat setelahnya
set check_function_bodies = off;

-- ---------- Helper RLS (security definer => tidak rekursif) ----------
create or replace function public.current_role_name()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_puskesmas()
returns uuid language sql stable security definer set search_path = public as $$
  select puskesmas_id from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_name() in ('super_admin','administrator'), false)
$$;

create or replace function public.is_super()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.current_role_name() = 'super_admin', false)
$$;

-- ============================ TABEL ============================
create table if not exists public.regions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.puskesmas (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  address text,
  region_id uuid references public.regions(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'pasien'
    check (role in ('super_admin','administrator','kapus','dokter','psikolog','bidan','pasien')),
  puskesmas_id uuid references public.puskesmas(id) on delete set null,
  phone text,
  email text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  nik text,
  no_rm text,
  phone text,
  dob date,
  age int,
  address text,
  gestational_week int,
  has_prev_depression boolean default false,
  status text default 'aktif',
  photo_url text,
  puskesmas_id uuid references public.puskesmas(id) on delete set null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.screenings (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  phase text not null check (phase in ('antenatal','postpartum')),
  examiner_id uuid references auth.users(id),
  status text not null default 'draft' check (status in ('draft','submitted')),
  total_score int,
  risk_level text check (risk_level in ('rendah','sedang','tinggi')),
  puskesmas_id uuid references public.puskesmas(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.screening_answers (
  id uuid primary key default gen_random_uuid(),
  screening_id uuid not null references public.screenings(id) on delete cascade,
  question_no int not null check (question_no between 1 and 10),
  answer_value int not null check (answer_value between 0 and 3)
);

create table if not exists public.patient_timeline (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  event_type text not null,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists public.intervention_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  category text
);

create table if not exists public.interventions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  screening_id uuid references public.screenings(id) on delete set null,
  type_id uuid references public.intervention_types(id),
  notes text,
  status text not null default 'planned' check (status in ('planned','ongoing','done','cancelled')),
  performed_by uuid references auth.users(id),
  performed_at timestamptz,
  puskesmas_id uuid references public.puskesmas(id),
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  screening_id uuid references public.screenings(id) on delete set null,
  from_puskesmas uuid references public.puskesmas(id),
  to_facility text not null,
  reason text,
  urgency text not null default 'rutin' check (urgency in ('rutin','segera','darurat')),
  status text not null default 'requested'
    check (status in ('requested','accepted','in_progress','completed','rejected')),
  puskesmas_id uuid references public.puskesmas(id),
  created_at timestamptz not null default now()
);

create table if not exists public.referral_tracking (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references public.referrals(id) on delete cascade,
  status text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.telehealth_appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete set null,
  patient_user_id uuid references auth.users(id),
  clinician_id uuid references auth.users(id),
  scheduled_at timestamptz not null,
  channel text not null default 'chat' check (channel in ('video','chat')),
  status text not null default 'scheduled',
  meeting_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.telehealth_messages (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.telehealth_appointments(id) on delete cascade,
  sender_id uuid references auth.users(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.education_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists public.education_contents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text,
  body text,
  category_id uuid references public.education_categories(id) on delete set null,
  cover_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  content_id uuid not null references public.education_contents(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, content_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  type text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.ews_alerts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete cascade,
  screening_id uuid references public.screenings(id) on delete cascade,
  level text not null check (level in ('sedang','tinggi')),
  reason text,
  status text not null default 'open' check (status in ('open','ack','closed')),
  ack_by uuid references auth.users(id),
  puskesmas_id uuid references public.puskesmas(id),
  created_at timestamptz not null default now()
);

create table if not exists public.cdss_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  is_active boolean not null default true,
  priority int not null default 10,
  "match" text not null default 'all' check ("match" in ('all','any')),
  conditions jsonb not null default '[]'::jsonb,
  stop_on_match boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.cdss_actions (
  id uuid primary key default gen_random_uuid(),
  rule_id uuid not null references public.cdss_rules(id) on delete cascade,
  type text not null,
  label text not null,
  target text,
  priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  meta jsonb,
  unique (rule_id, label)
);

create table if not exists public.cdss_recommendations (
  id uuid primary key default gen_random_uuid(),
  screening_id uuid references public.screenings(id) on delete cascade,
  matched_rule_ids jsonb,
  actions jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  created_at timestamptz not null default now()
);

-- ============================ TRIGGER & FUNGSI ============================
-- Auto-isi puskesmas_id dari pasien
create or replace function public.fn_set_puskesmas_from_patient()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.puskesmas_id is null then
    select puskesmas_id into new.puskesmas_id from public.patients where id = new.patient_id;
  end if;
  return new;
end $$;

drop trigger if exists trg_pkm_screenings on public.screenings;
create trigger trg_pkm_screenings before insert on public.screenings
  for each row execute function public.fn_set_puskesmas_from_patient();
drop trigger if exists trg_pkm_interventions on public.interventions;
create trigger trg_pkm_interventions before insert on public.interventions
  for each row execute function public.fn_set_puskesmas_from_patient();
drop trigger if exists trg_pkm_referrals on public.referrals;
create trigger trg_pkm_referrals before insert on public.referrals
  for each row execute function public.fn_set_puskesmas_from_patient();

-- Hitung skor EPDS + risk_level saat submit (BEFORE UPDATE)
create or replace function public.fn_calc_screening()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_total int;
begin
  if new.status = 'submitted' and (old.status is distinct from 'submitted') then
    select coalesce(sum(answer_value),0) into v_total
      from public.screening_answers where screening_id = new.id;
    new.total_score := v_total;
    new.risk_level := case when v_total >= 13 then 'tinggi'
                           when v_total >= 10 then 'sedang'
                           else 'rendah' end;
  end if;
  return new;
end $$;

drop trigger if exists trg_calc_screening on public.screenings;
create trigger trg_calc_screening before update on public.screenings
  for each row execute function public.fn_calc_screening();

-- Pasca-submit: timeline + EWS + notifikasi (AFTER UPDATE)
create or replace function public.fn_after_screening()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_q10 int;
begin
  if new.status = 'submitted' and (old.status is distinct from 'submitted') then
    select coalesce(max(answer_value),0) into v_q10
      from public.screening_answers where screening_id = new.id and question_no = 10;

    insert into public.patient_timeline(patient_id, event_type, summary)
    values (new.patient_id, 'skrining',
      format('Skrining EPDS selesai - skor %s (%s)', new.total_score, new.risk_level));

    if new.total_score >= 13 or v_q10 > 0 then
      insert into public.ews_alerts(patient_id, screening_id, level, reason, puskesmas_id)
      values (new.patient_id, new.id, 'tinggi',
        case when v_q10 > 0 then 'Indikasi menyakiti diri (Q10)'
             else 'Skor EPDS tinggi (>=13)' end,
        new.puskesmas_id);

      insert into public.notifications(user_id, title, body, type, link)
      select p.id, 'Alert EWS baru', 'Pasien memerlukan tindak lanjut segera', 'ews',
             '/patients/' || new.patient_id
        from public.profiles p
       where p.role in ('dokter','psikolog','kapus')
         and (p.puskesmas_id = new.puskesmas_id or new.puskesmas_id is null);
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_after_screening on public.screenings;
create trigger trg_after_screening after update on public.screenings
  for each row execute function public.fn_after_screening();

-- Auto-buat profil saat user auth baru dibuat
create or replace function public.fn_handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles(id, full_name, email, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name',''), new.email,
          coalesce(new.raw_user_meta_data->>'role','pasien'))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created after insert on auth.users
  for each row execute function public.fn_handle_new_user();

-- ============================ VIEW (security_invoker => hormati RLS) ============================
create or replace view public.v_dashboard_summary
  with (security_invoker = true) as
select
  p.puskesmas_id,
  count(distinct p.id) as total_pasien,
  count(distinct s.id) filter (where s.status='submitted') as total_skrining,
  count(distinct p.id) filter (where s.risk_level='tinggi') as high_risk,
  (select count(*) from public.ews_alerts e
     where e.puskesmas_id = p.puskesmas_id and e.status='open') as alert_aktif
from public.patients p
left join public.screenings s on s.patient_id = p.id
group by p.puskesmas_id;

create or replace view public.v_screening_monthly
  with (security_invoker = true) as
select
  s.puskesmas_id,
  date_trunc('month', s.created_at)::date as bulan,
  count(*) as total,
  count(*) filter (where s.risk_level='rendah') as rendah,
  count(*) filter (where s.risk_level='sedang') as sedang,
  count(*) filter (where s.risk_level='tinggi') as tinggi
from public.screenings s
where s.status='submitted'
group by s.puskesmas_id, date_trunc('month', s.created_at);

-- ============================ RLS ============================
alter table public.profiles enable row level security;
alter table public.regions enable row level security;
alter table public.puskesmas enable row level security;
alter table public.patients enable row level security;
alter table public.screenings enable row level security;
alter table public.screening_answers enable row level security;
alter table public.patient_timeline enable row level security;
alter table public.intervention_types enable row level security;
alter table public.interventions enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_tracking enable row level security;
alter table public.telehealth_appointments enable row level security;
alter table public.telehealth_messages enable row level security;
alter table public.education_categories enable row level security;
alter table public.education_contents enable row level security;
alter table public.bookmarks enable row level security;
alter table public.notifications enable row level security;
alter table public.ews_alerts enable row level security;
alter table public.cdss_rules enable row level security;
alter table public.cdss_actions enable row level security;
alter table public.cdss_recommendations enable row level security;
alter table public.audit_logs enable row level security;

-- profiles
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_super() or puskesmas_id = public.current_puskesmas());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert to authenticated
  with check (public.is_admin());

-- Master data: baca semua (authenticated), tulis admin
do $$
declare t text;
begin
  foreach t in array array['regions','puskesmas','intervention_types','education_categories','education_contents','cdss_rules','cdss_actions'] loop
    execute format('drop policy if exists %1$s_read on public.%1$s', t);
    execute format('create policy %1$s_read on public.%1$s for select to authenticated using (true)', t);
    execute format('drop policy if exists %1$s_write on public.%1$s', t);
    execute format('create policy %1$s_write on public.%1$s for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

-- Tabel ber-puskesmas
do $$
declare t text;
begin
  foreach t in array array['patients','screenings','ews_alerts','referrals','interventions'] loop
    execute format('drop policy if exists %1$s_pkm on public.%1$s', t);
    execute format('create policy %1$s_pkm on public.%1$s for all to authenticated using (public.is_super() or puskesmas_id = public.current_puskesmas()) with check (public.is_super() or puskesmas_id = public.current_puskesmas())', t);
  end loop;
end $$;

-- Tabel anak: ikut scope induk
drop policy if exists sa_all on public.screening_answers;
create policy sa_all on public.screening_answers for all to authenticated
  using (exists (select 1 from public.screenings s where s.id = screening_id
                 and (public.is_super() or s.puskesmas_id = public.current_puskesmas())))
  with check (exists (select 1 from public.screenings s where s.id = screening_id
                 and (public.is_super() or s.puskesmas_id = public.current_puskesmas())));

drop policy if exists tl_all on public.patient_timeline;
create policy tl_all on public.patient_timeline for all to authenticated
  using (exists (select 1 from public.patients p where p.id = patient_id
                 and (public.is_super() or p.puskesmas_id = public.current_puskesmas())))
  with check (exists (select 1 from public.patients p where p.id = patient_id
                 and (public.is_super() or p.puskesmas_id = public.current_puskesmas())));

drop policy if exists rt_all on public.referral_tracking;
create policy rt_all on public.referral_tracking for all to authenticated
  using (exists (select 1 from public.referrals r where r.id = referral_id
                 and (public.is_super() or r.puskesmas_id = public.current_puskesmas())))
  with check (exists (select 1 from public.referrals r where r.id = referral_id
                 and (public.is_super() or r.puskesmas_id = public.current_puskesmas())));

drop policy if exists rec_all on public.cdss_recommendations;
create policy rec_all on public.cdss_recommendations for all to authenticated
  using (exists (select 1 from public.screenings s where s.id = screening_id
                 and (public.is_super() or s.puskesmas_id = public.current_puskesmas())))
  with check (exists (select 1 from public.screenings s where s.id = screening_id
                 and (public.is_super() or s.puskesmas_id = public.current_puskesmas())));

-- Notifikasi & bookmark: per user
drop policy if exists notif_all on public.notifications;
create policy notif_all on public.notifications for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
drop policy if exists bm_all on public.bookmarks;
create policy bm_all on public.bookmarks for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Telehealth: peserta saja
drop policy if exists tha_all on public.telehealth_appointments;
create policy tha_all on public.telehealth_appointments for all to authenticated
  using (patient_user_id = auth.uid() or clinician_id = auth.uid() or public.is_admin())
  with check (patient_user_id = auth.uid() or clinician_id = auth.uid() or public.is_admin());
drop policy if exists thm_all on public.telehealth_messages;
create policy thm_all on public.telehealth_messages for all to authenticated
  using (exists (select 1 from public.telehealth_appointments a where a.id = appointment_id
                 and (a.patient_user_id = auth.uid() or a.clinician_id = auth.uid() or public.is_admin())))
  with check (exists (select 1 from public.telehealth_appointments a where a.id = appointment_id
                 and (a.patient_user_id = auth.uid() or a.clinician_id = auth.uid() or public.is_admin())));

-- Audit: baca admin
drop policy if exists audit_read on public.audit_logs;
create policy audit_read on public.audit_logs for select to authenticated using (public.is_admin());
drop policy if exists audit_insert on public.audit_logs;
create policy audit_insert on public.audit_logs for insert to authenticated with check (true);

-- ============================ REALTIME ============================
do $$
begin
  begin alter publication supabase_realtime add table public.ews_alerts; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.notifications; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.telehealth_messages; exception when duplicate_object then null; end;
end $$;

-- ============================ STORAGE BUCKET ============================
insert into storage.buckets (id, name, public)
values ('patient-files','patient-files', true)
on conflict (id) do nothing;

-- ============================ SEED ============================
insert into public.regions(name, code) values ('Contoh Kabupaten','KAB-01')
  on conflict (code) do nothing;

insert into public.puskesmas(name, address, region_id)
  select 'Puskesmas Contoh','Jl. Sehat No.1', r.id from public.regions r where r.code='KAB-01'
  on conflict (name) do nothing;

insert into public.intervention_types(name, category) values
  ('Konseling Suportif','konseling'),
  ('Konseling Intensif','konseling'),
  ('Psikoedukasi','edukasi'),
  ('Rujukan Spesialis','rujukan')
  on conflict (name) do nothing;

insert into public.education_categories(name) values
  ('Kesehatan Jiwa Ibu'),('Kehamilan'),('Pasca Persalinan')
  on conflict (name) do nothing;

insert into public.cdss_rules(name, description, priority, "match", conditions, stop_on_match) values
  ('Self-harm - krisis','Q10 lebih dari 0',1,'any','[{"field":"q10","operator":"gt","value":0}]'::jsonb,true),
  ('Risiko tinggi (skor >=13)','risk_level tinggi',2,'all','[{"field":"risk_level","operator":"eq","value":"tinggi"}]'::jsonb,false),
  ('Risiko sedang (10-12)','risk_level sedang',3,'all','[{"field":"risk_level","operator":"eq","value":"sedang"}]'::jsonb,false),
  ('Risiko rendah','risk_level rendah',4,'all','[{"field":"risk_level","operator":"eq","value":"rendah"}]'::jsonb,false)
  on conflict (name) do nothing;

insert into public.cdss_actions(rule_id, type, label, priority)
  select id,'referral','Rujuk segera ke psikolog/psikiater','critical' from public.cdss_rules where name='Self-harm - krisis'
  union all select id,'notify','Notifikasi darurat ke Dokter dan Psikolog','critical' from public.cdss_rules where name='Self-harm - krisis'
  union all select id,'visit_schedule','Kunjungan tindak lanjut < 48 jam','critical' from public.cdss_rules where name='Self-harm - krisis'
  union all select id,'referral','Rujukan evaluasi klinis','high' from public.cdss_rules where name='Risiko tinggi (skor >=13)'
  union all select id,'intervention','Konseling intensif','high' from public.cdss_rules where name='Risiko tinggi (skor >=13)'
  union all select id,'intervention','Konseling suportif','medium' from public.cdss_rules where name='Risiko sedang (10-12)'
  union all select id,'education','Materi: mengenali gejala depresi','medium' from public.cdss_rules where name='Risiko sedang (10-12)'
  union all select id,'education','Edukasi kesehatan jiwa rutin','low' from public.cdss_rules where name='Risiko rendah'
  on conflict (rule_id, label) do nothing;

-- ============================ SELESAI ============================
