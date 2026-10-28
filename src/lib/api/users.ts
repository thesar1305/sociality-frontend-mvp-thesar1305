import { apiClient } from '@/lib/api/client';
import type {
  PublicProfileResponse,
  UserPostsResponse,
  UserSearchResponse,
  UserConnectionKind,
  UserConnectionsResponse,
} from '@/types/user';

type GetUserPostsOptions = {
  username: string;
  page?: number;
  limit?: number;
};
type GetUserConnectionsOptions = {
  username: string;
  kind: UserConnectionKind;
  page?: number;
  limit?: number;
};

export async function getUserConnections({
  username,
  kind,
  page = 1,
  limit = 10,
}: GetUserConnectionsOptions) {
  const response = await apiClient.get<UserConnectionsResponse>(
    `/api/users/${encodeURIComponent(username)}/${kind}`,
    {
      params: {
        page,
        limit,
      },
    }
  );

  return response.data;
}
export async function getPublicProfile(username: string) {
  const response = await apiClient.get<PublicProfileResponse>(
    `/api/users/${encodeURIComponent(username)}`
  );

  return response.data;
}

export async function getUserPosts({
  username,
  page = 1,
  limit = 10,
}: GetUserPostsOptions) {
  const response = await apiClient.get<UserPostsResponse>(
    `/api/users/${encodeURIComponent(username)}/posts`,
    {
      params: {
        page,
        limit,
      },
    }
  );

  return response.data;
}

type SearchUsersOptions = {
  query: string;
  page?: number;
  limit?: number;
};

export async function searchUsers({
  query,
  page = 1,
  limit = 10,
}: SearchUsersOptions) {
  const response = await apiClient.get<UserSearchResponse>(
    '/api/users/search',
    {
      params: {
        q: query,
        page,
        limit,
      },
    }
  );

  return response.data;
}
export async function followUser(username: string) {
  const response = await apiClient.post(
    `/api/follow/${encodeURIComponent(username)}`
  );

  return response.data;
}

export async function unfollowUser(username: string) {
  const response = await apiClient.delete(
    `/api/follow/${encodeURIComponent(username)}`
  );

  return response.data;
}
type GetMyConnectionsOptions = {
  kind: UserConnectionKind;
  page?: number;
  limit?: number;
};

export async function getMyConnections({
  kind,
  page = 1,
  limit = 10,
}: GetMyConnectionsOptions) {
  const response = await apiClient.get<UserConnectionsResponse>(
    `/api/me/${kind}`,
    {
      params: {
        page,
        limit,
      },
    }
  );

  return response.data;
}
