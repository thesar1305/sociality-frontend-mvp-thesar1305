import { notFound, redirect } from 'next/navigation';

type PostLikersPageProps = {
  params: Promise<{
    id: string;
  }>;
};

// Daftar penyuka sekarang berupa modal "Disukai oleh" di kartu & detail post.
export default async function PostLikersPage({ params }: PostLikersPageProps) {
  const { id } = await params;
  const postId = Number(id);

  if (!Number.isInteger(postId) || postId <= 0) {
    notFound();
  }

  redirect(`/posts/${postId}`);
}
