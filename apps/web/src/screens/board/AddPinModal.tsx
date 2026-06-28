import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type {
  CreatePinRequest,
  Pin,
  PinType,
  RouteProfile,
  RouteResult,
  TopoLayer,
  TopoMark,
  TopoMarkKind,
  UpdatePinRequest,
} from '@yourvivac/types';
import { Field, Icon, Modal } from '@/ui';
import { api } from '@/lib/api';
import { errMsg } from '@/lib/errMsg';
import { uploadImage } from '@/lib/upload';
import { isMapsConfigured, DEFAULT_CENTER, type LatLng } from '@/lib/maps';
import { TopoMap } from '@/components/maps/TopoMap';
import { TopoMapLibre } from '@/components/maps/TopoMapLibre';
import { LocationSearch } from '@/components/maps/LocationSearch';

const TYPES: { key: PinType; label: string; icon: 'note' | 'image' | 'link' | 'list' | 'pin' | 'mountain' | 'route' }[] = [
  { key: 'note', label: 'Nota', icon: 'note' },
  { key: 'text', label: 'Aviso', icon: 'note' },
  { key: 'photo', label: 'Foto', icon: 'image' },
  { key: 'link', label: 'Enlace', icon: 'link' },
  { key: 'map', label: 'Mapa', icon: 'pin' },
  { key: 'topo', label: 'Mapa topo', icon: 'mountain' },
  { key: 'route', label: 'Ruta', icon: 'route' },
  { key: 'list', label: 'Lista', icon: 'list' },
];
const COLORS = ['#a8d77c', '#d68a57', '#79b8c4', '#e7ddc6'];

/** Capas base del mapa topográfico IGN. */
const LAYERS: { key: TopoLayer; label: string }[] = [
  { key: 'mtn', label: 'Mapa' },
  { key: 'relieve', label: 'Relieve' },
  { key: 'ortofoto', label: 'Satélite' },
  { key: 'base', label: 'Base' },
];
/** Iconografía YourVivac que se suelta sobre el mapa topo. */
const MARK_KINDS: { key: TopoMarkKind; label: string }[] = [
  { key: 'cumbre', label: 'Cumbre' },
  { key: 'refugio', label: 'Refugio' },
  { key: 'fuente', label: 'Fuente' },
  { key: 'vivac', label: 'Vivac' },
  { key: 'parking', label: 'Parking' },
  { key: 'cruce', label: 'Cruce' },
  { key: 'punto', label: 'Punto' },
];
/** Perfiles de cálculo de ruta (BRouter). */
const PROFILES: { key: RouteProfile; label: string }[] = [
  { key: 'hiking', label: 'Senderismo' },
  { key: 'trekking', label: 'Trekking' },
  { key: 'mountain', label: 'Montaña' },
];

/** Posición inicial pseudo-aleatoria dentro del mural. */
function randomLayout() {
  return {
    x: 16 + Math.round(Math.random() * 360),
    y: 16 + Math.round(Math.random() * 280),
    rotation: Math.round((Math.random() * 4 - 2) * 10) / 10,
    z: Math.floor(Date.now() / 1000) % 100000,
    w: 210,
  };
}

