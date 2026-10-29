'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { LoginPromptDialog } from '@/components/sociality/login-prompt-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiErrorMessage } from '@/lib/api/client';
import { getMyProfile } from '@/lib/api/profile';
import {
  followUser,
  getMyConnections,
  getUserConnections,
  unfollowUser,
} from '@/lib/api/users';
import { track } from '@/lib/analytics';
import { avatarThumb } from '@/lib/images';
import { useAppSelector } from '@/lib/store/hooks';
import type { UserConnectionKind, UserSearchItem } from '@/types/user';

const USERS_PER_PAGE = 10;

type UserConnectionListProps =
  | {
      scope: 'me';
      kind: UserConnectionKind;
    }
  | {
      scope: 'user';
      username: string;
      kind: UserConnectionKind;
    };

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'S';
}

export function UserConnectionList(props: UserConnectionListProps) {
  const { kind } = props;
  const ownerKey = props.scope === 'me' ? 'me' : props.username;
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);

  const profileQuery = useQuery({
    queryKey: ['me'],
    queryFn: getMyProfile,
    enabled: isHydrated && isAuthenticated,
  });
  const myUsername = profileQuery.data?.data.profile.username;

  const usersQuery = useInfiniteQuery({
    queryKey: ['users', 'connections', ownerKey, kind, 'infinite', USERS_PER_PAGE],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      props.scope === 'me'
        ? getMyConnections({ kind, page: pageParam, limit: USERS_PER_PAGE })
        : getUserConnections({
            username: props.username,
            kind,
            page: pageParam,
            limit: USERS_PER_PAGE,
          }),
    getNextPageParam: (lastPage) =>
      lastPage.data.pagination.page < lastPage.data.pagination.totalPages
        ? lastPage.data.pagination.page + 1
        : undefined,
  });

  const users = useMemo(() => {
    const seen = new Set<number>();

    return (usersQuery.data?.pages ?? [])
      .flatMap((page) => page.data.users)
      .filter((user) => {
        if (seen.has(user.id)) {
          return false;
        }

        seen.add(user.id);

        return true;
      });
  }, [usersQuery.data]);

  const title = kind === 'followers' ? 'Pengikut' : 'Mengikuti';
  const backHref =
    props.scope === 'me'
      ? '/me'
      : `/users/${encodeURIComponent(props.username)}`;
  const profileLabel =
    props.scope === 'me' ? 'Profil saya' : `@${props.username}`;

  function handleGuestFollow() {
    if (isHydrated) {
      setLoginPromptOpen(true);
    }
  }

  return (
    <section aria-labelledby='connections-heading' className='space-y-6'>
      <Link
        href={backHref}
        prefetch={false}
        className='inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
      >
        <ArrowLeft className='size-4' aria-hidden='true' />
        Kembali ke profil
      </Link>

      <div>
        <h1 id='connections-heading' className='text-2xl font-bold'>
          {title}
        </h1>
        <p className='mt-1 text-sm text-muted-foreground'>{profileLabel}</p>
      </div>

      {usersQuery.isPending ? (
        <ul
          role='status'
          aria-label={`Memuat daftar ${title.toLowerCase()}`}
          className='space-y-4'
        >
          {Array.from({ length: 5 }, (_, index) => (
            <li key={index} className='flex items-center gap-3'>
              <Skeleton className='size-11 rounded-full' />
              <div className='flex-1 space-y-2'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-3 w-24' />
              </div>
              <Skeleton className='h-9 w-24 rounded-full' />
            </li>
          ))}
        </ul>
      ) : null}

      {usersQuery.isError && !usersQuery.data ? (
        <div
          role='alert'
          className='rounded-2xl border border-destructive/40 bg-destructive/10 p-5'
        >
          <p className='text-sm text-destructive'>
            {getApiErrorMessage(usersQuery.error)}
          </p>
          <Button
            type='button'
            variant='outline'
            className='mt-4 rounded-full'
            onClick={() => void usersQuery.refetch()}
          >
            Coba lagi
          </Button>
        </div>
      ) : null}

      {usersQuery.isSuccess && users.length === 0 ? (
        <p className='rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground'>
          {kind === 'followers'
            ? 'Belum ada pengikut.'
            : 'Belum mengikuti siapa pun.'}
        </p>
      ) : null}

      {users.length > 0 ? (
        <ul className='space-y-4'>
          {users.map((user) => (
            <ConnectionRow
              key={user.id}
              user={user}
              isSelf={user.username === myUsername}
              onGuestFollow={isAuthenticated ? undefined : handleGuestFollow}
            />
          ))}
        </ul>
      ) : null}

      {usersQuery.isFetchNextPageError ? (
        <p role='alert' className='text-center text-sm text-destructive'>
          {getApiErrorMessage(usersQuery.error)}
        </p>
      ) : null}

      {usersQuery.hasNextPage ? (
        <div className='flex justify-center'>
          <Button
            type='button'
            variant='outline'
            className='rounded-full'
            disabled={usersQuery.isFetchingNextPage}
            onClick={() => void usersQuery.fetchNextPage()}
          >
            {usersQuery.isFetchingNextPage ? 'Memuat...' : 'Muat lebih banyak'}
          </Button>
        </div>
      ) : null}

      <LoginPromptDialog
        open={loginPromptOpen}
        onOpenChange={setLoginPromptOpen}
        title='Masuk untuk mengikuti'
        description='Masuk atau daftar untuk mengikuti pengguna ini.'
      />
    </section>
  );
}

