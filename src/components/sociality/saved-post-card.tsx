'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import Link from 'next/link';

import { SafeImage } from '@/components/sociality/post-comments';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api/client';
import { unsavePost } from '@/lib/api/posts';
import type { SavedPost, SavedPostsResponse } from '@/types/feed';

type SavedPostCardProps = {
  post: SavedPost;
};

export function SavedPostCard({ post }: SavedPostCardProps) {
  const queryClient = useQueryClient();
  const createdAt = dayjs(post.createdAt);

  const createdLabel = createdAt.isValid()
    ? createdAt.locale('id').format('D MMMM YYYY, HH.mm')
    : 'Waktu tidak tersedia';

  const unsaveMutation = useMutation({
    mutationFn: () => unsavePost(post.id),

    onMutate: async () => {
      await queryClient.cancelQueries({
        queryKey: ['posts', 'saved'],
      });

      const previousQueries = queryClient.getQueriesData<SavedPostsResponse>({
        queryKey: ['posts', 'saved'],
      });

      queryClient.setQueriesData<SavedPostsResponse>(
        {
          queryKey: ['posts', 'saved'],
        },
        (currentData) => {
          if (!currentData) {
            return currentData;
          }

          const postExists = currentData.data.posts.some(
            (savedPost) => savedPost.id === post.id
          );

          if (!postExists) {
            return currentData;
          }

          return {
            ...currentData,
            data: {
              ...currentData.data,
              posts: currentData.data.posts.filter(
                (savedPost) => savedPost.id !== post.id
              ),
              pagination: {
                ...currentData.data.pagination,
                total: Math.max(currentData.data.pagination.total - 1, 0),
              },
            },
          };
        }
      );

      return { previousQueries };
    },

    onError: (_error, _variables, context) => {
      context?.previousQueries.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data);
      });
    },

    onSettled: () => {
      void queryClient.invalidateQueries({
        queryKey: ['posts', 'saved'],
      });
    },
  });

  return (
    <article className='overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm'>
      <SafeImage
        src={post.imageUrl}
        alt={
          post.caption
            ? `Postingan tersimpan: ${post.caption}`
            : 'Postingan tersimpan'
        }
        className='aspect-square w-full bg-muted object-cover'
        fallback={
          <div
            role='img'
            aria-label='Gambar postingan tersimpan tidak tersedia'
            className='flex aspect-square w-full items-center justify-center bg-muted text-sm text-muted-foreground'
          >
            Gambar tidak tersedia
          </div>
        }
      />

      <div className='space-y-4 p-4'>
        <p className='text-sm text-muted-foreground'>{createdLabel}</p>

        {post.caption ? (
          <p className='leading-7'>{post.caption}</p>
        ) : (
          <p className='text-sm italic text-muted-foreground'>
            Postingan tanpa caption.
          </p>
        )}

        <div className='flex flex-wrap gap-3'>
          <Link
            href={`/posts/${post.id}?from=saved`}
            prefetch={false}
            className='inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition hover:bg-accent'
          >
            Lihat detail
          </Link>

          <Button
            type='button'
            variant='outline'
            disabled={unsaveMutation.isPending}
            onClick={() => unsaveMutation.mutate()}
          >
            {unsaveMutation.isPending ? 'Menghapus...' : 'Hapus dari tersimpan'}
          </Button>
        </div>

        {unsaveMutation.isError ? (
          <p role='alert' className='text-sm text-destructive'>
            {getApiErrorMessage(unsaveMutation.error)}
          </p>
        ) : null}
      </div>
    </article>
  );
}
