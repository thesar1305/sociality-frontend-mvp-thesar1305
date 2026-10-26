'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { loginUser, registerUser } from '@/lib/api/auth';

import { registerSchema, type RegisterFormValues } from '@/lib/validation/auth';
import { useAppSelector } from '@/lib/store/hooks';
import { saveAccessToken } from '@/lib/auth/storage';
import { extractAccessToken } from '@/types/auth';

const inputClassName =
  'h-11 w-full rounded-xl border border-zinc-700 bg-zinc-900 px-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20';

export function RegisterForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      window.location.replace('/');
    }
  }, [isAuthenticated, isHydrated]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      await registerUser(values);

      const loginResponse = await loginUser({
        email: values.email,
        password: values.password,
      });

      return extractAccessToken(loginResponse);
    },
    onSuccess: (accessToken) => {
      saveAccessToken(accessToken);
      window.location.replace('/feed');
    },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    registerMutation.mutate(values);
  });

  return (
    <form className='space-y-4' onSubmit={onSubmit} noValidate>
      {formError ? (
        <p
          role='alert'
          className='rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300'
        >
          {formError}
        </p>
      ) : null}

      <div className='space-y-2'>
        <label htmlFor='name' className='text-sm font-medium text-zinc-200'>
          Nama lengkap
        </label>
        <input
          id='name'
          autoComplete='name'
          placeholder='Nama lengkap'
          aria-invalid={Boolean(errors.name)}
          className={inputClassName}
          {...register('name')}
        />
        {errors.name ? (
          <p className='text-sm text-red-400'>{errors.name.message}</p>
        ) : null}
      </div>

      <div className='space-y-2'>
        <label htmlFor='username' className='text-sm font-medium text-zinc-200'>
          Username
        </label>
        <input
          id='username'
          autoComplete='username'
          placeholder='username'
          aria-invalid={Boolean(errors.username)}
          className={inputClassName}
          {...register('username')}
        />
        {errors.username ? (
          <p className='text-sm text-red-400'>{errors.username.message}</p>
        ) : null}
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
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
            className={inputClassName}
            {...register('email')}
          />
          {errors.email ? (
            <p className='text-sm text-red-400'>{errors.email.message}</p>
          ) : null}
        </div>

        <div className='space-y-2'>
          <label htmlFor='phone' className='text-sm font-medium text-zinc-200'>
            Nomor telepon
          </label>
          <input
            id='phone'
            type='tel'
            autoComplete='tel'
            placeholder='081234567890'
            aria-invalid={Boolean(errors.phone)}
            className={inputClassName}
            {...register('phone')}
          />
          {errors.phone ? (
            <p className='text-sm text-red-400'>{errors.phone.message}</p>
          ) : null}
        </div>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='space-y-2'>
          <label
            htmlFor='password'
            className='text-sm font-medium text-zinc-200'
          >
            Kata sandi
          </label>
          <input
            id='password'
            type='password'
            autoComplete='new-password'
            placeholder='Minimal 6 karakter'
            aria-invalid={Boolean(errors.password)}
            className={inputClassName}
            {...register('password')}
          />
          {errors.password ? (
            <p className='text-sm text-red-400'>{errors.password.message}</p>
          ) : null}
        </div>

        <div className='space-y-2'>
          <label
            htmlFor='confirmPassword'
            className='text-sm font-medium text-zinc-200'
          >
            Ulangi kata sandi
          </label>
          <input
            id='confirmPassword'
            type='password'
            autoComplete='new-password'
            placeholder='Ulangi kata sandi'
            aria-invalid={Boolean(errors.confirmPassword)}
            className={inputClassName}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword ? (
            <p className='text-sm text-red-400'>
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>
      </div>

      <Button
        type='submit'
        disabled={registerMutation.isPending}
        className='h-11 w-full rounded-xl bg-violet-600 text-white hover:bg-violet-500'
      >
        {registerMutation.isPending ? 'Mendaftarkan...' : 'Buat akun'}
      </Button>

      <p className='text-center text-sm text-zinc-400'>
        Sudah memiliki akun?{' '}
        <Link
          href='/login'
          onClick={(event) => {
            event.preventDefault();
            window.location.replace('/login');
          }}
          className='font-semibold text-violet-400 hover:text-violet-300'
        >
          Masuk
        </Link>
      </p>
    </form>
  );
}
