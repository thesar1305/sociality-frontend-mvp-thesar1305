'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { ApiPostCard } from '@/components/sociality/api-post-card';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api/client';
import { getMyLikedPosts } from '@/lib/api/posts';

const POSTS_PER_PAGE = 10;

export function LikedPosts() {
  const [page, setPage] = useState(1);

  const likedPostsQuery = useQuery({
    queryKey: ['posts', 'liked', page, POSTS_PER_PAGE],
    queryFn: () =>
      getMyLikedPosts({
        page,
        limit: POSTS_PER_PAGE,
      }),
  });

  if (likedPostsQuery.isPending) {
    return (
      <div
        role='status'
        className='rounded-2xl border bg-card p-6 text-sm text-muted-foreground'
      >
        Memuat postingan yang disukai...
      </div>
    );
  }

  if (likedPostsQuery.isError) {
    return (
      <div
        role='alert'
        className='rounded-2xl border border-destructive/40 bg-destructive/10 p-6'
      >
        <p className='text-sm text-destructive'>
          {getApiErrorMessage(likedPostsQuery.error)}
        </p>

        <Button
          type='button'
          variant='outline'
          className='mt-4'
          onClick={() => likedPostsQuery.refetch()}
        >
          Coba lagi
        </Button>
      </div>
    );
  }

  const { posts, pagination } = likedPostsQuery.data.data;
  const totalPages = Math.max(pagination.totalPages, 1);

  return (
    <section aria-labelledby='liked-heading' className='space-y-6'>
      <Link
        href='/me'
        prefetch={false}
        className='inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground'
      >
        <ArrowLeft className='size-4' aria-hidden='true' />
        Kembali ke profil
      </Link>

      <div>
        <h1 id='liked-heading' className='text-3xl font-bold'>
          Postingan yang disukai
        </h1>
        <p className='mt-2 text-muted-foreground'>
          Daftar postingan yang pernah kamu sukai.
        </p>
      </div>

      {posts.length > 0 ? (
        <div className='space-y-5'>
          {posts.map((post) => (
            <ApiPostCard key={post.id} post={post} detailSource='liked' />
          ))}
        </div>
      ) : (
        <div className='rounded-2xl border bg-card p-8 text-center text-muted-foreground'>
          Belum ada postingan yang disukai.
        </div>
      )}

      {posts.length > 0 ? (
        <nav
          aria-label='Navigasi postingan yang disukai'
          className='flex items-center justify-between gap-4 rounded-2xl border bg-card p-4'
        >
          <Button
            type='button'
            variant='outline'
            disabled={page <= 1 || likedPostsQuery.isFetching}
            onClick={() =>
              setPage((currentPage) => Math.max(currentPage - 1, 1))
            }
          >
            Sebelumnya
          </Button>

          <p className='text-sm text-muted-foreground'>
            Halaman {pagination.page} dari {totalPages}
          </p>

          <Button
            type='button'
            variant='outline'
            disabled={page >= totalPages || likedPostsQuery.isFetching}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            Berikutnya
          </Button>
        </nav>
      ) : null}
    </section>
  );
}
