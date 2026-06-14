import { useState } from 'react';
import { Icon } from '@/ui';
import { Modal } from '@/ui/Modal';

const CATS = ['Material', 'Seguridad', 'Rutas', 'Meteo', 'Vivac responsable'];
const MD_BTNS: [string, string][] = [
  ['#', 'H1'],
  ['**', 'B'],
  ['-', 'Lista'],
  ['[]', 'Link'],
  ['`', 'Cód'],
];

/** Modal de publicar consejo (editor Markdown). */
export function PublishTipModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [cat, setCat] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  return (
    <Modal open={open} onClose={onClose} title="Publicar consejo" className="max-w-xl">
      <div className="stack gap16">
        <div className="imgslot topo h-[116px] items-center justify-center rounded-[14px]">
          <div className="stack gap6 items-center">
            <div className="grid h-10 w-10 place-items-center rounded-pin backdrop-blur" style={{ background: 'color-mix(in srgb,var(--bg) 65%,transparent)' }}>
              <Icon name="image" size={22} />
            </div>
            <span className="mono faint text-[11px]">Añade una portada</span>
          </div>
        </div>

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
            {CATS.map((c, i) => (
              <span key={c} onClick={() => setCat(i)} className={`chip cursor-pointer ${i === cat ? 'chip--accent' : ''}`}>
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="stack gap6">
          <span className="eyebrow">Contenido · Markdown</span>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            placeholder="Escribe tu consejo en Markdown…"
            className="w-full resize-y rounded-control bg-bg-3 px-3.5 py-3 font-body text-sm text-ink shadow-[inset_0_0_0_1px_var(--line)] outline-none placeholder:text-ink-3 focus:shadow-[inset_0_0_0_1.5px_var(--accent)]"
          />
          <div className="row gap6 flex-wrap">
            {MD_BTNS.map(([s, l]) => (
              <span key={l} className="chip mono" style={{ fontSize: 10.5 }}>
                {s} {l}
              </span>
            ))}
          </div>
        </div>

        <div className="row gap10">
          <button className="btn btn--ghost grow" onClick={onClose}>
            Guardar borrador
          </button>
          <button className="btn grow" style={{ flex: 2 }} onClick={onClose}>
            Publicar consejo
          </button>
        </div>
      </div>
    </Modal>
  );
}
