import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboard.service';
import { useAuth } from '@/context/AuthContext';

export function useDashboard(year = new Date().getFullYear()) {
  const { profile } = useAuth();
  const pkm = profile?.role === 'super_admin' ? null : profile?.puskesmasId ?? null;
  const summary = useQuery({
    queryKey: ['dash-summary', pkm],
    queryFn: () => dashboardService.summary(pkm),
    enabled: !!profile,
  });
  const monthly = useQuery({
    queryKey: ['dash-monthly', pkm, year],
    queryFn: () => dashboardService.monthly(pkm, year),
    enabled: !!profile,
  });
  return { summary, monthly };
}
