'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Bookmark, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import {
  dedupeTiles,
  ProfileHeader,
  ShareProfileButton,
  TileGrid,
} from '@/components/sociality/profile-parts';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getApiErrorMessage } from '@/lib/api/client';
import { getMyProfile } from '@/lib/api/profile';
import { getSavedPosts } from '@/lib/api/posts';
import { getUserPosts } from '@/lib/api/users';
import { cn } from 'cn';

const TILES_PER_PAGE = 12;

type TabValue = 'gallery' | 'saved';

export function MyProfile() {
  const [tab, setTab] = useState<TabValue>('gallery');

  const profileQuery = useQuery({
    queryKey: ['me'],
    queryFn: getMyProfile,
  });

  if (profileQuery.isPending) {
    return (
      <div role='status' aria-label='Memuat profil' className='space-y-6'>
        <div className='flex items-center gap-4'>
          <Skeleton className='size-16 rounded-full' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-20' />
          </div>
        </div>
        <Skeleton className='h-10 w-full rounded-full' />
        <Skeleton className='h-16 w-full' />
      </div>
    );
  }

  if (profileQuery.isError) {
    return (
      <div
        role='alert'
        className='rounded-2xl border border-destructive/40 bg-destructive/10 p-6'
      >
        <p className='text-sm text-destructive'>
          {getApiErrorMessage(profileQuery.error)}
        </p>

        <Button
          type='button'
          variant='outline'
          className='mt-4'
          onClick={() => profileQuery.refetch()}
        >
          Coba lagi
        </Button>
      </div>
    );
  }

  const { profile, stats } = profileQuery.data.data;

  const statItems = [
    { label: 'Postingan', value: stats.posts },
    { label: 'Pengikut', value: stats.followers, href: '/me/followers' },
    { label: 'Mengikuti', value: stats.following, href: '/me/following' },
    { label: 'Disukai', value: stats.likes, href: '/me/likes' },
  ];

  return (
    <section aria-labelledby='my-profile-heading' className='space-y-5'>
      <ProfileHeader
        headingId='my-profile-heading'
        name={profile.name}
        username={profile.username}
        avatarUrl={profile.avatarUrl}
        bio={profile.bio}
        stats={statItems}
        actions={
          <>
            <Link
              href='/me/edit'
              prefetch={false}
              className={cn(
                buttonVariants({ variant: 'outline' }),
                'h-10 flex-1 rounded-full text-sm font-semibold'
              )}
            >
              Edit Profil
            </Link>

            <ShareProfileButton
              username={profile.username}
              name={profile.name}
            />
          </>
        }
      />

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as TabValue)}
        className='gap-4'
      >
        <TabsList aria-label='Konten profil'>
          <TabsTrigger value='gallery'>
            <LayoutGrid aria-hidden='true' />
            Galeri
          </TabsTrigger>
          <TabsTrigger value='saved'>
            <Bookmark aria-hidden='true' />
            Tersimpan
          </TabsTrigger>
        </TabsList>

        <TabsContent value='gallery'>
          <GalleryGrid username={profile.username} />
        </TabsContent>

        <TabsContent value='saved'>
          {tab === 'saved' ? <SavedGrid /> : null}
        </TabsContent>
      </Tabs>
    </section>
  );
}

function GalleryGrid({ username }: { username: string }) {
  const query = useInfiniteQuery({
    queryKey: ['posts', 'me-grid', username, TILES_PER_PAGE],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getUserPosts({ username, page: pageParam, limit: TILES_PER_PAGE }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.pagination;

      return page < totalPages ? page + 1 : undefined;
    },
  });

  const tiles = useMemo(
    () => dedupeTiles(query.data?.pages.flatMap((page) => page.data.posts)),
    [query.data]
  );

  return (
    <TileGrid
      tiles={tiles}
      isPending={query.isPending}
      error={query.isError && !query.data ? query.error : null}
      hasNextPage={query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      fetchNextPageFailed={query.isFetchNextPageError}
      onRetry={() => void query.refetch()}
      onLoadMore={() => void query.fetchNextPage()}
      hrefFor={(id) => `/posts/${id}?from=profile`}
      empty={
        <div className='flex flex-col items-center px-4 py-10 text-center'>
          <p className='font-semibold'>Ceritamu dimulai di sini</p>
          <p className='mt-2 max-w-xs text-sm text-muted-foreground'>
            Bagikan postingan pertamamu dan tunjukkan momen yang berarti.
          </p>
          <Link
            href='/posts/new'
            prefetch={false}
            className={cn(
              buttonVariants(),
              'mt-5 h-10 rounded-full px-5 text-sm font-semibold'
            )}
          >
            Unggah Postingan Pertama
          </Link>
        </div>
      }
    />
  );
}

function SavedGrid() {
  const query = useInfiniteQuery({
    queryKey: ['posts', 'saved-grid', TILES_PER_PAGE],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getSavedPosts({ page: pageParam, limit: TILES_PER_PAGE }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.pagination;

      return page < totalPages ? page + 1 : undefined;
    },
  });

  const tiles = useMemo(
    () => dedupeTiles(query.data?.pages.flatMap((page) => page.data.posts)),
    [query.data]
  );

  return (
    <TileGrid
      tiles={tiles}
      isPending={query.isPending}
      error={query.isError && !query.data ? query.error : null}
      hasNextPage={query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      fetchNextPageFailed={query.isFetchNextPageError}
      onRetry={() => void query.refetch()}
      onLoadMore={() => void query.fetchNextPage()}
      hrefFor={(id) => `/posts/${id}?from=saved`}
      empty={
        <p className='px-4 py-10 text-center text-sm text-muted-foreground'>
          Belum ada postingan yang disimpan.
        </p>
      }
    />
  );
}
