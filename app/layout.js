import './globals.css';
import { Inter } from 'next/font/google';
import MainLayout from '@/components/templates/MainLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Atomic Design Demo',
  description: 'Beautiful atomic design system built with Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
