import type { ReactNode } from 'react';
import { Header } from '../common/Header';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-bg-subtle">
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 py-5 md:px-8 md:py-7">
        {children}
      </main>
    </div>
  );
}
