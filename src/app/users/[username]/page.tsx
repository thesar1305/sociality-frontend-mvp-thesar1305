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
};

export default async function UserProfilePage({
  params,
}: UserProfilePageProps) {
  const { username } = await params;
  const normalizedUsername = username.trim();

  if (!normalizedUsername) {
    notFound();
  }

  return (
    <ProtectedRoute>
      <AppShell>
        <PublicUserProfile username={normalizedUsername} />
      </AppShell>
    </ProtectedRoute>
  );
}
