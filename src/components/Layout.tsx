'use client';

import Navigation from './Navigation';
import Footer from './Footer';
import { playfair } from '../app/fonts';

export default function Layout({ children, fullWidth = false }: { children: React.ReactNode, fullWidth?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a1a]">
      <Navigation />
      <main className={`flex-grow ${fullWidth ? '' : 'pt-2'}`}>
        <div className={`${fullWidth ? '' : 'max-w-7xl mx-auto px-8 sm:px-12 lg:px-24'}`}>
          <div className="space-y-8">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 