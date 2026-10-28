import type { Metadata } from 'next';

import { AppShell } from '@/components/sociality/app-shell';
import { ProtectedRoute } from '@/components/sociality/protected-route';
import { UserConnectionList } from '@/components/sociality/user-connection-list';

export const metadata: Metadata = {
  title: 'Pengikut Saya | Sociality',
};

export default function MyFollowersPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <UserConnectionList scope='me' kind='followers' />
      </AppShell>
    </ProtectedRoute>
  );
}
