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

export type MyProfile = {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

export type MyProfileStats = {
  posts: number;
  followers: number;
  following: number;
  likes: number;
};

export type MyProfileResponse = {
  success: boolean;
  message: string;
  data: {
    profile: MyProfile;
    stats: MyProfileStats;
  };
};
