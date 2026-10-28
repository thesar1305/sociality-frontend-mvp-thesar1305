import type { Metadata } from 'next';

import { AppShell } from '@/components/sociality/app-shell';
import { ProtectedRoute } from '@/components/sociality/protected-route';
import { SavedPosts } from '@/components/sociality/saved-posts';

export const metadata: Metadata = {
  title: 'Postingan Tersimpan | Sociality',
};

export default function SavedPostsPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <SavedPosts />
      </AppShell>
    </ProtectedRoute>
  );
}
