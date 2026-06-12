import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function KpiCard({
  label,
  value,
  icon,
  tone = 'primary',
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  tone?: 'primary' | 'success' | 'warning' | 'danger';
}) {
  const toneMap = {
    primary: 'from-emerald-500 to-emerald-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-amber-500 to-amber-600',
    danger: 'from-red-500 to-red-600',
  } as const;
  return (
    <motion.div
      initial={ { opacity: 0, y: 8 } }
      animate={ { opacity: 1, y: 0 } }
      className="size-full rounded-2xl bg-white/80 dark:bg-slate-800 backdrop-blur-sm shadow p-5 flex items-center gap-4"
    >
      <div
        className={`size-12 grid place-items-center rounded-xl text-white bg-gradient-to-br ${toneMap[tone]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </motion.div>
  );
}
