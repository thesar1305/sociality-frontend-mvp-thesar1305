'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { ApiPostCard } from '@/components/sociality/api-post-card';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api/client';
import { getFeed } from '@/lib/api/posts';
import { CreatePostForm } from '@/components/sociality/create-post-form';

const POSTS_PER_PAGE = 10;

export function ApiFeed() {
  const [page, setPage] = useState(1);

  const postsQuery = useQuery({
    queryKey: ['posts', 'feed', page, POSTS_PER_PAGE],
    queryFn: () =>
      getFeed({
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

  const { items: posts, pagination } = postsQuery.data.data;
  const totalPages = Math.max(pagination.totalPages, 1);

  return (
    <section aria-labelledby='feed-heading' className='space-y-6 sm:space-y-8'>
      <div>
        <h1
          id='feed-heading'
          className='text-3xl font-bold tracking-tight sm:text-4xl'
        >
          Feed
        </h1>
        <p className='mt-2 max-w-xl leading-7 text-muted-foreground'>
          Postingan terbaru darimu dan pengguna yang kamu ikuti.
        </p>
      </div>

      <CreatePostForm onCreated={() => setPage(1)} />

      {posts.length > 0 ? (
        <div className='space-y-6'>
          {posts.map((post) => (
            <ApiPostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className='rounded-2xl border bg-card p-8 text-center text-muted-foreground'>
          Belum ada postingan di feed. Ikuti pengguna lain atau buat postingan
          pertamamu.
        </div>
      )}

      {totalPages > 1 ? (
        <nav
          aria-label='Navigasi halaman postingan'
          className='flex items-center justify-between gap-3 rounded-2xl border bg-card p-4'
        >
          <Button
            type='button'
            variant='outline'
            disabled={page <= 1 || postsQuery.isFetching}
            onClick={() =>
              setPage((currentPage) => Math.max(currentPage - 1, 1))
            }
          >
            Sebelumnya
          </Button>

          <p className='text-center text-sm text-muted-foreground'>
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
      ) : null}
    </section>
  );
}
