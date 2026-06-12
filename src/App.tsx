import { lazy, Suspense } from 'react';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import {
  FiActivity,
  FiBookOpen,
  FiGrid,
  FiSettings,
  FiUsers,
  FiFileText,
  FiLogOut,
} from 'react-icons/fi';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useAuth } from '@/context/AuthContext';
import LoginPage from '@/features/auth/pages/LoginPage';

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

function AppShell() {
  const { profile, signOut } = useAuth();
  return (
    <div className="min-h-full flex">
      <aside className="w-60 shrink-0 border-r border-slate-200 dark:border-slate-700 p-4 hidden md:flex md:flex-col">
        <div className="mb-6 flex items-center gap-2">
          <span className="size-8 grid place-items-center rounded-xl bg-emerald-600 text-white font-bold">
            B
          </span>
          <span className="font-bold">BALE CERI_BU</span>
        </div>
        <nav className="space-y-1 flex-1">
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
        <div className="mt-4 border-t border-slate-200 dark:border-slate-700 pt-3">
          <p className="px-3 text-xs text-slate-400 truncate">{profile?.fullName}</p>
          <button
            onClick={() => void signOut()}
            className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <FiLogOut />
            Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
        <ErrorBoundary>
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
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default function App() {
  const { loading, authUserId, profile, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-full grid place-items-center">
        <div className="animate-pulse text-slate-400">Memuat...</div>
      </div>
    );
  }

  if (!authUserId) return <LoginPage />;

  if (!profile) {
    return (
      <div className="min-h-full grid place-items-center p-6 text-center">
        <div className="max-w-md space-y-3">
          <h1 className="text-lg font-bold">Profil belum tersedia</h1>
          <p className="text-sm text-slate-500">
            Akun Anda berhasil terautentikasi, tetapi belum ada baris profil di database. Jalankan
            setup database (Fase 2) lalu buat profil untuk akun ini.
          </p>
          <button
            onClick={() => void signOut()}
            className="rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm"
          >
            Keluar
          </button>
        </div>
      </div>
    );
  }

  return <AppShell />;
}
