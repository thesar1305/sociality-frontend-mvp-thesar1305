import type { Metadata } from 'next';

import { LoginForm } from '@/components/sociality/login-form';

export const metadata: Metadata = {
  title: 'Masuk | Sociality',
  description: 'Masuk ke akun Sociality.',
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { registered, next } = await searchParams;
  const registrationSuccess = registered === '1';
  const requestedPath = typeof next === 'string' ? next : '/feed';

  const redirectTo =
    requestedPath.startsWith('/') && !requestedPath.startsWith('//')
      ? requestedPath
      : '/feed';

  return (
    <LoginForm
      registrationSuccess={registrationSuccess}
      redirectTo={redirectTo}
    />
  );
}

type LoginPageProps = {
  searchParams: Promise<{
    registered?: string;
    next?: string;
  }>;
};
