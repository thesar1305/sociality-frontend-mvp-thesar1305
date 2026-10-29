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
  searchParams: Promise<{
    from?: string;
  }>;
};

export default async function PostPage({
  params,
  searchParams,
}: PostPageProps) {
  const [{ id }, { from }] = await Promise.all([params, searchParams]);
  const postId = Number(id);
  const backHref =
    from === 'saved'
      ? '/me/saved'
      : from === 'liked'
        ? '/me/likes'
        : from === 'profile'
          ? '/me'
          : '/feed';

  const backLabel =
    from === 'saved'
      ? 'Kembali ke tersimpan'
      : from === 'liked'
        ? 'Kembali ke postingan disukai'
        : from === 'profile'
          ? 'Kembali ke profil'
          : 'Kembali ke feed';

  if (!Number.isInteger(postId) || postId <= 0) {
    notFound();
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <PostDetail postId={postId} backHref={backHref} backLabel={backLabel} />
      </AppShell>
    </ProtectedRoute>
  );
}
