import type { Metadata } from 'next';

import { AppShell } from '@/components/sociality/app-shell';
import { LikedPosts } from '@/components/sociality/liked-posts';
import { ProtectedRoute } from '@/components/sociality/protected-route';

export const metadata: Metadata = {
  title: 'Postingan yang Disukai | Sociality',
};

export default function LikedPostsPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <LikedPosts />
      </AppShell>
    </ProtectedRoute>
  );
}