export function AddPinModal({
  open,
  onClose,
  tripId,
  editPin,
}: {
  open: boolean;
  onClose: () => void;
  tripId: string;
  /** Si se pasa, la modal abre en modo edición de ese pin (no creación). */
  editPin?: Pin | null;
}) {
  const qc = useQueryClient();
  const [type, setType] = useState<PinType>('note');
  const [uploading, setUploading] = useState(false);

  // Campos por tipo
  const [markdown, setMarkdown] = useState('');
  const [textBody, setTextBody] = useState('');
  const [color, setColor] = useState(COLORS[1]!);
  const [url, setUrl] = useState('');
  const [mapLabel, setMapLabel] = useState('');
  const [lat, setLat] = useState('42.63');
  const [lng, setLng] = useState('0.65');
  const [routePath, setRoutePath] = useState<LatLng[]>([]);
  const [photoMedia, setPhotoMedia] = useState<{ url: string; publicId: string } | null>(null);
  const [gearListId, setGearListId] = useState('');

  // Pin topo (mapa topográfico IGN con marcas YourVivac)
  const [topoLabel, setTopoLabel] = useState('');
  const [topoCenter, setTopoCenter] = useState<LatLng>(DEFAULT_CENTER);
  const [topoLayer, setTopoLayer] = useState<TopoLayer>('mtn');
  const [topoMarks, setTopoMarks] = useState<TopoMark[]>([]);
  const [topoMarkKind, setTopoMarkKind] = useState<TopoMarkKind>('cumbre');
  const [topoMarkLabel, setTopoMarkLabel] = useState('');
  const [topoQ, setTopoQ] = useState('');
  const [topoDebounced, setTopoDebounced] = useState('');

  // Pin route (ruta calculada por BRouter)
  const [routeName, setRouteName] = useState('');
  const [routeProfile, setRouteProfile] = useState<RouteProfile>('hiking');
  const [routeLayer, setRouteLayer] = useState<TopoLayer>('mtn');
  const [routeWaypoints, setRouteWaypoints] = useState<LatLng[]>([]);
  const [routeResult, setRouteResult] = useState<RouteResult | null>(null);

  const gearQ = useQuery({ queryKey: ['gear'], queryFn: () => api.gear.list(), enabled: open && type === 'list', retry: false });

  // Buscador de topónimos (debounced, como el PeoplePicker).
  useEffect(() => {
    const t = setTimeout(() => setTopoDebounced(topoQ.trim()), 220);
    return () => clearTimeout(t);
  }, [topoQ]);
  const geoQ = useQuery({
    queryKey: ['maps-search', topoDebounced],
    queryFn: () => api.maps.search(topoDebounced),
    enabled: open && type === 'topo' && topoDebounced.length >= 2,
    retry: false,
  });

  const routeMut = useMutation({
    mutationFn: () => api.routing.route({ profile: routeProfile, waypoints: routeWaypoints }),
    onSuccess: (res) => setRouteResult(res),
    onError: (e) => toast.error(errMsg(e, 'No se pudo calcular la ruta')),
  });

  function reset() {
    setMarkdown('');
    setTextBody('');
    setUrl('');
    setMapLabel('');
    setRoutePath([]);
    setPhotoMedia(null);
    setGearListId('');
    setTopoLabel('');
    setTopoCenter(DEFAULT_CENTER);
    setTopoLayer('mtn');
    setTopoMarks([]);
    setTopoMarkKind('cumbre');
    setTopoMarkLabel('');
    setTopoQ('');
    setRouteName('');
    setRouteProfile('hiking');
    setRouteLayer('mtn');
    setRouteWaypoints([]);
    setRouteResult(null);
  }

  // Modo edición: rellena el formulario con el pin al abrir; en creación, limpia.
  useEffect(() => {
    if (!open) return;
    if (!editPin) {
      reset();
      setType('note');
      return;
    }
    setType(editPin.type);
    switch (editPin.type) {
      case 'note':
        setMarkdown(editPin.note.markdown);
        break;
      case 'text':
        setTextBody(editPin.text.body);
        setColor(editPin.text.color);
        break;
      case 'photo':
        setPhotoMedia(
          editPin.photo.media ? { url: editPin.photo.media.url, publicId: editPin.photo.media.publicId } : null,
        );
        break;
      case 'link':
        setUrl(editPin.link.url);
        break;
      case 'map':
        setMapLabel(editPin.map.label);
        setLat(String(editPin.map.coords.lat));
        setLng(String(editPin.map.coords.lng));
        setRoutePath(editPin.map.path ?? []);
        break;
      case 'topo':
        setTopoLabel(editPin.topo.label);
        setTopoCenter(editPin.topo.center);
        setTopoLayer(editPin.topo.layer);
        setTopoMarks(editPin.topo.marks ?? []);
        break;
      case 'route': {
        const r = editPin.route;
        setRouteName(r.name);
        setRouteProfile(r.profile);
        setRouteLayer(r.layer ?? 'mtn');
        setRouteWaypoints(r.waypoints);
        setRouteResult({
          profile: r.profile,
          waypoints: r.waypoints,
          geometry: r.geometry,
          distanceM: r.distanceM,
          ascentM: r.ascentM,
          descentM: r.descentM,
          ...(r.durationMin != null ? { durationMin: r.durationMin } : {}),
        });
        break;
      }
      case 'list':
        setGearListId(editPin.list.gearListId);
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editPin]);

  const createMut = useMutation({
    mutationFn: () => {
      // Contenido del pin (sin type/layout): se usa tal cual para editar y se
      // completa con type+layout para crear.
      let content: UpdatePinRequest;
      switch (type) {
        case 'note':
          content = { note: { markdown } };
          break;
        case 'text':
          content = { text: { body: textBody, color } };
          break;
        case 'photo':
          if (!photoMedia) throw new Error('Sube una foto primero');
          content = { photo: { media: { url: photoMedia.url, publicId: photoMedia.publicId } } };
          break;
        case 'link':
          content = { link: { url } };
          break;
        case 'map':
          content = {
            map: {
              label: mapLabel,
              coords: { lat: Number(lat), lng: Number(lng) },
              ...(routePath.length > 1 ? { path: routePath } : {}),
            },
          };
          break;
        case 'topo':
          content = {
            topo: { label: topoLabel, center: topoCenter, zoom: 13, layer: topoLayer, marks: topoMarks },
          };
          break;
        case 'route':
          if (!routeResult) throw new Error('Calcula la ruta primero');
          content = {
            route: {
              name: routeName,
              profile: routeResult.profile,
              waypoints: routeResult.waypoints,
              geometry: routeResult.geometry,
              distanceM: routeResult.distanceM,
              ascentM: routeResult.ascentM,
              descentM: routeResult.descentM,
              ...(routeResult.durationMin != null ? { durationMin: routeResult.durationMin } : {}),
              layer: routeLayer,
            },
          };
          break;
        case 'list':
          if (!gearListId) throw new Error('Elige una lista');
          content = { list: { gearListId } };
          break;
        default:
          throw new Error('Tipo no soportado');
      }
      if (editPin) return api.board.updatePin(editPin.id, content);
      return api.board.createPin(tripId, { type, layout: randomLayout(), ...content } as CreatePinRequest);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['board', tripId] });
      toast.success(editPin ? 'Pin actualizado' : 'Pin añadido');
      reset();
      onClose();
    },
    onError: (e) => toast.error(errMsg(e, editPin ? 'No se pudo guardar' : 'No se pudo añadir el pin')),
  });

  async function onPickPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ref = await uploadImage(file);
      setPhotoMedia({ url: ref.url, publicId: ref.publicId });
    } catch (err) {
      toast.error(errMsg(err, 'No se pudo subir la foto'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={editPin ? 'Editar pin' : 'Añadir pin'}>
      {!editPin && (
        <div className="row gap6 mb-4 flex-wrap">
          {TYPES.map((t) => (
            <button key={t.key} onClick={() => setType(t.key)} className={`chip cursor-pointer ${type === t.key ? 'chip--accent' : ''}`}>
              <Icon name={t.icon} size={13} /> {t.label}
            </button>
          ))}
        </div>
      )}

      <form
        className="stack gap12"
        onSubmit={(e) => {
          e.preventDefault();
          createMut.mutate();
        }}
      >
        {type === 'note' && (
          <label className="stack gap6">
            <span className="eyebrow">Nota (Markdown)</span>
            <textarea className="min-h-[120px] w-full rounded-control bg-bg-3 px-3.5 py-2.5 font-mono text-[13px] text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none focus:shadow-[inset_0_0_0_1.5px_var(--accent)]" placeholder="## Plan de cumbre&#10;- Salida 6:00" value={markdown} onChange={(e) => setMarkdown(e.target.value)} />
          </label>
        )}

        {type === 'text' && (
          <>
            <label className="stack gap6">
              <span className="eyebrow">Aviso</span>
              <textarea className="min-h-[80px] w-full rounded-control bg-bg-3 px-3.5 py-2.5 text-[14px] text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none focus:shadow-[inset_0_0_0_1.5px_var(--accent)]" placeholder="¿Coche compartido? Salgo de Jaca…" value={textBody} onChange={(e) => setTextBody(e.target.value)} />
            </label>
            <div className="row gap8">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} className="h-7 w-7 rounded-full" style={{ background: c, boxShadow: color === c ? '0 0 0 2px var(--ink)' : 'inset 0 0 0 1px var(--line)' }} />
              ))}
            </div>
          </>
        )}

        {type === 'photo' && (
          <div className="stack gap6">
            <span className="eyebrow">Foto</span>
            {photoMedia ? (
              <div className="h-40 rounded-card bg-cover bg-center" style={{ backgroundImage: `url(${photoMedia.url})` }} />
            ) : (
              <label className="imgslot topo grid h-40 cursor-pointer place-items-center rounded-card">
                <span className="stack gap6 items-center text-ink-3">
                  <Icon name={uploading ? 'clock' : 'camera'} size={24} />
                  <span className="mono text-[11px]">{uploading ? 'Subiendo…' : 'Sube una foto'}</span>
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={onPickPhoto} disabled={uploading} />
              </label>
            )}
          </div>
        )}

        {type === 'link' && <Field label="URL" type="url" placeholder="https://…" value={url} onChange={(e) => setUrl(e.target.value)} />}

        {type === 'map' && (
          <>
            {isMapsConfigured ? (
              <>
                <label className="stack gap6">
                  <span className="eyebrow">Buscar ubicación</span>
                  <LocationSearch
                    placeholder="Pico Aneto, refugio…"
                    onPick={(p) => {
                      setMapLabel(p.name);
                      setLat(String(p.coords.lat));
                      setLng(String(p.coords.lng));
                    }}
                  />
                </label>
                <Field label="Etiqueta" placeholder="Pico Aneto" value={mapLabel} onChange={(e) => setMapLabel(e.target.value)} />
                <div className="stack gap6">
                  <div className="spread">
                    <span className="eyebrow">Dibuja la ruta (toca el mapa)</span>
                    <span className="row gap8">
                      <button type="button" className="chip cursor-pointer" onClick={() => setRoutePath((p) => p.slice(0, -1))}>
                        Deshacer
                      </button>
                      <button type="button" className="chip cursor-pointer" onClick={() => setRoutePath([])}>
                        Borrar
                      </button>
                    </span>
                  </div>
                  <TopoMap
                    key={`${lat},${lng}`}
                    interactive
                    center={{ lat: Number(lat), lng: Number(lng) }}
                    marker={{ lat: Number(lat), lng: Number(lng) }}
                    path={routePath}
                    onClick={(c) => setRoutePath((p) => [...p, c])}
                    className="h-56 overflow-hidden rounded-card"
                  />
                  <span className="faint mono text-[11px]">{routePath.length} puntos en la ruta</span>
                </div>
              </>
            ) : (
              <>
                <Field label="Etiqueta" placeholder="Pico Aneto" value={mapLabel} onChange={(e) => setMapLabel(e.target.value)} />
                <div className="row gap12">
                  <div className="grow"><Field label="Latitud" value={lat} onChange={(e) => setLat(e.target.value)} /></div>
                  <div className="grow"><Field label="Longitud" value={lng} onChange={(e) => setLng(e.target.value)} /></div>
                </div>
              </>
            )}
          </>
        )}

        {type === 'topo' && (
          <>
            <div className="stack gap6">
              <span className="eyebrow">Buscar topónimo</span>
              <div className="row gap10 rounded-control bg-bg-2 px-3.5 py-2.5 shadow-[inset_0_0_0_1px_var(--line)] focus-within:shadow-[inset_0_0_0_1.5px_var(--accent)]">
                <Icon name="search" size={17} className="text-ink-3" />
                <input
                  className="grow bg-transparent text-[14.5px] text-ink outline-none placeholder:text-ink-3"
                  placeholder="Aneto, Renclusa, Posets…"
                  value={topoQ}
                  onChange={(e) => setTopoQ(e.target.value)}
                />
              </div>
              {topoDebounced.length >= 2 && (geoQ.data ?? []).length > 0 && (
                <div className="stack max-h-40 overflow-auto rounded-control bg-bg-2 shadow-[inset_0_0_0_1px_var(--line)]">
                  {(geoQ.data ?? []).map((g, i) => (
                    <button
                      key={`${g.name}-${i}`}
                      type="button"
                      onClick={() => {
                        setTopoCenter(g.coords);
                        if (!topoLabel) setTopoLabel(g.name);
                        setTopoQ('');
                      }}
                      className="row gap8 w-full px-3 py-2 text-left text-[14px] hover:bg-bg-3"
                    >
                      <Icon name="pin" size={14} className="text-ink-3" />
                      <span className="grow truncate">{g.name}</span>
                      {g.context && <span className="faint mono text-[11px]">{g.context}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Field label="Etiqueta" placeholder="Macizo de la Maladeta" value={topoLabel} onChange={(e) => setTopoLabel(e.target.value)} />

            <div className="stack gap6">
              <span className="eyebrow">Capa base</span>
              <div className="row gap6 flex-wrap">
                {LAYERS.map((l) => (
                  <button key={l.key} type="button" onClick={() => setTopoLayer(l.key)} className={`chip cursor-pointer ${topoLayer === l.key ? 'chip--accent' : ''}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="stack gap6">
              <span className="eyebrow">Marca a soltar</span>
              <div className="row gap6 flex-wrap">
                {MARK_KINDS.map((k) => (
                  <button key={k.key} type="button" onClick={() => setTopoMarkKind(k.key)} className={`chip cursor-pointer ${topoMarkKind === k.key ? 'chip--accent' : ''}`}>
                    {k.label}
                  </button>
                ))}
              </div>
              <Field label="Etiqueta de la marca (opcional)" placeholder="Pico Aneto" value={topoMarkLabel} onChange={(e) => setTopoMarkLabel(e.target.value)} />
            </div>

            <div className="stack gap6">
              <div className="spread">
                <span className="eyebrow">Toca el mapa para soltar marcas</span>
                <span className="row gap8">
                  <button type="button" className="chip cursor-pointer" onClick={() => setTopoMarks((m) => m.slice(0, -1))}>
                    Deshacer
                  </button>
                  <button type="button" className="chip cursor-pointer" onClick={() => setTopoMarks([])}>
                    Borrar
                  </button>
                </span>
              </div>
              <TopoMapLibre
                key={`${topoCenter.lat},${topoCenter.lng}`}
                interactive
                center={topoCenter}
                zoom={13}
                layer={topoLayer}
                marks={topoMarks}
                onClick={(c) => setTopoMarks((m) => [...m, { coords: c, kind: topoMarkKind, ...(topoMarkLabel.trim() ? { label: topoMarkLabel.trim() } : {}) }])}
                className="h-56 overflow-hidden rounded-card"
              />
              <span className="faint mono text-[11px]">{topoMarks.length} marcas</span>
            </div>
          </>
        )}

        {type === 'route' && (
          <>
            <Field label="Nombre" placeholder="Renclusa → Aneto" value={routeName} onChange={(e) => setRouteName(e.target.value)} />

            <div className="stack gap6">
              <span className="eyebrow">Perfil</span>
              <div className="row gap6 flex-wrap">
                {PROFILES.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => { setRouteProfile(p.key); setRouteResult(null); }}
                    className={`chip cursor-pointer ${routeProfile === p.key ? 'chip--accent' : ''}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="stack gap6">
              <span className="eyebrow">Capa base</span>
              <div className="row gap6 flex-wrap">
                {LAYERS.map((l) => (
                  <button key={l.key} type="button" onClick={() => setRouteLayer(l.key)} className={`chip cursor-pointer ${routeLayer === l.key ? 'chip--accent' : ''}`}>
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="stack gap6">
              <div className="spread">
                <span className="eyebrow">Toca el mapa para añadir waypoints</span>
                <span className="row gap8">
                  <button type="button" className="chip cursor-pointer" onClick={() => { setRouteWaypoints((w) => w.slice(0, -1)); setRouteResult(null); }}>
                    Deshacer
                  </button>
                  <button type="button" className="chip cursor-pointer" onClick={() => { setRouteWaypoints([]); setRouteResult(null); }}>
                    Borrar
                  </button>
                </span>
              </div>
              <TopoMapLibre
                key={routeWaypoints[0] ? `${routeWaypoints[0].lat},${routeWaypoints[0].lng}` : 'route-start'}
                interactive
                center={routeWaypoints[0] ?? routeResult?.geometry[0] ?? DEFAULT_CENTER}
                zoom={13}
                layer={routeLayer}
                route={routeResult?.geometry}
                marks={routeWaypoints.map((c, i) => ({
                  coords: c,
                  kind: 'punto',
                  label: i === 0 ? 'Inicio' : i === routeWaypoints.length - 1 ? 'Fin' : String(i + 1),
                }))}
                onClick={(c) => { setRouteWaypoints((w) => [...w, c]); setRouteResult(null); }}
                className="h-56 overflow-hidden rounded-card"
              />
              <div className="spread">
                <span className="faint mono text-[11px]">{routeWaypoints.length} waypoints</span>
                <button
                  type="button"
                  className="btn px-3 py-1.5 text-xs"
                  disabled={routeWaypoints.length < 2 || routeMut.isPending}
                  onClick={() => routeMut.mutate()}
                >
                  <Icon name="route" size={14} /> {routeMut.isPending ? 'Calculando…' : 'Calcular ruta'}
                </button>
              </div>
              {routeResult && (
                <div className="row gap6 flex-wrap">
                  <span className="chip mono"><Icon name="ruler" size={12} /> {(routeResult.distanceM / 1000).toFixed(1)} km</span>
                  <span className="chip mono"><Icon name="elev" size={12} /> +{Math.round(routeResult.ascentM)} m</span>
                  <span className="chip mono"><Icon name="elev" size={12} className="rotate-180" /> −{Math.round(routeResult.descentM)} m</span>
                </div>
              )}
            </div>
          </>
        )}

        {type === 'list' && (
          <div className="stack gap6">
            <span className="eyebrow">Tu lista de equipo</span>
            {(gearQ.data ?? []).length === 0 ? (
              <p className="faint text-sm">No tienes listas. Crea una en <a href="/equipo" className="underline">Mi equipo</a>.</p>
            ) : (
              <select className="w-full rounded-control bg-bg-3 px-3.5 py-2.5 text-[14px] text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none" value={gearListId} onChange={(e) => setGearListId(e.target.value)}>
                <option value="">Elige una lista…</option>
                {(gearQ.data ?? []).map((g) => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        <button className="btn btn--block btn--lg" type="submit" disabled={createMut.isPending || uploading}>
          {createMut.isPending
            ? editPin
              ? 'Guardando…'
              : 'Añadiendo…'
            : editPin
              ? 'Guardar cambios'
              : 'Añadir al tablero'}
        </button>
      </form>
    </Modal>
  );
}
