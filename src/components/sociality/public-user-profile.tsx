'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { ArrowLeft, Check, Heart, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import { LoginPromptDialog } from '@/components/sociality/login-prompt-dialog';
import {
  dedupeTiles,
  ProfileHeader,
  ShareProfileButton,
  TileGrid,
} from '@/components/sociality/profile-parts';
import { Button, buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getApiErrorMessage } from '@/lib/api/client';
import {
  followUser,
  getPublicProfile,
  getUserLikes,
  getUserPosts,
  unfollowUser,
} from '@/lib/api/users';
import { track } from '@/lib/analytics';
import { useAppSelector } from '@/lib/store/hooks';
import type { PublicProfileResponse } from '@/types/user';
import { cn } from 'cn';

const TILES_PER_PAGE = 12;

type ProfileTab = 'posts' | 'likes';

type PublicUserProfileProps = {
  username: string;
  backHref?: string;
  backLabel?: string;
  initialTab?: ProfileTab;
  profileReturnHref: string;
};

export function PublicUserProfile({
  username,
  backHref = '/search',
  backLabel = 'Kembali ke pencarian',
  initialTab = 'posts',
  profileReturnHref,
}: PublicUserProfileProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>(initialTab);
  const queryClient = useQueryClient();
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);

  const profileQueryKey = ['users', 'profile', username] as const;

  const profileQuery = useQuery({
    queryKey: profileQueryKey,
    queryFn: () => getPublicProfile(username),
  });

  const followMutation = useMutation({
    mutationFn: ({ shouldFollow }: { shouldFollow: boolean }) =>
      shouldFollow ? followUser(username) : unfollowUser(username),

    onSuccess: (_, { shouldFollow }) => {
      track(shouldFollow ? 'user_follow' : 'user_unfollow', { username });
    },

    onMutate: async ({ shouldFollow }) => {
      await queryClient.cancelQueries({
        queryKey: profileQueryKey,
      });

      const previousProfile =
        queryClient.getQueryData<PublicProfileResponse>(profileQueryKey);

      queryClient.setQueryData<PublicProfileResponse>(
        profileQueryKey,
        (currentProfile) => {
          if (!currentProfile) {
            return currentProfile;
          }

          const followerChange = shouldFollow ? 1 : -1;

          return {
            ...currentProfile,
            data: {
              ...currentProfile.data,
              isFollowing: shouldFollow,
              counts: {
                ...currentProfile.data.counts,
                followers: Math.max(
                  currentProfile.data.counts.followers + followerChange,
                  0
                ),
              },
            },
          };
        }
      );

      return {
        previousProfile,
      };
    },

    onError: (_error, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(profileQueryKey, context.previousProfile);
      }
    },

    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: profileQueryKey,
        }),
        queryClient.invalidateQueries({
          queryKey: ['users', 'search'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['posts', 'feed'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['me'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['users', 'connections'],
        }),
      ]);
    },
  });

  if (profileQuery.isPending) {
    return (
      <div role='status' aria-label='Memuat profil' className='space-y-6'>
        <div className='flex items-center gap-4'>
          <Skeleton className='size-16 rounded-full' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-3 w-20' />
          </div>
        </div>
        <Skeleton className='h-10 w-full rounded-full' />
        <Skeleton className='h-16 w-full' />
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

        <div className='mt-4 flex gap-3'>
          <Button
            type='button'
            variant='outline'
            onClick={() => profileQuery.refetch()}
          >
            Coba lagi
          </Button>
          <Link
            href={backHref}
            prefetch={false}
            className={buttonVariants({ variant: 'ghost' })}
          >
            {backLabel}
          </Link>
        </div>
      </div>
    );
  }

  const profile = profileQuery.data.data;
  const encodedUsername = encodeURIComponent(profile.username);

  function handleFollow() {
    if (!isAuthenticated) {
      if (isHydrated) {
        setLoginPromptOpen(true);
      }

      return;
    }

    followMutation.mutate({ shouldFollow: !profile.isFollowing });
  }

  const [profilePath, profileQueryString = ''] = profileReturnHref.split('?');
  const returnParams = new URLSearchParams(profileQueryString);

  if (activeTab === 'likes') {
    returnParams.set('tab', 'likes');
  } else {
    returnParams.delete('tab');
  }

  const returnQuery = returnParams.toString();
  const currentReturnHref = returnQuery
    ? `${profilePath}?${returnQuery}`
    : profilePath;

  const hrefFor = (id: number) =>
    `/posts/${id}?from=public-profile&returnTo=${encodeURIComponent(
      currentReturnHref
    )}`;

  return (
    <section aria-labelledby='public-profile-heading' className='space-y-5'>
      <Link
        href={backHref}
        prefetch={false}
        className='inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground'
      >
        <ArrowLeft className='size-4' aria-hidden='true' />
        {backLabel}
      </Link>

      <ProfileHeader
        headingId='public-profile-heading'
        name={profile.name}
        username={profile.username}
        avatarUrl={profile.avatarUrl}
        bio={profile.bio}
        stats={[
          { label: 'Postingan', value: profile.counts.post },
          {
            label: 'Pengikut',
            value: profile.counts.followers,
            href: `/users/${encodedUsername}/followers`,
          },
          {
            label: 'Mengikuti',
            value: profile.counts.following,
            href: `/users/${encodedUsername}/following`,
          },
          {
            label: 'Disukai',
            value: profile.counts.likes,
            onClick: () => setActiveTab('likes'),
          },
        ]}
        actions={
          <>
            {profile.isMe ? (
              <Link
                href='/me'
                prefetch={false}
                className={cn(
                  buttonVariants({ variant: 'outline' }),
                  'h-10 flex-1 rounded-full text-sm font-semibold'
                )}
              >
                Profil saya
              </Link>
            ) : (
              <Button
                type='button'
                variant={profile.isFollowing ? 'outline' : 'default'}
                aria-pressed={profile.isFollowing}
                aria-busy={followMutation.isPending}
                disabled={followMutation.isPending}
                className='h-10 flex-1 rounded-full text-sm font-semibold'
                onClick={handleFollow}
              >
                {profile.isFollowing ? (
                  <>
                    <Check aria-hidden='true' />
                    Mengikuti
                  </>
                ) : (
                  'Ikuti'
                )}
              </Button>
            )}

            <ShareProfileButton
              username={profile.username}
              name={profile.name}
            />
          </>
        }
      />

      {followMutation.isError ? (
        <p
          role='alert'
          className='rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive'
        >
          {getApiErrorMessage(followMutation.error)}
        </p>
      ) : null}

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as ProfileTab)}
        className='gap-4'
      >
        <TabsList aria-label='Konten profil pengguna'>
          <TabsTrigger value='posts'>
            <LayoutGrid aria-hidden='true' />
            Galeri
          </TabsTrigger>
          <TabsTrigger value='likes'>
            <Heart aria-hidden='true' />
            Disukai
          </TabsTrigger>
        </TabsList>

        <TabsContent value='posts'>
          <UserTiles
            kind='posts'
            username={profile.username}
            hrefFor={hrefFor}
          />
        </TabsContent>

        <TabsContent value='likes'>
          <UserTiles
            kind='likes'
            username={profile.username}
            hrefFor={hrefFor}
          />
        </TabsContent>
      </Tabs>

      <LoginPromptDialog
        open={loginPromptOpen}
        onOpenChange={setLoginPromptOpen}
        title='Masuk untuk mengikuti'
        description={`Masuk atau daftar untuk mengikuti ${profile.name} dan melihat aktivitasnya.`}
      />
    </section>
  );
}

