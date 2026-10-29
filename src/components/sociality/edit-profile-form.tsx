'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { avatarThumb } from '@/lib/images';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { getApiErrorMessage } from '@/lib/api/client';
import { getMyProfile, updateMyProfile } from '@/lib/api/profile';
import { useAppDispatch } from '@/lib/store/hooks';
import { showToast } from '@/lib/store/toast-slice';
import {
  updateProfileSchema,
  validateAvatarFile,
  type UpdateProfileFormValues,
} from '@/lib/validation/profile';
import type { MyProfile } from '@/types/profile';

const BIO_MAX_LENGTH = 160;

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'U';
}

function PageHeader() {
  return (
    <div className='flex items-center gap-3'>
      <Link
        href='/me'
        prefetch={false}
        aria-label='Kembali ke profil'
        className='flex size-9 items-center justify-center rounded-full transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40'
      >
        <ArrowLeft className='size-5' aria-hidden='true' />
      </Link>
      <h1 className='text-xl font-bold'>Edit Profil</h1>
    </div>
  );
}

export function EditProfileForm() {
  const profileQuery = useQuery({
    queryKey: ['me'],
    queryFn: getMyProfile,
  });

  if (profileQuery.isPending) {
    return (
      <div role='status' aria-label='Memuat profil' className='space-y-6'>
        <Skeleton className='mx-auto size-24 rounded-full' />
        <Skeleton className='h-11 w-full' />
        <Skeleton className='h-11 w-full' />
        <Skeleton className='h-11 w-full' />
      </div>
    );
  }

  if (profileQuery.isError) {
    return (
      <div
        role='alert'
        className='rounded-2xl border border-destructive/40 bg-destructive/10 p-6'
      >
        <p className='text-sm text-destructive'>
          {getApiErrorMessage(profileQuery.error)}
        </p>
        <Button
          type='button'
          variant='outline'
          className='mt-4'
          onClick={() => profileQuery.refetch()}
        >
          Coba lagi
        </Button>
      </div>
    );
  }

  return <EditProfileFields profile={profileQuery.data.data.profile} />;
}

function EditProfileFields({ profile }: { profile: MyProfile }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile.name,
      username: profile.username,
      phone: profile.phone,
      bio: profile.bio ?? '',
    },
  });

  const bioLength = useWatch({ control, name: 'bio' })?.length ?? 0;

  const updateMutation = useMutation({
    mutationFn: (values: UpdateProfileFormValues) =>
      updateMyProfile(values, avatarFile),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['me'] }),
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
        queryClient.invalidateQueries({ queryKey: ['users'] }),
      ]);

      dispatch(showToast({ message: 'Profil berhasil diperbarui.' }));
      router.push('/me');
    },
    onError: (error) => {
      setFormError(getApiErrorMessage(error));
    },
  });

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    event.target.value = '';

    if (!file) {
      return;
    }

    const validationError = validateAvatarFile(file);

    if (validationError) {
      setAvatarError(validationError);
      return;
    }

    setAvatarError(null);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    updateMutation.mutate(values);
  });

  const isPending = updateMutation.isPending;
  const avatarSrc = avatarPreview ?? profile.avatarUrl;

  return (
    <section className='space-y-6'>
      <PageHeader />

      <form className='space-y-5' noValidate onSubmit={onSubmit}>
        <div className='flex flex-col items-center gap-3'>
          <Avatar className='size-24'>
            {avatarSrc ? <AvatarImage src={avatarThumb(avatarSrc, 192)} alt='' /> : null}
            <AvatarFallback className='text-3xl'>
              {getInitial(profile.name)}
            </AvatarFallback>
          </Avatar>

          <input
            ref={fileInputRef}
            type='file'
            accept='image/png,image/jpeg,image/webp'
            className='sr-only'
            tabIndex={-1}
            aria-hidden='true'
            onChange={handleAvatarChange}
          />

          <Button
            type='button'
            variant='outline'
            className='h-10 rounded-full px-5'
            disabled={isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            Ganti Foto
          </Button>

          {avatarFile ? (
            <p className='max-w-full truncate text-xs text-muted-foreground'>
              {avatarFile.name}
            </p>
          ) : (
            <p className='text-xs text-muted-foreground'>
              PNG, JPG, atau WEBP. Maksimal 5 MB.
            </p>
          )}

          {avatarError ? (
            <p role='alert' className='text-sm text-destructive'>
              {avatarError}
            </p>
          ) : null}
        </div>

        {formError ? (
          <p
            role='alert'
            className='rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive'
          >
            {formError}
          </p>
        ) : null}

        <div className='space-y-2'>
          <Label htmlFor='profile-name'>Nama</Label>
          <Input
            id='profile-name'
            autoComplete='name'
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'profile-name-error' : undefined}
            {...register('name')}
          />
          {errors.name ? (
            <p id='profile-name-error' className='text-sm text-destructive'>
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='profile-username'>Username</Label>
          <Input
            id='profile-username'
            autoCapitalize='none'
            autoComplete='username'
            aria-invalid={Boolean(errors.username)}
            aria-describedby={
              errors.username ? 'profile-username-error' : undefined
            }
            {...register('username')}
          />
          {errors.username ? (
            <p id='profile-username-error' className='text-sm text-destructive'>
              {errors.username.message}
            </p>
          ) : null}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='profile-email'>Email</Label>
          <Input
            id='profile-email'
            type='email'
            value={profile.email}
            readOnly
            aria-describedby='profile-email-hint'
            className='cursor-not-allowed opacity-70'
          />
          <p id='profile-email-hint' className='text-xs text-muted-foreground'>
            Email akun tidak dapat diubah.
          </p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='profile-phone'>Nomor telepon</Label>
          <Input
            id='profile-phone'
            type='tel'
            autoComplete='tel'
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'profile-phone-error' : undefined}
            {...register('phone')}
          />
          {errors.phone ? (
            <p id='profile-phone-error' className='text-sm text-destructive'>
              {errors.phone.message}
            </p>
          ) : null}
        </div>

        <div className='space-y-2'>
          <Label htmlFor='profile-bio'>Bio</Label>
          <Textarea
            id='profile-bio'
            rows={4}
            maxLength={BIO_MAX_LENGTH}
            aria-invalid={Boolean(errors.bio)}
            aria-describedby={errors.bio ? 'profile-bio-error' : undefined}
            {...register('bio')}
          />
          <div className='flex items-start justify-between gap-3'>
            {errors.bio ? (
              <p id='profile-bio-error' className='text-sm text-destructive'>
                {errors.bio.message}
              </p>
            ) : (
              <span />
            )}
            <p className='text-xs text-muted-foreground'>
              {bioLength}/{BIO_MAX_LENGTH}
            </p>
          </div>
        </div>

        <Button
          type='submit'
          className='h-11 w-full rounded-full text-base font-semibold'
          disabled={isPending}
        >
          {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
        </Button>
      </form>
    </section>
  );
}
