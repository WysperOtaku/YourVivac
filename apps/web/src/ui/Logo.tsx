import { cn } from '@/lib/cn';

interface Props {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

/** Marca: pico + anillos de nivel topográfico. */
export function Logo({ size = 28, withWordmark = true, className }: Props) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
        <circle cx="16" cy="16" r="14" stroke="var(--ink-3)" strokeWidth="1.2" opacity="0.5" />
        <circle cx="16" cy="16" r="9" stroke="var(--ink-3)" strokeWidth="1.2" opacity="0.4" />
        <path d="M6 22 L14 9 L19 17 L22 13 L26 22 Z" fill="var(--accent)" stroke="none" />
      </svg>
      {withWordmark && (
        <span className="font-display text-lg tracking-tight text-ink">YourVivac</span>
      )}
    </span>
  );
}
