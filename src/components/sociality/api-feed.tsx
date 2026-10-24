'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { ApiPostCard } from '@/components/sociality/api-post-card';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api/client';
import { getPosts } from '@/lib/api/posts';

const POSTS_PER_PAGE = 10;

export function ApiFeed() {
  const [page, setPage] = useState(1);

  const postsQuery = useQuery({
    queryKey: ['posts', page, POSTS_PER_PAGE],
    queryFn: () =>
      getPosts({
        page,
        limit: POSTS_PER_PAGE,
      }),
  });

  if (postsQuery.isPending) {
    return (
      <div
        role='status'
        className='rounded-2xl border bg-card p-6 text-sm text-muted-foreground'
      >
        Memuat postingan...
      </div>
    );
  }

  if (postsQuery.isError) {
    return (
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
    );
  }

  const { posts, pagination } = postsQuery.data.data;
  const totalPages = Math.max(pagination.totalPages, 1);

  return (
    <section aria-labelledby='feed-heading' className='space-y-5'>
      <div>
        <h1 id='feed-heading' className='text-3xl font-bold'>
          Jelajahi postingan
        </h1>
        <p className='mt-2 text-muted-foreground'>
          Postingan terbaru dari komunitas Sociality.
        </p>
      </div>

      {posts.length > 0 ? (
        <div className='space-y-5'>
          {posts.map((post) => (
            <ApiPostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className='rounded-2xl border bg-card p-8 text-center text-muted-foreground'>
          Belum ada postingan pada halaman ini.
        </div>
      )}

      <nav
        aria-label='Navigasi halaman postingan'
        className='flex items-center justify-between gap-4 rounded-2xl border bg-card p-4'
      >
        <Button
          type='button'
          variant='outline'
          disabled={page <= 1 || postsQuery.isFetching}
          onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
        >
          Sebelumnya
        </Button>

        <p className='text-sm text-muted-foreground'>
          Halaman {pagination.page} dari {totalPages}
        </p>

        <Button
          type='button'
          variant='outline'
          disabled={page >= totalPages || postsQuery.isFetching}
          onClick={() => setPage((currentPage) => currentPage + 1)}
        >
          Berikutnya
        </Button>
      </nav>
    </section>
  );
}
