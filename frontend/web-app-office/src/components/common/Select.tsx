import React, { forwardRef } from 'react';

interface Option {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: (Option | string)[];
  error?: string;
  helperText?: string;
  placeholder?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      placeholder,
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={`w-full flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label htmlFor={selectId} className="text-xs font-semibold uppercase tracking-wider text-slate-700">
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`w-full appearance-none bg-white border rounded-lg px-3.5 py-2 pr-8 text-sm text-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-tnnavy-500 focus:border-tnnavy-500 disabled:bg-slate-50 disabled:text-slate-400 ${
              error ? 'border-rose-400 focus:ring-rose-400 focus:border-rose-400' : 'border-slate-300'
            } ${className}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt, idx) => {
              if (typeof opt === 'string') {
                return (
                  <option key={idx} value={opt}>
                    {opt}
                  </option>
                );
              }
              return (
                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              );
            })}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        {error ? (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
