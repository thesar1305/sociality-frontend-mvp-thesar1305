import type { Metadata } from 'next';

import { AppShell } from '@/components/sociality/app-shell';
import { MyProfile } from '@/components/sociality/my-profile';
import { ProtectedRoute } from '@/components/sociality/protected-route';

export const metadata: Metadata = {
  title: 'Profil Saya | Sociality',
  description: 'Profil pengguna Sociality.',
};

type MyProfilePageProps = {
  searchParams: Promise<{
    tab?: string;
  }>;
};

export default async function MyProfilePage({
  searchParams,
}: MyProfilePageProps) {
  const { tab } = await searchParams;

  return (
    <ProtectedRoute>
      <AppShell>
        <MyProfile initialTab={tab === 'saved' ? 'saved' : 'gallery'} />
      </AppShell>
    </ProtectedRoute>
  );
}
