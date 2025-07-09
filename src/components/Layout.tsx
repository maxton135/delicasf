'use client';

import Navigation from './Navigation';
import Footer from './Footer';
import { playfair } from '../app/fonts';
import { useOrderConfig } from '../context/OrderConfigContext';

export default function Layout({ children, fullWidth = false }: { children: React.ReactNode, fullWidth?: boolean }) {
  const { ordersEnabled, disabledMessage } = useOrderConfig();
  
  return (
    <div className="min-h-screen flex flex-col bg-[#1a1a1a]">
      <Navigation />
      
      {/* Global Order Status Banner */}
      {!ordersEnabled && (
        <div className="bg-red-600 text-white py-2 px-4 text-center text-sm font-medium">
          <span className="mr-2">🚫</span>
          Online Orders Disabled
          <span className="hidden sm:inline ml-2">- {disabledMessage}</span>
        </div>
      )}
      
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