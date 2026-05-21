// src/app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { DM_Sans, Syne } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-syne',
  display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'StackSolve — Anonymous College Community', template: '%s | StackSolve' },
  description: 'A safe anonymous space for college students to share problems, ask questions, and help each other.',
  keywords: ['college', 'anonymous', 'community', 'students', 'help', 'discussion'],
  authors: [{ name: 'StackSolve' }],
  openGraph: {
    title: 'StackSolve — Anonymous College Community',
    description: 'Ask anything. Help everyone. Stay anonymous.',
    type: 'website',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#7c6aff',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${dmSans.variable} ${syne.variable} font-sans bg-surface-0 text-white antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#12121a',
              color: '#f0eeff',
              border: '1px solid #2a2740',
              borderRadius: '12px',
              fontFamily: 'var(--font-dm-sans)',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#22d3a5', secondary: '#12121a' } },
            error: { iconTheme: { primary: '#f43f5e', secondary: '#12121a' } },
          }}
        />
      </body>
    </html>
  );
}
