import { cn } from 'cn';

type BrandLogoProps = {
  className?: string;
  markClassName?: string;
};

export function BrandLogo({ className, markClassName }: BrandLogoProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2.5 text-xl font-bold tracking-tight',
        className
      )}
    >
      <span
        aria-hidden='true'
        className={cn(
          'flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground',
          markClassName
        )}
      >
        S
      </span>
      Sociality
    </span>
  );
}
