'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api/client';
import { getMyConnections, getUserConnections } from '@/lib/api/users';
import type { UserConnectionKind } from '@/types/user';

const USERS_PER_PAGE = 10;

type UserConnectionListProps =
  | {
      scope: 'me';
      kind: UserConnectionKind;
    }
  | {
      scope: 'user';
      username: string;
      kind: UserConnectionKind;
    };

function getInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('') || 'S'
  );
}

export function UserConnectionList(props: UserConnectionListProps) {
  const [page, setPage] = useState(1);
  const { kind } = props;

  const ownerKey = props.scope === 'me' ? 'me' : props.username;

  const usersQuery = useQuery({
    queryKey: ['users', 'connections', ownerKey, kind, page, USERS_PER_PAGE],
    queryFn: () =>
      props.scope === 'me'
        ? getMyConnections({
            kind,
            page,
            limit: USERS_PER_PAGE,
          })
        : getUserConnections({
            username: props.username,
            kind,
            page,
            limit: USERS_PER_PAGE,
          }),
  });

  const title = kind === 'followers' ? 'Pengikut' : 'Mengikuti';

  const backHref =
    props.scope === 'me'
      ? '/me'
      : `/users/${encodeURIComponent(props.username)}`;

  const profileLabel =
    props.scope === 'me' ? 'Profil saya' : `@${props.username}`;

  if (usersQuery.isPending) {
    return (
      <div
        role='status'
        className='rounded-2xl border bg-card p-6 text-sm text-muted-foreground'
      >
        Memuat daftar {title.toLowerCase()}...
      </div>
    );
  }

  if (usersQuery.isError) {
    return (
      <div
        role='alert'
        className='rounded-2xl border border-destructive/40 bg-destructive/10 p-6'
      >
        <p className='text-sm text-destructive'>
          {getApiErrorMessage(usersQuery.error)}
        </p>

        <Button
          type='button'
          variant='outline'
          className='mt-4'
          onClick={() => usersQuery.refetch()}
        >
          Coba lagi
        </Button>
      </div>
    );
  }

  const { users, pagination } = usersQuery.data.data;
  const totalPages = Math.max(pagination.totalPages, 1);

  return (
    <section aria-labelledby='connections-heading' className='space-y-6'>
      <Link
        href={backHref}
        className='inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground'
      >
        <ArrowLeft className='size-4' aria-hidden='true' />
        Kembali ke profil
      </Link>

      <div>
        <h1 id='connections-heading' className='text-3xl font-bold'>
          {title}
        </h1>
        <p className='mt-2 text-muted-foreground'>{profileLabel}</p>
      </div>

      {users.length > 0 ? (
        <div className='space-y-3'>
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/users/${encodeURIComponent(user.username)}`}
              className='flex items-center gap-4 rounded-2xl border bg-card p-4 transition hover:border-violet-500/60 hover:bg-accent'
            >
              <div
                aria-hidden='true'
                className='flex size-12 shrink-0 items-center justify-center rounded-full bg-primary bg-cover bg-center font-bold text-primary-foreground'
                style={
                  user.avatarUrl
                    ? {
                        backgroundImage: `url("${user.avatarUrl}")`,
                      }
                    : undefined
                }
              >
                {user.avatarUrl ? null : getInitials(user.name)}
              </div>

              <div className='min-w-0 flex-1'>
                <p className='truncate font-semibold'>{user.name}</p>
                <p className='truncate text-sm text-muted-foreground'>
                  @{user.username}
                </p>
              </div>

              {user.isFollowedByMe ? (
                <span className='text-xs font-medium text-violet-500'>
                  Mengikuti
                </span>
              ) : null}
            </Link>
          ))}
        </div>
      ) : (
        <div className='rounded-2xl border bg-card p-8 text-center text-muted-foreground'>
          {kind === 'followers'
            ? 'Pengguna ini belum memiliki pengikut.'
            : 'Pengguna ini belum mengikuti siapa pun.'}
        </div>
      )}

      {users.length > 0 ? (
        <nav
          aria-label={`Navigasi daftar ${title.toLowerCase()}`}
          className='flex items-center justify-between gap-4 rounded-2xl border bg-card p-4'
        >
          <Button
            type='button'
            variant='outline'
            disabled={page <= 1 || usersQuery.isFetching}
            onClick={() =>
              setPage((currentPage) => Math.max(currentPage - 1, 1))
            }
          >
            Sebelumnya
          </Button>

          <p className='text-sm text-muted-foreground'>
            Halaman {pagination.page} dari {totalPages}
          </p>

          <Button
            type='button'
            variant='outline'
            disabled={page >= totalPages || usersQuery.isFetching}
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            Berikutnya
          </Button>
        </nav>
      ) : null}
    </section>
  );
}
