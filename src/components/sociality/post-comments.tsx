/* eslint-disable @next/next/no-img-element */
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { type FormEvent, type ReactNode, useState } from 'react';

import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api/client';
import {
  addPostComment,
  deleteComment,
  getPostComments,
} from '@/lib/api/comments';
import { getMyProfile } from '@/lib/api/profile';
import type { ApiComment, CommentsResponse } from '@/types/comment';

type PostCommentsProps = {
  postId: number;
  commentCount: number;
};

const COMMENTS_PER_PAGE = 10;
const COMMENT_MAX_LENGTH = 180;

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

type SafeImageProps = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  fallback: ReactNode;
};

export function SafeImage({ src, alt, className, fallback }: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      loading='lazy'
      decoding='async'
      className={className}
      onError={() => setFailedSrc(src)}
    />
  );
}

export function PostComments({ postId, commentCount }: PostCommentsProps) {
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [text, setText] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const commentsQuery = useQuery({
    queryKey: ['comments', postId, page, COMMENTS_PER_PAGE],
    queryFn: () =>
      getPostComments({
        postId,
        page,
        limit: COMMENTS_PER_PAGE,
      }),
    enabled: isOpen,
  });
  const profileQuery = useQuery({
    queryKey: ['me'],
    queryFn: getMyProfile,
    staleTime: 5 * 60 * 1000,
  });

  const currentUserId = profileQuery.data?.data.profile.id;
  const addCommentMutation = useMutation({
    mutationFn: (commentText: string) => addPostComment(postId, commentText),

    onMutate: async (commentText) => {
      const firstPageKey = ['comments', postId, 1, COMMENTS_PER_PAGE];

      await queryClient.cancelQueries({ queryKey: ['comments', postId] });

      const previousComments =
        queryClient.getQueryData<CommentsResponse>(firstPageKey);
      const profile = profileQuery.data?.data.profile;

      setText('');
      setPage(1);

      if (previousComments && profile) {
        const optimisticComment: ApiComment = {
          id: -Date.now(),
          text: commentText,
          createdAt: new Date().toISOString(),
          author: {
            id: profile.id,
            username: profile.username,
            name: profile.name,
            avatarUrl: profile.avatarUrl,
          },
        };
        const { pagination } = previousComments.data;
        const nextTotal = pagination.total + 1;

        queryClient.setQueryData<CommentsResponse>(firstPageKey, {
          ...previousComments,
          data: {
            ...previousComments.data,
            comments: [
              optimisticComment,
              ...previousComments.data.comments,
            ].slice(0, pagination.limit),
            pagination: {
              ...pagination,
              total: nextTotal,
              totalPages: Math.max(Math.ceil(nextTotal / pagination.limit), 1),
            },
          },
        });
      }

      return { firstPageKey, previousComments, commentText };
    },

    onError: (_error, _commentText, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(
          context.firstPageKey,
          context.previousComments
        );
      }

      setText((currentText) => currentText || context?.commentText || '');
    },

    onSuccess: () => {
      setSuccessMessage('Komentar berhasil dikirim.');
    },

    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['comments', postId],
        }),
        queryClient.invalidateQueries({
          queryKey: ['posts'],
        }),
      ]);
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedText = text.trim();

    setSuccessMessage(null);

    if (!trimmedText) {
      return;
    }

    addCommentMutation.mutate(trimmedText);
  }

  function handleDeleteComment(commentId: number) {
    if (deleteCommentMutation.isPending) {
      return;
    }

    const confirmed = window.confirm(
      'Hapus komentar ini? Tindakan ini tidak dapat dibatalkan.'
    );

    if (!confirmed) {
      return;
    }

    setSuccessMessage(null);
    deleteCommentMutation.mutate(commentId);
  }

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),

    onSuccess: async (_, deletedCommentId) => {
      const currentPageCommentCount =
        commentsQuery.data?.data.comments.length ?? 0;

      queryClient.setQueriesData<CommentsResponse>(
        {
          queryKey: ['comments', postId],
        },
        (currentResponse) => {
          if (!currentResponse) {
            return currentResponse;
          }

          const nextTotal = Math.max(
            currentResponse.data.pagination.total - 1,
            0
          );

          const nextTotalPages = Math.max(
            Math.ceil(nextTotal / currentResponse.data.pagination.limit),
            1
          );

          return {
            ...currentResponse,
            data: {
              ...currentResponse.data,
              comments: currentResponse.data.comments.filter(
                (comment) => comment.id !== deletedCommentId
              ),
              pagination: {
                ...currentResponse.data.pagination,
                total: nextTotal,
                totalPages: nextTotalPages,
              },
            },
          };
        }
      );

      setSuccessMessage('Komentar berhasil dihapus.');

      if (currentPageCommentCount === 1 && page > 1) {
        setPage((currentPage) => Math.max(currentPage - 1, 1));
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['comments', postId],
        }),
        queryClient.invalidateQueries({
          queryKey: ['posts'],
        }),
      ]);
    },
  });

  const comments = commentsQuery.data?.data.comments ?? [];

  const pagination = commentsQuery.data?.data.pagination;

  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);

  return (
    <div className='mt-4 border-t pt-4'>
      <Button
        type='button'
        variant='outline'
        aria-expanded={isOpen}
        aria-controls={`comments-${postId}`}
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen
          ? 'Sembunyikan komentar'
          : commentCount > 0
            ? `Lihat ${commentCount} komentar`
            : 'Tulis komentar'}
      </Button>

      {isOpen ? (
        <div id={`comments-${postId}`} className='mt-4 space-y-4'>
          {commentsQuery.isPending ? (
            <p role='status' className='text-sm text-muted-foreground'>
              Memuat komentar...
            </p>
          ) : null}

          {commentsQuery.isError ? (
            <div
              role='alert'
              className='rounded-xl border border-destructive/40 bg-destructive/10 p-4'
            >
              <p className='text-sm text-destructive'>
                {getApiErrorMessage(commentsQuery.error)}
              </p>

              <Button
                type='button'
                variant='outline'
                className='mt-3'
                onClick={() => commentsQuery.refetch()}
              >
                Coba lagi
              </Button>
            </div>
          ) : null}

          {commentsQuery.isSuccess ? (
            comments.length > 0 ? (
              <ul className='space-y-4'>
                {comments.map((comment) => {
                  const createdAt = dayjs(comment.createdAt);

                  const createdLabel = createdAt.isValid()
                    ? createdAt.locale('id').format('D MMM YYYY, HH.mm')
                    : 'Waktu tidak tersedia';

                  return (
                    <li key={comment.id} className='flex gap-3'>
                      <div className='flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold'>
                        <SafeImage
                          src={comment.author.avatarUrl}
                          alt={`Avatar ${comment.author.name}`}
                          className='size-full object-cover'
                          fallback={
                            <span>{getInitials(comment.author.name)}</span>
                          }
                        />
                      </div>

                      <div className='min-w-0 flex-1 rounded-xl bg-muted/50 px-4 py-3'>
                        <div className='flex flex-wrap items-start justify-between gap-3'>
                          <div className='min-w-0'>
                            <p className='font-semibold'>
                              {comment.author.name}
                            </p>
                            <p className='text-sm text-muted-foreground'>
                              @{comment.author.username}
                            </p>
                          </div>

                          <div className='flex items-center gap-2'>
                            <time className='text-xs text-muted-foreground'>
                              {createdLabel}
                            </time>

                            {comment.author.id === currentUserId && comment.id > 0 ? (
                              <Button
                                type='button'
                                variant='ghost'
                                className='h-auto px-2 py-1 text-xs text-destructive hover:text-destructive'
                                disabled={
                                  deleteCommentMutation.isPending &&
                                  deleteCommentMutation.variables === comment.id
                                }
                                onClick={() => handleDeleteComment(comment.id)}
                              >
                                {deleteCommentMutation.isPending &&
                                deleteCommentMutation.variables === comment.id
                                  ? 'Menghapus...'
                                  : 'Hapus'}
                              </Button>
                            ) : null}
                          </div>
                        </div>

                        <p className='mt-2 whitespace-pre-wrap break-words text-sm leading-6'>
                          {comment.text}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className='text-sm text-muted-foreground'>
                Belum ada komentar. Jadilah yang pertama.
              </p>
            )
          ) : null}

          {deleteCommentMutation.isError ? (
            <p role='alert' className='text-sm text-destructive'>
              {getApiErrorMessage(deleteCommentMutation.error)}
            </p>
          ) : null}

          {commentsQuery.isSuccess && totalPages > 1 ? (
            <nav
              aria-label={`Halaman komentar postingan ${postId}`}
              className='flex items-center justify-between gap-3'
            >
              <Button
                type='button'
                variant='outline'
                disabled={page <= 1 || commentsQuery.isFetching}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
              >
                Sebelumnya
              </Button>

              <p className='text-xs text-muted-foreground'>
                Halaman {pagination?.page ?? page} dari {totalPages}
              </p>

              <Button
                type='button'
                variant='outline'
                disabled={page >= totalPages || commentsQuery.isFetching}
                onClick={() => setPage((current) => current + 1)}
              >
                Berikutnya
              </Button>
            </nav>
          ) : null}

          <form className='space-y-2 border-t pt-4' onSubmit={handleSubmit}>
            <label htmlFor={`comment-${postId}`} className='font-medium'>
              Tambahkan komentar
            </label>

            <textarea
              id={`comment-${postId}`}
              rows={3}
              maxLength={COMMENT_MAX_LENGTH}
              value={text}
              placeholder='Tulis komentarmu...'
              className='w-full resize-y rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
              onChange={(event) => {
                setText(event.target.value);
                setSuccessMessage(null);
              }}
            />

            <div className='flex flex-wrap items-center justify-between gap-3'>
              <span className='text-xs text-muted-foreground'>
                {text.length}/{COMMENT_MAX_LENGTH}
              </span>

              <Button
                type='submit'
                disabled={!text.trim() || addCommentMutation.isPending}
              >
                Kirim komentar
              </Button>
            </div>

            {addCommentMutation.isError ? (
              <p role='alert' className='text-sm text-destructive'>
                {getApiErrorMessage(addCommentMutation.error)}
              </p>
            ) : null}

            {successMessage ? (
              <p
                role='status'
                className='text-sm text-emerald-600 dark:text-emerald-400'
              >
                {successMessage}
              </p>
            ) : null}
          </form>
        </div>
      ) : null}
    </div>
  );
}
