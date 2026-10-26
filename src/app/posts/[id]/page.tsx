import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AppShell } from '@/components/sociality/app-shell';
import { PostDetail } from '@/components/sociality/post-detail';
import { ProtectedRoute } from '@/components/sociality/protected-route';

export const metadata: Metadata = {
  title: 'Detail Postingan | Sociality',
  description: 'Lihat detail postingan Sociality.',
};

type PostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isInteger(postId) || postId <= 0) {
    notFound();
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <PostDetail postId={postId} />
      </AppShell>
    </ProtectedRoute>
  );
}
