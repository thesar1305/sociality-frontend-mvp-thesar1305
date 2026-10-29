'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { ApiPostCard } from '@/components/sociality/api-post-card';
import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api/client';
import { deletePost, getPostDetail } from '@/lib/api/posts';
import { getMyProfile } from '@/lib/api/profile';
import { track } from '@/lib/analytics';
import { useAppSelector } from '@/lib/store/hooks';

type PostDetailProps = {
  postId: number;
  backHref: string;
  backLabel: string;
};

export function PostDetail({ postId, backHref, backLabel }: PostDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const postQuery = useQuery({
    queryKey: ['posts', 'detail', postId],
    queryFn: () => getPostDetail(postId),
  });

  const profileQuery = useQuery({
    queryKey: ['me'],
    queryFn: getMyProfile,
    enabled: isAuthenticated,
  });

  const viewedPostId = postQuery.data?.data.id;

  useEffect(() => {
    if (viewedPostId !== undefined) {
      track('post_view', { postId: viewedPostId });
    }
  }, [viewedPostId]);

  const deleteMutation = useMutation({
    mutationFn: () => deletePost(postId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['posts', 'feed'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['me'],
        }),
      ]);

      router.replace('/feed');
    },
  });

  if (postQuery.isPending) {
    return (
      <div
        role='status'
        className='rounded-2xl border bg-card p-6 text-sm text-muted-foreground'
      >
        Memuat detail postingan...
      </div>
    );
  }

  if (postQuery.isError) {
    return (
      <div
        role='alert'
        className='rounded-2xl border border-destructive/40 bg-destructive/10 p-6'
      >
        <p className='text-sm text-destructive'>
          {getApiErrorMessage(postQuery.error)}
        </p>

        <Button
          type='button'
          variant='outline'
          className='mt-4'
          onClick={() => postQuery.refetch()}
        >
          Coba lagi
        </Button>
      </div>
    );
  }

  const post = postQuery.data.data;
  const myProfile = profileQuery.data?.data.profile;
  const isOwner = myProfile?.id === post.author.id;

  function handleDelete() {
    const confirmed = window.confirm(
      'Hapus postingan ini? Tindakan ini tidak dapat dibatalkan.'
    );

    if (confirmed) {
      deleteMutation.mutate();
    }
  }

  return (
    <section aria-labelledby='post-detail-heading' className='space-y-5'>
      <div className='flex items-center justify-between gap-4'>
        <Link
          href={backHref}
          className='inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground'
        >
          <ArrowLeft className='size-4' aria-hidden='true' />
          {backLabel}
        </Link>

        {isOwner ? (
          <Button
            type='button'
            variant='destructive'
            disabled={deleteMutation.isPending}
            onClick={handleDelete}
          >
            <Trash2 className='size-4' aria-hidden='true' />
            {deleteMutation.isPending ? 'Menghapus...' : 'Hapus postingan'}
          </Button>
        ) : null}
      </div>

      <h1 id='post-detail-heading' className='sr-only'>
        Detail postingan
      </h1>

      {deleteMutation.isError ? (
        <p
          role='alert'
          className='rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive'
        >
          {getApiErrorMessage(deleteMutation.error)}
        </p>
      ) : null}

      <ApiPostCard post={post} showDetailLink={false} priority />
    </section>
  );
}
