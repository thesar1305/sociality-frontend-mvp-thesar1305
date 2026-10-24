import type { Metadata } from 'next';
import Link from 'next/link';

import { AuthNavigation } from '@/components/sociality/auth-navigation';
import { MyProfile } from '@/components/sociality/my-profile';
import { ProtectedRoute } from '@/components/sociality/protected-route';
import { ThemeToggle } from '@/components/sociality/theme-toggle';

export const metadata: Metadata = {
  title: 'Profil | Sociality',
  description: 'Profil pengguna Sociality.',
};

export default function ProfilePage() {
  return (
    <ProtectedRoute>
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

            <div className='ml-auto flex items-center gap-2'>
              <ThemeToggle />
              <AuthNavigation showProfileLink={false} />
            </div>
          </div>
        </header>

        <main className='mx-auto w-full max-w-2xl px-4 py-6'>
          <MyProfile />
        </main>
      </div>
    </ProtectedRoute>
  );
}
