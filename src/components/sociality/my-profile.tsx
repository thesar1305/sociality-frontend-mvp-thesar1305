'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

import { AvatarUpload } from '@/components/sociality/avatar-upload';
import { EditProfileForm } from '@/components/sociality/edit-profile-form';
import { Button } from '@/components/ui/button';
import { getMyProfile } from '@/lib/api/profile';
import Link from 'next/link';

export function MyProfile() {
  const profileQuery = useQuery({
    queryKey: ['me'],
    queryFn: getMyProfile,
  });

  const [isEditing, setIsEditing] = useState(false);

  if (!profileQuery.data) {
    return (
      <div
        role='status'
        className='rounded-2xl border bg-card p-6 text-sm text-muted-foreground'
      >
        Memuat profil...
      </div>
    );
  }

  const { profile, stats } = profileQuery.data.data;
  const joinedAt = dayjs(profile.createdAt);

  const joinedLabel = joinedAt.isValid()
    ? `Bergabung ${joinedAt.locale('id').format('MMMM YYYY')}`
    : 'Tanggal bergabung tidak tersedia';

  if (isEditing) {
    return (
      <EditProfileForm
        profile={profile}
        onCancel={() => setIsEditing(false)}
        onSaved={() => setIsEditing(false)}
      />
    );
  }

  return (
    <article className='overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm'>
      <div className='h-32 bg-gradient-to-r from-violet-950 via-violet-700 to-fuchsia-600' />

      <div className='px-5 pb-5'>
        <AvatarUpload profile={profile} />

        <div className='flex flex-wrap gap-2'>
          <Link
            href='/me/saved'
            prefetch={false}
            className='inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition hover:bg-accent'
          >
            Tersimpan
          </Link>
          <Link
            href='/me/likes'
            prefetch={false}
            className='inline-flex h-9 items-center justify-center rounded-md border bg-background px-4 text-sm font-medium transition hover:bg-accent'
          >
            Disukai
          </Link>

          <Button
            type='button'
            variant='outline'
            onClick={() => setIsEditing(true)}
          >
            Edit profil
          </Button>
        </div>

        <p className='mt-4 max-w-lg leading-7'>
          {profile.bio || 'Pengguna ini belum menambahkan bio.'}
        </p>

        <p className='mt-4 text-sm text-muted-foreground'>{joinedLabel}</p>

        <dl className='mt-6 grid grid-cols-2 divide-x divide-y border-t pt-5 text-center sm:grid-cols-4 sm:divide-y-0'>
          <div className='p-3'>
            <dt className='text-sm text-muted-foreground'>Postingan</dt>
            <dd className='mt-1 font-bold'>{stats.posts}</dd>
          </div>

          <div className='p-3'>
            <dt className='text-sm text-muted-foreground'>Pengikut</dt>
            <dd className='mt-1 font-bold'>
              <Link
                href='/me/followers'
                className='rounded text-violet-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
                aria-label={`Lihat ${stats.followers} pengikut`}
              >
                {stats.followers}
              </Link>
            </dd>
          </div>

          <div className='p-3'>
            <dt className='text-sm text-muted-foreground'>Mengikuti</dt>
            <dd className='mt-1 font-bold'>
              <Link
                href='/me/following'
                className='rounded text-violet-500 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500'
                aria-label={`Lihat ${stats.following} akun yang diikuti`}
              >
                {stats.following}
              </Link>
            </dd>
          </div>

          <div className='p-3'>
            <dt className='text-sm text-muted-foreground'>Disukai</dt>
            <dd className='mt-1 font-bold'>{stats.likes}</dd>
          </div>
        </dl>

        <dl className='mt-5 grid gap-4 border-t pt-5 text-sm sm:grid-cols-2'>
          <div>
            <dt className='text-muted-foreground'>Email</dt>
            <dd className='mt-1 break-all font-medium'>{profile.email}</dd>
          </div>

          <div>
            <dt className='text-muted-foreground'>Nomor telepon</dt>
            <dd className='mt-1 font-medium'>{profile.phone}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
