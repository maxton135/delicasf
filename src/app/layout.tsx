import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MenuProvider } from '../context/MenuContext';

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
          {children}
        </MenuProvider>
      </body>
    </html>
  );
} 