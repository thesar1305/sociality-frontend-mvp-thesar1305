import type { Metadata } from 'next';
import Link from 'next/link';

import { currentUser } from '@/data/profile';

export const metadata: Metadata = {
  title: 'Profil | Sociality',
  description: `Profil ${currentUser.name} di Sociality.`,
};

export default function ProfilePage() {
  return (
    <div className='min-h-screen bg-muted/40'>
      <header className='border-b bg-background'>
        <div className='mx-auto flex h-16 max-w-2xl items-center gap-4 px-4'>
          <Link
            href='/'
            className='rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
          >
            ← Kembali
          </Link>

          <h1 className='text-lg font-bold'>Profil</h1>
        </div>
      </header>

      <main className='mx-auto w-full max-w-2xl px-4 py-6'>
        <article className='overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm'>
          <div className='h-32 bg-gradient-to-r from-zinc-900 via-zinc-700 to-zinc-500' />

          <div className='px-5 pb-5'>
            <div className='-mt-12 flex size-24 items-center justify-center rounded-full border-4 border-card bg-primary text-2xl font-bold text-primary-foreground'>
              {currentUser.initials}
            </div>

            <div className='mt-4'>
              <h2 className='text-2xl font-bold'>{currentUser.name}</h2>
              <p className='text-muted-foreground'>{currentUser.username}</p>
            </div>

            <p className='mt-4 max-w-lg leading-7'>{currentUser.bio}</p>

            <div className='mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground'>
              <span>{currentUser.location}</span>
              <span>{currentUser.joinedLabel}</span>
            </div>

            <dl className='mt-6 grid grid-cols-3 divide-x border-t pt-5 text-center'>
              <div>
                <dt className='text-sm text-muted-foreground'>Postingan</dt>
                <dd className='mt-1 font-bold'>{currentUser.stats.posts}</dd>
              </div>

              <div>
                <dt className='text-sm text-muted-foreground'>Pengikut</dt>
                <dd className='mt-1 font-bold'>
                  {currentUser.stats.followers}
                </dd>
              </div>

              <div>
                <dt className='text-sm text-muted-foreground'>Mengikuti</dt>
                <dd className='mt-1 font-bold'>
                  {currentUser.stats.following}
                </dd>
              </div>
            </dl>
          </div>
        </article>
      </main>
    </div>
  );
}
