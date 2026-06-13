import { type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FiArrowLeft } from 'react-icons/fi';
import { educationService } from '@/services/education.service';

// Render isi artikel (markdown sederhana: ## judul, - daftar, paragraf)
function renderBody(body: string): ReactNode[] {
  const lines = (body ?? '').split('\n');
  const out: ReactNode[] = [];
  let list: string[] = [];
  const flush = (key: string) => {
    if (list.length) {
      const items = list;
      out.push(
        <ul key={`ul-${key}`} className="list-disc pl-6 space-y-1 my-2">
          {items.map((t, i) => (
            <li key={i}>{t}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };
  lines.forEach((raw, idx) => {
    const line = raw.trim();
    if (line.startsWith('## ')) {
      flush(String(idx));
      out.push(
        <h2 key={idx} className="text-lg font-semibold mt-5 mb-1">
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith('- ')) {
      list.push(line.slice(2));
    } else if (line === '') {
      flush(String(idx));
    } else {
      flush(String(idx));
      out.push(
        <p key={idx} className="my-2 leading-relaxed">
          {line}
        </p>,
      );
    }
  });
  flush('end');
  return out;
}

export default function EducationDetailPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ['edu-detail', id],
    queryFn: async () => {
      const { data, error } = await educationService.byId(id!);
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });

  const backLink = (
    <Link
      to="/education"
      className="inline-flex items-center gap-1 text-emerald-600 text-sm hover:underline"
    >
      <FiArrowLeft /> Kembali ke Edukasi
    </Link>
  );

  if (isLoading) {
    return <p className="text-slate-400">Memuat materi...</p>;
  }

  if (error || !data) {
    return (
      <div className="space-y-4">
        {backLink}
        <p className="text-slate-500">Materi tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto space-y-4">
      {backLink}
      {data.cover_url && (
        <img src={data.cover_url} alt="" className="w-full h-56 object-cover rounded-2xl" />
      )}
      <h1 className="text-2xl font-bold">{data.title}</h1>
      {data.excerpt && <p className="text-slate-500">{data.excerpt}</p>}
      <div className="text-slate-700 dark:text-slate-200 text-sm sm:text-base">
        {renderBody(data.body)}
      </div>
    </article>
  );
}
