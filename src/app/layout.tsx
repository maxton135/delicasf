import type { Metadata } from 'next';
import './globals.css';
import { libre } from './fonts';

export const metadata: Metadata = {
  title: 'DELICA SF',
  description: 'Japanese cuisine in the heart of San Francisco\'s Ferry Building',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${libre.className} text-base`}>{children}</body>
    </html>
  );
} 