export type PostComment = {
  id: string;
  authorName: string;
  content: string;
};

export type Post = {
  id: string;
  author: {
    name: string;
    username: string;
    initials: string;
  };
  isOwnedByViewer: boolean;
  content: string;
  publishedAt: string;
  publishedLabel: string;
  likes: number;
  likedByViewer: boolean;
  comments: number;
  recentComments: PostComment[];
};
