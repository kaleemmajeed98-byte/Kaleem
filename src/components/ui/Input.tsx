// src/components/ui/Input.tsx
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => (
  <div className={`mb-4 ${className}`}>
    {label && (
      <label className="block text-sm font-medium text-stone-300 mb-1">{label}</label>
    )}
    <input
      className={`w-full rounded-md border border-stone-700 bg-stone-950 px-3 py-2.5 text-white placeholder-stone-500 focus:border-emerald-500 focus:outline-none ${error ? 'border-red-500' : ''}`}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
  </div>
);
