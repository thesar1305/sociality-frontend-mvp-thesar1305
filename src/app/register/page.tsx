import type { Metadata } from 'next';

import { RegisterForm } from '@/components/sociality/register-form';

export const metadata: Metadata = {
  title: 'Daftar | Sociality',
  description: 'Buat akun Sociality.',
};

export default function RegisterPage() {
  return <RegisterForm />;
}
