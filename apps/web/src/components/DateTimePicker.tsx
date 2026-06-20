import { useEffect, useRef, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  setHours,
  setMinutes,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { Icon } from '@/ui';

interface Props {
  value?: string; // ISO
  onChange: (iso: string) => void;
  placeholder?: string;
}

const WEEK = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

/** Selector de fecha + hora propio, temático (claro/oscuro), en un solo control. */
export function DateTimePicker({ value, onChange, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = value ? new Date(value) : undefined;
  const [month, setMonth] = useState(() => selected ?? new Date());

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });

  /** Emite el ISO conservando la hora actual (o 08:00 por defecto). */
  function pickDay(day: Date) {
    const base = selected ?? setMinutes(setHours(day, 8), 0);
    const next = setMinutes(setHours(day, base.getHours()), base.getMinutes());
    onChange(next.toISOString());
  }
  function pickTime(h: number, m: number) {
    const base = selected ?? new Date();
    onChange(setMinutes(setHours(base, h), m).toISOString());
  }

  const inputCls =
    'w-full rounded-control bg-bg-2 px-3.5 py-3 text-left text-[15px] text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none focus:shadow-[inset_0_0_0_1.5px_var(--accent)]';

  return (
    <div className="relative" ref={ref}>
      <button type="button" className={`${inputCls} row gap8`} onClick={() => setOpen((v) => !v)}>
        <Icon name="calendar" size={16} className="text-ink-3" />
        {selected ? (
          <span className="mono">{format(selected, "d 'de' MMM, HH:mm", { locale: es })}</span>
        ) : (
          <span className="faint">{placeholder ?? 'Elige fecha y hora'}</span>
        )}
      </button>

      {open && (
        <div className="card absolute left-0 top-[calc(100%+6px)] z-50 w-[290px] p-3 shadow">
          {/* Navegación de mes */}
          <div className="spread mb-2">
            <button type="button" onClick={() => setMonth((m) => addMonths(m, -1))} aria-label="Mes anterior" className="grid h-7 w-7 place-items-center rounded-control hover:bg-bg-3">
              <Icon name="back" size={16} />
            </button>
            <span className="font-display text-[15px] capitalize">{format(month, 'MMMM yyyy', { locale: es })}</span>
            <button type="button" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="Mes siguiente" className="grid h-7 w-7 place-items-center rounded-control hover:bg-bg-3">
              <Icon name="chevron" size={16} />
            </button>
          </div>

          {/* Rejilla de días */}
          <div className="grid grid-cols-7 gap-0.5">
            {WEEK.map((d) => (
              <div key={d} className="eyebrow grid h-7 place-items-center" style={{ fontSize: 9 }}>{d}</div>
            ))}
            {days.map((day) => {
              const isSel = selected && isSameDay(day, selected);
              const dim = !isSameMonth(day, month);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => pickDay(day)}
                  className={`mono grid h-8 place-items-center rounded-[8px] text-[12.5px] ${
                    isSel ? 'bg-accent text-accent-ink' : dim ? 'text-ink-3' : 'text-ink hover:bg-bg-3'
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {/* Hora */}
          <div className="row gap8 mt-3 border-t border-[var(--line)] pt-3">
            <Icon name="clock" size={15} className="text-ink-3" />
            <select
              className="grow rounded-control bg-bg-3 px-2 py-1.5 text-sm text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none"
              value={selected ? selected.getHours() : 8}
              onChange={(e) => pickTime(Number(e.target.value), selected ? selected.getMinutes() : 0)}
            >
              {HOURS.map((h) => (
                <option key={h} value={h}>{String(h).padStart(2, '0')}h</option>
              ))}
            </select>
            <select
              className="grow rounded-control bg-bg-3 px-2 py-1.5 text-sm text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none"
              value={selected ? Math.floor(selected.getMinutes() / 15) * 15 : 0}
              onChange={(e) => pickTime(selected ? selected.getHours() : 8, Number(e.target.value))}
            >
              {MINUTES.map((m) => (
                <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
              ))}
            </select>
            <button type="button" className="btn px-3 py-1.5 text-sm" onClick={() => setOpen(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
