'use client';

import { X } from 'lucide-react';
import { useEffect } from 'react';

import { dismissToast } from '@/lib/store/toast-slice';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { cn } from 'cn';

const TOAST_DURATION_MS = 4000;

export function ToastViewport() {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((state) => state.toast);
  const toastId = toast?.id;

  useEffect(() => {
    if (toastId === undefined) {
      return;
    }

    const timeoutId = window.setTimeout(
      () => dispatch(dismissToast()),
      TOAST_DURATION_MS
    );

    return () => window.clearTimeout(timeoutId);
  }, [toastId, dispatch]);

  return (
    <div
      aria-live='polite'
      className='pointer-events-none fixed inset-x-0 top-20 z-[60] flex justify-center px-4'
    >
      {toast ? (
        <div
          key={toast.id}
          role={toast.variant === 'error' ? 'alert' : 'status'}
          className={cn(
            'pointer-events-auto flex w-full max-w-sm items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg',
            toast.variant === 'error' ? 'bg-red-700' : 'bg-emerald-700'
          )}
        >
          <span>{toast.message}</span>
          <button
            type='button'
            aria-label='Tutup notifikasi'
            className='flex size-6 shrink-0 items-center justify-center rounded transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white'
            onClick={() => dispatch(dismissToast())}
          >
            <X className='size-4' aria-hidden='true' />
          </button>
        </div>
      ) : null}
    </div>
  );
}
