import { cn } from '@/lib/cn';

interface Props {
  value: string | number;
  label: string;
  className?: string;
}

export function Stat({ value, label, className }: Props) {
  return (
    <div className={cn('flex flex-col', className)}>
      <span className="font-display text-2xl text-ink tabular-nums">{value}</span>
      <span className="eyebrow">{label}</span>
    </div>
  );
}
