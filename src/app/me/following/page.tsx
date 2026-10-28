import type { Metadata } from 'next';

import { AppShell } from '@/components/sociality/app-shell';
import { ProtectedRoute } from '@/components/sociality/protected-route';
import { UserConnectionList } from '@/components/sociality/user-connection-list';

export const metadata: Metadata = {
  title: 'Yang Saya Ikuti | Sociality',
};

export default function MyFollowingPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <UserConnectionList scope='me' kind='following' />
      </AppShell>
    </ProtectedRoute>
  );
}
