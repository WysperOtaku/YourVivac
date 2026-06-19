import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { CreateTipRequest, MediaRef, TipCategory } from '@yourvivac/types';
import { Icon } from '@/ui';
import { Modal } from '@/ui/Modal';
import { api } from '@/lib/api';
import { errMsg } from '@/lib/errMsg';
import { uploadImage } from '@/lib/upload';

const CATS: { key: TipCategory; label: string }[] = [
  { key: 'material', label: 'Material' },
  { key: 'seguridad', label: 'Seguridad' },
  { key: 'rutas', label: 'Rutas' },
  { key: 'vivac', label: 'Vivac responsable' },
  { key: 'meteo', label: 'Meteo' },
];

/** Modal de publicar consejo (editor Markdown + portada Cloudinary). */
export function PublishTipModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const qc = useQueryClient();
  const [category, setCategory] = useState<TipCategory>('material');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [cover, setCover] = useState<MediaRef | null>(null);
  const [uploading, setUploading] = useState(false);

  function reset() {
    setTitle('');
    setBody('');
    setCover(null);
    setCategory('material');
  }

  const publishMut = useMutation({
    mutationFn: (status: 'draft' | 'published') => {
      const payload: CreateTipRequest = {
        title: title.trim(),
        category,
        contentMarkdown: body,
        status,
        ...(cover ? { cover } : {}),
      };
      return api.tips.create(payload);
    },
    onSuccess: (_t, status) => {
      qc.invalidateQueries({ queryKey: ['tips'] });
      toast.success(status === 'published' ? 'Consejo publicado' : 'Borrador guardado');
      reset();
      onClose();
    },
    onError: (e) => toast.error(errMsg(e, 'No se pudo publicar')),
  });

  async function onPickCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      setCover(await uploadImage(file));
    } catch (err) {
      toast.error(errMsg(err, 'No se pudo subir la portada'));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  const valid = title.trim().length >= 3 && body.trim().length > 0;

  return (
    <Modal open={open} onClose={onClose} title="Publicar consejo" className="max-w-xl">
      <div className="stack gap16">
        {cover ? (
          <div className="h-[116px] rounded-[14px] bg-cover bg-center" style={{ backgroundImage: `url(${cover.url})` }} />
        ) : (
          <label className="imgslot topo flex h-[116px] cursor-pointer items-center justify-center rounded-[14px]">
            <div className="stack gap6 items-center text-ink-3">
              <div className="grid h-10 w-10 place-items-center rounded-pin backdrop-blur" style={{ background: 'color-mix(in srgb,var(--bg) 65%,transparent)' }}>
                <Icon name={uploading ? 'clock' : 'image'} size={22} />
              </div>
              <span className="mono text-[11px]">{uploading ? 'Subiendo…' : 'Añade una portada'}</span>
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={onPickCover} disabled={uploading} />
          </label>
        )}

        <label className="stack gap6">
          <span className="eyebrow">Título</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Cómo elegir el saco según la cota"
            className="w-full rounded-control bg-bg-3 px-3.5 py-2.5 text-[15px] text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1.5px_var(--accent)]"
          />
        </label>

        <div className="stack gap6">
          <span className="eyebrow">Categoría</span>
          <div className="row gap6 flex-wrap">
            {CATS.map((c) => (
              <span key={c.key} onClick={() => setCategory(c.key)} className={`chip cursor-pointer ${category === c.key ? 'chip--accent' : ''}`}>
                {c.label}
              </span>
            ))}
          </div>
        </div>

        <label className="stack gap6">
          <span className="eyebrow">Contenido · Markdown</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            placeholder="Escribe tu consejo en Markdown…"
            className="w-full resize-y rounded-control bg-bg-3 px-3.5 py-3 font-mono text-[13px] text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1.5px_var(--accent)]"
          />
        </label>

        <div className="row gap10">
          <button className="btn btn--ghost grow" onClick={() => publishMut.mutate('draft')} disabled={!valid || publishMut.isPending || uploading}>
            Guardar borrador
          </button>
          <button className="btn grow" style={{ flex: 2 }} onClick={() => publishMut.mutate('published')} disabled={!valid || publishMut.isPending || uploading}>
            Publicar consejo
          </button>
        </div>
      </div>
    </Modal>
  );
}
