'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';

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
import { loginUser, registerUser } from '@/lib/api/auth';
import { getApiErrorMessage } from '@/lib/api/client';

import { registerSchema, type RegisterFormValues } from '@/lib/validation/auth';
import { useAppSelector } from '@/lib/store/hooks';
import { saveAccessToken } from '@/lib/auth/storage';
import { extractAccessToken } from '@/types/auth';

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
    onError: (error) => {
      setFormError(getApiErrorMessage(error));
    },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    registerMutation.mutate(values);
  });

  return (
    <AuthShell
      title='Daftar'
      description='Buat akun untuk mulai berbagi cerita.'
      footer={
        <>
          Sudah memiliki akun?{' '}
          <Link
            href='/login'
            onClick={(event) => {
              event.preventDefault();
              window.location.replace('/login');
            }}
            className='font-semibold text-primary hover:underline'
          >
            Masuk
          </Link>
        </>
      }
    >
      <form className='space-y-4' onSubmit={onSubmit} noValidate>
        {formError ? <AuthAlert variant='error'>{formError}</AuthAlert> : null}

        <AuthField id='name' label='Nama' error={errors.name?.message}>
          <Input
            id='name'
            autoComplete='name'
            placeholder='Masukkan nama'
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'name-error' : undefined}
            {...register('name')}
          />
        </AuthField>

        <AuthField
          id='username'
          label='Username'
          error={errors.username?.message}
        >
          <Input
            id='username'
            autoComplete='username'
            placeholder='Masukkan username'
            aria-invalid={Boolean(errors.username)}
            aria-describedby={errors.username ? 'username-error' : undefined}
            {...register('username')}
          />
        </AuthField>

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
          id='phone'
          label='Nomor telepon'
          error={errors.phone?.message}
        >
          <Input
            id='phone'
            type='tel'
            autoComplete='tel'
            placeholder='Masukkan nomor telepon'
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            {...register('phone')}
          />
        </AuthField>

        <AuthField
          id='password'
          label='Kata sandi'
          error={errors.password?.message}
        >
          <PasswordInput
            id='password'
            autoComplete='new-password'
            placeholder='Minimal 6 karakter'
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
        </AuthField>

        <AuthField
          id='confirmPassword'
          label='Ulangi kata sandi'
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            id='confirmPassword'
            autoComplete='new-password'
            placeholder='Ulangi kata sandi'
            aria-invalid={Boolean(errors.confirmPassword)}
            aria-describedby={
              errors.confirmPassword ? 'confirmPassword-error' : undefined
            }
            {...register('confirmPassword')}
          />
        </AuthField>

        <Button
          type='submit'
          disabled={registerMutation.isPending}
          className='h-11 w-full rounded-full text-base font-semibold'
        >
          {registerMutation.isPending ? 'Mendaftarkan...' : 'Daftar'}
        </Button>
      </form>
    </AuthShell>
  );
}
