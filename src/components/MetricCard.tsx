import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtext?: string;
  icon: LucideIcon;
  badge?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'neutral';
  progress?: number; // 0-100
  colorScheme?: 'emerald' | 'blue' | 'purple' | 'slate';
  tooltip?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtext,
  icon: Icon,
  badge,
  badgeType = 'success',
  progress,
  colorScheme = 'emerald',
}) => {
  const colorStyles = {
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      bar: 'bg-emerald-500',
    },
    blue: {
      bg: 'bg-blue-50 text-blue-600',
      bar: 'bg-blue-500',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      bar: 'bg-purple-500',
    },
    slate: {
      bg: 'bg-slate-100 text-slate-700',
      bar: 'bg-slate-700',
    },
  }[colorScheme];

  const badgeStyles = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  }[badgeType];

  return (
    <div className="sleek-card hover:border-slate-300 transition-all">
      <div className="flex items-center justify-between">
        <span className="sleek-section-title mb-0">{title}</span>
        <div className={`p-1.5 rounded-lg ${colorStyles.bg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-2.5 flex items-baseline gap-1.5">
        <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">{value}</span>
        {unit && <span className="text-xs font-semibold text-slate-500 font-sans">{unit}</span>}
      </div>

      {(subtext || badge) && (
        <div className="mt-2 flex items-center justify-between text-xs">
          {subtext && <span className="text-slate-500 truncate max-w-[180px]">{subtext}</span>}
          {badge && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${badgeStyles}`}>
              {badge}
            </span>
          )}
        </div>
      )}

      {progress !== undefined && (
        <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colorStyles.bar}`}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  );
};
