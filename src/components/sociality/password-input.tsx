'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState, type ComponentProps } from 'react';

import { Input } from '@/components/ui/input';
import { cn } from 'cn';

type PasswordInputProps = Omit<ComponentProps<'input'>, 'type'>;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className='relative'>
      <Input
        {...props}
        type={visible ? 'text' : 'password'}
        className={cn('pr-11', className)}
      />
      <button
        type='button'
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
        aria-pressed={visible}
        className='absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30'
      >
        {visible ? (
          <EyeOff className='size-4' aria-hidden='true' />
        ) : (
          <Eye className='size-4' aria-hidden='true' />
        )}
      </button>
    </div>
  );
}
