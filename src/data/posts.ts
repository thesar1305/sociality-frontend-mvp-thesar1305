import type { Post } from '@/types/post';

export const posts: Post[] = [
  {
    id: 'post-1',
    author: {
      name: 'Nadia Putri',
      username: '@nadiaputri',
      initials: 'NP',
    },
    content:
      'Baru selesai merancang tampilan pertama Sociality. Sedikit demi sedikit, idenya mulai terasa nyata.',
    publishedAt: '2026-10-24T08:30:00+08:00',
    publishedLabel: '2 jam lalu',
    likes: 24,
    likedByViewer: false,
    comments: 6,
  },
  {
    id: 'post-2',
    author: {
      name: 'Raka Pratama',
      username: '@rakapratama',
      initials: 'RP',
    },
    content:
      'Belajar membangun produk itu bukan hanya soal menulis kode, tetapi juga memahami masalah yang ingin diselesaikan.',
    publishedAt: '2026-10-23T19:15:00+08:00',
    publishedLabel: 'Kemarin',
    likes: 41,
    likedByViewer: false,
    comments: 9,
  },
];
