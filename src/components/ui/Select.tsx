// src/components/ui/Select.tsx
import React from 'react';

interface Option<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

interface SelectProps<T = string> extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option<T>[];
  error?: string;
}

export const Select = <T extends string = string>({
  label,
  options,
  error,
  className = '',
  ...props
}: SelectProps<T>) => (
  <div className={`mb-4 ${className}`}>
    {label && (
      <label className="block text-sm font-medium text-stone-300 mb-1">{label}</label>
    )}
    <select
      className={`w-full rounded-md border border-stone-700 bg-stone-950 px-3 py-2.5 text-white focus:border-emerald-500 focus:outline-none ${error ? 'border-red-500' : ''}`}
      {...props}
    >
      {options.map((opt) => (
        <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);
