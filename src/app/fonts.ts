import { Playfair_Display, Libre_Franklin, Noto_Serif_JP } from 'next/font/google';

export const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
});

export const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

export const libre = Libre_Franklin({
  subsets: ['latin'],
  display: 'swap',
}); 