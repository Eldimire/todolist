import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-bg-subtle flex items-center justify-center px-4">
      <div className="w-full max-w-[400px] bg-bg-base rounded-[20px] p-10 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        {title && (
          <h1 className="text-[28px] leading-9 font-bold text-text-primary text-center mb-8">
            {title}
          </h1>
        )}
        {children}
      </div>
    </div>
  );
}
