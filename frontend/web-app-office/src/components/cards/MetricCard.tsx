import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  trend?: {
    text: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'primary',
  trend,
  onClick,
}) => {
  const variantStyles = {
    primary: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-tnnavy-300',
      iconBg: 'bg-tnnavy-50 text-tnnavy-800',
      accent: 'text-tnnavy-900',
    },
    success: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-emerald-300',
      iconBg: 'bg-emerald-50 text-emerald-700',
      accent: 'text-emerald-700',
    },
    warning: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-amber-300',
      iconBg: 'bg-amber-50 text-amber-700',
      accent: 'text-amber-800',
    },
    danger: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-rose-300',
      iconBg: 'bg-rose-50 text-rose-700',
      accent: 'text-rose-700',
    },
    info: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-sky-300',
      iconBg: 'bg-sky-50 text-sky-700',
      accent: 'text-sky-800',
    },
    neutral: {
      bg: 'bg-white',
      border: 'border-slate-200/80 hover:border-slate-300',
      iconBg: 'bg-slate-100 text-slate-700',
      accent: 'text-slate-900',
    },
  };

  const current = variantStyles[variant];

  return (
    <div
      onClick={onClick}
      className={`${current.bg} ${current.border} p-5 rounded-2xl border shadow-sm transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
        onClick ? 'cursor-pointer' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 line-clamp-1">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl shrink-0 ${current.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3">
        <div className={`text-2xl lg:text-3xl font-extrabold tracking-tight ${current.accent}`}>
          {value}
        </div>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs">
          <span
            className={`font-semibold ${
              trend.isPositive ? 'text-emerald-600' : 'text-slate-500'
            }`}
          >
            {trend.text}
          </span>
        </div>
      )}
    </div>
  );
};
