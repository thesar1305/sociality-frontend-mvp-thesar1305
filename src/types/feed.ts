export type ApiPostAuthor = {
  id: number;
  username: string;
  name: string;
  avatarUrl: string | null;
};

export type ApiPost = {
  id: number;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
  author: ApiPostAuthor;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
};

export type FeedPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PostsResponse = {
  success: boolean;
  message: string;
  data: {
    posts: ApiPost[];
    pagination: FeedPagination;
  };
};
