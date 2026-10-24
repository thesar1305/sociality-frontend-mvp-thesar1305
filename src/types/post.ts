export type Post = {
  id: string;
  author: {
    name: string;
    username: string;
    initials: string;
  };
  content: string;
  publishedAt: string;
  publishedLabel: string;
  likes: number;
  likedByViewer: boolean;
  comments: number;
};
