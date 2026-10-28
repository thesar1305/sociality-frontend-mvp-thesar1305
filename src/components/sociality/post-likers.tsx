'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api/client';
import { getPostLikers } from '@/lib/api/posts';

const USERS_PER_PAGE = 10;

type PostLikersProps = {
  postId: number;
};

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'S'
  );
}

export function PostLikers({ postId }: PostLikersProps) {
  const [page, setPage] = useState(1);

  const likersQuery = useQuery({
    queryKey: ['posts', 'likes', postId, page, USERS_PER_PAGE],
    queryFn: () =>
      getPostLikers({
        postId,
        page,
        limit: USERS_PER_PAGE,
      }),
  });

  if (likersQuery.isPending) {
    return (
      <div
        role='status'
        className='rounded-2xl border bg-card p-6 text-sm text-muted-foreground'
      >
        Memuat daftar penyuka...
      </div>
    );
  }

  if (likersQuery.isError) {
    return (
      <div
        role='alert'
        className='rounded-2xl border border-destructive/40 bg-destructive/10 p-6'
      >
        <p className='text-sm text-destructive'>
          {getApiErrorMessage(likersQuery.error)}
        </p>

        <Button
          type='button'
          variant='outline'
          className='mt-4'
          onClick={() => likersQuery.refetch()}
        >
          Coba lagi
        </Button>
      </div>
    );
  }

  const { users, pagination } = likersQuery.data.data;
  const totalPages = Math.max(pagination.totalPages, 1);

  return (
    <section aria-labelledby='likers-heading' className='space-y-6'>
      <Link
        href={`/posts/${postId}`}
        prefetch={false}
        className='inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground'
      >
        <ArrowLeft className='size-4' aria-hidden='true' />
        Kembali ke postingan
      </Link>

      <div>
        <h1 id='likers-heading' className='text-3xl font-bold'>
          Disukai oleh
        </h1>
        <p className='mt-2 text-muted-foreground'>
          Pengguna yang menyukai postingan ini.
        </p>
      </div>

      {users.length > 0 ? (
        <div className='space-y-3'>
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/users/${encodeURIComponent(user.username)}?from=post-likers&postId=${postId}`}
              prefetch={false}
              className='flex items-center gap-4 rounded-2xl border bg-card p-4 transition hover:border-violet-500/60 hover:bg-accent'
            >
              <div
                aria-hidden='true'
                className='flex size-12 shrink-0 items-center justify-center rounded-full bg-primary bg-cover bg-center font-bold text-primary-foreground'
                style={
                  user.avatarUrl
                    ? {
                        backgroundImage: `url("${user.avatarUrl}")`,
                      }
                    : undefined
                }
              >
                {user.avatarUrl ? null : getInitials(user.name)}
              </div>

              <div className='min-w-0 flex-1'>
                <p className='truncate font-semibold'>{user.name}</p>
                <p className='truncate text-sm text-muted-foreground'>
                  @{user.username}
                </p>
              </div>

              <div className='flex flex-wrap justify-end gap-2 text-xs'>
                {user.isMe ? (
                  <span className='rounded-full bg-violet-500/10 px-2 py-1 font-medium text-violet-500'>
                    Anda
                  </span>
                ) : null}

                {!user.isMe && user.isFollowedByMe ? (
                  <span className='rounded-full border px-2 py-1 text-muted-foreground'>
                    Mengikuti
                  </span>
                ) : null}

                {!user.isMe && user.followsMe ? (
                  <span className='rounded-full border px-2 py-1 text-muted-foreground'>
                    Mengikuti Anda
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className='rounded-2xl border bg-card p-8 text-center text-muted-foreground'>
          Belum ada pengguna yang menyukai postingan ini.
        </div>
      )}

      {users.length > 0 ? (
        <nav
          aria-label='Navigasi daftar penyuka'
          className='flex items-center justify-between gap-4 rounded-2xl border bg-card p-4'
        >
          <Button
            type='button'
            variant='outline'
            disabled={page <= 1 || likersQuery.isFetching}
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
            disabled={page >= totalPages || likersQuery.isFetching}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            Berikutnya
          </Button>
        </nav>
      ) : null}
    </section>
  );
}
