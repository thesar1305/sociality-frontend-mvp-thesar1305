import { PostCard } from '@/components/sociality/post-card';
import { Button } from '@/components/ui/button';
import { posts } from '@/data/posts';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='min-h-screen bg-muted/40'>
      <header className='sticky top-0 z-10 border-b bg-background/95 backdrop-blur'>
        <div className='mx-auto flex h-16 max-w-2xl items-center justify-between px-4'>
          <Link href='/' className='text-xl font-bold tracking-tight'>
            Sociality
          </Link>

          <Button type='button' variant='outline' size='sm'>
            Profil
          </Button>
        </div>
      </header>

      <main className='mx-auto w-full max-w-2xl space-y-5 px-4 py-6'>
        <section
          aria-labelledby='feed-heading'
          className='rounded-2xl border bg-card p-5 shadow-sm'
        >
          <h1 id='feed-heading' className='text-2xl font-bold tracking-tight'>
            Beranda
          </h1>

          <p className='mt-1 text-sm text-muted-foreground'>
            Bagikan kabar terbaru dengan komunitasmu.
          </p>

          <div className='mt-4 rounded-xl border bg-background p-4 text-muted-foreground'>
            Apa yang sedang kamu pikirkan?
          </div>

          <div className='mt-3 flex justify-end'>
            <Button type='button'>Buat postingan</Button>
          </div>
        </section>

        <section aria-label='Daftar postingan' className='space-y-4'>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </section>
      </main>
    </div>
  );
}
