import { ArrowLeft, Home, SearchX } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className='relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12'>
      <div
        aria-hidden='true'
        className='absolute -left-32 top-0 size-80 rounded-full bg-violet-600/20 blur-3xl'
      />

      <div
        aria-hidden='true'
        className='absolute -right-32 bottom-0 size-80 rounded-full bg-fuchsia-600/20 blur-3xl'
      />

      <section className='relative w-full max-w-lg rounded-3xl border bg-card/95 p-8 text-center text-card-foreground shadow-2xl backdrop-blur sm:p-12'>
        <div className='mx-auto flex size-16 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-500'>
          <SearchX className='size-8' aria-hidden='true' />
        </div>

        <p className='mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-violet-500'>
          Error 404
        </p>

        <h1 className='mt-3 text-3xl font-bold sm:text-4xl'>
          Halaman tidak ditemukan
        </h1>

        <p className='mx-auto mt-4 max-w-md leading-7 text-muted-foreground'>
          Halaman yang kamu cari mungkin telah dipindahkan, dihapus, atau
          alamatnya tidak tepat.
        </p>

        <div className='mt-8 flex flex-col justify-center gap-3 sm:flex-row'>
          <Link
            href='/feed'
            prefetch={false}
            className='inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90'
          >
            <Home className='size-4' aria-hidden='true' />
            Kembali ke beranda
          </Link>

          <Link
            href='/search'
            prefetch={false}
            className='inline-flex h-10 items-center justify-center gap-2 rounded-md border bg-background px-5 text-sm font-medium transition hover:bg-accent'
          >
            <ArrowLeft className='size-4' aria-hidden='true' />
            Cari pengguna
          </Link>
        </div>
      </section>
    </main>
  );
}
