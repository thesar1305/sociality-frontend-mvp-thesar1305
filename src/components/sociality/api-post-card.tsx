/* eslint-disable @next/next/no-img-element */

import dayjs from 'dayjs';
import 'dayjs/locale/id';

import type { ApiPost } from '@/types/feed';

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
  const createdAt = dayjs(post.createdAt);

  const createdLabel = createdAt.isValid()
    ? createdAt.locale('id').format('D MMMM YYYY, HH.mm')
    : 'Waktu tidak tersedia';

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
        <div className='flex flex-wrap gap-5 text-sm font-medium'>
          <span>
            {post.likedByMe ? 'Disukai' : 'Suka'} · {post.likeCount}
          </span>
          <span>Komentar · {post.commentCount}</span>
        </div>

        {post.caption ? (
          <p className='mt-4 leading-7'>
            <span className='mr-2 font-semibold'>@{post.author.username}</span>
            {post.caption}
          </p>
        ) : null}
      </div>
    </article>
  );
}
