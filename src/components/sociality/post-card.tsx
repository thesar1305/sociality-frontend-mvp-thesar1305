import { Button } from '@/components/ui/button';
import type { Post } from '@/types/post';

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
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
      </header>

      <p className='mt-4 whitespace-pre-line leading-7'>{post.content}</p>

      <footer className='mt-4 flex gap-2 border-t pt-3'>
        <Button type='button' variant='ghost' size='sm'>
          Suka · {post.likes}
        </Button>

        <Button type='button' variant='ghost' size='sm'>
          Komentar · {post.comments}
        </Button>
      </footer>
    </article>
  );
}
