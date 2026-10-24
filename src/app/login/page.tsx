import type { Metadata } from 'next';
import Link from 'next/link';

import { LoginForm } from '@/components/sociality/login-form';

export const metadata: Metadata = {
  title: 'Masuk | Sociality',
  description: 'Masuk ke akun Sociality.',
};

export default function LoginPage() {
  return (
    <main className='relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-10 text-white'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(124,58,237,0.28),_transparent_42%)]' />
      <div className='absolute bottom-0 right-0 size-80 rounded-full bg-fuchsia-600/10 blur-3xl' />

      <section className='relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur lg:grid-cols-2'>
        <div className='hidden min-h-[620px] flex-col justify-between bg-gradient-to-br from-violet-700 via-violet-950 to-zinc-950 p-10 lg:flex'>
          <Link href='/' className='text-2xl font-bold tracking-tight'>
            Sociality
          </Link>

          <div>
            <p className='text-sm font-medium uppercase tracking-[0.25em] text-violet-200'>
              Share your story
            </p>
            <h1 className='mt-4 max-w-md text-4xl font-bold leading-tight'>
              Terhubung dan berbagi cerita dengan komunitasmu.
            </h1>
            <p className='mt-4 max-w-md text-violet-100/70'>
              Temukan cerita baru, ikuti teman, dan abadikan setiap momen.
            </p>
          </div>
        </div>

        <div className='flex min-h-[620px] items-center p-6 sm:p-10'>
          <div className='mx-auto w-full max-w-sm'>
            <Link
              href='/'
              className='mb-10 inline-block text-xl font-bold tracking-tight lg:hidden'
            >
              Sociality
            </Link>

            <p className='text-sm font-semibold text-violet-400'>
              Selamat datang kembali
            </p>
            <h2 className='mt-2 text-3xl font-bold'>Masuk ke Sociality</h2>
            <p className='mb-8 mt-2 text-sm leading-6 text-zinc-400'>
              Gunakan email dan kata sandi yang telah terdaftar.
            </p>

            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
