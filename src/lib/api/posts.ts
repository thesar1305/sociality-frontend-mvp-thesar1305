import { apiClient } from '@/lib/api/client';
import type { PostsResponse } from '@/types/feed';

type GetPostsOptions = {
  page?: number;
  limit?: number;
};

export async function getPosts({ page = 1, limit = 10 }: GetPostsOptions = {}) {
  const response = await apiClient.get<PostsResponse>('/api/posts', {
    params: {
      page,
      limit,
    },
  });

  return response.data;
}
