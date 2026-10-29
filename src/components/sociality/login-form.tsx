'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  AuthAlert,
  AuthField,
  AuthShell,
} from '@/components/sociality/auth-shell';
import { PasswordInput } from '@/components/sociality/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginUser } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/client';
import { saveAccessToken } from '@/lib/auth/storage';

import { useAppSelector } from '@/lib/store/hooks';
import { loginSchema, type LoginFormValues } from '@/lib/validation/auth';
import { extractAccessToken } from '@/types/auth';

type LoginFormProps = {
  registrationSuccess?: boolean;
  redirectTo?: string;
};

export function LoginForm({
  registrationSuccess = false,
  redirectTo = '/feed',
}: LoginFormProps) {
  const router = useRouter();

  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const response = await loginUser(values);

      return extractAccessToken(response);
    },
    onSuccess: (token) => {
      saveAccessToken(token);
      window.location.replace(redirectTo);
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setFormError('Email atau kata sandi salah.');
        return;
      }

      setFormError(getApiErrorMessage(error));
    },
  });

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, isHydrated, router]);

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    loginMutation.mutate(values);
  });

  return (
    <AuthShell
      title='Selamat Datang Kembali!'
      description='Masuk untuk melihat cerita terbaru.'
      footer={
        <>
          Belum memiliki akun?{' '}
          <Link
            href='/register'
            className='font-semibold text-primary hover:underline'
          >
            Daftar
          </Link>
        </>
      }
    >
      <form className='space-y-4' onSubmit={onSubmit} noValidate>
        {registrationSuccess ? (
          <AuthAlert variant='success'>
            Akun berhasil dibuat. Silakan masuk.
          </AuthAlert>
        ) : null}
        {formError ? <AuthAlert variant='error'>{formError}</AuthAlert> : null}

        <AuthField id='email' label='Email' error={errors.email?.message}>
          <Input
            id='email'
            type='email'
            autoComplete='email'
            placeholder='Masukkan email'
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
        </AuthField>

        <AuthField
          id='password'
          label='Kata sandi'
          error={errors.password?.message}
        >
          <PasswordInput
            id='password'
            autoComplete='current-password'
            placeholder='Masukkan kata sandi'
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
        </AuthField>

        <Button
          type='submit'
          disabled={loginMutation.isPending}
          className='h-11 w-full rounded-full text-base font-semibold'
        >
          {loginMutation.isPending ? 'Memproses...' : 'Masuk'}
        </Button>
      </form>
    </AuthShell>
  );
}
