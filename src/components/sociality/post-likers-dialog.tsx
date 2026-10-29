'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useMemo, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiErrorMessage } from '@/lib/api/client';
import { getPostLikers } from '@/lib/api/posts';
import { followUser, unfollowUser } from '@/lib/api/users';
import { useAppSelector } from '@/lib/store/hooks';
import type { PostLiker } from '@/types/user';

const LIKERS_PER_PAGE = 10;

type PostLikersDialogProps = {
  postId: number;
  className?: string;
  'aria-label'?: string;
  children: ReactNode;
};

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'S';
}

export function PostLikersDialog({
  postId,
  className,
  children,
  ...triggerProps
}: PostLikersDialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
  const [open, setOpen] = useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen && !isAuthenticated) {
      if (isHydrated) {
        router.push(`/login?next=${encodeURIComponent(pathname)}`);
      }

      return;
    }

    setOpen(nextOpen);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger className={className} {...triggerProps}>
        {children}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disukai oleh</DialogTitle>
          <DialogDescription>
            Pengguna yang menyukai postingan ini.
          </DialogDescription>
        </DialogHeader>

        <LikersList postId={postId} enabled={open} />
      </DialogContent>
    </Dialog>
  );
}

function LikersList({
  postId,
  enabled,
}: {
  postId: number;
  enabled: boolean;
}) {
  const likersQuery = useInfiniteQuery({
    queryKey: ['posts', 'likes', postId, 'infinite', LIKERS_PER_PAGE],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getPostLikers({
        postId,
        page: pageParam,
        limit: LIKERS_PER_PAGE,
      }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.pagination;

      return page < totalPages ? page + 1 : undefined;
    },
    enabled,
  });

  const users = useMemo(() => {
    const seen = new Set<number>();
    const uniqueUsers: PostLiker[] = [];

    for (const page of likersQuery.data?.pages ?? []) {
      for (const user of page.data.users) {
        if (!seen.has(user.id)) {
          seen.add(user.id);
          uniqueUsers.push(user);
        }
      }
    }

    return uniqueUsers;
  }, [likersQuery.data]);

  if (likersQuery.isPending) {
    return (
      <div
        role='status'
        aria-label='Memuat daftar penyuka'
        className='space-y-4'
      >
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className='flex items-center gap-3'>
            <Skeleton className='size-11 rounded-full' />
            <div className='flex-1 space-y-2'>
              <Skeleton className='h-4 w-28' />
              <Skeleton className='h-3 w-20' />
            </div>
            <Skeleton className='h-9 w-20 rounded-full' />
          </div>
        ))}
      </div>
    );
  }

  if (likersQuery.isError && !likersQuery.data) {
    return (
      <div
        role='alert'
        className='rounded-xl border border-destructive/40 bg-destructive/10 p-4'
      >
        <p className='text-sm text-destructive'>
          {getApiErrorMessage(likersQuery.error)}
        </p>
        <Button
          type='button'
          variant='outline'
          className='mt-3'
          onClick={() => likersQuery.refetch()}
        >
          Coba lagi
        </Button>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <p className='py-6 text-center text-sm text-muted-foreground'>
        Belum ada pengguna yang menyukai postingan ini.
      </p>
    );
  }

  return (
    <div className='-mr-2 min-h-0 flex-1 overflow-y-auto pr-2'>
      <ul className='space-y-4'>
        {users.map((user) => (
          <LikerRow key={user.id} user={user} postId={postId} />
        ))}
      </ul>

      {likersQuery.isFetchNextPageError ? (
        <p role='alert' className='mt-4 text-center text-sm text-destructive'>
          {getApiErrorMessage(likersQuery.error)}
        </p>
      ) : null}

      {likersQuery.hasNextPage ? (
        <div className='mt-4 flex justify-center'>
          <Button
            type='button'
            variant='outline'
            className='rounded-full'
            disabled={likersQuery.isFetchingNextPage}
            onClick={() => void likersQuery.fetchNextPage()}
          >
            {likersQuery.isFetchingNextPage
              ? 'Memuat...'
              : 'Muat lebih banyak'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function LikerRow({ user, postId }: { user: PostLiker; postId: number }) {
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

    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['posts', 'likes', postId],
        }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
        queryClient.invalidateQueries({ queryKey: ['me'] }),
        // Feed hanya ditandai kedaluwarsa agar tidak memuat ulang di belakang modal.
        queryClient.invalidateQueries({
          queryKey: ['posts', 'feed'],
          refetchType: 'none',
        }),
      ]);
      setOptimisticFollowed(null);
    },
  });

  return (
    <li className='flex flex-wrap items-center gap-x-3 gap-y-1'>
      <Link
        href={`/users/${encodeURIComponent(user.username)}`}
        prefetch={false}
        className='flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40'
      >
        <Avatar className='size-11'>
          {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt='' /> : null}
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

      {user.isMe ? (
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
          onClick={() => followMutation.mutate(!isFollowed)}
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
