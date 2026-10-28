import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AppShell } from '@/components/sociality/app-shell';
import { PostLikers } from '@/components/sociality/post-likers';
import { ProtectedRoute } from '@/components/sociality/protected-route';

export const metadata: Metadata = {
  title: 'Penyuka Postingan | Sociality',
};

type PostLikersPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PostLikersPage({ params }: PostLikersPageProps) {
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isInteger(postId) || postId <= 0) {
    notFound();
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <PostLikers postId={postId} />
      </AppShell>
    </ProtectedRoute>
  );
}
