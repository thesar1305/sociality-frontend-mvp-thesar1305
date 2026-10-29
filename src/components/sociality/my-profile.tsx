'use client';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Bookmark, Check, LayoutGrid, Send } from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, useMemo, useState } from 'react';

import { SafeImage } from '@/components/sociality/post-comments';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getApiErrorMessage } from '@/lib/api/client';
import { getMyProfile } from '@/lib/api/profile';
import { getSavedPosts } from '@/lib/api/posts';
import { getUserPosts } from '@/lib/api/users';
import { cn } from 'cn';

const TILES_PER_PAGE = 12;

type GridTile = {
  id: number;
  imageUrl: string;
  caption: string | null;
};

type TabValue = 'gallery' | 'saved';

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'U';
}

export function MyProfile() {
  const [tab, setTab] = useState<TabValue>('gallery');
  const [shared, setShared] = useState(false);

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

  async function handleShare() {
    const url = `${window.location.origin}/users/${encodeURIComponent(profile.username)}`;

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ url, title: `Profil ${profile.name}` });
      } else {
        await navigator.clipboard.writeText(url);
      }

      setShared(true);
      window.setTimeout(() => setShared(false), 2000);
    } catch {
      // Dibatalkan pengguna atau clipboard tidak tersedia.
    }
  }

  const statItems = [
    { label: 'Postingan', value: stats.posts, href: null },
    { label: 'Pengikut', value: stats.followers, href: '/me/followers' },
    { label: 'Mengikuti', value: stats.following, href: '/me/following' },
    { label: 'Disukai', value: stats.likes, href: '/me/likes' },
  ];

  return (
    <section aria-labelledby='my-profile-heading' className='space-y-5'>
      <div className='flex items-center gap-4'>
        <Avatar className='size-16'>
          {profile.avatarUrl ? (
            <AvatarImage src={profile.avatarUrl} alt='' />
          ) : null}
          <AvatarFallback className='text-xl'>
            {getInitial(profile.name)}
          </AvatarFallback>
        </Avatar>

        <div className='min-w-0'>
          <h1
            id='my-profile-heading'
            className='truncate text-lg font-bold leading-tight'
          >
            {profile.name}
          </h1>
          <p className='truncate text-sm text-muted-foreground'>
            @{profile.username}
          </p>
        </div>
      </div>

      <div className='flex items-center gap-3'>
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

        <Button
          type='button'
          variant='outline'
          size='icon-lg'
          className='size-10 rounded-full'
          aria-label={shared ? 'Tautan profil disalin' : 'Bagikan profil'}
          onClick={handleShare}
        >
          {shared ? <Check aria-hidden='true' /> : <Send aria-hidden='true' />}
        </Button>
      </div>

      <p className='whitespace-pre-line text-sm leading-6'>
        {profile.bio || 'Belum ada bio.'}
      </p>

      <dl className='grid grid-cols-4 text-center'>
        {statItems.map((item) => {
          const content = (
            <>
              <dd className='text-lg font-bold'>{item.value}</dd>
              <dt className='text-xs text-muted-foreground'>{item.label}</dt>
            </>
          );

          return item.href ? (
            <Link
              key={item.label}
              href={item.href}
              prefetch={false}
              aria-label={`${item.value} ${item.label}`}
              className='rounded-lg py-1 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40'
            >
              {content}
            </Link>
          ) : (
            <div key={item.label} className='py-1'>
              {content}
            </div>
          );
        })}
      </dl>

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

function dedupeTiles(posts: GridTile[] | undefined) {
  const seen = new Set<number>();
  const tiles: GridTile[] = [];

  for (const post of posts ?? []) {
    if (!seen.has(post.id)) {
      seen.add(post.id);
      tiles.push(post);
    }
  }

  return tiles;
}

type TileGridProps = {
  tiles: GridTile[];
  isPending: boolean;
  error: unknown;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPageFailed: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
  hrefFor: (id: number) => string;
  empty: ReactNode;
};

function TileGrid({
  tiles,
  isPending,
  error,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPageFailed,
  onRetry,
  onLoadMore,
  hrefFor,
  empty,
}: TileGridProps) {
  if (isPending) {
    return (
      <div
        role='status'
        aria-label='Memuat postingan'
        className='grid grid-cols-3 gap-1'
      >
        {Array.from({ length: 9 }, (_, index) => (
          <Skeleton key={index} className='aspect-square rounded-md' />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div
        role='alert'
        className='rounded-xl border border-destructive/40 bg-destructive/10 p-4'
      >
        <p className='text-sm text-destructive'>{getApiErrorMessage(error)}</p>
        <Button
          type='button'
          variant='outline'
          className='mt-3'
          onClick={onRetry}
        >
          Coba lagi
        </Button>
      </div>
    );
  }

  if (tiles.length === 0) {
    return <>{empty}</>;
  }

  return (
    <div className='space-y-4'>
      <ul className='grid grid-cols-3 gap-1'>
        {tiles.map((tile) => (
          <li key={tile.id}>
            <Link
              href={hrefFor(tile.id)}
              prefetch={false}
              className='block overflow-hidden rounded-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50'
            >
              <SafeImage
                src={tile.imageUrl}
                alt={tile.caption ? `Postingan: ${tile.caption}` : 'Postingan'}
                className='aspect-square w-full bg-muted object-cover transition-opacity hover:opacity-80'
                fallback={
                  <div
                    role='img'
                    aria-label='Gambar tidak tersedia'
                    className='flex aspect-square w-full items-center justify-center bg-muted text-xs text-muted-foreground'
                  >
                    Tidak tersedia
                  </div>
                }
              />
            </Link>
          </li>
        ))}
      </ul>

      {fetchNextPageFailed ? (
        <p role='alert' className='text-center text-sm text-destructive'>
          Gagal memuat postingan berikutnya.
        </p>
      ) : null}

      {hasNextPage ? (
        <div className='flex justify-center'>
          <Button
            type='button'
            variant='outline'
            className='rounded-full'
            disabled={isFetchingNextPage}
            onClick={onLoadMore}
          >
            {isFetchingNextPage ? 'Memuat...' : 'Muat lebih banyak'}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
