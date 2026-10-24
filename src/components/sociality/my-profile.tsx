'use client';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import 'dayjs/locale/id';

import { getMyProfile } from '@/lib/api/profile';

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

  return initials || 'S';
}

export function MyProfile() {
  const profileQuery = useQuery({
    queryKey: ['me'],
    queryFn: getMyProfile,
  });

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

  return (
    <article className='overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm'>
      <div className='h-32 bg-gradient-to-r from-violet-950 via-violet-700 to-fuchsia-600' />

      <div className='px-5 pb-5'>
        <div className='-mt-12 flex size-24 items-center justify-center overflow-hidden rounded-full border-4 border-card bg-primary text-2xl font-bold text-primary-foreground'>
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={`Avatar ${profile.name}`}
              className='size-full object-cover'
            />
          ) : (
            getInitials(profile.name)
          )}
        </div>

        <div className='mt-4'>
          <h2 className='text-2xl font-bold'>{profile.name}</h2>
          <p className='text-muted-foreground'>@{profile.username}</p>
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
            <dd className='mt-1 font-bold'>{stats.followers}</dd>
          </div>

          <div className='p-3'>
            <dt className='text-sm text-muted-foreground'>Mengikuti</dt>
            <dd className='mt-1 font-bold'>{stats.following}</dd>
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
