import type { Metadata } from 'next';

import { AppShell } from '@/components/sociality/app-shell';
import { MyProfile } from '@/components/sociality/my-profile';
import { ProtectedRoute } from '@/components/sociality/protected-route';

export const metadata: Metadata = {
  title: 'Profil Saya | Sociality',
  description: 'Profil pengguna Sociality.',
};

export default function MyProfilePage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <MyProfile />
      </AppShell>
    </ProtectedRoute>
  );
}
