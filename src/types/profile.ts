export type UserProfile = {
  name: string;
  username: string;
  initials: string;
  bio: string;
  location: string;
  joinedLabel: string;
  stats: {
    posts: number;
    followers: number;
    following: number;
  };
};
