import Link from 'next/link';
import type { ReactNode } from 'react';

import { BrandLogo } from '@/components/sociality/brand-logo';
import { Label } from '@/components/ui/label';
import { cn } from 'cn';

type AuthShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function AuthShell({
  title,
  description,
  children,
  footer,
  className,
}: AuthShellProps) {
  return (
    <main className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-10 text-foreground'>
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-x-0 bottom-0 h-[55vh] bg-[radial-gradient(ellipse_at_bottom,_rgba(105,56,242,0.45),_transparent_70%)]'
      />

      <section
        className={cn(
          'relative z-10 w-full max-w-[400px] rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8',
          className
        )}
      >
        <Link href='/' className='mb-6 flex justify-center'>
          <BrandLogo />
        </Link>

        <h1 className='text-center text-2xl font-bold'>{title}</h1>
        {description ? (
          <p className='mt-2 text-center text-sm text-muted-foreground'>
            {description}
          </p>
        ) : null}

        <div className='mt-6'>{children}</div>

        {footer ? (
          <p className='mt-6 text-center text-sm text-muted-foreground'>
            {footer}
          </p>
        ) : null}
      </section>
    </main>
  );
}

type AuthFieldProps = {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
};

export function AuthField({ id, label, error, children }: AuthFieldProps) {
  return (
    <div className='space-y-2'>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p id={`${id}-error`} className='text-sm text-destructive'>
          {error}
        </p>
      ) : null}
    </div>
  );
}

type AuthAlertProps = {
  variant: 'error' | 'success';
  children: ReactNode;
};

export function AuthAlert({ variant, children }: AuthAlertProps) {
  return (
    <p
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-lg border px-3 py-2 text-sm',
        variant === 'error'
          ? 'border-destructive/40 bg-destructive/10 text-destructive'
          : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300'
      )}
    >
      {children}
    </p>
  );
}
