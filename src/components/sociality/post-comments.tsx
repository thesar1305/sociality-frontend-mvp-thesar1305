'use client';

import {
  type InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import relativeTime from 'dayjs/plugin/relativeTime';
import { SmilePlus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  type FormEvent,
  type ReactNode,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Button } from '@/components/ui/button';
import { track } from '@/lib/analytics';
import { cloudinaryLoader, isOptimizableImage } from '@/lib/images';
import { cn } from 'cn';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiErrorMessage } from '@/lib/api/client';
import {
  addPostComment,
  deleteComment,
  getPostComments,
} from '@/lib/api/comments';
import { getMyProfile } from '@/lib/api/profile';
import { useAppSelector } from '@/lib/store/hooks';
import type { ApiComment, CommentsResponse } from '@/types/comment';

type PostCommentsDialogProps = {
  postId: number;
  postAuthorId?: number;
  className?: string;
  'aria-label'?: string;
  children: ReactNode;
};

type CommentsData = InfiniteData<CommentsResponse, number>;

dayjs.extend(relativeTime);

const EMOJIS = [
  '😀',
  '😂',
  '😍',
  '🥰',
  '😎',
  '🤩',
  '😅',
  '😭',
  '😮',
  '😡',
  '👍',
  '👏',
  '🙏',
  '🔥',
  '❤️',
  '🎉',
  '✨',
  '💯',
];

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
  /** Diterapkan pada pembungkus (ukuran, rasio, radius, latar). */
  className?: string;
  fallback: ReactNode;
  /** Lebar tampil sebenarnya, agar Next memilih ukuran gambar yang tepat. */
  sizes?: string;
  priority?: boolean;
};

export function SafeImage({
  src,
  alt,
  className,
  fallback,
  sizes = '100vw',
  priority = false,
}: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src || failedSrc === src) {
    return <>{fallback}</>;
  }

  const optimizable = isOptimizableImage(src);

  return (
    <span className={cn('relative block overflow-hidden', className)}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loader={optimizable ? cloudinaryLoader : undefined}
        unoptimized={!optimizable}
        className='object-cover'
        onError={() => setFailedSrc(src)}
      />
    </span>
  );
}

export function PostCommentsDialog({
  postId,
  postAuthorId,
  className,
  children,
  ...triggerProps
}: PostCommentsDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className={className} {...triggerProps}>
        {children}
      </DialogTrigger>

      <DialogContent className='top-auto bottom-0 left-0 h-[85dvh] w-full max-w-none translate-x-0 translate-y-0 rounded-b-none sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:h-[36rem] sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl'>
        <DialogHeader>
          <DialogTitle>Komentar</DialogTitle>
          <DialogDescription className='sr-only'>
            Daftar komentar dan kolom untuk menambahkan komentar.
          </DialogDescription>
        </DialogHeader>

        <CommentsPanel
          postId={postId}
          postAuthorId={postAuthorId}
          open={open}
        />
      </DialogContent>
    </Dialog>
  );
}

