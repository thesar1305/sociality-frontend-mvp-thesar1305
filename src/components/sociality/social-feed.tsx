'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';

import { PostCard } from '@/components/sociality/post-card';
import { Button } from '@/components/ui/button';
import { posts as initialPosts } from '@/data/posts';
import type { Post, PostComment } from '@/types/post';
import { currentUser } from '@/data/profile';

const MAX_POST_LENGTH = 280;

export function SocialFeed() {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [content, setContent] = useState('');

  const trimmedContent = content.trim();
  const canSubmit = trimmedContent.length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const newPost: Post = {
      id: crypto.randomUUID(),
      author: {
        name: currentUser.name,
        username: currentUser.username,
        initials: currentUser.initials,
      },
      content: trimmedContent,
      publishedAt: new Date().toISOString(),
      publishedLabel: 'Baru saja',
      likes: 0,
      likedByViewer: false,
      comments: 0,
      recentComments: [],
    };

    setPosts((currentPosts) => [newPost, ...currentPosts]);
    setContent('');
  }
  function handleToggleLike(postId: string) {
    setPosts((currentPosts) =>
      currentPosts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        return {
          ...post,
          likes: post.likes + (post.likedByViewer ? -1 : 1),
          likedByViewer: !post.likedByViewer,
        };
      })
    );
  }
  function handleAddComment(postId: string, content: string) {
    const newComment: PostComment = {
      id: crypto.randomUUID(),
      authorName: currentUser.name,
      content,
    };

    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: post.comments + 1,
              recentComments: [...post.recentComments, newComment],
            }
          : post
      )
    );
  }
  return (
    <>
      <section
        aria-labelledby='feed-heading'
        className='rounded-2xl border bg-card p-5 shadow-sm'
      >
        <h1 id='feed-heading' className='text-2xl font-bold tracking-tight'>
          Beranda
        </h1>

        <p className='mt-1 text-sm text-muted-foreground'>
          Bagikan kabar terbaru dengan komunitasmu.
        </p>

        <form className='mt-4' onSubmit={handleSubmit}>
          <label htmlFor='post-content' className='sr-only'>
            Isi postingan
          </label>

          <textarea
            id='post-content'
            name='content'
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={MAX_POST_LENGTH}
            rows={4}
            placeholder='Apa yang sedang kamu pikirkan?'
            className='w-full resize-none rounded-xl border bg-background p-4 text-foreground outline-none transition focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50'
          />

          <div className='mt-3 flex items-center justify-between gap-4'>
            <p className='text-sm text-muted-foreground' aria-live='polite'>
              {content.length}/{MAX_POST_LENGTH}
            </p>

            <Button type='submit' disabled={!canSubmit}>
              Buat postingan
            </Button>
          </div>
        </form>
      </section>

      <section aria-label='Daftar postingan' className='space-y-4'>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onToggleLike={handleToggleLike}
            onAddComment={handleAddComment}
          />
        ))}
      </section>
    </>
  );
}
