/* eslint-disable @next/next/no-img-element */
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import { type FormEvent, useState } from 'react';

import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api/client';
import { addPostComment, getPostComments } from '@/lib/api/comments';

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

  const addCommentMutation = useMutation({
    mutationFn: (commentText: string) => addPostComment(postId, commentText),

    onSuccess: async () => {
      setText('');
      setPage(1);
      setSuccessMessage('Komentar berhasil dikirim.');

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
                        {comment.author.avatarUrl ? (
                          <img
                            src={comment.author.avatarUrl}
                            alt={`Avatar ${comment.author.name}`}
                            className='size-full object-cover'
                          />
                        ) : (
                          <span>{getInitials(comment.author.name)}</span>
                        )}
                      </div>

                      <div className='min-w-0 flex-1 rounded-xl bg-muted/50 px-4 py-3'>
                        <div className='flex flex-wrap items-baseline justify-between gap-2'>
                          <p className='font-semibold'>{comment.author.name}</p>
                          <time className='text-xs text-muted-foreground'>
                            {createdLabel}
                          </time>
                        </div>

                        <p className='text-sm text-muted-foreground'>
                          @{comment.author.username}
                        </p>

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
                {addCommentMutation.isPending
                  ? 'Mengirim...'
                  : 'Kirim komentar'}
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
