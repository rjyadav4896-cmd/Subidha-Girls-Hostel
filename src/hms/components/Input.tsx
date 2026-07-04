import type { InputHTMLAttributes } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  const { label, className = '', id, ...rest } = props;
  const inputId = id ?? `input-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

  return (
    <label className="block" htmlFor={inputId}>
      <div className="text-xs font-semibold text-slate-600 mb-1">{label}</div>
      <input
        {...rest}
        id={inputId}
        className={`w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-secondary focus:ring-2 focus:ring-secondary/30 disabled:bg-slate-50 disabled:text-slate-500 ${className}`}
      />
    </label>
  );
}
