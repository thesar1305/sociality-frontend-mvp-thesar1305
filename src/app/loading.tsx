export default function Loading() {
  return (
    <main className='flex min-h-screen items-center justify-center bg-background px-4'>
      <div
        role='status'
        aria-live='polite'
        className='flex flex-col items-center gap-4 text-center'
      >
        <span
          aria-hidden='true'
          className='size-10 animate-spin rounded-full border-4 border-violet-500/20 border-t-violet-500'
        />

        <div>
          <p className='font-semibold'>Memuat Sociality</p>
          <p className='mt-1 text-sm text-muted-foreground'>
            Menyiapkan halaman untukmu...
          </p>
        </div>

        <span className='sr-only'>Halaman sedang dimuat</span>
      </div>
    </main>
  );
}
