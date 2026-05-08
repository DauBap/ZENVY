'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AppChrome({ children }) {
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    if (!document?.body) return;
    document.body.classList.toggle('home-hero', isHome);
    return () => document.body.classList.remove('home-hero');
  }, [isHome]);

  if (isHome) return <>{children}</>;

  return (
    <>
      <Header />
      <main className="app-main">{children}</main>
      <Footer />
    </>
  );
}

