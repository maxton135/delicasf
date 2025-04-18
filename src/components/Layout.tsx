'use client';

import Navigation from './Navigation';
import Footer from './Footer';
import { playfair } from '../app/layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#132a1f]">
      <Navigation />
      <main className="flex-grow pt-8">
        <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-24">
          <div className="space-y-8">
            {children}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 