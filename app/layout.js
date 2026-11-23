import { Special_Elite } from 'next/font/google';
import './globals.css';

const font = Special_Elite({ weight: '400', subsets: ['latin'], display: 'swap', variable: '--font-elite' });

export const metadata = { title: 'Red Letters' };
export const viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={font.variable}>{children}</body>
    </html>
  );
}
