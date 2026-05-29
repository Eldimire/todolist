import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#F8F8F8] flex items-center justify-center px-4">
      <div className="w-full max-w-[400px] bg-white rounded-[20px] p-10 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        {title && (
          <h1 className="text-[28px] leading-9 font-bold text-[#111827] text-center mb-8">
            {title}
          </h1>
        )}
        {children}
      </div>
    </div>
  );
}
