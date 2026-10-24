'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { loginUser } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/client';
import { saveAccessToken } from '@/lib/auth/storage';

import { useAppSelector } from '@/lib/store/hooks';
import { loginSchema, type LoginFormValues } from '@/lib/validation/auth';
import { extractAccessToken } from '@/types/auth';

const inputClassName =
  'h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20';

type LoginFormProps = {
  registrationSuccess?: boolean;
};

export function LoginForm({ registrationSuccess = false }: LoginFormProps) {
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
      window.location.replace('/');
    },
    onError: (error) => {
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
    <form className='space-y-5' onSubmit={onSubmit} noValidate>
      {registrationSuccess ? (
        <p
          role='status'
          className='rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300'
        >
          Akun berhasil dibuat. Silakan masuk.
        </p>
      ) : null}
      {formError ? (
        <p
          role='alert'
          className='rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300'
        >
          {formError}
        </p>
      ) : null}

      <div className='space-y-2'>
        <label htmlFor='email' className='text-sm font-medium text-zinc-200'>
          Email
        </label>

        <input
          id='email'
          type='email'
          autoComplete='email'
          placeholder='nama@email.com'
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
          className={inputClassName}
          {...register('email')}
        />

        {errors.email ? (
          <p id='email-error' className='text-sm text-red-400'>
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className='space-y-2'>
        <label htmlFor='password' className='text-sm font-medium text-zinc-200'>
          Kata sandi
        </label>

        <input
          id='password'
          type='password'
          autoComplete='current-password'
          placeholder='Minimal 6 karakter'
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'password-error' : undefined}
          className={inputClassName}
          {...register('password')}
        />

        {errors.password ? (
          <p id='password-error' className='text-sm text-red-400'>
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <Button
        type='submit'
        disabled={loginMutation.isPending}
        className='h-11 w-full rounded-xl bg-violet-600 text-white hover:bg-violet-500'
      >
        {loginMutation.isPending ? 'Memproses...' : 'Masuk'}
      </Button>

      <p className='text-center text-sm text-zinc-400'>
        Belum memiliki akun?{' '}
        <Link
          href='/register'
          className='font-semibold text-violet-400 hover:text-violet-300'
        >
          Daftar
        </Link>
      </p>
    </form>
  );
}
