'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import { getApiErrorMessage } from '@/lib/api/client';
import { searchUsers } from '@/lib/api/users';

const USERS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 400;

function useDebouncedValue(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delay);

    return () => window.clearTimeout(timeoutId);
  }, [value, delay]);

  return [debouncedValue, setDebouncedValue] as const;
}

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

export function UserSearch() {
  const [draftQuery, setDraftQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useDebouncedValue(
    draftQuery.trim(),
    SEARCH_DEBOUNCE_MS
  );
  const [page, setPage] = useState(1);

  const usersQuery = useQuery({
    queryKey: ['users', 'search', submittedQuery, page, USERS_PER_PAGE],
    queryFn: () =>
      searchUsers({
        query: submittedQuery,
        page,
        limit: USERS_PER_PAGE,
      }),
    enabled: submittedQuery.length > 0,
    placeholderData: keepPreviousData,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedQuery = draftQuery.trim();

    setPage(1);
    setSubmittedQuery(normalizedQuery);
  }

  const users = usersQuery.data?.data.users ?? [];
  const pagination = usersQuery.data?.data.pagination;
  const totalPages = Math.max(pagination?.totalPages ?? 1, 1);

  return (
    <section aria-labelledby='search-heading' className='space-y-6'>
      <div>
        <h1 id='search-heading' className='text-3xl font-bold'>
          Cari pengguna
        </h1>
        <p className='mt-2 text-muted-foreground'>
          Temukan teman melalui nama atau username.
        </p>
      </div>

      <form
        className='flex gap-3 rounded-2xl border bg-card p-4'
        onSubmit={handleSubmit}
      >
        <label htmlFor='user-search' className='sr-only'>
          Nama atau username
        </label>

        <input
          id='user-search'
          type='search'
          value={draftQuery}
          placeholder='Cari nama atau username...'
          className='min-w-0 flex-1 rounded-xl border bg-background px-4 py-3 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'
          onChange={(event) => {
            setDraftQuery(event.target.value);
            setPage(1);
          }}
        />

        <Button type='submit' disabled={!draftQuery.trim()}>
          <Search className='size-4' aria-hidden='true' />
          Cari
        </Button>
      </form>

      {!submittedQuery ? (
        <div className='rounded-2xl border bg-card p-8 text-center text-muted-foreground'>
          Masukkan nama atau username untuk memulai pencarian.
        </div>
      ) : null}

      {usersQuery.isPending && submittedQuery ? (
        <div
          role='status'
          className='rounded-2xl border bg-card p-6 text-sm text-muted-foreground'
        >
          Mencari pengguna...
        </div>
      ) : null}

      {usersQuery.isError ? (
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
      ) : null}

      {usersQuery.isSuccess && users.length === 0 ? (
        <div className='rounded-2xl border bg-card p-8 text-center text-muted-foreground'>
          Tidak ada pengguna yang cocok dengan “{submittedQuery}”.
        </div>
      ) : null}

      {users.length > 0 ? (
        <>
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

          <nav
            aria-label='Navigasi hasil pencarian'
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
              Halaman {pagination?.page ?? page} dari {totalPages}
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
        </>
      ) : null}
    </section>
  );
}
