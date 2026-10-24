import type { Metadata } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';
import { AppProviders } from '@/components/providers/app-providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const themeScript = `
  (() => {
    try {
      const savedTheme = localStorage.getItem("sociality:theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const useDark =
        savedTheme === "dark" || (!savedTheme && prefersDark);

      document.documentElement.classList.toggle("dark", useDark);
      document.documentElement.style.colorScheme = useDark
        ? "dark"
        : "light";
    } catch {}
  })();
`;

export const metadata: Metadata = {
  title: 'Sociality',
  description: 'Tempat berbagi cerita dan terhubung dengan komunitas.',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang='id'
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className='min-h-screen bg-background font-sans text-foreground antialiased'>
        <Script id='sociality-theme' strategy='beforeInteractive'>
          {themeScript}
        </Script>

        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
