import Link from 'next/link';

import { SocialFeed } from '@/components/sociality/social-feed';

export default function Home() {
  return (
    <div className='min-h-screen bg-muted/40'>
      <header className='sticky top-0 z-10 border-b bg-background/95 backdrop-blur'>
        <div className='mx-auto flex h-16 max-w-2xl items-center justify-between px-4'>
          <Link href='/' className='text-xl font-bold tracking-tight'>
            Sociality
          </Link>

          <Link
            href='/profile'
            className='inline-flex h-8 items-center justify-center rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
          >
            Profil
          </Link>
        </div>
      </header>

      <main className='mx-auto w-full max-w-2xl space-y-5 px-4 py-6'>
        <SocialFeed />
      </main>
    </div>
  );
}
