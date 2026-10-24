'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import type { Post } from '@/types/post';

const MAX_POST_LENGTH = 280;
const MAX_COMMENT_LENGTH = 180;

type PostCardProps = {
  post: Post;
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onDeletePost: (postId: string) => void;
  onEditPost: (postId: string, content: string) => void;
};

export function PostCard({
  post,
  onToggleLike,
  onAddComment,
  onDeletePost,
  onEditPost,
}: PostCardProps) {
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentContent, setCommentContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);

  const trimmedComment = commentContent.trim();
  const trimmedEditContent = editContent.trim();
  const canSaveEdit =
    trimmedEditContent.length > 0 && trimmedEditContent !== post.content;

  function handleCommentSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!trimmedComment) {
      return;
    }

    onAddComment(post.id, trimmedComment);
    setCommentContent('');
    setIsCommenting(false);
  }

  function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSaveEdit) {
      return;
    }

    onEditPost(post.id, trimmedEditContent);
    setIsEditing(false);
  }

  function handleEditStart() {
    setEditContent(post.content);
    setIsEditing(true);
  }

  function handleEditCancel() {
    setEditContent(post.content);
    setIsEditing(false);
  }

  function handleDelete() {
    const shouldDelete = window.confirm(
      'Hapus postingan ini? Tindakan ini tidak dapat dibatalkan.'
    );

    if (shouldDelete) {
      onDeletePost(post.id);
    }
  }

  return (
    <article className='rounded-2xl border bg-card p-5 text-card-foreground shadow-sm'>
      <header className='flex items-start gap-3'>
        <div
          aria-hidden='true'
          className='flex size-11 shrink-0 items-center justify-center rounded-full bg-primary font-semibold text-primary-foreground'
        >
          {post.author.initials}
        </div>

        <div className='min-w-0 flex-1'>
          <h2 className='truncate font-semibold'>{post.author.name}</h2>

          <div className='flex flex-wrap items-center gap-1 text-sm text-muted-foreground'>
            <span>{post.author.username}</span>
            <span aria-hidden='true'>·</span>
            <time dateTime={post.publishedAt}>{post.publishedLabel}</time>
          </div>
        </div>

        {post.isOwnedByViewer && (
          <div className='flex shrink-0 gap-1'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              disabled={isEditing}
              onClick={handleEditStart}
            >
              Edit
            </Button>

            <Button
              type='button'
              variant='ghost'
              size='sm'
              className='text-destructive hover:text-destructive'
              onClick={handleDelete}
            >
              Hapus
            </Button>
          </div>
        )}
      </header>

      {isEditing ? (
        <form
          className='mt-4 rounded-xl border bg-background p-3'
          onSubmit={handleEditSubmit}
        >
          <label htmlFor={`edit-post-${post.id}`} className='sr-only'>
            Edit isi postingan
          </label>

          <textarea
            id={`edit-post-${post.id}`}
            value={editContent}
            onChange={(event) => setEditContent(event.target.value)}
            maxLength={MAX_POST_LENGTH}
            rows={4}
            autoFocus
            className='w-full resize-none bg-transparent outline-none'
          />

          <div className='mt-2 flex items-center justify-between gap-3'>
            <span className='text-xs text-muted-foreground'>
              {editContent.length}/{MAX_POST_LENGTH}
            </span>

            <div className='flex gap-2'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={handleEditCancel}
              >
                Batal
              </Button>

              <Button type='submit' size='sm' disabled={!canSaveEdit}>
                Simpan
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <p className='mt-4 whitespace-pre-line leading-7'>{post.content}</p>
      )}

      <footer className='mt-4 flex gap-2 border-t pt-3'>
        <Button
          type='button'
          variant={post.likedByViewer ? 'secondary' : 'ghost'}
          size='sm'
          aria-pressed={post.likedByViewer}
          onClick={() => onToggleLike(post.id)}
        >
          {post.likedByViewer ? 'Disukai' : 'Suka'} · {post.likes}
        </Button>

        <Button
          type='button'
          variant='ghost'
          size='sm'
          aria-expanded={isCommenting}
          onClick={() => setIsCommenting((currentValue) => !currentValue)}
        >
          Komentar · {post.comments}
        </Button>
      </footer>

      {post.recentComments.length > 0 && (
        <section
          aria-label='Komentar terbaru'
          className='mt-3 space-y-2 border-t pt-3'
        >
          {post.recentComments.map((comment) => (
            <div key={comment.id} className='rounded-xl bg-muted p-3 text-sm'>
              <p className='font-semibold'>{comment.authorName}</p>
              <p className='mt-1 leading-6'>{comment.content}</p>
            </div>
          ))}
        </section>
      )}

      {isCommenting && (
        <form
          className='mt-3 rounded-xl border bg-background p-3'
          onSubmit={handleCommentSubmit}
        >
          <label htmlFor={`comment-${post.id}`} className='sr-only'>
            Tulis komentar
          </label>

          <textarea
            id={`comment-${post.id}`}
            value={commentContent}
            onChange={(event) => setCommentContent(event.target.value)}
            maxLength={MAX_COMMENT_LENGTH}
            rows={2}
            autoFocus
            placeholder='Tulis komentar...'
            className='w-full resize-none bg-transparent outline-none'
          />

          <div className='mt-2 flex items-center justify-between gap-3'>
            <span className='text-xs text-muted-foreground'>
              {commentContent.length}/{MAX_COMMENT_LENGTH}
            </span>

            <Button type='submit' size='sm' disabled={!trimmedComment}>
              Kirim
            </Button>
          </div>
        </form>
      )}
    </article>
  );
}
