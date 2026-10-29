import type { Metadata } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import { Geist_Mono, Inter } from 'next/font/google';

import './globals.css';
import { AppProviders } from '@/components/providers/app-providers';

const inter = Inter({
  variable: '--font-inter',
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
      // Desain Figma dark-first: gelap kecuali pengguna memilih terang.
      const useDark = savedTheme !== "light";

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
      data-scroll-behavior='smooth'
      className={`dark ${inter.variable} ${geistMono.variable}`}
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
