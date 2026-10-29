'use client';

import { Home, RefreshCw, TriangleAlert } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

type ErrorPageProps = {
  error: Error & {
    digest?: string;
  };
  reset: () => void;
};

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main className='relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12'>
      <div
        aria-hidden='true'
        className='absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-destructive/10 to-transparent'
      />

      <section className='relative w-full max-w-lg rounded-3xl border bg-card p-8 text-center text-card-foreground shadow-xl sm:p-12'>
        <div className='mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive'>
          <TriangleAlert className='size-8' aria-hidden='true' />
        </div>

        <p className='mt-6 text-sm font-semibold uppercase tracking-[0.3em] text-destructive'>
          Terjadi kesalahan
        </p>

        <h1 className='mt-3 text-3xl font-bold'>
          Halaman belum dapat ditampilkan
        </h1>

        <p className='mx-auto mt-4 max-w-md leading-7 text-muted-foreground'>
          Periksa koneksi internetmu, lalu coba kembali. Data dan sesi akunmu
          tetap aman.
        </p>

        <div className='mt-8 flex flex-col justify-center gap-3 sm:flex-row'>
          <Button type='button' className='gap-2' onClick={() => reset()}>
            <RefreshCw className='size-4' aria-hidden='true' />
            Coba lagi
          </Button>

          <Link
            href='/feed'
            prefetch={false}
            className='inline-flex h-9 items-center justify-center gap-2 rounded-md border bg-background px-4 text-sm font-medium transition hover:bg-accent'
          >
            <Home className='size-4' aria-hidden='true' />
            Kembali ke beranda
          </Link>
        </div>
      </section>
    </main>
  );
}
