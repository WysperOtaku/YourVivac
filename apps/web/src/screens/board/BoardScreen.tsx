import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { Avatar, Icon } from '@/ui';
import { NotePin, PhotoPin, LinkPin, ListPin, MapPin, TextPin } from './pins';

type View = 'free' | 'wall' | 'guided';
const MEMBERS: [string, '' | 't' | 's'][] = [
  ['Marcos', ''],
  ['Lucía', 't'],
  ['Iker', 's'],
  ['Ana', ''],
];

function BoardFree() {
  return (
    <div className="board">
      <NotePin style={{ left: 16, top: 16, width: 200, transform: 'rotate(-2deg)' }} />
      <PhotoPin style={{ left: 240, top: 28, width: 200, transform: 'rotate(1.6deg)' }} />
      <MapPin style={{ left: 470, top: 18, width: 210, transform: 'rotate(-1.4deg)' }} />
      <LinkPin style={{ left: 20, top: 320, width: 200, transform: 'rotate(1.4deg)' }} />
      <ListPin style={{ left: 244, top: 330, width: 206, transform: 'rotate(-1.6deg)' }} />
      <TextPin style={{ left: 480, top: 330, width: 196, transform: 'rotate(2deg)' }} />
    </div>
  );
}

function BoardWall() {
  return (
    <div className="absolute inset-0 overflow-y-auto bg-bg p-4">
      <div className="columns-2 gap-3 lg:columns-3">
        {[<PhotoPin />, <NotePin />, <ListPin />, <MapPin />, <LinkPin />, <TextPin />].map((el, i) => (
          <div key={i} className="mb-3 break-inside-avoid [&>.pin]:static [&>.pin]:w-full [&>.pin]:shadow-sm [&_.pin__tack]:hidden">
            {el}
          </div>
        ))}
      </div>
    </div>
  );
}

function Group({ icon, title, count, children }: { icon: 'list' | 'image' | 'note' | 'pin'; title: string; count: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <div className="row gap8 mb-2.5">
        <Icon name={icon} size={18} className="text-accent" />
        <span className="font-display text-[17px]">{title}</span>
        <span className="chip mono" style={{ fontSize: 10, padding: '1px 7px' }}>
          {count}
        </span>
      </div>
      {children}
    </section>
  );
}

function BoardGuided() {
  return (
    <div className="absolute inset-0 overflow-y-auto bg-bg p-4 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <Group icon="list" title="Equipo" count="3 listas">
          <div className="card p-3">
            {([['Marcos', '', '12 ítems · 6,4 kg'], ['Lucía', 't', '9 ítems · 5,1 kg']] as const).map(([n, t, s], i) => (
              <div key={i} className={`row gap10 py-2 ${i < 1 ? 'border-b border-[var(--line)]' : ''}`}>
                <Avatar name={n} tone={t} size={30} />
                <div className="grow">
                  <div className="text-sm">Lista de {n}</div>
                  <div className="faint mono text-[10.5px]">{s}</div>
                </div>
                <Icon name="chevron" size={18} className="text-ink-3" />
              </div>
            ))}
          </div>
        </Group>
        <Group icon="note" title="Notas" count="4">
          <div className="card pin--paper note-md p-3.5 text-[13px]">
            <h4>Plan de cumbre ⛰️</h4>
            <p className="mb-0">
              Salida del refu a las <strong>6:00</strong>. Tramo glaciar con crampones; cuidado en el Paso de Mahoma.
            </p>
          </div>
        </Group>
        <Group icon="pin" title="Mapa" count="2">
          <div className="card overflow-hidden">
            <div className="map h-[120px] rounded-none">
              <div className="map__pin">
                <Icon name="pin" size={22} className="text-terra" />
              </div>
            </div>
            <div className="spread px-3 py-2.5">
              <div className="font-display text-sm">Pico Aneto</div>
              <span className="chip chip--accent">Abrir</span>
            </div>
          </div>
        </Group>
      </div>
    </div>
  );
}

