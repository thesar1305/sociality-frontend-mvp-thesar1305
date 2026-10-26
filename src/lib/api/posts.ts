import { apiClient } from '@/lib/api/client';
import type {
  PostDetailResponse,
  PostsResponse,
  PrivateFeedResponse,
} from '@/types/feed';

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

export async function getFeed({ page = 1, limit = 10 }: GetPostsOptions = {}) {
  const response = await apiClient.get<PrivateFeedResponse>('/api/feed', {
    params: {
      page,
      limit,
    },
  });

  return response.data;
}
export type CreatePostValues = {
  image: File;
  caption: string;
};

export async function createPost({ image, caption }: CreatePostValues) {
  const formData = new FormData();

  formData.append('image', image);

  if (caption.trim()) {
    formData.append('caption', caption.trim());
  }

  const response = await apiClient.post('/api/posts', formData);

  return response.data;
}
export async function likePost(postId: number) {
  const response = await apiClient.post(`/api/posts/${postId}/like`);

  return response.data;
}

export async function unlikePost(postId: number) {
  const response = await apiClient.delete(`/api/posts/${postId}/like`);

  return response.data;
}

export async function getPostDetail(postId: number) {
  const response = await apiClient.get<PostDetailResponse>(
    `/api/posts/${postId}`
  );

  return response.data;
}

export async function deletePost(postId: number) {
  const response = await apiClient.delete(`/api/posts/${postId}`);

  return response.data;
}
