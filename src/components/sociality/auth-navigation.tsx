'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { removeAccessToken } from '@/lib/auth/storage';
import { clearSession } from '@/lib/store/auth-slice';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';

type AuthNavigationProps = {
  showProfileLink?: boolean;
};

const linkClassName =
  'inline-flex h-8 items-center justify-center rounded-lg border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50';

export function AuthNavigation({
  showProfileLink = true,
}: AuthNavigationProps) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);

  function handleLogout() {
    removeAccessToken();
    dispatch(clearSession());
    queryClient.clear();
    window.location.replace('/login');
  }

  if (!isHydrated) {
    return (
      <span
        aria-label='Memuat sesi'
        className='h-8 w-20 animate-pulse rounded-lg bg-muted'
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Link href='/login' className={linkClassName}>
          Masuk
        </Link>
        <Link
          href='/register'
          className='inline-flex h-8 items-center justify-center rounded-lg bg-violet-600 px-3 text-sm font-medium text-white transition-colors hover:bg-violet-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50'
        >
          Daftar
        </Link>
      </>
    );
  }

  return (
    <>
      {showProfileLink ? (
        <Link href='/profile' className={linkClassName}>
          Profil
        </Link>
      ) : null}

      <Button type='button' variant='outline' onClick={handleLogout}>
        Keluar
      </Button>
    </>
  );
}
