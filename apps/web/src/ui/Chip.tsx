import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'accent' | 'terra' | 'guide';

interface Props {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}

const styles = {
  base: 'inline-flex items-center gap-1.5 font-mono rounded-pill px-2.5 py-1 text-[11px] tracking-wide',
  tone: {
    neutral: 'bg-bg-3 text-ink-2 shadow-[inset_0_0_0_1px_var(--line)]',
    accent: 'bg-accent/20 text-accent shadow-[inset_0_0_0_1px_rgba(168,215,124,.3)]',
    terra: 'bg-terra/20 text-terra shadow-[inset_0_0_0_1px_rgba(214,138,87,.32)]',
    guide: 'bg-terra text-[#20140a] font-semibold',
  } satisfies Record<Tone, string>,
};

export function Chip({ tone = 'neutral', children, className }: Props) {
  return <span className={cn(styles.base, styles.tone[tone], className)}>{children}</span>;
}
