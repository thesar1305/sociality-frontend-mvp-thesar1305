'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { ApiPostCard } from '@/components/sociality/api-post-card';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api/client';
import {
  followUser,
  getPublicProfile,
  getUserPosts,
  unfollowUser,
} from '@/lib/api/users';
import type { PublicProfileResponse } from '@/types/user';

const POSTS_PER_PAGE = 10;

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

type PublicUserProfileProps = {
  username: string;
};

export function PublicUserProfile({ username }: PublicUserProfileProps) {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const profileQueryKey = ['users', 'profile', username] as const;

  const profileQuery = useQuery({
    queryKey: profileQueryKey,
    queryFn: () => getPublicProfile(username),
  });

  const postsQuery = useQuery({
    queryKey: ['posts', 'user', username, page, POSTS_PER_PAGE],
    queryFn: () =>
      getUserPosts({
        username,
        page,
        limit: POSTS_PER_PAGE,
      }),
  });
  const followMutation = useMutation({
    mutationFn: ({ shouldFollow }: { shouldFollow: boolean }) =>
      shouldFollow ? followUser(username) : unfollowUser(username),

    onMutate: async ({ shouldFollow }) => {
      await queryClient.cancelQueries({
        queryKey: profileQueryKey,
      });

      const previousProfile =
        queryClient.getQueryData<PublicProfileResponse>(profileQueryKey);

      queryClient.setQueryData<PublicProfileResponse>(
        profileQueryKey,
        (currentProfile) => {
          if (!currentProfile) {
            return currentProfile;
          }

          const followerChange = shouldFollow ? 1 : -1;

          return {
            ...currentProfile,
            data: {
              ...currentProfile.data,
              isFollowing: shouldFollow,
              counts: {
                ...currentProfile.data.counts,
                followers: Math.max(
                  currentProfile.data.counts.followers + followerChange,
                  0
                ),
              },
            },
          };
        }
      );

      return {
        previousProfile,
      };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileQueryKey, context.previousProfile);
      }
    },

    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: profileQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: ['users', 'search'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['posts', 'feed'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['me'],
        }),
      ]);
    },
  });

  if (profileQuery.isPending || postsQuery.isPending) {
    return (
      <div
        role='status'
        className='rounded-2xl border bg-card p-6 text-sm text-muted-foreground'
      >
        Memuat profil pengguna...
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
            void Promise.all([profileQuery.refetch(), postsQuery.refetch()]);
          }}
        >
          Coba lagi
        </Button>
      </div>
    );
  }

  const profile = profileQuery.data.data;
  const { posts, pagination } = postsQuery.data.data;
  const totalPages = Math.max(pagination.totalPages, 1);

  return (
    <section aria-labelledby='public-profile-heading' className='space-y-6'>
      <Link
        href='/search'
        className='inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground'
      >
        <ArrowLeft className='size-4' aria-hidden='true' />
        Kembali ke pencarian
      </Link>

      <article className='overflow-hidden rounded-2xl border bg-card shadow-sm'>
        <div className='h-32 bg-gradient-to-r from-violet-950 via-violet-700 to-fuchsia-600' />

        <div className='px-5 pb-6'>
          <div
            aria-hidden='true'
            className='-mt-12 flex size-24 items-center justify-center rounded-full border-4 border-card bg-primary bg-cover bg-center text-2xl font-bold text-primary-foreground'
            style={
              profile.avatarUrl
                ? {
                    backgroundImage: `url("${profile.avatarUrl}")`,
                  }
                : undefined
            }
          >
            {profile.avatarUrl ? null : getInitials(profile.name)}
          </div>

          <div className='mt-4 flex flex-wrap items-start justify-between gap-4'>
            <div>
              <h1 id='public-profile-heading' className='text-3xl font-bold'>
                {profile.name}
              </h1>
              <p className='mt-1 text-lg text-muted-foreground'>
                @{profile.username}
              </p>
            </div>

            {profile.isMe ? (
              <Link
                href='/me'
                className='inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition hover:bg-accent'
              >
                Profil saya
              </Link>
            ) : (
              <Button
                type='button'
                variant={profile.isFollowing ? 'outline' : 'default'}
                disabled={followMutation.isPending}
                onClick={() =>
                  followMutation.mutate({
                    shouldFollow: !profile.isFollowing,
                  })
                }
              >
                {followMutation.isPending
                  ? 'Memproses...'
                  : profile.isFollowing
                    ? 'Berhenti mengikuti'
                    : 'Ikuti'}
              </Button>
            )}
          </div>

          <p className='mt-5 max-w-xl leading-7'>
            {profile.bio || 'Pengguna ini belum menambahkan bio.'}
          </p>

          <dl className='mt-6 grid grid-cols-2 divide-x divide-y border-t pt-5 text-center sm:grid-cols-4 sm:divide-y-0'>
            <div className='p-3'>
              <dt className='text-sm text-muted-foreground'>Postingan</dt>
              <dd className='mt-1 font-bold'>{profile.counts.post}</dd>
            </div>

            <div className='p-3'>
              <dt className='text-sm text-muted-foreground'>Pengikut</dt>
              <dd className='mt-1 font-bold'>{profile.counts.followers}</dd>
            </div>

            <div className='p-3'>
              <dt className='text-sm text-muted-foreground'>Mengikuti</dt>
              <dd className='mt-1 font-bold'>{profile.counts.following}</dd>
            </div>

            <div className='p-3'>
              <dt className='text-sm text-muted-foreground'>Disukai</dt>
              <dd className='mt-1 font-bold'>{profile.counts.likes}</dd>
            </div>
          </dl>
        </div>
      </article>

      {followMutation.isError ? (
        <p
          role='alert'
          className='rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive'
        >
          {getApiErrorMessage(followMutation.error)}
        </p>
      ) : null}

      <div>
        <h2 className='text-2xl font-bold'>Postingan</h2>
        <p className='mt-1 text-sm text-muted-foreground'>
          Postingan terbaru dari @{profile.username}.
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
          Pengguna ini belum membuat postingan.
        </div>
      )}

      {posts.length > 0 ? (
        <nav
          aria-label='Navigasi postingan pengguna'
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
