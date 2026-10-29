'use client';

import { Home, Plus, Search, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

import { AuthNavigation } from '@/components/sociality/auth-navigation';
import { ThemeToggle } from '@/components/sociality/theme-toggle';

type AppShellProps = {
  children: ReactNode;
};

const mobileNavigationClassName =
  'flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50';

const desktopNavigationClassName =
  'inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50';

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname === '/feed' && window.location.hash === '#create-post') {
      window.requestAnimationFrame(() => {
        document.getElementById('create-post')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    }
  }, [pathname]);

  function handleCreatePostClick() {
    if (pathname === '/feed') {
      document.getElementById('create-post')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      return;
    }

    router.push('/feed#create-post');
  }

  const feedIsActive = pathname === '/feed';
  const profileIsActive = pathname === '/me' || pathname.startsWith('/me/');

  return (
    <div className='min-h-screen bg-muted/40'>
      <header className='sticky top-0 z-30 border-b bg-background/90 backdrop-blur-xl'>
        <div className='mx-auto flex min-h-16 w-full max-w-5xl items-center justify-between gap-3 px-4 sm:px-6'>
          <Link
            href='/feed'
            prefetch={false}
            className='shrink-0 text-xl font-bold tracking-tight'
          >
            Sociality
          </Link>

          <div className='flex min-w-0 items-center gap-2'>
            <nav
              aria-label='Navigasi utama desktop'
              className='mr-1 hidden items-center gap-1 lg:flex'
            >
              <Link
                href='/feed'
                prefetch={false}
                aria-current={feedIsActive ? 'page' : undefined}
                className={`${desktopNavigationClassName} ${
                  feedIsActive
                    ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Home className='size-4' aria-hidden='true' />
                Beranda
              </Link>

              <button
                type='button'
                className={`${desktopNavigationClassName} text-muted-foreground hover:bg-accent hover:text-foreground`}
                onClick={handleCreatePostClick}
              >
                <Plus className='size-4' aria-hidden='true' />
                Buat
              </button>

              <Link
                href='/me'
                prefetch={false}
                aria-current={profileIsActive ? 'page' : undefined}
                className={`${desktopNavigationClassName} ${
                  profileIsActive
                    ? 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <UserRound className='size-4' aria-hidden='true' />
                Profil
              </Link>
            </nav>

            <span
              aria-hidden='true'
              className='hidden h-6 w-px bg-border lg:block'
            />

            <Link
              href='/search'
              prefetch={false}
              aria-label='Cari pengguna'
              aria-current={pathname === '/search' ? 'page' : undefined}
              className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xl border transition ${
                pathname === '/search'
                  ? 'border-violet-500/40 bg-violet-500/10 text-violet-500'
                  : 'bg-background hover:bg-accent'
              }`}
            >
              <Search className='size-5' aria-hidden='true' />
            </Link>

            <ThemeToggle />
            <AuthNavigation showProfileLink={false} />
          </div>
        </div>
      </header>

      <main className='mx-auto w-full max-w-2xl px-4 py-6 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-8 lg:pb-10'>
        {children}
      </main>

      <nav
        aria-label='Navigasi utama mobile'
        className='fixed inset-x-0 bottom-0 z-30 border-t bg-background/90 shadow-[0_-8px_30px_rgba(0,0,0,0.10)] backdrop-blur-xl lg:hidden'
      >
        <div className='mx-auto grid min-h-20 max-w-md grid-cols-3 items-center px-5 pb-[env(safe-area-inset-bottom)]'>
          <Link
            href='/feed'
            prefetch={false}
            aria-current={feedIsActive ? 'page' : undefined}
            className={`${mobileNavigationClassName} ${
              feedIsActive
                ? 'text-violet-600 dark:text-violet-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Home className='size-5' aria-hidden='true' />
            <span>Beranda</span>
          </Link>

          <button
            type='button'
            aria-label='Buat postingan'
            className='mx-auto -mt-7 flex size-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-950/20 transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50'
            onClick={handleCreatePostClick}
          >
            <Plus className='size-7' aria-hidden='true' />
          </button>

          <Link
            href='/me'
            prefetch={false}
            aria-current={profileIsActive ? 'page' : undefined}
            className={`${mobileNavigationClassName} ${
              profileIsActive
                ? 'text-violet-600 dark:text-violet-400'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserRound className='size-5' aria-hidden='true' />
            <span>Profil</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
