/* eslint-disable @next/next/no-img-element */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api/client';
import { likePost, unlikePost } from '@/lib/api/posts';
import type { ApiPost } from '@/types/feed';
import { PostComments } from '@/components/sociality/post-comments';
import Link from 'next/link';

type ApiPostCardProps = {
  post: ApiPost;
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

export function ApiPostCard({ post }: ApiPostCardProps) {
  const queryClient = useQueryClient();
  const createdAt = dayjs(post.createdAt);

  const createdLabel = createdAt.isValid()
    ? createdAt.locale('id').format('D MMMM YYYY, HH.mm')
    : 'Waktu tidak tersedia';

  const likeMutation = useMutation({
    mutationFn: () =>
      post.likedByMe ? unlikePost(post.id) : likePost(post.id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['posts'],
      });
    },
  });

  function handleLike() {
    if (!likeMutation.isPending) {
      likeMutation.mutate();
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

          <span className='text-sm font-medium'>{post.likeCount} suka</span>
        </div>

        {likeMutation.isError ? (
          <p role='alert' className='mt-3 text-sm text-destructive'>
            {getApiErrorMessage(likeMutation.error)}
          </p>
        ) : null}

        <Link
          href={`/posts/${post.id}`}
          className='inline-flex text-sm font-medium text-violet-500 transition hover:text-violet-400'
        >
          Lihat detail
        </Link>

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
