'use client';

import { Home, Plus, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';

import { AuthNavigation } from '@/components/sociality/auth-navigation';
import { ThemeToggle } from '@/components/sociality/theme-toggle';

type AppShellProps = {
  children: ReactNode;
};

const navigationClassName =
  'flex flex-col items-center justify-center gap-1 rounded-xl px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50';

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
  const profileIsActive = pathname === '/me';

  return (
    <div className='min-h-screen bg-muted/40'>
      <header className='sticky top-0 z-20 border-b bg-background/95 backdrop-blur'>
        <div className='mx-auto flex h-16 w-full max-w-2xl items-center justify-between px-4'>
          <Link href='/feed' className='text-xl font-bold tracking-tight'>
            Sociality
          </Link>

          <div className='flex items-center gap-2'>
            <ThemeToggle />
            <AuthNavigation showProfileLink={false} />
          </div>
        </div>
      </header>

      <main className='mx-auto w-full max-w-2xl px-4 py-6 pb-28'>
        {children}
      </main>

      <nav
        aria-label='Navigasi utama'
        className='fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur'
      >
        <div className='mx-auto grid h-20 max-w-md grid-cols-3 items-center px-5'>
          <Link
            href='/feed'
            aria-current={feedIsActive ? 'page' : undefined}
            className={`${navigationClassName} ${
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
            className='mx-auto -mt-7 flex size-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg transition hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50'
            onClick={handleCreatePostClick}
          >
            <Plus className='size-7' aria-hidden='true' />
          </button>

          <Link
            href='/me'
            aria-current={profileIsActive ? 'page' : undefined}
            className={`${navigationClassName} ${
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
