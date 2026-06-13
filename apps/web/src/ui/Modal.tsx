import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  className?: string;
}

/** Hoja inferior / diálogo sobre fondo atenuado (patrón bottom-sheet del diseño). */
export function Modal({ open, onClose, children, title, className }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          'relative w-full max-w-lg bg-bg-2 rounded-card shadow p-5 max-h-[90vh] overflow-auto',
          className,
        )}
      >
        {title && <h3 className="text-xl mb-3">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
