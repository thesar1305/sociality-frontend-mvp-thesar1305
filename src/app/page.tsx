import Link from 'next/link';

import { SocialFeed } from '@/components/sociality/social-feed';
import { ThemeToggle } from '@/components/sociality/theme-toggle';
import { AuthNavigation } from '@/components/sociality/auth-navigation';

export default function Home() {
  return (
    <div className='min-h-screen bg-muted/40'>
      <header className='sticky top-0 z-10 border-b bg-background/95 backdrop-blur'>
        <div className='mx-auto flex h-16 max-w-2xl items-center justify-between px-4'>
          <Link href='/' className='text-xl font-bold tracking-tight'>
            Sociality
          </Link>

          <nav aria-label='Navigasi utama' className='flex items-center gap-2'>
            <ThemeToggle />
            <AuthNavigation />
          </nav>
        </div>
      </header>

      <main className='mx-auto w-full max-w-2xl space-y-5 px-4 py-6'>
        <SocialFeed />
      </main>
    </div>
  );
}
