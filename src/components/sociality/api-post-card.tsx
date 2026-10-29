/* eslint-disable @next/next/no-img-element */
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { Bookmark } from 'lucide-react';
import Link from 'next/link';

import { PostComments } from '@/components/sociality/post-comments';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api/client';
import {
  getSavedPosts,
  likePost,
  savePost,
  unlikePost,
  unsavePost,
} from '@/lib/api/posts';
import type { ApiPost, PostsResponse } from '@/types/feed';

type ApiPostCardProps = {
  post: ApiPost;
  showDetailLink?: boolean;
  detailSource?: 'liked' | 'profile';
};

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase() || 'U'
  );
}

export function ApiPostCard({
  post,
  showDetailLink = true,
  detailSource,
}: ApiPostCardProps) {
  const queryClient = useQueryClient();

  const savedPostsQuery = useQuery({
    queryKey: ['posts', 'saved', 'lookup'],
    queryFn: () =>
      getSavedPosts({
        page: 1,
        limit: 50,
      }),
    staleTime: 30_000,
  });

  const isSaved =
    savedPostsQuery.data?.data.posts.some(
      (savedPost) => savedPost.id === post.id
    ) ?? false;

  const createdAt = dayjs(post.createdAt);

  const createdLabel = createdAt.isValid()
    ? createdAt.locale('id').format('D MMMM YYYY, HH.mm')
    : 'Waktu tidak tersedia';

  const likeMutation = useMutation({
    mutationFn: () =>
      post.likedByMe ? unlikePost(post.id) : likePost(post.id),

    onSuccess: () => {
      if (post.likedByMe) {
        queryClient.setQueriesData<PostsResponse>(
          {
            queryKey: ['posts', 'liked'],
          },
          (currentData) => {
            if (!currentData) {
              return currentData;
            }

            const postExists = currentData.data.posts.some(
              (likedPost) => likedPost.id === post.id
            );

            if (!postExists) {
              return currentData;
            }

            return {
              ...currentData,
              data: {
                ...currentData.data,
                posts: currentData.data.posts.filter(
                  (likedPost) => likedPost.id !== post.id
                ),
                pagination: {
                  ...currentData.data.pagination,
                  total: Math.max(currentData.data.pagination.total - 1, 0),
                },
              },
            };
          }
        );
      }

      void queryClient.invalidateQueries({
        queryKey: ['posts'],
      });
    },
  });
  const saveMutation = useMutation({
    mutationFn: () => (isSaved ? unsavePost(post.id) : savePost(post.id)),

    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['posts', 'saved'],
      });
    },
  });

  function handleLike() {
    if (!likeMutation.isPending) {
      likeMutation.mutate();
    }
  }

  function handleSave() {
    if (
      !savedPostsQuery.isPending &&
      !savedPostsQuery.isError &&
      !saveMutation.isPending
    ) {
      saveMutation.mutate();
    }
  }

  return (
    <article className='overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm'>
      <header className='flex items-center gap-3 p-4'>
        <div className='flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-semibold text-primary-foreground'>
          {post.author.avatarUrl ? (
            <img
              src={post.author.avatarUrl}
              alt={`Avatar ${post.author.name}`}
              className='size-full object-cover'
            />
          ) : (
            <span>{getInitials(post.author.name)}</span>
          )}
        </div>

        <div className='min-w-0'>
          <p className='truncate font-semibold'>{post.author.name}</p>
          <p className='truncate text-sm text-muted-foreground'>
            @{post.author.username} · {createdLabel}
          </p>
        </div>
      </header>

      <img
        src={post.imageUrl}
        alt={
          post.caption
            ? `Postingan ${post.author.name}: ${post.caption}`
            : `Postingan ${post.author.name}`
        }
        className='aspect-square w-full bg-muted object-cover'
      />

      <div className='p-4'>
        <div className='flex flex-wrap items-center gap-3'>
          <Button
            type='button'
            variant={post.likedByMe ? 'default' : 'outline'}
            disabled={likeMutation.isPending}
            aria-pressed={post.likedByMe}
            aria-label={
              post.likedByMe
                ? `Batalkan suka pada postingan ${post.author.name}`
                : `Sukai postingan ${post.author.name}`
            }
            onClick={handleLike}
          >
            {likeMutation.isPending
              ? 'Memproses...'
              : post.likedByMe
                ? 'Disukai'
                : 'Suka'}
          </Button>

          <Button
            type='button'
            variant={isSaved ? 'default' : 'outline'}
            aria-pressed={isSaved}
            aria-label={
              isSaved
                ? `Batalkan simpan postingan ${post.author.name}`
                : `Simpan postingan ${post.author.name}`
            }
            disabled={
              savedPostsQuery.isPending ||
              savedPostsQuery.isError ||
              saveMutation.isPending
            }
            onClick={handleSave}
          >
            <Bookmark
              className={isSaved ? 'size-4 fill-current' : 'size-4'}
              aria-hidden='true'
            />

            {saveMutation.isPending
              ? 'Memproses...'
              : isSaved
                ? 'Tersimpan'
                : 'Simpan'}
          </Button>

          <Link
            href={`/posts/${post.id}/likes`}
            prefetch={false}
            className='rounded text-sm font-medium text-violet-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
            aria-label={`Lihat ${post.likeCount} pengguna yang menyukai postingan ini`}
          >
            {post.likeCount} suka
          </Link>
        </div>

        {likeMutation.isError ? (
          <p role='alert' className='mt-3 text-sm text-destructive'>
            {getApiErrorMessage(likeMutation.error)}
          </p>
        ) : null}

        {savedPostsQuery.isError ? (
          <p role='alert' className='mt-3 text-sm text-destructive'>
            Status simpan tidak dapat dimuat:{' '}
            {getApiErrorMessage(savedPostsQuery.error)}
          </p>
        ) : null}

        {saveMutation.isError ? (
          <p role='alert' className='mt-3 text-sm text-destructive'>
            {getApiErrorMessage(saveMutation.error)}
          </p>
        ) : null}

        {showDetailLink ? (
          <Link
            href={
              detailSource === 'liked'
                ? `/posts/${post.id}?from=liked`
                : detailSource === 'profile'
                  ? `/posts/${post.id}?from=profile`
                  : `/posts/${post.id}`
            }
            prefetch={false}
            className='mt-3 inline-flex text-sm font-medium text-violet-500 transition hover:text-violet-400'
          >
            Lihat detail
          </Link>
        ) : null}

        {post.caption ? (
          <p className='mt-4 leading-7'>
            <span className='mr-2 font-semibold'>@{post.author.username}</span>
            {post.caption}
          </p>
        ) : null}

        <PostComments postId={post.id} commentCount={post.commentCount} />
      </div>
    </article>
  );
}
