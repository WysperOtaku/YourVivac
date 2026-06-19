import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreatePinRequest, PinType } from '@yourvivac/types';
import { Field, Icon, Modal } from '@/ui';
import { api } from '@/lib/api';
import { errMsg } from '@/lib/errMsg';
import { uploadImage } from '@/lib/upload';

const TYPES: { key: PinType; label: string; icon: 'note' | 'image' | 'link' | 'list' | 'pin' }[] = [
  { key: 'note', label: 'Nota', icon: 'note' },
  { key: 'text', label: 'Aviso', icon: 'note' },
  { key: 'photo', label: 'Foto', icon: 'image' },
  { key: 'link', label: 'Enlace', icon: 'link' },
  { key: 'map', label: 'Mapa', icon: 'pin' },
  { key: 'list', label: 'Lista', icon: 'list' },
];
const COLORS = ['#a8d77c', '#d68a57', '#79b8c4', '#e7ddc6'];

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

export function AddPinModal({ open, onClose, tripId }: { open: boolean; onClose: () => void; tripId: string }) {
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
  const [photoMedia, setPhotoMedia] = useState<{ url: string; publicId: string } | null>(null);
  const [gearListId, setGearListId] = useState('');

  const gearQ = useQuery({ queryKey: ['gear'], queryFn: () => api.gear.list(), enabled: open && type === 'list', retry: false });

  function reset() {
    setMarkdown('');
    setTextBody('');
    setUrl('');
    setMapLabel('');
    setPhotoMedia(null);
    setGearListId('');
  }

  const createMut = useMutation({
    mutationFn: () => {
      const layout = randomLayout();
      let payload: CreatePinRequest;
      switch (type) {
        case 'note':
          payload = { type, layout, note: { markdown } };
          break;
        case 'text':
          payload = { type, layout, text: { body: textBody, color } };
          break;
        case 'photo':
          if (!photoMedia) throw new Error('Sube una foto primero');
          payload = { type, layout, photo: { media: { url: photoMedia.url, publicId: photoMedia.publicId } } };
          break;
        case 'link':
          payload = { type, layout, link: { url } };
          break;
        case 'map':
          payload = { type, layout, map: { label: mapLabel, coords: { lat: Number(lat), lng: Number(lng) } } };
          break;
        case 'list':
          if (!gearListId) throw new Error('Elige una lista');
          payload = { type, layout, list: { gearListId } };
          break;
        default:
          throw new Error('Tipo no soportado');
      }
      return api.board.createPin(tripId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['board', tripId] });
      toast.success('Pin añadido');
      reset();
      onClose();
    },
    onError: (e) => toast.error(errMsg(e, 'No se pudo añadir el pin')),
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
    <Modal open={open} onClose={onClose} title="Añadir pin">
      <div className="row gap6 mb-4 flex-wrap">
        {TYPES.map((t) => (
          <button key={t.key} onClick={() => setType(t.key)} className={`chip cursor-pointer ${type === t.key ? 'chip--accent' : ''}`}>
            <Icon name={t.icon} size={13} /> {t.label}
          </button>
        ))}
      </div>

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
            <Field label="Etiqueta" placeholder="Pico Aneto" value={mapLabel} onChange={(e) => setMapLabel(e.target.value)} />
            <div className="row gap12">
              <div className="grow"><Field label="Latitud" value={lat} onChange={(e) => setLat(e.target.value)} /></div>
              <div className="grow"><Field label="Longitud" value={lng} onChange={(e) => setLng(e.target.value)} /></div>
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
          {createMut.isPending ? 'Añadiendo…' : 'Añadir al tablero'}
        </button>
      </form>
    </Modal>
  );
}
