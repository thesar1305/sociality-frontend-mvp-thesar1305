import type { Metadata } from 'next';

import { AppShell } from '@/components/sociality/app-shell';
import { UserConnectionList } from '@/components/sociality/user-connection-list';

export const metadata: Metadata = {
  title: 'Pengikut | Sociality',
};

type FollowersPageProps = {
  params: Promise<{
    username: string;
  }>;
};

export default async function FollowersPage({ params }: FollowersPageProps) {
  const { username } = await params;

  return (
    <AppShell>
      <UserConnectionList scope='user' username={username} kind='followers' />
    </AppShell>
  );
}
