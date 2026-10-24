'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api/client';
import { updateMyProfile } from '@/lib/api/profile';
import {
  updateProfileSchema,
  type UpdateProfileFormValues,
} from '@/lib/validation/profile';
import type { MyProfile } from '@/types/profile';

type EditProfileFormProps = {
  profile: MyProfile;
  onCancel: () => void;
  onSaved: () => void;
};

const inputClassName =
  'w-full rounded-xl border bg-background px-4 py-3 text-foreground outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20';

export function EditProfileForm({
  profile,
  onCancel,
  onSaved,
}: EditProfileFormProps) {
  const queryClient = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
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

  const updateMutation = useMutation({
    mutationFn: updateMyProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['me'],
      });

      onSaved();
    },
    onError: (error) => {
      setFormError(getApiErrorMessage(error));
    },
  });

  const onSubmit = handleSubmit((values) => {
    setFormError(null);
    updateMutation.mutate(values);
  });

  return (
    <section className='rounded-3xl border bg-card p-6 text-card-foreground shadow-sm sm:p-8'>
      <div className='mb-6'>
        <p className='text-sm font-semibold text-violet-500'>
          Pengaturan profil
        </p>
        <h2 className='mt-1 text-2xl font-bold'>Edit profil</h2>
        <p className='mt-2 text-sm text-muted-foreground'>
          Email akun tidak dapat diubah dari halaman ini.
        </p>
      </div>

      {formError ? (
        <p
          role='alert'
          className='mb-5 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive'
        >
          {formError}
        </p>
      ) : null}

      <form className='space-y-5' noValidate onSubmit={onSubmit}>
        <div>
          <label className='mb-2 block font-medium' htmlFor='profile-name'>
            Nama lengkap
          </label>
          <input
            id='profile-name'
            className={inputClassName}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'profile-name-error' : undefined}
            {...register('name')}
          />
          {errors.name ? (
            <p
              id='profile-name-error'
              className='mt-2 text-sm text-destructive'
            >
              {errors.name.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className='mb-2 block font-medium' htmlFor='profile-username'>
            Username
          </label>
          <input
            id='profile-username'
            className={inputClassName}
            autoCapitalize='none'
            aria-invalid={Boolean(errors.username)}
            aria-describedby={
              errors.username ? 'profile-username-error' : undefined
            }
            {...register('username')}
          />
          {errors.username ? (
            <p
              id='profile-username-error'
              className='mt-2 text-sm text-destructive'
            >
              {errors.username.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className='mb-2 block font-medium' htmlFor='profile-phone'>
            Nomor telepon
          </label>
          <input
            id='profile-phone'
            type='tel'
            className={inputClassName}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'profile-phone-error' : undefined}
            {...register('phone')}
          />
          {errors.phone ? (
            <p
              id='profile-phone-error'
              className='mt-2 text-sm text-destructive'
            >
              {errors.phone.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className='mb-2 block font-medium' htmlFor='profile-bio'>
            Bio
          </label>
          <textarea
            id='profile-bio'
            rows={4}
            maxLength={160}
            className={`${inputClassName} resize-y`}
            aria-invalid={Boolean(errors.bio)}
            aria-describedby={errors.bio ? 'profile-bio-error' : undefined}
            {...register('bio')}
          />
          {errors.bio ? (
            <p id='profile-bio-error' className='mt-2 text-sm text-destructive'>
              {errors.bio.message}
            </p>
          ) : null}
        </div>

        <div className='flex flex-wrap justify-end gap-3'>
          <Button
            type='button'
            variant='outline'
            disabled={updateMutation.isPending}
            onClick={onCancel}
          >
            Batal
          </Button>

          <Button type='submit' disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Menyimpan...' : 'Simpan perubahan'}
          </Button>
        </div>
      </form>
    </section>
  );
}
