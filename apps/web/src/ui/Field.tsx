import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';
import { cn } from '@/lib/cn';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
}

const styles = {
  wrap: 'flex flex-col gap-1.5',
  label: 'eyebrow',
  input:
    'w-full bg-bg-3 text-ink rounded-control px-3.5 py-2.5 font-body text-[15px] placeholder:text-ink-3 shadow-[inset_0_0_0_1px_var(--line)] focus:outline-none focus:shadow-[inset_0_0_0_1.5px_var(--accent)]',
  error: 'text-[12px] text-terra font-mono',
};

export const Field = forwardRef<HTMLInputElement, Props>(function Field(
  { label, error, className, id, ...rest },
  ref,
) {
  return (
    <label className={styles.wrap} htmlFor={id}>
      {label && <span className={styles.label}>{label}</span>}
      <input ref={ref} id={id} className={cn(styles.input, className)} {...rest} />
      {error && <span className={styles.error}>{error}</span>}
    </label>
  );
});
