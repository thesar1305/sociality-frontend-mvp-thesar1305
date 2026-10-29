import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AppShell } from '@/components/sociality/app-shell';
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
    tab?: string;
  }>;
};

export default async function UserProfilePage({
  params,
  searchParams,
}: UserProfilePageProps) {
  const [{ username }, { tab }] = await Promise.all([params, searchParams]);
  const normalizedUsername = username.trim();

  if (!normalizedUsername) {
    notFound();
  }

  const initialTab = tab === 'likes' ? 'likes' : 'posts';
  const profilePath = `/users/${encodeURIComponent(normalizedUsername)}`;
  const profileReturnHref =
    initialTab === 'likes' ? `${profilePath}?tab=likes` : profilePath;

  return (
    <AppShell>
      <PublicUserProfile
        username={normalizedUsername}
        initialTab={initialTab}
        profileReturnHref={profileReturnHref}
      />
    </AppShell>
  );
}
