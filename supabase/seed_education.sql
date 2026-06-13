-- ============================================================
-- BALE CERI_BU - Seed Konten Edukasi
-- Jalankan di Supabase SQL Editor. Aman dijalankan ulang
-- (cek duplikat berdasarkan judul).
-- ============================================================

-- ---------------- KATEGORI: Kehamilan ----------------
insert into public.education_contents (title, excerpt, body, category_id, is_published)
select 'Menjaga Kesehatan Mental Selama Kehamilan',
       'Cara praktis menjaga suasana hati dan ketenangan selama masa kehamilan.',
       $body$## Mengapa penting?
Kehamilan membawa perubahan hormon dan emosi yang besar. Menjaga kesehatan mental sama pentingnya dengan menjaga kesehatan fisik, baik bagi ibu maupun janin.

## Langkah sederhana
- Istirahat cukup dan jaga pola tidur.
- Ceritakan perasaan Anda kepada pasangan, keluarga, atau bidan.
- Lakukan aktivitas ringan seperti jalan santai atau peregangan.
- Batasi paparan berita atau hal yang memicu cemas.
- Ikuti kontrol kehamilan secara rutin.

## Kapan waspada?
Jika rasa sedih, cemas, atau kehilangan minat berlangsung lebih dari dua minggu, sampaikan kepada petugas kesehatan agar dapat dilakukan skrining EPDS.$body$,
       c.id, true
from public.education_categories c
where c.name = 'Kehamilan'
and not exists (select 1 from public.education_contents e where e.title = 'Menjaga Kesehatan Mental Selama Kehamilan');

insert into public.education_contents (title, excerpt, body, category_id, is_published)
select 'Mengenali Kecemasan Berlebih Saat Hamil',
       'Membedakan cemas yang wajar dengan kecemasan yang perlu ditangani.',
       $body$## Cemas itu wajar
Merasa khawatir tentang persalinan dan kesehatan bayi adalah hal normal. Namun kecemasan bisa menjadi masalah bila mengganggu tidur, nafsu makan, atau aktivitas sehari-hari.

## Tanda kecemasan berlebih
- Khawatir berlebihan yang sulit dikendalikan.
- Jantung berdebar, sesak, atau gemetar tanpa sebab fisik.
- Sulit tidur meski tubuh lelah.
- Menghindari aktivitas atau pemeriksaan kehamilan.

## Yang bisa dilakukan
- Latih pernapasan perlahan dan dalam.
- Bagikan kekhawatiran kepada orang terpercaya.
- Jangan ragu meminta skrining dan konseling di puskesmas.$body$,
       c.id, true
from public.education_categories c
where c.name = 'Kehamilan'
and not exists (select 1 from public.education_contents e where e.title = 'Mengenali Kecemasan Berlebih Saat Hamil');

-- ---------------- KATEGORI: Pasca Persalinan ----------------
insert into public.education_contents (title, excerpt, body, category_id, is_published)
select 'Baby Blues atau Depresi Pascapersalinan? Kenali Bedanya',
       'Panduan singkat membedakan baby blues yang umum dengan depresi pascapersalinan.',
       $body$## Baby blues
Dialami banyak ibu pada 1 hingga 2 minggu pertama setelah melahirkan. Gejalanya ringan: mudah menangis, cemas, dan suasana hati naik turun. Biasanya membaik sendiri.

## Depresi pascapersalinan
Lebih berat dan berlangsung lebih lama (lebih dari dua minggu). Tandanya antara lain:
- Sedih mendalam atau merasa hampa terus menerus.
- Kehilangan minat pada bayi atau aktivitas.
- Gangguan tidur dan nafsu makan yang berat.
- Merasa tidak berharga atau bersalah berlebihan.
- Muncul pikiran menyakiti diri sendiri.

## Penting
Jika gejala berat atau muncul pikiran menyakiti diri, segera hubungi petugas kesehatan. Kondisi ini bisa ditangani dengan dukungan dan terapi yang tepat.$body$,
       c.id, true
from public.education_categories c
where c.name = 'Pasca Persalinan'
and not exists (select 1 from public.education_contents e where e.title = 'Baby Blues atau Depresi Pascapersalinan? Kenali Bedanya');

insert into public.education_contents (title, excerpt, body, category_id, is_published)
select 'Perawatan Diri untuk Ibu Baru',
       'Langkah self-care sederhana agar ibu tetap sehat secara fisik dan mental.',
       $body$## Rawat diri, rawat bayi
