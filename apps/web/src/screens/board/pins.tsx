import type { CSSProperties } from 'react';
import { Avatar, Icon } from '@/ui';

const STORES: Record<string, string> = { amazon: 'Amazon', decath: 'Decathlon', deporv: 'Deporvil.' };

function Head({ icon, who, tone, label }: { icon: 'note' | 'link' | 'list' | 'pin'; who: string; tone?: '' | 't' | 's'; label: string }) {
  return (
    <div className="pin__head">
      <Icon name={icon} size={13} /> {label}
      <span className="grow" />
      <Avatar name={who} tone={tone} size={16} style={{ fontSize: 8 }} />
    </div>
  );
}

export function NotePin({ style }: { style?: CSSProperties }) {
  return (
    <div className="pin pin--paper" style={style}>
      <span className="pin__tack" />
      <Head icon="note" who="Lucía" tone="t" label="Nota · MD" />
      <div className="pin__body note-md text-[13px]">
        <h4>Plan de cumbre ⛰️</h4>
        <p>
          Salida del refu a las <strong>6:00</strong>. Portar frontal.
        </p>
        <ul>
          <li>Tramo glaciar → crampones</li>
          <li>Paso de Mahoma con cuidado</li>
        </ul>
        <p className="mb-0">
          Ver <a>parte de AEMET</a>
        </p>
      </div>
    </div>
  );
}

export function PhotoPin({ style }: { style?: CSSProperties }) {
  return (
    <div className="pin overflow-hidden" style={style}>
      <span className="pin__tack sky" />
      <div className="imgslot topo h-[116px] items-end">
        <span className="imgslot__tag">foto · la renclusa</span>
      </div>
      <div className="pin__body" style={{ padding: '8px 11px 10px' }}>
        <div className="row gap6 faint mono text-[10px]">
          <Avatar name="Iker" tone="s" size={15} style={{ fontSize: 8 }} /> Iker · ayer
        </div>
      </div>
    </div>
  );
}

export function LinkPin({ style }: { style?: CSSProperties }) {
  return (
    <div className="pin" style={style}>
      <span className="pin__tack" />
      <Head icon="link" who="Marcos" label="Enlace" />
      <div className="pin__body">
        <div className="imgslot topo mb-2 h-16 rounded-md" />
        <div className="font-display text-sm leading-tight">Refugio de la Renclusa</div>
        <div className="faint mono row gap4 mt-1 text-[10px]">
          <Icon name="globe" size={11} /> alberges.com
        </div>
      </div>
    </div>
  );
}

export function ListPin({ style }: { style?: CSSProperties }) {
  const items: [string, string][] = [
    ['Saco -5 ºC', 'amazon'],
    ['Esterilla', 'decath'],
    ['Hornillo', 'deporv'],
  ];
  return (
    <div className="pin" style={style}>
      <span className="pin__tack green" />
      <Head icon="list" who="Marcos" label="Mi lista" />
      <div className="pin__body pt-1">
        {items.map(([t, s], i) => (
          <div key={i} className={`row gap8 py-1.5 ${i < 2 ? 'border-b border-[var(--line)]' : ''}`}>
            <span className="gear-check" style={{ width: 15, height: 15 }} />
            <span className="grow text-[12.5px]">{t}</span>
            <span className={`store store--${s}`} style={{ fontSize: 9 }}>
              {STORES[s]}
            </span>
          </div>
        ))}
        <button className="btn btn--ghost mt-2.5 w-full py-1.5 text-xs">+ Añade tu lista</button>
      </div>
    </div>
  );
}

export function MapPin({ style }: { style?: CSSProperties }) {
  return (
    <div className="pin" style={style}>
      <span className="pin__tack sky" />
      <Head icon="pin" who="Ana" label="Ubicación" />
      <div className="pin__body">
        <div className="map h-24">
          <svg className="map__route" viewBox="0 0 180 96" preserveAspectRatio="none">
            <path d="M20 80 C60 70 70 30 110 34 S160 30 168 18" fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeDasharray="2 5" strokeLinecap="round" />
          </svg>
          <div className="map__pin">
            <Icon name="pin" size={22} className="text-terra" />
          </div>
        </div>
        <div className="mt-1.5 font-display text-sm">Pico Aneto</div>
        <div className="faint mono mt-0.5 text-[10px]">42.6318, 0.6577 · Google Maps</div>
      </div>
    </div>
  );
}

export function TextPin({ style }: { style?: CSSProperties }) {
  return (
    <div className="pin pin--paper" style={{ background: 'var(--accent)', color: '#15200d', ...style }}>
      <span className="pin__tack" />
      <div className="pin__body pt-3.5">
        <div className="mb-1 font-display text-[15px]">¿Coche compartido?</div>
        <p className="text-[12.5px]">Salgo de Jaca el viernes a las 16h. Caben 3 🚗</p>
        <div className="row gap4 mono mt-2 text-[10px] opacity-70">
          <Icon name="heart" size={12} /> 2 · Ana, Iker
        </div>
      </div>
    </div>
  );
}