function ChatAside() {
  return (
    <aside className="hidden w-[330px] flex-none flex-col overflow-hidden bg-bg shadow-[inset_1px_0_0_var(--line)] lg:flex">
      <div className="spread flex-none px-4 py-4 shadow-[inset_0_-1px_0_var(--line)]">
        <h3 className="font-display text-[18px]">Chat del grupo</h3>
        <Icon name="users" size={18} className="text-ink-3" />
      </div>
      <div className="grow overflow-y-auto p-4">
        {([['Lucía', 't', '¿Confirmamos el refugio para el viernes?'], ['Iker', 's', 'Yo reservo. Somos 4 ✋']] as const).map(([n, t, m], i) => (
          <div key={i} className="row gap8 mb-3 items-end">
            <Avatar name={n} tone={t} size={26} />
            <div className="max-w-[210px]">
              <div className="faint mono mb-0.5 text-[10px]">{n}</div>
              <div className="rounded-2xl rounded-bl-[5px] bg-bg-3 px-3 py-2 text-sm shadow-[inset_0_0_0_1px_var(--line)]">{m}</div>
            </div>
          </div>
        ))}
        <div className="row justify-end mb-3">
          <div className="max-w-[210px] rounded-2xl rounded-br-[5px] bg-accent px-3 py-2 text-sm text-accent-ink">Pineé mi lista de equipo 👀</div>
        </div>
      </div>
      <div className="row gap8 flex-none px-3.5 py-3 shadow-[inset_0_1px_0_var(--line)]">
        <div className="grow row rounded-2xl bg-bg-3 px-3.5 py-2.5 shadow-[inset_0_0_0_1px_var(--line)]">
          <span className="faint text-sm">Mensaje…</span>
        </div>
        <span className="grid h-[38px] w-[38px] place-items-center rounded-control bg-accent text-accent-ink">
          <Icon name="send" size={18} />
        </span>
      </div>
    </aside>
  );
}

export function BoardScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [view, setView] = useState<View>('wall');

  return (
    <AppShell topbar={{ title: 'Vivac en el Aneto', sub: '14–15 JUN · Benasque, Huesca' }} bareDesktop>
      {/* Cabecera móvil */}
      <header className="flex-none px-4 pt-1 lg:hidden">
        <div className="spread">
          <div className="row gap10">
            <button onClick={() => navigate(-1)} aria-label="Volver">
              <Icon name="back" size={26} />
            </button>
            <div>
              <h3 className="text-[18px]">Vivac en el Aneto</h3>
              <div className="faint mono text-[11px]">14–15 JUN · 4 montañeros</div>
            </div>
          </div>
          <div className="row pr-1">
            {MEMBERS.map(([n, t], i) => (
              <Avatar key={i} name={n} tone={t} size={28} ring style={{ marginLeft: -7 }} />
            ))}
          </div>
        </div>
      </header>

      <div className="flex h-full flex-col lg:flex-row">
        <div className="relative flex flex-1 flex-col overflow-hidden">
          {/* Conmutador de vista */}
          <div className="row gap6 flex-none px-4 pt-3 lg:px-7 lg:pt-5">
            <div className="row gap6 rounded-control bg-bg-2 p-1 shadow-[inset_0_0_0_1px_var(--line)]">
              {(['free', 'wall', 'guided'] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`mono rounded-[9px] px-3 py-1.5 text-[12.5px] capitalize ${
                    view === v ? 'bg-bg-4 text-ink shadow-sm' : 'text-ink-3'
                  }`}
                >
                  {v === 'free' ? 'Mural' : v === 'wall' ? 'Muro' : 'Guiado'}
                </button>
              ))}
            </div>
          </div>
          <div className="relative mt-3 flex-1 overflow-hidden">
            {view === 'free' && <BoardFree />}
            {view === 'wall' && <BoardWall />}
            {view === 'guided' && <BoardGuided />}
            <button className="btn absolute bottom-5 right-4 rounded-[16px] px-4 py-3 shadow">
              <Icon name="plus" size={18} /> Añadir pin
            </button>
          </div>
        </div>
        <ChatAside />
      </div>
    </AppShell>
  );
}
