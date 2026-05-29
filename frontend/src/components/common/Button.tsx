import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  children: ReactNode;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-[#4A7AAF] text-white hover:bg-[#3A6A9F] active:bg-[#2A5A8F]',
  secondary: 'bg-white text-text-primary border border-[#A3BDD8] hover:bg-bg-subtle',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
};

export function Button({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`px-4 py-2 text-sm font-medium rounded-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {loading ? '처리 중...' : children}
    </button>
  );
}