function CommentsPanel({
  postId,
  postAuthorId,
  open,
}: {
  postId: number;
  postAuthorId?: number;
  open: boolean;
}) {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
  const isGuest = isHydrated && !isAuthenticated;

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);

  const commentsKey = [
    'comments',
    postId,
    'infinite',
    COMMENTS_PER_PAGE,
  ] as const;

  const commentsQuery = useInfiniteQuery({
    queryKey: commentsKey,
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getPostComments({
        postId,
        page: pageParam,
        limit: COMMENTS_PER_PAGE,
      }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.pagination;

      return page < totalPages ? page + 1 : undefined;
    },
    enabled: open,
  });

  const profileQuery = useQuery({
    queryKey: ['me'],
    queryFn: getMyProfile,
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated,
  });

  const currentUserId = profileQuery.data?.data.profile.id;

  // API: komentar boleh dihapus oleh pemilik komentar atau pemilik post.
  function canDeleteComment(comment: ApiComment) {
    return (
      comment.id > 0 &&
      currentUserId !== undefined &&
      (comment.author.id === currentUserId || postAuthorId === currentUserId)
    );
  }

  const comments = useMemo(() => {
    const seen = new Set<number>();
    const uniqueComments: ApiComment[] = [];

    for (const page of commentsQuery.data?.pages ?? []) {
      for (const comment of page.data.comments) {
        if (!seen.has(comment.id)) {
          seen.add(comment.id);
          uniqueComments.push(comment);
        }
      }
    }

    return uniqueComments;
  }, [commentsQuery.data]);

  const addCommentMutation = useMutation({
    mutationFn: (commentText: string) => addPostComment(postId, commentText),

    onSuccess: () => {
      track('comment_submit', { postId });
    },

    onMutate: async (commentText) => {
      await queryClient.cancelQueries({ queryKey: ['comments', postId] });

      const previousComments =
        queryClient.getQueryData<CommentsData>(commentsKey);
      const profile = profileQuery.data?.data.profile;

      setText('');
      setEmojiOpen(false);

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

        queryClient.setQueryData<CommentsData>(commentsKey, {
          ...previousComments,
          pages: previousComments.pages.map((page, index) =>
            index === 0
              ? {
                  ...page,
                  data: {
                    ...page.data,
                    comments: [optimisticComment, ...page.data.comments],
                    pagination: {
                      ...page.data.pagination,
                      total: page.data.pagination.total + 1,
                    },
                  },
                }
              : page
          ),
        });

        listRef.current?.scrollTo({ top: 0 });
      }

      return { previousComments, commentText };
    },

    onError: (_error, _commentText, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(commentsKey, context.previousComments);
      }

      setText((currentText) => currentText || context?.commentText || '');
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

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),

    onSuccess: async (_, deletedCommentId) => {
      queryClient.setQueryData<CommentsData>(commentsKey, (current) =>
        current
          ? {
              ...current,
              pages: current.pages.map((page) => ({
                ...page,
                data: {
                  ...page.data,
                  comments: page.data.comments.filter(
                    (comment) => comment.id !== deletedCommentId
                  ),
                  pagination: {
                    ...page.data.pagination,
                    total: Math.max(page.data.pagination.total - 1, 0),
                  },
                },
              })),
            }
          : current
      );

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

    if (!trimmedText || addCommentMutation.isPending) {
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

    if (confirmed) {
      deleteCommentMutation.mutate(commentId);
    }
  }

  function handleInsertEmoji(emoji: string) {
    const input = inputRef.current;
    const start = input?.selectionStart ?? text.length;
    const end = input?.selectionEnd ?? start;
    const nextText = text.slice(0, start) + emoji + text.slice(end);

    if (nextText.length > COMMENT_MAX_LENGTH) {
      return;
    }

    setText(nextText);

    window.requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(start + emoji.length, start + emoji.length);
    });
  }

  return (
    <>
      <div ref={listRef} className='-mr-2 min-h-0 flex-1 overflow-y-auto pr-2'>
        {commentsQuery.isPending && open ? (
          <div
            role='status'
            aria-label='Memuat komentar'
            className='space-y-4'
          >
            {[0, 1, 2].map((item) => (
              <div key={item} className='flex gap-3'>
                <Skeleton className='size-9 rounded-full' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-28' />
                  <Skeleton className='h-4 w-full' />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {commentsQuery.isError && !commentsQuery.data ? (
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

        {commentsQuery.isSuccess && comments.length === 0 ? (
          <div className='flex h-full flex-col items-center justify-center py-10 text-center'>
            <p className='font-semibold'>Belum ada komentar</p>
            <p className='mt-1 text-sm text-muted-foreground'>
              Mulai percakapan.
            </p>
          </div>
        ) : null}

        {comments.length > 0 ? (
          <ul className='space-y-5'>
            {comments.map((comment) => {
              const createdAt = dayjs(comment.createdAt);
              const isDeleting =
                deleteCommentMutation.isPending &&
                deleteCommentMutation.variables === comment.id;

              return (
                <li key={comment.id} className='flex gap-3'>
                  <div className='flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-sm font-semibold'>
                    <SafeImage
                      src={comment.author.avatarUrl}
                      alt={`Avatar ${comment.author.name}`}
                      className='size-full'
                      sizes='36px'
                      fallback={<span>{getInitials(comment.author.name)}</span>}
                    />
                  </div>

                  <div className='min-w-0 flex-1'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-semibold'>
                          {comment.author.name}
                        </p>
                        <time
                          dateTime={comment.createdAt}
                          className='block text-xs text-muted-foreground'
                        >
                          {createdAt.isValid()
                            ? createdAt.locale('id').fromNow()
                            : 'Waktu tidak tersedia'}
                        </time>
                      </div>

                      {canDeleteComment(comment) ? (
                        <Button
                          type='button'
                          variant='ghost'
                          className='h-auto shrink-0 px-2 py-1 text-xs text-destructive hover:text-destructive'
                          disabled={isDeleting}
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          {isDeleting ? 'Menghapus...' : 'Hapus'}
                        </Button>
                      ) : null}
                    </div>

                    <p className='mt-1 whitespace-pre-wrap break-words text-sm leading-6'>
                      {comment.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}

        {deleteCommentMutation.isError ? (
          <p role='alert' className='mt-4 text-sm text-destructive'>
            {getApiErrorMessage(deleteCommentMutation.error)}
          </p>
        ) : null}

        {commentsQuery.isFetchNextPageError ? (
          <p role='alert' className='mt-4 text-center text-sm text-destructive'>
            {getApiErrorMessage(commentsQuery.error)}
          </p>
        ) : null}

        {commentsQuery.hasNextPage ? (
          <div className='mt-4 flex justify-center'>
            <Button
              type='button'
              variant='outline'
              className='rounded-full'
              disabled={commentsQuery.isFetchingNextPage}
              onClick={() => void commentsQuery.fetchNextPage()}
            >
              {commentsQuery.isFetchingNextPage
                ? 'Memuat...'
                : 'Muat komentar lainnya'}
            </Button>
          </div>
        ) : null}
      </div>

      <div className='border-t border-border pt-3'>
        {isGuest ? (
          <p className='text-sm text-muted-foreground'>
            <Link
              href={`/login?next=${encodeURIComponent(pathname)}`}
              className='font-medium text-brand-200 hover:underline'
            >
              Masuk
            </Link>{' '}
            untuk menambahkan komentar.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            {emojiOpen ? (
              <div
                role='group'
                aria-label='Pilih emoji'
                className='mb-3 grid grid-cols-6 gap-1 rounded-xl bg-muted/40 p-2'
              >
                {EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    type='button'
                    aria-label={`Sisipkan emoji ${emoji}`}
                    className='flex size-9 items-center justify-center rounded-lg text-xl transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40'
                    onClick={() => handleInsertEmoji(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : null}

            <div className='flex items-center gap-2'>
              <button
                type='button'
                aria-label='Pilih emoji'
                aria-expanded={emojiOpen}
                className='flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40'
                onClick={() => setEmojiOpen((current) => !current)}
              >
                <SmilePlus className='size-5' aria-hidden='true' />
              </button>

              <label htmlFor={`comment-${postId}`} className='sr-only'>
                Tambahkan komentar
              </label>
              <input
                ref={inputRef}
                id={`comment-${postId}`}
                type='text'
                maxLength={COMMENT_MAX_LENGTH}
                value={text}
                placeholder='Tambahkan komentar'
                autoComplete='off'
                className='h-10 min-w-0 flex-1 rounded-full border border-input bg-muted/40 px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30'
                onChange={(event) => setText(event.target.value)}
              />

              <Button
                type='submit'
                variant='ghost'
                className='h-10 rounded-full px-3 font-semibold text-brand-200 hover:text-brand-200'
                disabled={!text.trim() || addCommentMutation.isPending}
              >
                Kirim
              </Button>
            </div>

            {text.length >= COMMENT_MAX_LENGTH - 30 ? (
              <p className='mt-1 text-right text-xs text-muted-foreground'>
                {text.length}/{COMMENT_MAX_LENGTH}
              </p>
            ) : null}

            {addCommentMutation.isError ? (
              <p role='alert' className='mt-2 text-sm text-destructive'>
                {getApiErrorMessage(addCommentMutation.error)}
              </p>
            ) : null}
          </form>
        )}
      </div>
    </>
  );
}
