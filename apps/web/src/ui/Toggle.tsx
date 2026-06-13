import { cn } from '@/lib/cn';

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 rounded-pill transition-colors',
        checked ? 'bg-accent' : 'bg-bg-4 shadow-[inset_0_0_0_1px_var(--line-2)]',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-bg transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
