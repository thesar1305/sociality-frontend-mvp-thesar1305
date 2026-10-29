import type { Metadata } from 'next';

import { AppShell } from '@/components/sociality/app-shell';
import { CreatePostForm } from '@/components/sociality/create-post-form';
import { ProtectedRoute } from '@/components/sociality/protected-route';

export const metadata: Metadata = {
  title: 'Tambah Postingan | Sociality',
  description: 'Bagikan foto dan cerita ke Sociality.',
};

export default function NewPostPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <CreatePostForm />
      </AppShell>
    </ProtectedRoute>
  );
}
