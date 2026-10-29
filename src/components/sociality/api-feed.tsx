'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';

import { ApiPostCard } from '@/components/sociality/api-post-card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiErrorMessage } from '@/lib/api/client';
import { getFeed } from '@/lib/api/posts';
import type { ApiPost } from '@/types/feed';

const POSTS_PER_PAGE = 10;

function FeedSkeleton() {
  return (
    <div role='status' aria-label='Memuat postingan' className='space-y-8'>
      {[0, 1].map((item) => (
        <div key={item} className='space-y-3'>
          <div className='flex items-center gap-3'>
            <Skeleton className='size-11 rounded-full' />
            <div className='space-y-2'>
              <Skeleton className='h-4 w-32' />
              <Skeleton className='h-3 w-20' />
            </div>
          </div>
          <Skeleton className='aspect-square w-full rounded-xl' />
          <Skeleton className='h-4 w-24' />
        </div>
      ))}
    </div>
  );
}

export function ApiFeed() {
  const sentinelRef = useRef<HTMLDivElement>(null);

  const postsQuery = useInfiniteQuery({
    queryKey: ['posts', 'feed', 'infinite', POSTS_PER_PAGE],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getFeed({
        page: pageParam,
        limit: POSTS_PER_PAGE,
      }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.pagination;

      return page < totalPages ? page + 1 : undefined;
    },
  });

  const {
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = postsQuery;

  // Offset pagination dapat menghasilkan duplikat saat ada postingan baru.
  const posts = useMemo(() => {
    const seen = new Set<number>();
    const uniquePosts: ApiPost[] = [];

    for (const page of postsQuery.data?.pages ?? []) {
      for (const post of page.data.items) {
        if (!seen.has(post.id)) {
          seen.add(post.id);
          uniquePosts.push(post);
        }
      }
    }

    return uniquePosts;
  }, [postsQuery.data]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (
      !sentinel ||
      !hasNextPage ||
      isFetchingNextPage ||
      isFetchNextPageError ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void fetchNextPage();
        }
      },
      { rootMargin: '400px 0px' }
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
    posts.length,
  ]);

  return (
    <section aria-labelledby='feed-heading' className='space-y-8'>
      <h1 id='feed-heading' className='sr-only'>
        Beranda
      </h1>

      {postsQuery.isPending ? <FeedSkeleton /> : null}

      {postsQuery.isError && !postsQuery.data ? (
        <div
          role='alert'
          className='rounded-2xl border border-destructive/40 bg-destructive/10 p-6'
        >
          <p className='text-sm text-destructive'>
            {getApiErrorMessage(postsQuery.error)}
          </p>

          <Button
            type='button'
            variant='outline'
            className='mt-4'
            onClick={() => postsQuery.refetch()}
          >
            Coba lagi
          </Button>
        </div>
      ) : null}

      {postsQuery.isSuccess && posts.length === 0 ? (
        <div className='rounded-2xl border bg-card p-8 text-center text-muted-foreground'>
          Belum ada postingan di feed. Ikuti pengguna lain atau buat postingan
          pertamamu.
        </div>
      ) : null}

      {posts.length > 0 ? (
        <div className='space-y-8'>
          {posts.map((post, index) => (
            <ApiPostCard key={post.id} post={post} priority={index === 0} />
          ))}
        </div>
      ) : null}

      {isFetchingNextPage ? <FeedSkeleton /> : null}

      {isFetchNextPageError ? (
        <div
          role='alert'
          className='rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-center'
        >
          <p className='text-sm text-destructive'>
            {getApiErrorMessage(postsQuery.error)}
          </p>
          <Button
            type='button'
            variant='outline'
            className='mt-3'
            onClick={() => void fetchNextPage()}
          >
            Coba lagi
          </Button>
        </div>
      ) : null}

      {hasNextPage && !isFetchingNextPage && !isFetchNextPageError ? (
        <div ref={sentinelRef} className='flex justify-center py-2'>
          <Button
            type='button'
            variant='outline'
            className='rounded-full'
            onClick={() => void fetchNextPage()}
          >
            Muat lebih banyak
          </Button>
        </div>
      ) : null}

      {postsQuery.isSuccess && !hasNextPage && posts.length > 0 ? (
        <p className='pb-2 text-center text-sm text-muted-foreground'>
          Kamu sudah melihat semua postingan.
        </p>
      ) : null}
    </section>
  );
}
