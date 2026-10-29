'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Bookmark, Check, Heart, MessageCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { PostComments, SafeImage } from '@/components/sociality/post-comments';
import { getApiErrorMessage } from '@/lib/api/client';
import {
  getSavedPosts,
  likePost,
  savePost,
  unlikePost,
  unsavePost,
} from '@/lib/api/posts';
import { useAppSelector } from '@/lib/store/hooks';
import type { ApiPost, PostsResponse } from '@/types/feed';
import { cn } from 'cn';

dayjs.extend(relativeTime);

const CAPTION_PREVIEW_LENGTH = 110;

const actionButtonClassName =
  'inline-flex items-center gap-1.5 rounded-md p-1 text-sm transition-colors hover:text-brand-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50';

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
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);

  function redirectToLogin() {
    router.push(`/login?next=${encodeURIComponent(pathname)}`);
  }

  const savedPostsQuery = useQuery({
    queryKey: ['posts', 'saved', 'lookup'],
    queryFn: () =>
      getSavedPosts({
        page: 1,
        limit: 50,
      }),
    staleTime: 30_000,
    enabled: isAuthenticated,
  });

  const serverSaved =
    savedPostsQuery.data?.data.posts.some(
      (savedPost) => savedPost.id === post.id
    ) ?? false;

  const createdAt = dayjs(post.createdAt);

  const createdLabel = createdAt.isValid()
    ? createdAt.locale('id').fromNow()
    : 'Waktu tidak tersedia';

  const createdTitle = createdAt.isValid()
    ? createdAt.locale('id').format('D MMMM YYYY, HH.mm')
    : undefined;

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [shared, setShared] = useState(false);

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
    if (!isAuthenticated) {
      if (isHydrated) {
        redirectToLogin();
      }

      return;
    }

    if (!likeMutation.isPending) {
      likeMutation.mutate(!isLiked);
    }
  }

  function handleSave() {
    if (!isAuthenticated) {
      if (isHydrated) {
        redirectToLogin();
      }

      return;
    }

    if (
      !savedPostsQuery.isPending &&
      !savedPostsQuery.isError &&
      !saveMutation.isPending
    ) {
      saveMutation.mutate(!isSaved);
    }
  }

  const detailHref =
    detailSource === 'liked'
      ? `/posts/${post.id}?from=liked`
      : detailSource === 'profile'
        ? `/posts/${post.id}?from=profile`
        : detailSource === 'public-profile' && detailReturnHref
          ? `/posts/${post.id}?from=public-profile&returnTo=${encodeURIComponent(
              detailReturnHref
            )}`
          : `/posts/${post.id}`;

  const caption = post.caption ?? '';
  const captionIsLong =
    caption.length > CAPTION_PREVIEW_LENGTH || caption.includes('\n');

  async function handleShare() {
    const url = `${window.location.origin}/posts/${post.id}`;

    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ url, title: `Postingan ${post.author.name}` });
      } else {
        await navigator.clipboard.writeText(url);
      }

      setShared(true);
      window.setTimeout(() => setShared(false), 2000);
    } catch {
      // Dibatalkan pengguna atau clipboard tidak tersedia.
    }
  }

  const postImage = (
    <SafeImage
      src={post.imageUrl}
      alt={
        post.caption
          ? `Postingan ${post.author.name}: ${post.caption}`
          : `Postingan ${post.author.name}`
      }
      className='aspect-square w-full rounded-xl bg-muted object-cover'
      fallback={
        <div
          role='img'
          aria-label={`Gambar postingan ${post.author.name} tidak tersedia`}
          className='flex aspect-square w-full items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground'
        >
          Gambar tidak tersedia
        </div>
      }
    />
  );

  return (
    <article className='border-b border-border pb-6 text-foreground'>
      <header className='flex items-center gap-3 pb-3'>
        <Link
          href={`/users/${post.author.username}`}
          prefetch={false}
          className='flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40'
        >
          <SafeImage
            src={post.author.avatarUrl}
            alt={`Avatar ${post.author.name}`}
            className='size-full object-cover'
            fallback={<span>{getInitials(post.author.name)}</span>}
          />
        </Link>

        <div className='min-w-0'>
          <Link
            href={`/users/${post.author.username}`}
            prefetch={false}
            className='block truncate font-semibold hover:underline'
          >
            {post.author.name}
          </Link>
          {showDetailLink ? (
            <Link
              href={detailHref}
              prefetch={false}
              title={createdTitle}
              className='block truncate text-sm text-muted-foreground hover:underline'
            >
              {createdLabel}
            </Link>
          ) : (
            <p
              title={createdTitle}
              className='truncate text-sm text-muted-foreground'
            >
              {createdLabel}
            </p>
          )}
        </div>
      </header>

      {showDetailLink ? (
        <Link
          href={detailHref}
          prefetch={false}
          className='block rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40'
        >
          {postImage}
        </Link>
      ) : (
        postImage
      )}

      <div className='mt-3 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-4'>
          <span className='inline-flex items-center gap-1'>
            <button
              type='button'
              aria-pressed={isLiked}
              aria-busy={likeMutation.isPending}
              aria-label={
                isLiked
                  ? `Batalkan suka pada postingan ${post.author.name}`
                  : `Sukai postingan ${post.author.name}`
              }
              className={cn(
                actionButtonClassName,
                isLiked && 'text-destructive hover:text-destructive'
              )}
              onClick={handleLike}
            >
              <Heart
                className={cn('size-6', isLiked && 'fill-current')}
                aria-hidden='true'
              />
            </button>
            <Link
              href={`/posts/${post.id}/likes`}
              prefetch={false}
              className='rounded text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40'
              aria-label={`Lihat ${likeCount} pengguna yang menyukai postingan ini`}
            >
              {likeCount}
            </Link>
          </span>

          <button
            type='button'
            aria-expanded={commentsOpen}
            aria-controls={`comments-${post.id}`}
            aria-label={`Komentar, ${post.commentCount} komentar`}
            className={actionButtonClassName}
            onClick={() => setCommentsOpen((current) => !current)}
          >
            <MessageCircle className='size-6' aria-hidden='true' />
            <span className='font-medium'>{post.commentCount}</span>
          </button>

          <button
            type='button'
            aria-label={shared ? 'Tautan disalin' : 'Bagikan postingan'}
            className={actionButtonClassName}
            onClick={handleShare}
          >
            {shared ? (
              <Check className='size-6' aria-hidden='true' />
            ) : (
              <Send className='size-6' aria-hidden='true' />
            )}
          </button>
        </div>

        <button
          type='button'
          aria-pressed={isSaved}
          aria-busy={saveMutation.isPending}
          aria-label={
            isSaved
              ? `Batalkan simpan postingan ${post.author.name}`
              : `Simpan postingan ${post.author.name}`
          }
          disabled={
            isAuthenticated &&
            (savedPostsQuery.isPending || savedPostsQuery.isError)
          }
          className={cn(actionButtonClassName, isSaved && 'text-brand-200')}
          onClick={handleSave}
        >
          <Bookmark
            className={cn('size-6', isSaved && 'fill-current')}
            aria-hidden='true'
          />
        </button>
      </div>

      <span role='status' className='sr-only'>
        {shared ? 'Tautan postingan disalin.' : ''}
      </span>

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

      {caption ? (
        <div className='mt-3 text-sm leading-6'>
          <p className='font-semibold'>{post.author.name}</p>
          <p
            className={cn(
              'whitespace-pre-line text-foreground/90',
              captionIsLong && !captionExpanded && 'line-clamp-2'
            )}
          >
            {caption}
          </p>
          {captionIsLong ? (
            <button
              type='button'
              aria-expanded={captionExpanded}
              className='mt-1 rounded text-sm font-semibold text-brand-200 hover:underline focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40'
              onClick={() => setCaptionExpanded((current) => !current)}
            >
              {captionExpanded ? 'Sembunyikan' : 'Selengkapnya'}
            </button>
          ) : null}
        </div>
      ) : null}

      <PostComments
        postId={post.id}
        postAuthorId={post.author.id}
        commentCount={post.commentCount}
        open={commentsOpen}
        onOpenChange={setCommentsOpen}
        hideToggle
      />
    </article>
  );
}
