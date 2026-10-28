import type { ApiPost, FeedPagination } from '@/types/feed';
export type PublicProfileCounts = {
  post: number;
  followers: number;
  following: number;
  likes: number;
};

export type PublicProfile = {
  id: number;
  name: string;
  username: string;
  bio: string | null;
  avatarUrl: string | null;
  email: string;
  phone: string | null;
  counts: PublicProfileCounts;
  isFollowing: boolean;
  isMe: boolean;
};

export type PublicProfileResponse = {
  success: boolean;
  message: string;
  data: PublicProfile;
};

export type UserPostsResponse = {
  success: boolean;
  message: string;
  data: {
    posts: ApiPost[];
    pagination: FeedPagination;
  };
};

export type UserSearchItem = {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
  isFollowedByMe: boolean;
};

export type UserSearchResponse = {
  success: boolean;
  message: string;
  data: {
    users: UserSearchItem[];
    pagination: FeedPagination;
  };
};

export type UserConnectionKind = 'followers' | 'following';

export type UserConnectionsResponse = {
  success: boolean;
  message: string;
  data: {
    users: UserSearchItem[];
    pagination: FeedPagination;
  };
};
export type PostLiker = UserSearchItem & {
  isMe: boolean;
  followsMe: boolean;
};

export type PostLikersResponse = {
  success: boolean;
  message: string;
  data: {
    users: PostLiker[];
    pagination: FeedPagination;
  };
};
