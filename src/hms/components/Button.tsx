import type { ButtonHTMLAttributes, ReactNode } from 'react';

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed';
  const cls =
    variant === 'primary'
      ? 'bg-primary text-white hover:opacity-95'
      : variant === 'secondary'
        ? 'bg-secondary text-white hover:opacity-95'
        : variant === 'danger'
          ? 'bg-red-600 text-white hover:opacity-95'
          : 'bg-transparent text-slate-700 hover:bg-slate-100';
  return (
    <button className={`${base} ${cls} ${className}`} {...props}>
      {children}
    </button>
  );
}
