import { FiUsers, FiClipboard, FiAlertTriangle, FiActivity } from 'react-icons/fi';
import { useDashboard } from '../hooks/useDashboard';
import { useAuth } from '@/context/AuthContext';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { RiskTrendChart } from '@/components/charts/RiskTrendChart';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

export default function DashboardPage() {
  const { profile } = useAuth();
  const { summary, monthly } = useDashboard();
  if (summary.isLoading) return <LoadingSkeleton rows={4} />;
  const s = summary.data!;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Halo, {profile?.fullName} 👋</h1>
        <p className="text-slate-500 capitalize">Dashboard {profile?.role.replace('_', ' ')}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Pasien" value={s.total_pasien} icon={<FiUsers />} />
        <KpiCard label="Total Skrining" value={s.total_skrining} icon={<FiClipboard />} tone="success" />
        <KpiCard label="Pasien High Risk" value={s.high_risk} icon={<FiAlertTriangle />} tone="danger" />
        <KpiCard label="Alert Aktif" value={s.alert_aktif} icon={<FiActivity />} tone="warning" />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">{monthly.data && <RiskTrendChart rows={monthly.data} />}</div>
        <ActivityFeed />
      </section>
    </div>
  );
}
