import { Line } from 'react-chartjs-2';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { MonthlyRow } from '@/services/dashboard.service';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const BULAN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function RiskTrendChart({ rows }: { rows: MonthlyRow[] }) {
  const idx = (r: MonthlyRow) => new Date(r.bulan).getMonth();
  const series = (key: keyof MonthlyRow) => {
    const arr = Array(12).fill(0);
    rows.forEach((r) => {
      arr[idx(r)] = Number(r[key]) || 0;
    });
    return arr;
  };
  const data = {
    labels: BULAN,
    datasets: [
      { label: 'Rendah', data: series('rendah'), borderColor: '#22c55e', backgroundColor: '#22c55e', tension: 0.3 },
      { label: 'Sedang', data: series('sedang'), borderColor: '#f59e0b', backgroundColor: '#f59e0b', tension: 0.3 },
      { label: 'Tinggi', data: series('tinggi'), borderColor: '#ef4444', backgroundColor: '#ef4444', tension: 0.3 },
    ],
  };
  const options = { responsive: true, plugins: { legend: { position: 'bottom' as const } } };
  return (
    <div className="rounded-2xl bg-white/80 dark:bg-slate-800 p-5 shadow">
      <h3 className="font-semibold mb-3">Trend Risiko Bulanan</h3>
      <Line data={data} options={options} />
    </div>
  );
}
