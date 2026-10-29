'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { Bookmark } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { PostComments, SafeImage } from '@/components/sociality/post-comments';
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
  detailSource?: 'liked' | 'profile' | 'public-profile';
  detailReturnHref?: string;
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
  detailReturnHref,
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

  const serverSaved =
    savedPostsQuery.data?.data.posts.some(
      (savedPost) => savedPost.id === post.id
    ) ?? false;

  const createdAt = dayjs(post.createdAt);

  const createdLabel = createdAt.isValid()
    ? createdAt.locale('id').format('D MMMM YYYY, HH.mm')
    : 'Waktu tidak tersedia';

  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
  const [optimisticSaved, setOptimisticSaved] = useState<boolean | null>(null);

  const isLiked = optimisticLiked ?? post.likedByMe;
  const isSaved = optimisticSaved ?? serverSaved;
  const likeDelta =
    optimisticLiked === null || optimisticLiked === post.likedByMe
      ? 0
      : optimisticLiked
        ? 1
        : -1;
  const likeCount = Math.max(post.likeCount + likeDelta, 0);

  const likeMutation = useMutation({
    mutationFn: (nextLiked: boolean) =>
      nextLiked ? likePost(post.id) : unlikePost(post.id),

    onMutate: (nextLiked) => {
      setOptimisticLiked(nextLiked);
    },

    onError: () => {
      setOptimisticLiked(null);
    },

    onSuccess: (_, nextLiked) => {
      if (!nextLiked) {
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
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['posts'],
      });
      setOptimisticLiked(null);
    },
  });

  const saveMutation = useMutation({
    mutationFn: (nextSaved: boolean) =>
      nextSaved ? savePost(post.id) : unsavePost(post.id),

    onMutate: (nextSaved) => {
      setOptimisticSaved(nextSaved);
    },

    onError: () => {
      setOptimisticSaved(null);
    },

    onSettled: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['posts', 'saved'],
      });
      setOptimisticSaved(null);
    },
  });

  function handleLike() {
    if (!likeMutation.isPending) {
      likeMutation.mutate(!isLiked);
    }
  }

  function handleSave() {
    if (
      !savedPostsQuery.isPending &&
      !savedPostsQuery.isError &&
      !saveMutation.isPending
    ) {
      saveMutation.mutate(!isSaved);
    }
  }

  return (
    <article className='overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm'>
      <header className='flex items-center gap-3 p-4'>
        <div className='flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-semibold text-primary-foreground'>
          <SafeImage
            src={post.author.avatarUrl}
            alt={`Avatar ${post.author.name}`}
            className='size-full object-cover'
            fallback={<span>{getInitials(post.author.name)}</span>}
          />
        </div>

        <div className='min-w-0'>
          <p className='truncate font-semibold'>{post.author.name}</p>
          <p className='truncate text-sm text-muted-foreground'>
            @{post.author.username} · {createdLabel}
          </p>
        </div>
      </header>

      <SafeImage
        src={post.imageUrl}
        alt={
          post.caption
            ? `Postingan ${post.author.name}: ${post.caption}`
            : `Postingan ${post.author.name}`
        }
        className='aspect-square w-full bg-muted object-cover'
        fallback={
          <div
            role='img'
            aria-label={`Gambar postingan ${post.author.name} tidak tersedia`}
            className='flex aspect-square w-full items-center justify-center bg-muted text-sm text-muted-foreground'
          >
            Gambar tidak tersedia
          </div>
        }
      />

      <div className='p-4'>
        <div className='flex flex-wrap items-center gap-3'>
          <Button
            type='button'
            variant={isLiked ? 'default' : 'outline'}
            aria-pressed={isLiked}
            aria-busy={likeMutation.isPending}
            aria-label={
              isLiked
                ? `Batalkan suka pada postingan ${post.author.name}`
                : `Sukai postingan ${post.author.name}`
            }
            onClick={handleLike}
          >
            {isLiked ? 'Disukai' : 'Suka'}
          </Button>

          <Button
            type='button'
            variant={isSaved ? 'default' : 'outline'}
            aria-pressed={isSaved}
            aria-busy={saveMutation.isPending}
            aria-label={
              isSaved
                ? `Batalkan simpan postingan ${post.author.name}`
                : `Simpan postingan ${post.author.name}`
            }
            disabled={savedPostsQuery.isPending || savedPostsQuery.isError}
            onClick={handleSave}
          >
            <Bookmark
              className={isSaved ? 'size-4 fill-current' : 'size-4'}
              aria-hidden='true'
            />

            {isSaved ? 'Tersimpan' : 'Simpan'}
          </Button>

          <Link
            href={`/posts/${post.id}/likes`}
            prefetch={false}
            className='rounded text-sm font-medium text-violet-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
            aria-label={`Lihat ${likeCount} pengguna yang menyukai postingan ini`}
          >
            {likeCount} suka
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
                  : detailSource === 'public-profile' && detailReturnHref
                    ? `/posts/${post.id}?from=public-profile&returnTo=${encodeURIComponent(
                        detailReturnHref
                      )}`
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
