'use client';

import { Home, Plus, Search, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { AuthNavigation } from '@/components/sociality/auth-navigation';
import { BrandLogo } from '@/components/sociality/brand-logo';
import { ThemeToggle } from '@/components/sociality/theme-toggle';
import { ToastViewport } from '@/components/sociality/toast-viewport';
import { cn } from 'cn';

type AppShellProps = {
  children: ReactNode;
};

const bottomNavItemClassName =
  'flex w-16 flex-col items-center justify-center gap-1 rounded-xl py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40';

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  function handleCreatePostClick() {
    router.push('/posts/new');
  }

  const feedIsActive = pathname === '/feed';
  const profileIsActive = pathname === '/me' || pathname.startsWith('/me/');
  const searchIsActive = pathname === '/search';

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <header className='sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-xl'>
        <div className='mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:h-20 sm:px-6'>
          <Link
            href='/feed'
            prefetch={false}
            aria-label='Sociality, ke beranda'
            className='shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40'
          >
            <BrandLogo />
          </Link>

          <Link
            href='/search'
            prefetch={false}
            aria-label='Cari pengguna'
            aria-current={searchIsActive ? 'page' : undefined}
            className='hidden h-11 w-full max-w-sm items-center gap-2 rounded-full border border-border bg-muted/40 px-4 text-sm text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 md:flex'
          >
            <Search className='size-4' aria-hidden='true' />
            Cari pengguna
          </Link>

          <div className='flex shrink-0 items-center gap-2'>
            <Link
              href='/search'
              prefetch={false}
              aria-label='Cari pengguna'
              aria-current={searchIsActive ? 'page' : undefined}
              className={cn(
                'inline-flex size-10 items-center justify-center rounded-full transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 md:hidden',
                searchIsActive && 'text-brand-200'
              )}
            >
              <Search className='size-5' aria-hidden='true' />
            </Link>

            <ThemeToggle />
            <AuthNavigation />
          </div>
        </div>
      </header>

      <main className='mx-auto w-full max-w-2xl px-4 pt-6 pb-[calc(8rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-8'>
        {children}
      </main>

      <ToastViewport />

      <nav
        aria-label='Navigasi utama'
        className='fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-4'
      >
        <div className='flex h-[68px] items-center gap-6 rounded-full border border-border bg-card/90 px-5 shadow-xl shadow-black/30 backdrop-blur-xl'>
          <Link
            href='/feed'
            prefetch={false}
            aria-current={feedIsActive ? 'page' : undefined}
            className={cn(
              bottomNavItemClassName,
              feedIsActive
                ? 'text-brand-200'
                : 'text-foreground hover:text-brand-200'
            )}
          >
            <Home className='size-5' aria-hidden='true' />
            <span>Beranda</span>
          </Link>

          <button
            type='button'
            aria-label='Buat postingan'
            className='flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-colors hover:bg-primary/85 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50'
            onClick={handleCreatePostClick}
          >
            <Plus className='size-6' aria-hidden='true' />
          </button>

          <Link
            href='/me'
            prefetch={false}
            aria-current={profileIsActive ? 'page' : undefined}
            className={cn(
              bottomNavItemClassName,
              profileIsActive
                ? 'text-brand-200'
                : 'text-foreground hover:text-brand-200'
            )}
          >
            <UserRound className='size-5' aria-hidden='true' />
            <span>Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
