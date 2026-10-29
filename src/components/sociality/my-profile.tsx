'use client';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import Link from 'next/link';
import { useState } from 'react';

import { ApiPostCard } from '@/components/sociality/api-post-card';
import { AvatarUpload } from '@/components/sociality/avatar-upload';
import { EditProfileForm } from '@/components/sociality/edit-profile-form';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api/client';
import { getMyProfile } from '@/lib/api/profile';
import { getUserPosts } from '@/lib/api/users';

const POSTS_PER_PAGE = 10;

export function MyProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [page, setPage] = useState(1);

  const profileQuery = useQuery({
    queryKey: ['me'],
    queryFn: getMyProfile,
  });

  const username = profileQuery.data?.data.profile.username;

  const postsQuery = useQuery({
    queryKey: ['posts', 'me', username, page, POSTS_PER_PAGE],
    queryFn: () => {
      if (!username) {
        return Promise.reject(new Error('Profil pengguna belum tersedia.'));
      }

      return getUserPosts({
        username,
        page,
        limit: POSTS_PER_PAGE,
      });
    },
    enabled: Boolean(username),
  });

  if (profileQuery.isPending || (Boolean(username) && postsQuery.isPending)) {
    return (
      <div
        role='status'
        className='rounded-2xl border bg-card p-6 text-sm text-muted-foreground'
      >
        Memuat profil dan postingan...
      </div>
    );
  }

  if (profileQuery.isError || postsQuery.isError) {
    const error = profileQuery.error ?? postsQuery.error;

    return (
      <div
        role='alert'
        className='rounded-2xl border border-destructive/40 bg-destructive/10 p-6'
      >
        <p className='text-sm text-destructive'>{getApiErrorMessage(error)}</p>

        <Button
          type='button'
          variant='outline'
          className='mt-4'
          onClick={() => {
            void profileQuery.refetch();

            if (username) {
              void postsQuery.refetch();
            }
          }}
        >
          Coba lagi
        </Button>
      </div>
    );
  }

  if (!profileQuery.data) {
    return null;
  }

  const { profile, stats } = profileQuery.data.data;
  const posts = postsQuery.data?.data.posts ?? [];
  const pagination = postsQuery.data?.data.pagination;
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);

  const joinedAt = dayjs(profile.createdAt);

  const joinedLabel = joinedAt.isValid()
    ? `Bergabung ${joinedAt.locale('id').format('MMMM YYYY')}`
    : 'Tanggal bergabung tidak tersedia';

  if (isEditing) {
    return (
      <EditProfileForm
        profile={profile}
        onCancel={() => setIsEditing(false)}
        onSaved={() => setIsEditing(false)}
      />
    );
  }

  return (
    <section aria-labelledby='my-profile-heading' className='space-y-6'>
      <article className='overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm'>
        <div className='h-32 bg-gradient-to-r from-violet-950 via-violet-700 to-fuchsia-600' />

        <div className='px-5 pb-5'>
          <AvatarUpload profile={profile} />

          <div className='mt-4 flex flex-wrap items-start justify-between gap-4'>
            <div>
              <h1 id='my-profile-heading' className='text-3xl font-bold'>
                {profile.name}
              </h1>

              <p className='mt-1 text-lg text-muted-foreground'>
                @{profile.username}
              </p>
            </div>

            <div className='flex flex-wrap gap-2'>
              <Link
                href='/me/saved'
                prefetch={false}
                className='inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition hover:bg-accent'
              >
                Tersimpan
              </Link>

              <Link
                href='/me/likes'
                prefetch={false}
                className='inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition hover:bg-accent'
              >
                Disukai
              </Link>

              <Button
                type='button'
                variant='outline'
                onClick={() => setIsEditing(true)}
              >
                Edit profil
              </Button>
            </div>
          </div>

          <p className='mt-4 max-w-lg leading-7'>
            {profile.bio || 'Pengguna ini belum menambahkan bio.'}
          </p>

          <p className='mt-4 text-sm text-muted-foreground'>{joinedLabel}</p>

          <dl className='mt-6 grid grid-cols-2 divide-x divide-y border-t pt-5 text-center sm:grid-cols-4 sm:divide-y-0'>
            <div className='p-3'>
              <dt className='text-sm text-muted-foreground'>Postingan</dt>
              <dd className='mt-1 font-bold'>
                <a
                  href='#my-posts'
                  className='rounded text-violet-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
                  aria-label={`Lihat ${stats.posts} postingan`}
                  onClick={(event) => {
                    event.preventDefault();

                    document.getElementById('my-posts')?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }}
                >
                  {stats.posts}
                </a>
              </dd>
            </div>

            <div className='p-3'>
              <dt className='text-sm text-muted-foreground'>Pengikut</dt>
              <dd className='mt-1 font-bold'>
                <Link
                  href='/me/followers'
                  prefetch={false}
                  className='rounded text-violet-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
                  aria-label={`Lihat ${stats.followers} pengikut`}
                >
                  {stats.followers}
                </Link>
              </dd>
            </div>

            <div className='p-3'>
              <dt className='text-sm text-muted-foreground'>Mengikuti</dt>
              <dd className='mt-1 font-bold'>
                <Link
                  href='/me/following'
                  prefetch={false}
                  className='rounded text-violet-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
                  aria-label={`Lihat ${stats.following} akun yang diikuti`}
                >
                  {stats.following}
                </Link>
              </dd>
            </div>

            <div className='p-3'>
              <dt className='text-sm text-muted-foreground'>Disukai</dt>
              <dd className='mt-1 font-bold'>
                <Link
                  href='/me/likes'
                  prefetch={false}
                  className='rounded text-violet-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
                  aria-label={`Lihat ${stats.likes} postingan disukai`}
                >
                  {stats.likes}
                </Link>
              </dd>
            </div>
          </dl>

          <dl className='mt-5 grid gap-4 border-t pt-5 text-sm sm:grid-cols-2'>
            <div>
              <dt className='text-muted-foreground'>Email</dt>
              <dd className='mt-1 break-all font-medium'>{profile.email}</dd>
            </div>

            <div>
              <dt className='text-muted-foreground'>Nomor telepon</dt>
              <dd className='mt-1 font-medium'>{profile.phone}</dd>
            </div>
          </dl>
        </div>
      </article>

      <div id='my-posts' className='scroll-mt-24'>
        <h2 className='text-2xl font-bold'>Postingan saya</h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Postingan terbaru yang telah kamu bagikan.
        </p>
      </div>

      {posts.length > 0 ? (
        <div className='space-y-5'>
          {posts.map((post) => (
            <ApiPostCard key={post.id} post={post} detailSource='profile' />
          ))}
        </div>
      ) : (
        <div className='rounded-2xl border bg-card p-8 text-center'>
          <p className='font-medium'>Belum ada postingan</p>
          <p className='mt-2 text-sm text-muted-foreground'>
            Postingan yang kamu buat akan muncul di bagian ini.
          </p>

          <Link
            href='/posts/new'
            prefetch={false}
            className='mt-5 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90'
          >
            Buat postingan
          </Link>
        </div>
      )}

      {posts.length > 0 ? (
        <nav
          aria-label='Navigasi postingan saya'
          className='flex items-center justify-between gap-4 rounded-2xl border bg-card p-4'
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

          <p className='text-sm text-muted-foreground'>
            Halaman {pagination?.page ?? page} dari {totalPages}
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
