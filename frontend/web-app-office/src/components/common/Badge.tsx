import React from 'react';
import { PERMIT_STATUS_COLORS } from '../../utils/constants';

interface BadgeProps {
  status?: string;
  children?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  status,
  children,
  variant,
  size = 'md',
  showDot = true,
  className = '',
}) => {
  if (status) {
    const config = PERMIT_STATUS_COLORS[status.toUpperCase()] || {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      dot: 'bg-slate-400',
    };

    const sizeClasses =
      size === 'sm'
        ? 'px-2 py-0.5 text-xs'
        : size === 'lg'
        ? 'px-3 py-1.5 text-sm font-semibold'
        : 'px-2.5 py-1 text-xs font-medium';

    return (
      <span
        className={`inline-flex items-center gap-1.5 rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
      >
        {showDot && <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />}
        <span>{children || status}</span>
      </span>
    );
  }

  const variantStyles = {
    default: 'bg-tnnavy-50 text-tnnavy-800 border-tnnavy-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const dotStyles = {
    default: 'bg-tnnavy-600',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    info: 'bg-sky-500',
    neutral: 'bg-slate-400',
  };

  const currentVariant = variant || 'default';
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-xs'
      : size === 'lg'
      ? 'px-3 py-1.5 text-sm font-semibold'
      : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${variantStyles[currentVariant]} ${sizeClasses} ${className}`}
    >
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[currentVariant]}`} />}
      <span>{children}</span>
    </span>
  );
};
