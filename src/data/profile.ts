import type { UserProfile } from '@/types/profile';

export const currentUser: UserProfile = {
  name: 'Pengguna Sociality',
  username: '@socialityuser',
  initials: 'PS',
  bio: 'Belajar membangun pengalaman sosial yang sederhana dan bermanfaat.',
  location: 'Indonesia',
  joinedLabel: 'Bergabung Oktober 2026',
  stats: {
    posts: 12,
    followers: 128,
    following: 84,
  },
};
