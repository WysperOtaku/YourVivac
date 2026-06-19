import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { TipCategory } from '@yourvivac/types';
import { AppShell } from '@/components/AppShell';
import { Icon } from '@/ui';
import { api } from '@/lib/api';
import { PublishTipModal } from './PublishTipModal';
import { TipReadModal } from './TipReadModal';

const CATS: { key?: TipCategory; label: string }[] = [
  { label: 'Todos' },
  { key: 'material', label: 'Material' },
  { key: 'seguridad', label: 'Seguridad' },
  { key: 'rutas', label: 'Rutas' },
  { key: 'vivac', label: 'Vivac responsable' },
  { key: 'meteo', label: 'Meteo' },
];

export function TipsScreen() {
  const [cat, setCat] = useState(0);
  const [publish, setPublish] = useState(false);
  const [readSlug, setReadSlug] = useState<string | null>(null);

  const category = CATS[cat]?.key;
  const { data, isLoading } = useQuery({
    queryKey: ['tips', category ?? 'all'],
    queryFn: () => api.tips.feed(category ? { category } : undefined),
    retry: false,
  });
  const tips = data?.items ?? [];

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
            <span key={c.label} onClick={() => setCat(i)} className={`chip cursor-pointer ${i === cat ? 'chip--accent' : ''}`}>
              {c.label}
            </span>
          ))}
        </div>

        {isLoading ? (
          <div className="faint py-10 text-center text-sm">Cargando consejos…</div>
        ) : tips.length === 0 ? (
          <div className="card mt-4 p-8 text-center">
            <p className="muted">Aún no hay consejos en esta categoría.</p>
            <button className="btn mt-3" onClick={() => setPublish(true)}>
              <Icon name="edit" size={16} /> Publica el primero
            </button>
          </div>
        ) : (
          <div className="pt-3 lg:columns-2 lg:gap-4">
            {tips.map((t) => (
              <article
                key={t.id}
                className="card mb-3 cursor-pointer overflow-hidden lg:break-inside-avoid"
                onClick={() => setReadSlug(t.slug)}
              >
                <div
                  className="imgslot topo h-[120px] items-start bg-cover bg-center"
                  style={t.cover?.url ? { backgroundImage: `url(${t.cover.url})` } : undefined}
                >
                  <span className="chip chip--terra m-2.5 capitalize">{t.category}</span>
                </div>
                <div className="px-3.5 pb-3.5 pt-3">
                  <h3 className="text-[18px] leading-tight">{t.title}</h3>
                  {t.excerpt && <p className="faint mt-1.5 text-[13px]">{t.excerpt}</p>}
                  <div className="row gap16 faint mono mt-2.5 text-[11px]">
                    <span className="row gap4"><Icon name="clock" size={12} /> {t.readMinutes}′</span>
                    <span className="row gap4"><Icon name="heart" size={12} /> {t.counts?.likes ?? 0}</span>
                    <span className="row gap4"><Icon name="chat" size={12} /> {t.counts?.comments ?? 0}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
      <PublishTipModal open={publish} onClose={() => setPublish(false)} />
      <TipReadModal slug={readSlug} open={Boolean(readSlug)} onClose={() => setReadSlug(null)} />
    </AppShell>
  );
}
