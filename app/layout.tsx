import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from '@/components/error-boundary';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: 'Overflow - Smart Notes & Todo App',
    template: '%s | Overflow',
  },
  description: 'Enterprise-grade notes and todo application with voice transcription, OCR, real-time collaboration, and offline support.',
  keywords: ['notes', 'todo', 'productivity', 'collaboration', 'voice transcription', 'OCR', 'offline', 'PWA'],
  authors: [{ name: 'Overflow Team' }],
  creator: 'Overflow Team',
  publisher: 'Overflow',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://overflow.app',
    title: 'Overflow - Smart Notes & Todo App',
    description: 'Enterprise-grade notes and todo application',
    siteName: 'Overflow',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Overflow - Smart Notes & Todo App',
    description: 'Enterprise-grade notes and todo application',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Overflow',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 4000,
                className: 'text-sm',
                style: {
                  background: 'hsl(var(--background))',
                  color: 'hsl(var(--foreground))',
                  border: '1px solid hsl(var(--border))',
                },
              }}
            />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}