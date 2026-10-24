import type { ApiPostAuthor } from '@/types/feed';

export type ApiComment = {
  id: number;
  text: string;
  createdAt: string;
  author: ApiPostAuthor;
};

export type CommentsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type CommentsResponse = {
  success: boolean;
  message: string;
  data: {
    comments: ApiComment[];
    pagination: CommentsPagination;
  };
};
