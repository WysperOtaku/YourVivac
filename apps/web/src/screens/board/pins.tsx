import type { CSSProperties } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import type { Pin, TopoMark } from '@yourvivac/types';
import { Avatar, Icon } from '@/ui';
import { isMapsConfigured, DEFAULT_CENTER } from '@/lib/maps';
import { TopoMap } from '@/components/maps/TopoMap';
import { TopoMapLibre } from '@/components/maps/TopoMapLibre';

interface PinViewProps {
  pin: Pin;
  authorName?: string;
  canEdit?: boolean;
  onDelete?: () => void;
  onReact?: (emoji: string) => void;
  meId?: string;
  style?: CSSProperties;
  className?: string;
  /** Sin chincheta (para el muro ordenado / guiado). */
  flat?: boolean;
}

function Head({ icon, label, author, onDelete, canEdit }: { icon: 'note' | 'link' | 'list' | 'pin' | 'image' | 'mountain' | 'route'; label: string; author?: string; onDelete?: () => void; canEdit?: boolean }) {
  return (
    <div className="pin__head">
      <Icon name={icon} size={13} /> {label}
      <span className="grow" />
      {author && <Avatar name={author} size={16} style={{ fontSize: 8 }} />}
      {canEdit && onDelete && (
        <button onClick={onDelete} aria-label="Borrar pin" className="ml-1 text-ink-3 hover:text-terra">
          <Icon name="x" size={13} />
        </button>
      )}
    </div>
  );
}

function Reactions({ pin, meId, onReact }: { pin: Pin; meId?: string; onReact?: (e: string) => void }) {
  if (!onReact) return null;
  const count = pin.reactions?.length ?? 0;
  const mine = pin.reactions?.some((r) => String(r.userId) === meId && r.emoji === '❤️');
  return (
    <button
      onClick={() => onReact('❤️')}
      className={`row gap4 mono mt-2 text-[10px] ${mine ? 'text-terra' : 'text-ink-3'}`}
    >
      <Icon name="heart" size={12} /> {count > 0 ? count : ''}
    </button>
  );
}

