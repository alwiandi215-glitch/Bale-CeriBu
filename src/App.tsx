import { lazy, Suspense } from 'react';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import {
  FiActivity,
  FiBookOpen,
  FiGrid,
  FiSettings,
  FiUsers,
  FiFileText,
} from 'react-icons/fi';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

const DashboardPage = lazy(() => import('@/features/dashboard/pages/DashboardPage'));
const PatientsPage = lazy(() => import('@/features/patients/pages/PatientsPage'));
const MonitoringPage = lazy(() => import('@/features/monitoring/pages/MonitoringPage'));
const ReportsPage = lazy(() => import('@/features/reports/pages/ReportsPage'));
const EducationListPage = lazy(() => import('@/features/education/pages/EducationListPage'));
const SettingsPage = lazy(() => import('@/features/settings/pages/SettingsPage'));

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: <FiGrid /> },
  { to: '/patients', label: 'Pasien', icon: <FiUsers /> },
  { to: '/monitoring', label: 'Monitoring', icon: <FiActivity /> },
  { to: '/reports', label: 'Laporan', icon: <FiFileText /> },
  { to: '/education', label: 'Edukasi', icon: <FiBookOpen /> },
  { to: '/settings', label: 'Pengaturan', icon: <FiSettings /> },
];

export default function App() {
  return (
    <div className="min-h-full flex">
      <aside className="w-60 shrink-0 border-r border-slate-200 dark:border-slate-700 p-4 hidden md:block">
        <div className="mb-6 flex items-center gap-2">
          <span className="size-8 grid place-items-center rounded-xl bg-emerald-600 text-white font-bold">B</span>
          <span className="font-bold">BALE CERI_BU</span>
        </div>
        <nav className="space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-slate-800' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`
              }
            >
              {n.icon}
              {n.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <Suspense fallback={<LoadingSkeleton rows={5} />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/patients" element={<PatientsPage />} />
            <Route path="/monitoring" element={<MonitoringPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/education" element={<EducationListPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