Ibu yang sehat secara mental lebih mampu merawat bayinya. Perawatan diri bukan hal egois, melainkan kebutuhan.

## Tips harian
- Tidur saat bayi tidur, meski sebentar.
- Makan teratur dan cukup minum air.
- Terima bantuan dari pasangan dan keluarga.
- Sisihkan waktu singkat untuk diri sendiri.
- Jangan menuntut diri menjadi ibu sempurna.

## Bangun dukungan
Bergabunglah dengan kelompok ibu atau manfaatkan layanan konseling di puskesmas bila merasa kewalahan.$body$,
       c.id, true
from public.education_categories c
where c.name = 'Pasca Persalinan'
and not exists (select 1 from public.education_contents e where e.title = 'Perawatan Diri untuk Ibu Baru');

-- ---------------- KATEGORI: Kesehatan Jiwa Ibu ----------------
insert into public.education_contents (title, excerpt, body, category_id, is_published)
select 'Memahami Skrining EPDS',
       'Apa itu EPDS dan mengapa penting untuk deteksi dini depresi.',
       $body$## Apa itu EPDS?
Edinburgh Postnatal Depression Scale (EPDS) adalah kuesioner 10 pertanyaan untuk mendeteksi risiko depresi pada masa kehamilan dan setelah melahirkan.

## Cara kerja
- Setiap pertanyaan bernilai 0 sampai 3.
- Skor total berkisar 0 sampai 30.
- Skor lebih tinggi menandakan risiko lebih besar.

## Makna skor (panduan umum)
- 0 sampai 9: risiko rendah.
- 10 sampai 12: risiko sedang, perlu pemantauan.
- 13 atau lebih: risiko tinggi, perlu tindak lanjut.

## Catatan
EPDS adalah alat skrining, bukan diagnosis. Hasil tinggi berarti ibu perlu evaluasi lebih lanjut oleh tenaga kesehatan.$body$,
       c.id, true
from public.education_categories c
where c.name = 'Kesehatan Jiwa Ibu'
and not exists (select 1 from public.education_contents e where e.title = 'Memahami Skrining EPDS');

insert into public.education_contents (title, excerpt, body, category_id, is_published)
select 'Kapan Ibu Perlu Mencari Bantuan Profesional',
       'Tanda-tanda yang menunjukkan ibu sebaiknya segera mendapat bantuan.',
       $body$## Jangan tunggu terlalu lama
Mencari bantuan lebih awal membuat pemulihan lebih cepat. Tidak ada yang perlu dimalukan dari meminta pertolongan.

## Segera cari bantuan bila
- Suasana hati sangat sedih atau hampa lebih dari dua minggu.
- Tidak mampu merawat diri atau bayi.
- Gangguan tidur dan makan yang berat.
- Muncul pikiran menyakiti diri sendiri atau bayi.

## Ke mana harus pergi
- Hubungi bidan, dokter, atau psikolog di puskesmas.
- Pada kondisi darurat, minta keluarga segera mengantar ke fasilitas kesehatan.$body$,
       c.id, true
from public.education_categories c
where c.name = 'Kesehatan Jiwa Ibu'
and not exists (select 1 from public.education_contents e where e.title = 'Kapan Ibu Perlu Mencari Bantuan Profesional');

insert into public.education_contents (title, excerpt, body, category_id, is_published)
select 'Peran Keluarga dalam Mendukung Kesehatan Jiwa Ibu',
       'Cara pasangan dan keluarga membantu ibu tetap sehat secara mental.',
       $body$## Dukungan keluarga sangat berarti
Ibu yang merasa didukung lebih jarang mengalami depresi. Keluarga adalah garda terdepan.

## Yang bisa dilakukan keluarga
- Dengarkan tanpa menghakimi.
- Bantu pekerjaan rumah dan merawat bayi.
- Pastikan ibu cukup istirahat dan makan.
- Perhatikan perubahan suasana hati ibu.
- Temani ibu saat kontrol atau konseling.

## Bila melihat tanda bahaya
Jika ibu tampak sangat sedih, menarik diri, atau menyebut ingin menyakiti diri, jangan biarkan sendirian dan segera hubungi tenaga kesehatan.$body$,
       c.id, true
from public.education_categories c
where c.name = 'Kesehatan Jiwa Ibu'
and not exists (select 1 from public.education_contents e where e.title = 'Peran Keluarga dalam Mendukung Kesehatan Jiwa Ibu');
