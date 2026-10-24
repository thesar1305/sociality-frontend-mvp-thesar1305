import type { Metadata } from 'next';
import Link from 'next/link';

import { RegisterForm } from '@/components/sociality/register-form';

export const metadata: Metadata = {
  title: 'Daftar | Sociality',
  description: 'Buat akun Sociality.',
};

export default function RegisterPage() {
  return (
    <main className='relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 px-4 py-10 text-white'>
      <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(124,58,237,0.28),_transparent_42%)]' />
      <div className='absolute bottom-0 left-0 size-80 rounded-full bg-fuchsia-600/10 blur-3xl' />

      <section className='relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-zinc-950/80 shadow-2xl backdrop-blur lg:grid-cols-[0.85fr_1.15fr]'>
        <div className='hidden min-h-[720px] flex-col justify-between bg-gradient-to-br from-violet-700 via-violet-950 to-zinc-950 p-10 lg:flex'>
          <Link href='/' className='text-2xl font-bold tracking-tight'>
            Sociality
          </Link>

          <div>
            <p className='text-sm font-medium uppercase tracking-[0.25em] text-violet-200'>
              Join the community
            </p>
            <h1 className='mt-4 text-4xl font-bold leading-tight'>
              Mulai bagikan ceritamu hari ini.
            </h1>
            <p className='mt-4 text-violet-100/70'>
              Temukan teman baru dan terhubung melalui setiap momen.
            </p>
          </div>
        </div>

        <div className='flex min-h-[720px] items-center p-6 sm:p-10'>
          <div className='mx-auto w-full max-w-xl'>
            <Link
              href='/'
              className='mb-8 inline-block text-xl font-bold tracking-tight lg:hidden'
            >
              Sociality
            </Link>

            <p className='text-sm font-semibold text-violet-400'>
              Bergabung dengan Sociality
            </p>
            <h2 className='mt-2 text-3xl font-bold'>Buat akun baru</h2>
            <p className='mb-7 mt-2 text-sm leading-6 text-zinc-400'>
              Isi informasi berikut untuk membuat akunmu.
            </p>

            <RegisterForm />
          </div>
        </div>
      </section>
    </main>
  );
}
