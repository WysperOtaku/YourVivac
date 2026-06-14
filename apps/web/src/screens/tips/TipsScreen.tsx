import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Icon } from '@/ui';
import { TipCard } from '@/components/cards';
import { PublishTipModal } from './PublishTipModal';

const CATS = ['Todos', 'Material', 'Seguridad', 'Rutas', 'Vivac responsable', 'Meteo'];
const TIPS = [
  { big: true, title: 'Cómo elegir el saco según la cota del vivac', who: 'Lucía Roldán', tone: 't' as const, guide: true, cat: 'Material', mins: '6', likes: '218' },
  { title: 'Vivac responsable: no dejar rastro (LNT)', who: 'Editorial YourVivac', tone: '' as const, cat: 'Vivac responsable', mins: '4', likes: '190' },
  { title: 'Leer un parte de AEMET de montaña', who: 'Diego Romero', tone: 's' as const, guide: true, cat: 'Meteo', mins: '5', likes: '134' },
  { title: 'Qué llevar en el botiquín de travesía', who: 'Bea López', tone: 't' as const, cat: 'Seguridad', mins: '7', likes: '98' },
];

export function TipsScreen() {
  const [cat, setCat] = useState(0);
  const [publish, setPublish] = useState(false);

  return (
    <AppShell topbar={{ title: 'Consejos', sub: 'Comunidad', actions: <button className="btn" onClick={() => setPublish(true)}><Icon name="edit" size={18} /> Publicar</button> }}>
      <div className="mx-auto w-full max-w-4xl px-[18px] lg:px-7 lg:pt-4">
        <header className="flex-none pb-2.5 pt-1.5 lg:hidden">
          <div className="spread">
            <h1 className="text-[25px]">Consejos</h1>
            <button className="btn px-4 py-2 text-sm" onClick={() => setPublish(true)}>
              <Icon name="edit" size={18} /> Publicar
            </button>
          </div>
        </header>
        <div className="row gap6 flex-wrap pb-1">
          {CATS.map((c, i) => (
            <span key={c} onClick={() => setCat(i)} className={`chip cursor-pointer ${i === cat ? 'chip--accent' : ''}`}>
              {c}
            </span>
          ))}
        </div>
        <div className="pt-3 lg:columns-2 lg:gap-4">
          {TIPS.map((t, i) => (
            <div key={i} className="lg:break-inside-avoid">
              <TipCard {...t} />
            </div>
          ))}
        </div>
      </div>
      <PublishTipModal open={publish} onClose={() => setPublish(false)} />
    </AppShell>
  );
}
