import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Overflow - Smart Notes & Todo App',
  description: 'Advanced notes and todo application with voice transcription, OCR, collaboration, and more.',
  keywords: ['notes', 'todo', 'productivity', 'collaboration', 'voice transcription', 'OCR'],
  authors: [{ name: 'Overflow Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              className: 'text-sm',
            }}
          />
        </Providers>
      </body>
    </html>
  );
}