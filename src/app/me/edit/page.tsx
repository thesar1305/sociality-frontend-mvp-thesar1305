import type { Metadata } from 'next';

import { AppShell } from '@/components/sociality/app-shell';
import { EditProfileForm } from '@/components/sociality/edit-profile-form';
import { ProtectedRoute } from '@/components/sociality/protected-route';

export const metadata: Metadata = {
  title: 'Edit Profil | Sociality',
  description: 'Perbarui profil Sociality kamu.',
};

export default function EditProfilePage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <EditProfileForm />
      </AppShell>
    </ProtectedRoute>
  );
}
