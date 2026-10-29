'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from 'cn';

type LoginPromptDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
};

export function LoginPromptDialog({
  open,
  onOpenChange,
  title = 'Masuk untuk melanjutkan',
  description = 'Masuk atau daftar untuk menyukai, menyimpan, dan mengikuti pengguna lain.',
}: LoginPromptDialogProps) {
  const pathname = usePathname();
  const next = encodeURIComponent(pathname);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className='flex flex-col gap-2'>
          <Link
            href={`/login?next=${next}`}
            className={cn(buttonVariants(), 'h-11 rounded-full font-semibold')}
          >
            Masuk
          </Link>
          <Link
            href='/register'
            className={cn(
              buttonVariants({ variant: 'outline' }),
              'h-11 rounded-full font-semibold'
            )}
          >
            Daftar
          </Link>
          <DialogClose
            className={cn(
              buttonVariants({ variant: 'ghost' }),
              'h-10 rounded-full text-muted-foreground'
            )}
          >
            Nanti saja
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
