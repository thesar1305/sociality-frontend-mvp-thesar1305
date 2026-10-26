'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import { getMyProfile } from '@/lib/api/profile';
import { removeAccessToken } from '@/lib/auth/storage';
import { clearSession } from '@/lib/store/auth-slice';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { usePathname } from 'next/navigation';

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
  const pathname = usePathname();
  const loginUrl = `/login?next=${encodeURIComponent(pathname)}`;
  const profileQuery = useQuery({
    queryKey: ['me'],
    queryFn: getMyProfile,
    enabled: isHydrated && isAuthenticated,
    retry: false,
  });

  const isUnauthorized =
    axios.isAxiosError(profileQuery.error) &&
    profileQuery.error.response?.status === 401;

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      window.location.replace(loginUrl);
    }
  }, [isAuthenticated, isHydrated, loginUrl]);

  useEffect(() => {
    if (!isUnauthorized) {
      return;
    }

    removeAccessToken();
    queryClient.clear();
    dispatch(clearSession());
    window.location.replace(loginUrl);
  }, [dispatch, isUnauthorized, loginUrl, queryClient]);

  if (
    !isHydrated ||
    !isAuthenticated ||
    profileQuery.isPending ||
    isUnauthorized
  ) {
    return (
      <main className='flex min-h-screen items-center justify-center bg-background px-4'>
        <div
          role='status'
          className='flex items-center gap-3 text-sm text-muted-foreground'
        >
          <span className='size-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-violet-500' />
          Memeriksa sesi...
        </div>
      </main>
    );
  }

  if (profileQuery.isError) {
    return (
      <main className='flex min-h-screen items-center justify-center bg-background px-4'>
        <div className='w-full max-w-sm rounded-2xl border bg-card p-6 text-center shadow-sm'>
          <h1 className='text-lg font-bold'>Sesi belum dapat diperiksa</h1>
          <p className='mt-2 text-sm text-muted-foreground'>
            Periksa koneksi internet, lalu coba kembali.
          </p>

          <Button
            type='button'
            className='mt-5'
            onClick={() => {
              void profileQuery.refetch();
            }}
          >
            Coba lagi
          </Button>
        </div>
      </main>
    );
  }

  return children;
}
