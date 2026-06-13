import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const styles = {
  card: 'bg-bg-2 rounded-card shadow-[inset_0_0_0_1px_var(--line)]',
};

export function Card({ className, children, ...rest }: Props) {
  return (
    <div className={cn(styles.card, className)} {...rest}>
      {children}
    </div>
  );
}
