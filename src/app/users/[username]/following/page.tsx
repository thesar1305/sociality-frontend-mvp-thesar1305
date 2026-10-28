import type { Metadata } from 'next';

import { AppShell } from '@/components/sociality/app-shell';
import { ProtectedRoute } from '@/components/sociality/protected-route';
import { UserConnectionList } from '@/components/sociality/user-connection-list';

export const metadata: Metadata = {
  title: 'Mengikuti | Sociality',
};

type FollowingPageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function FollowingPage({ params }: FollowingPageProps) {
  const { username } = await params;

  return (
    <ProtectedRoute>
      <AppShell>
        <UserConnectionList scope='user' username={username} kind='following' />
      </AppShell>
    </ProtectedRoute>
  );
}
