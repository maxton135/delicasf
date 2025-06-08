import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MenuProvider } from '../context/MenuContext';
import { CartProvider } from '../context/CartContext';
import CartButton from '../components/CartButton';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Delica SF',
  description: 'Japanese Delicatessen in San Francisco',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MenuProvider>
          <CartProvider>
            {children}
            <CartButton />
          </CartProvider>
        </MenuProvider>
      </body>
    </html>
  );
} 