function ConnectionRow({
  user,
  isSelf,
  onGuestFollow,
}: {
  user: UserSearchItem;
  isSelf: boolean;
  /** Diisi saat pengunjung belum masuk; menggantikan aksi ikuti. */
  onGuestFollow?: () => void;
}) {
  const queryClient = useQueryClient();
  const [optimisticFollowed, setOptimisticFollowed] = useState<boolean | null>(
    null
  );

  const isFollowed = optimisticFollowed ?? user.isFollowedByMe;

  const followMutation = useMutation({
    mutationFn: (nextFollowed: boolean) =>
      nextFollowed ? followUser(user.username) : unfollowUser(user.username),

    onMutate: (nextFollowed) => {
      setOptimisticFollowed(nextFollowed);
    },

    onError: () => {
      setOptimisticFollowed(null);
    },

    onSuccess: (_, nextFollowed) => {
      track(nextFollowed ? 'user_follow' : 'user_unfollow', {
        username: user.username,
      });
    },

    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['me'] }),
        queryClient.invalidateQueries({
          queryKey: ['posts', 'feed'],
          refetchType: 'none',
        }),
      ]);
      setOptimisticFollowed(null);
    },
  });

  function handleClick() {
    if (onGuestFollow) {
      onGuestFollow();

      return;
    }

    if (!followMutation.isPending) {
      followMutation.mutate(!isFollowed);
    }
  }

  return (
    <li className='flex flex-wrap items-center gap-x-3 gap-y-1'>
      <Link
        href={`/users/${encodeURIComponent(user.username)}`}
        prefetch={false}
        className='flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40'
      >
        <Avatar className='size-11'>
          {user.avatarUrl ? (
            <AvatarImage src={avatarThumb(user.avatarUrl, 88)} alt='' />
          ) : null}
          <AvatarFallback>{getInitial(user.name)}</AvatarFallback>
        </Avatar>

        <span className='min-w-0'>
          <span className='block truncate text-sm font-semibold'>
            {user.name}
          </span>
          <span className='block truncate text-sm text-muted-foreground'>
            @{user.username}
          </span>
        </span>
      </Link>

      {isSelf ? (
        <span className='text-sm text-muted-foreground'>Anda</span>
      ) : (
        <Button
          type='button'
          variant={isFollowed ? 'outline' : 'default'}
          aria-pressed={isFollowed}
          aria-busy={followMutation.isPending}
          aria-label={
            isFollowed
              ? `Berhenti mengikuti ${user.name}`
              : `Ikuti ${user.name}`
          }
          disabled={followMutation.isPending}
          className='h-9 min-w-24 rounded-full px-4'
          onClick={handleClick}
        >
          {isFollowed ? 'Mengikuti' : 'Ikuti'}
        </Button>
      )}

      {followMutation.isError ? (
        <p role='alert' className='w-full text-xs text-destructive'>
          {getApiErrorMessage(followMutation.error)}
        </p>
      ) : null}
    </li>
  );
}
