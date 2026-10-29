import type { Metadata } from 'next';

import { AppShell } from '@/components/sociality/app-shell';
import { UserSearch } from '@/components/sociality/user-search';

export const metadata: Metadata = {
  title: 'Cari Pengguna | Sociality',
  description: 'Temukan pengguna lain di Sociality.',
};

export default function SearchPage() {
  return (
    <AppShell>
      <UserSearch />
    </AppShell>
  );
}
