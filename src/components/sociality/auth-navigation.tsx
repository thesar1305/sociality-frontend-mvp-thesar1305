'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { LogOut } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { getMyProfile } from '@/lib/api/profile';
import { avatarThumb } from '@/lib/images';
import { removeAccessToken } from '@/lib/auth/storage';
import { clearSession } from '@/lib/store/auth-slice';
import { useHydrated } from '@/lib/hooks/use-hydrated';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { cn } from 'cn';

function getInitial(name?: string) {
  return name?.trim().charAt(0).toUpperCase() || 'S';
}

export function AuthNavigation() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { isAuthenticated, isHydrated: sessionReady } = useAppSelector(
    (state) => state.auth
  );
  // Keep the first client render identical to the server HTML (skeleton).
  const isHydrated = useHydrated() && sessionReady;

  const profileQuery = useQuery({
    queryKey: ['me'],
    queryFn: getMyProfile,
    enabled: isHydrated && isAuthenticated,
  });

  function handleLogout() {
    removeAccessToken();
    dispatch(clearSession());
    queryClient.clear();
    window.location.replace('/login');
  }

  if (!isHydrated) {
    return (
      <span
        role='status'
        aria-label='Memuat sesi'
        className='h-10 w-24 animate-pulse rounded-full bg-muted'
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='flex items-center gap-2'>
        <Link
          href='/login'
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'h-10 rounded-full px-4'
          )}
        >
          Masuk
        </Link>
        <Link
          href='/register'
          className={cn(buttonVariants(), 'h-10 rounded-full px-4')}
        >
          Daftar
        </Link>
      </div>
    );
  }

  const profile = profileQuery.data?.data.profile;

  return (
    <div className='flex items-center gap-1'>
      <Link
        href='/me'
        prefetch={false}
        aria-label='Profil saya'
        className='flex items-center gap-2.5 rounded-full p-1 pr-1 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 sm:pr-3'
      >
        <Avatar className='size-9'>
          {profile?.avatarUrl ? (
            <AvatarImage src={avatarThumb(profile.avatarUrl, 72)} alt='' />
          ) : null}
          <AvatarFallback>{getInitial(profile?.name)}</AvatarFallback>
        </Avatar>
        <span className='hidden max-w-32 truncate text-sm font-semibold sm:inline'>
          {profile?.name ?? ''}
        </span>
      </Link>

      <Button
        type='button'
        variant='ghost'
        size='icon-lg'
        aria-label='Keluar'
        title='Keluar'
        className='rounded-full'
        onClick={handleLogout}
      >
        <LogOut aria-hidden='true' />
      </Button>
    </div>
  );
}
