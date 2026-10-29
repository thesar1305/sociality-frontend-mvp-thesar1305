import { redirect } from 'next/navigation';

// Postingan tersimpan sekarang menjadi tab di halaman profil (/me).
export default function SavedPostsPage() {
  redirect('/me?tab=saved');
}
