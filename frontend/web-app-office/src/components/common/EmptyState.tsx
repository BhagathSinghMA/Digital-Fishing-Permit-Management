import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`w-full py-12 px-6 flex flex-col items-center justify-center text-center bg-white rounded-2xl border border-dashed border-slate-300 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mb-4 shadow-inner">
        {icon || <Inbox className="w-7 h-7" />}
      </div>
      <h4 className="text-base font-bold text-slate-800">{title}</h4>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-5">{description}</p>
      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};