function UserTiles({
  kind,
  username,
  hrefFor,
}: {
  kind: ProfileTab;
  username: string;
  hrefFor: (id: number) => string;
}) {
  const query = useInfiniteQuery({
    queryKey: [
      'posts',
      kind === 'posts' ? 'user-grid' : 'user-liked-grid',
      username,
      TILES_PER_PAGE,
    ],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      (kind === 'posts' ? getUserPosts : getUserLikes)({
        username,
        page: pageParam,
        limit: TILES_PER_PAGE,
      }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.data.pagination;

      return page < totalPages ? page + 1 : undefined;
    },
  });

  const tiles = useMemo(
    () => dedupeTiles(query.data?.pages.flatMap((page) => page.data.posts)),
    [query.data]
  );

  return (
    <TileGrid
      tiles={tiles}
      isPending={query.isPending}
      error={query.isError && !query.data ? query.error : null}
      hasNextPage={query.hasNextPage}
      isFetchingNextPage={query.isFetchingNextPage}
      fetchNextPageFailed={query.isFetchNextPageError}
      onRetry={() => void query.refetch()}
      onLoadMore={() => void query.fetchNextPage()}
      hrefFor={hrefFor}
      empty={
        <p className='px-4 py-10 text-center text-sm text-muted-foreground'>
          {kind === 'posts'
            ? 'Pengguna ini belum membuat postingan.'
            : 'Pengguna ini belum menyukai postingan.'}
        </p>
      }
    />
  );
}
