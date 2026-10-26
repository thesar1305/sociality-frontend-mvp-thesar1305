import type { Metadata } from 'next';

import { ApiFeed } from '@/components/sociality/api-feed';
import { AppShell } from '@/components/sociality/app-shell';
import { ProtectedRoute } from '@/components/sociality/protected-route';

export const metadata: Metadata = {
  title: 'Feed | Sociality',
  description: 'Timeline komunitas Sociality.',
};

export default function FeedPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <ApiFeed />
      </AppShell>
    </ProtectedRoute>
  );
}
