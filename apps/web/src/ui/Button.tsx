import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'ghost' | 'terra';
type Size = 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  children: ReactNode;
}

const styles = {
  base: 'inline-flex items-center justify-center gap-2 font-body font-semibold rounded-pill whitespace-nowrap transition-[transform,filter] active:translate-y-px disabled:opacity-50 disabled:pointer-events-none',
  variant: {
    primary: 'bg-accent text-accent-ink hover:brightness-105',
    ghost: 'bg-transparent text-ink shadow-[inset_0_0_0_1px_var(--line-2)] hover:bg-bg-3',
    terra: 'bg-terra text-[#1c130a] hover:brightness-105',
  } satisfies Record<Variant, string>,
  size: {
    md: 'text-[15px] px-5 py-[11px]',
    lg: 'text-base px-6 py-[14px]',
  } satisfies Record<Size, string>,
};

export function Button({
  variant = 'primary',
  size = 'md',
  block,
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      className={cn(styles.base, styles.variant[variant], styles.size[size], block && 'flex w-full', className)}
      {...rest}
    >
      {children}
    </button>
  );
}
