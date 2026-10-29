'use client';

import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { avatarThumb } from '@/lib/images';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getApiErrorMessage } from '@/lib/api/client';
import { searchUsers } from '@/lib/api/users';
import type { UserSearchItem } from '@/types/user';

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

function getInitial(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'S';
}

export function UserSearch() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draftQuery, setDraftQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useDebouncedValue(
    draftQuery.trim(),
    SEARCH_DEBOUNCE_MS
  );

  const usersQuery = useInfiniteQuery({
    queryKey: ['users', 'search', submittedQuery, USERS_PER_PAGE],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      searchUsers({
        query: submittedQuery,
        page: pageParam,
        limit: USERS_PER_PAGE,
      }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.pagination;

      return page < totalPages ? page + 1 : undefined;
    },
    enabled: submittedQuery.length > 0,
    placeholderData: keepPreviousData,
  });

  const users = useMemo(() => {
    const seen = new Set<number>();
    const uniqueUsers: UserSearchItem[] = [];

    for (const page of usersQuery.data?.pages ?? []) {
      for (const user of page.data.users) {
        if (!seen.has(user.id)) {
          seen.add(user.id);
          uniqueUsers.push(user);
        }
      }
    }

    return uniqueUsers;
  }, [usersQuery.data]);

  const isWaitingForDebounce = draftQuery.trim() !== submittedQuery;

  function clearQuery() {
    setDraftQuery('');
    setSubmittedQuery('');
    inputRef.current?.focus();
  }

  return (
    <section aria-labelledby='search-heading' className='space-y-5'>
      <h1 id='search-heading' className='sr-only'>
        Cari pengguna
      </h1>

      <form
        role='search'
        className='relative'
        onSubmit={(event) => {
          event.preventDefault();
          setSubmittedQuery(draftQuery.trim());
        }}
      >
        <label htmlFor='user-search' className='sr-only'>
          Nama atau username
        </label>

        <Search
          className='pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground'
          aria-hidden='true'
        />

        <input
          ref={inputRef}
          id='user-search'
          type='text'
          value={draftQuery}
          placeholder='Cari pengguna'
          autoComplete='off'
          autoFocus
          className='h-11 w-full rounded-full border border-input bg-muted/40 pr-11 pl-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30'
          onChange={(event) => setDraftQuery(event.target.value)}
        />

        {draftQuery ? (
          <button
            type='button'
            aria-label='Hapus pencarian'
            className='absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40'
            onClick={clearQuery}
          >
            <X className='size-4' aria-hidden='true' />
          </button>
        ) : null}
      </form>

      {!submittedQuery && !draftQuery ? (
        <p className='py-10 text-center text-sm text-muted-foreground'>
          Masukkan nama atau username untuk mencari pengguna.
        </p>
      ) : null}

      {usersQuery.isFetching && users.length === 0 && submittedQuery ? (
        <div
          role='status'
          aria-label='Mencari pengguna'
          className='space-y-4'
        >
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className='flex items-center gap-3'>
              <Skeleton className='size-11 rounded-full' />
              <div className='space-y-2'>
                <Skeleton className='h-4 w-28' />
                <Skeleton className='h-3 w-20' />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {usersQuery.isError && !usersQuery.data ? (
        <div
          role='alert'
          className='rounded-xl border border-destructive/40 bg-destructive/10 p-4'
        >
          <p className='text-sm text-destructive'>
            {getApiErrorMessage(usersQuery.error)}
          </p>

          <Button
            type='button'
            variant='outline'
            className='mt-3'
            onClick={() => usersQuery.refetch()}
          >
            Coba lagi
          </Button>
        </div>
      ) : null}

      {usersQuery.isSuccess &&
      users.length === 0 &&
      !isWaitingForDebounce &&
      !usersQuery.isFetching ? (
        <div role='status' className='py-12 text-center'>
          <p className='font-semibold'>Tidak ada hasil</p>
          <p className='mt-1 text-sm text-muted-foreground'>
            Ubah kata kunci pencarian.
          </p>
        </div>
      ) : null}

      {users.length > 0 ? (
        <>
          <ul
            className='space-y-4'
            aria-busy={isWaitingForDebounce || usersQuery.isFetching}
          >
            {users.map((user) => (
              <li key={user.id}>
                <Link
                  href={`/users/${encodeURIComponent(user.username)}`}
                  prefetch={false}
                  className='flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40'
                >
                  <Avatar className='size-11'>
                    {user.avatarUrl ? (
                      <AvatarImage src={avatarThumb(user.avatarUrl, 88)} alt='' />
                    ) : null}
                    <AvatarFallback>{getInitial(user.name)}</AvatarFallback>
                  </Avatar>

                  <span className='min-w-0 flex-1'>
                    <span className='block truncate text-sm font-semibold'>
                      {user.name}
                    </span>
                    <span className='block truncate text-sm text-muted-foreground'>
                      @{user.username}
                    </span>
                  </span>

                  {user.isFollowedByMe ? (
                    <span className='text-xs font-medium text-brand-200'>
                      Mengikuti
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>

          {usersQuery.isFetchNextPageError ? (
            <p role='alert' className='text-center text-sm text-destructive'>
              {getApiErrorMessage(usersQuery.error)}
            </p>
          ) : null}

          {usersQuery.hasNextPage ? (
            <div className='flex justify-center'>
              <Button
                type='button'
                variant='outline'
                className='rounded-full'
                disabled={usersQuery.isFetchingNextPage}
                onClick={() => void usersQuery.fetchNextPage()}
              >
                {usersQuery.isFetchingNextPage
                  ? 'Memuat...'
                  : 'Muat lebih banyak'}
              </Button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
