import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AppShell } from '@/components/sociality/app-shell';
import { ProtectedRoute } from '@/components/sociality/protected-route';
import { PublicUserProfile } from '@/components/sociality/public-user-profile';

export const metadata: Metadata = {
  title: 'Profil Pengguna | Sociality',
  description: 'Lihat profil publik pengguna Sociality.',
};

type UserProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
  searchParams: Promise<{
    from?: string;
    postId?: string;
  }>;
};

export default async function UserProfilePage({
  params,
  searchParams,
}: UserProfilePageProps) {
  const [{ username }, { from, postId }] = await Promise.all([
    params,
    searchParams,
  ]);
  const normalizedUsername = username.trim();
  const numericPostId = Number(postId);

  const cameFromPostLikers =
    from === 'post-likers' &&
    Number.isInteger(numericPostId) &&
    numericPostId > 0;

  const backHref = cameFromPostLikers
    ? `/posts/${numericPostId}/likes`
    : '/search';

  const backLabel = cameFromPostLikers
    ? 'Kembali ke daftar penyuka'
    : 'Kembali ke pencarian';

  if (!normalizedUsername) {
    notFound();
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <PublicUserProfile
          username={normalizedUsername}
          backHref={backHref}
          backLabel={backLabel}
        />
      </AppShell>
    </ProtectedRoute>
  );
}
