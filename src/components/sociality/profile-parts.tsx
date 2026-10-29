'use client';

import { Check, Send } from 'lucide-react';
import Link from 'next/link';
import { type ReactNode, useState } from 'react';

import { SafeImage } from '@/components/sociality/post-comments';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { avatarThumb } from '@/lib/images';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiErrorMessage } from '@/lib/api/client';

export type GridTile = {
  id: number;
  imageUrl: string;
  caption: string | null;
};

export type ProfileStat = {
  label: string;
  value: number;
  href?: string;
  onClick?: () => void;
};

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'U';
}

type ProfileHeaderProps = {
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  actions: ReactNode;
  stats: ProfileStat[];
  headingId: string;
};

export function ProfileHeader({
  name,
  username,
  avatarUrl,
  bio,
  actions,
  stats,
  headingId,
}: ProfileHeaderProps) {
  const statClassName =
    'rounded-lg py-1 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40';

  return (
    <div className='space-y-5'>
      <div className='flex items-center gap-4'>
        <Avatar className='size-16'>
          {avatarUrl ? (
            <AvatarImage src={avatarThumb(avatarUrl, 128)} alt='' />
          ) : null}
          <AvatarFallback className='text-xl'>
            {getInitial(name)}
          </AvatarFallback>
        </Avatar>

        <div className='min-w-0'>
          <h1
            id={headingId}
            className='truncate text-lg font-bold leading-tight'
          >
            {name}
          </h1>
          <p className='truncate text-sm text-muted-foreground'>@{username}</p>
        </div>
      </div>

      <div className='flex items-center gap-3'>{actions}</div>

      <p className='whitespace-pre-line text-sm leading-6'>
        {bio || 'Belum ada bio.'}
      </p>

      <dl className='grid grid-cols-4 text-center'>
        {stats.map((stat) => {
          const content = (
            <>
              <dd className='text-lg font-bold'>{stat.value}</dd>
              <dt className='text-xs text-muted-foreground'>{stat.label}</dt>
            </>
          );

          if (stat.href) {
            return (
              <Link
                key={stat.label}
                href={stat.href}
                prefetch={false}
                aria-label={`${stat.value} ${stat.label}`}
                className={statClassName}
              >
                {content}
              </Link>
            );
          }

          if (stat.onClick) {
            return (
              <button
                key={stat.label}
                type='button'
                aria-label={`${stat.value} ${stat.label}`}
                className={statClassName}
                onClick={stat.onClick}
              >
                {content}
              </button>
            );
          }

          return (
            <div key={stat.label} className='py-1'>
              {content}
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export function ShareProfileButton({
  username,
  name,
}: {
  username: string;
  name: string;
}) {
  const [shared, setShared] = useState(false);

  async function handleShare() {
    const url = `${window.location.origin}/users/${encodeURIComponent(username)}`;

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ url, title: `Profil ${name}` });
      } else {
        await navigator.clipboard.writeText(url);
      }

      setShared(true);
      window.setTimeout(() => setShared(false), 2000);
    } catch {
      // Dibatalkan pengguna atau clipboard tidak tersedia.
    }
  }

  return (
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
  );
}

export function dedupeTiles(posts: GridTile[] | undefined) {
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

export function TileGrid({
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
                className='aspect-square w-full bg-muted transition-opacity hover:opacity-80'
                sizes='(min-width: 672px) 220px, 33vw'
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