/** Renderiza un pin real según su tipo. El posicionamiento lo controla el tablero. */
export function PinView({ pin, authorName, canEdit, onDelete, onReact, meId, style, className, flat }: PinViewProps) {
  const wrap = (inner: React.ReactNode, extra?: string) => (
    <div className={`pin ${extra ?? ''} ${className ?? ''}`} style={style}>
      {!flat && <span className={`pin__tack ${tackClass(pin.type)}`} />}
      {inner}
    </div>
  );

  switch (pin.type) {
    case 'note':
      return wrap(
        <>
          <Head icon="note" label="Nota · MD" author={authorName} onDelete={onDelete} canEdit={canEdit} />
          <div className="pin__body note-md text-[13px]">
            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
              {pin.note.markdown}
            </Markdown>
            <Reactions pin={pin} meId={meId} onReact={onReact} />
          </div>
        </>,
        'pin--paper',
      );

    case 'text':
      return wrap(
        <div className="pin__body pt-3.5" style={{ background: pin.text.color, color: '#15200d', margin: -1, borderRadius: 10, padding: 14 }}>
          <p className="text-[13px]">{pin.text.body}</p>
          <Reactions pin={pin} meId={meId} onReact={onReact} />
        </div>,
        'pin--paper',
      );

    case 'photo':
      return wrap(
        <>
          <div
            className="imgslot topo h-[140px] items-end bg-cover bg-center"
            style={pin.photo.media?.url ? { backgroundImage: `url(${pin.photo.media.url})` } : undefined}
          />
          <div className="pin__body" style={{ padding: '8px 11px 10px' }}>
            <div className="row gap6 faint mono text-[10px]">
              {authorName && <Avatar name={authorName} size={15} style={{ fontSize: 8 }} />} {pin.photo.caption ?? authorName}
            </div>
            <Reactions pin={pin} meId={meId} onReact={onReact} />
          </div>
          {canEdit && onDelete && (
            <button onClick={onDelete} aria-label="Borrar pin" className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-black/40 text-white">
              <Icon name="x" size={13} />
            </button>
          )}
        </>,
        'relative overflow-hidden',
      );

    case 'link':
      return wrap(
        <>
          <Head icon="link" label="Enlace" author={authorName} onDelete={onDelete} canEdit={canEdit} />
          <a href={pin.link.url} target="_blank" rel="noreferrer" className="pin__body block">
            {pin.link.image && (
              <div className="mb-2 h-16 rounded-md bg-cover bg-center" style={{ backgroundImage: `url(${pin.link.image})` }} />
            )}
            <div className="font-display text-sm leading-tight">{pin.link.title ?? pin.link.url}</div>
            <div className="faint mono row gap4 mt-1 text-[10px]">
              <Icon name="globe" size={11} /> {pin.link.domain ?? ''}
            </div>
          </a>
        </>,
      );

    case 'map':
      return wrap(
        <>
          <Head icon="pin" label="Ubicación" author={authorName} onDelete={onDelete} canEdit={canEdit} />
          <div className="pin__body">
            {isMapsConfigured ? (
              <TopoMap
                center={pin.map.coords}
                zoom={12}
                marker={pin.map.coords}
                path={pin.map.path}
                className="h-28 overflow-hidden rounded-md"
              />
            ) : (
              <div className="map h-24">
                <div className="map__pin">
                  <Icon name="pin" size={22} className="text-terra" />
                </div>
              </div>
            )}
            <div className="mt-1.5 font-display text-sm">{pin.map.label}</div>
            <a
              className="faint mono mt-0.5 block text-[10px] underline"
              href={`https://www.google.com/maps?q=${pin.map.coords.lat},${pin.map.coords.lng}`}
              target="_blank"
              rel="noreferrer"
            >
              {pin.map.coords.lat.toFixed(4)}, {pin.map.coords.lng.toFixed(4)} · Google Maps
            </a>
          </div>
        </>,
      );

    case 'topo':
      return wrap(
        <>
          <Head icon="mountain" label="Mapa topo" author={authorName} onDelete={onDelete} canEdit={canEdit} />
          <div className="pin__body">
            <TopoMapLibre
              center={pin.topo.center}
              zoom={pin.topo.zoom}
              layer={pin.topo.layer}
              marks={pin.topo.marks}
              interactive={false}
              className="h-28 overflow-hidden rounded-md"
            />
            <div className="mt-1.5 font-display text-sm">{pin.topo.label}</div>
            <Reactions pin={pin} meId={meId} onReact={onReact} />
          </div>
        </>,
      );

    case 'route': {
      const r = pin.route;
      // El mapa se centra en el primer punto de la geometría calculada.
      const start = r.geometry[0] ?? r.waypoints[0];
      const end = r.geometry[r.geometry.length - 1] ?? r.waypoints[r.waypoints.length - 1];
      const marks: TopoMark[] = [];
      if (start) marks.push({ coords: start, kind: 'punto', label: 'Inicio' });
      if (end) marks.push({ coords: end, kind: 'punto', label: 'Fin' });
      return wrap(
        <>
          <Head icon="route" label="Ruta" author={authorName} onDelete={onDelete} canEdit={canEdit} />
          <div className="pin__body">
            <TopoMapLibre
              center={start ?? DEFAULT_CENTER}
              route={r.geometry}
              marks={marks}
              interactive={false}
              className="h-28 overflow-hidden rounded-md"
            />
            <div className="mt-1.5 font-display text-sm">{r.name}</div>
            <div className="row gap6 mt-1 flex-wrap">
              <span className="chip mono" style={{ fontSize: 10, padding: '1px 7px' }}>
                <Icon name="ruler" size={11} /> {(r.distanceM / 1000).toFixed(1)} km
              </span>
              <span className="chip mono" style={{ fontSize: 10, padding: '1px 7px' }}>
                <Icon name="elev" size={11} /> +{Math.round(r.ascentM)} m
              </span>
              <span className="chip mono" style={{ fontSize: 10, padding: '1px 7px' }}>
                <Icon name="elev" size={11} className="rotate-180" /> −{Math.round(r.descentM)} m
              </span>
            </div>
            <Reactions pin={pin} meId={meId} onReact={onReact} />
          </div>
        </>,
      );
    }

    case 'list':
      return wrap(
        <>
          <Head icon="list" label="Lista de equipo" author={authorName} onDelete={onDelete} canEdit={canEdit} />
          <div className="pin__body pt-1">
            <a href="/equipo" className="btn btn--ghost mt-1 w-full py-1.5 text-xs">
              <Icon name="list" size={14} /> Abrir lista
            </a>
          </div>
        </>,
        'pin--paper',
      );

    default:
      return null;
  }
}

function tackClass(type: Pin['type']): string {
  if (type === 'photo' || type === 'map' || type === 'route') return 'sky';
  if (type === 'list' || type === 'text' || type === 'topo') return 'green';
  return '';
}
