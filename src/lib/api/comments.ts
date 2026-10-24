import { apiClient } from '@/lib/api/client';
import type { CommentsResponse } from '@/types/comment';

type GetPostCommentsOptions = {
  postId: number;
  page?: number;
  limit?: number;
};

export async function getPostComments({
  postId,
  page = 1,
  limit = 10,
}: GetPostCommentsOptions) {
  const response = await apiClient.get<CommentsResponse>(
    `/api/posts/${postId}/comments`,
    {
      params: {
        page,
        limit,
      },
    }
  );

  return response.data;
}

export async function addPostComment(postId: number, text: string) {
  const response = await apiClient.post(`/api/posts/${postId}/comments`, {
    text,
  });

  return response.data;
}
