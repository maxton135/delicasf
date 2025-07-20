import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MenuProvider } from '../context/MenuContext';
import { CartProvider } from '../context/CartContext';
import { OrderConfigProvider } from '../context/OrderConfigContext';
import { initializeApp } from '../lib/initializeApp';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Delica SF',
  description: 'Japanese Delicatessen in San Francisco',
};

// Initialize application services
initializeApp();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OrderConfigProvider>
          <MenuProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </MenuProvider>
        </OrderConfigProvider>
      </body>
    </html>
  );
} 