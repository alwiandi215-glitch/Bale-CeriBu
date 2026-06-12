import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { educationService } from '@/services/education.service';

export default function EducationListPage() {
  const { data = [] } = useQuery({ queryKey: ['edu'], queryFn: () => educationService.list() });
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((c: any) => (
        <Link
          key={c.id}
          to={`/education/${c.id}`}
          className="rounded-2xl bg-white dark:bg-slate-800 shadow overflow-hidden hover:shadow-md transition"
        >
          {c.cover_url && <img src={c.cover_url} alt="" className="h-32 w-full object-cover" />}
          <div className="p-4">
            <span className="text-xs text-emerald-600">{c.education_categories?.name}</span>
            <h3 className="font-semibold mt-1">{c.title}</h3>
            <p className="text-sm text-slate-500 line-clamp-2">{c.excerpt}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
