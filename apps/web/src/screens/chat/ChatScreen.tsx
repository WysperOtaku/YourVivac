import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { Avatar, Icon } from '@/ui';

function Msg({ who, tone, time, children, me }: { who?: string; tone?: '' | 't' | 's'; time: string; children: React.ReactNode; me?: boolean }) {
  return (
    <div className={`row gap8 mb-3 items-end ${me ? 'flex-row-reverse' : ''}`}>
      {!me && <Avatar name={who ?? ''} tone={tone} size={28} />}
      <div className="max-w-[260px]">
        {!me && <div className="faint mono mb-0.5 ml-1 text-[10px]">{who}</div>}
        <div
          className="px-3.5 py-2.5 text-[14.5px] leading-snug"
          style={{
            borderRadius: 16,
            borderBottomRightRadius: me ? 5 : 16,
            borderBottomLeftRadius: me ? 16 : 5,
            background: me ? 'var(--accent)' : 'var(--bg-3)',
            color: me ? 'var(--accent-ink)' : 'var(--ink)',
            boxShadow: me ? 'none' : 'inset 0 0 0 1px var(--line)',
          }}
        >
          {children}
        </div>
        <div className={`faint mono mt-0.5 text-[9.5px] ${me ? 'text-right' : 'text-left'} mx-1`}>{time}</div>
      </div>
    </div>
  );
}

export function ChatScreen() {
  const navigate = useNavigate();
  return (
    <AppShell topbar={{ title: 'Chat del grupo', sub: 'Vivac en el Aneto' }} bareDesktop>
      <div className="mx-auto flex h-full max-w-3xl flex-col">
        <header className="row gap10 flex-none px-4 pt-2 lg:hidden">
          <button onClick={() => navigate(-1)} aria-label="Volver">
            <Icon name="back" size={26} />
          </button>
          <div>
            <h3 className="text-[18px]">Vivac en el Aneto</h3>
            <div className="faint mono text-[11px]">14–15 JUN · 4 montañeros</div>
          </div>
        </header>

        <div className="grow overflow-y-auto px-4 pt-4">
          <div className="stack items-center mb-4">
            <span className="chip mono" style={{ fontSize: 10 }}>
              HOY
            </span>
          </div>
          <Msg who="Lucía Roldán" tone="t" time="9:12">
            ¿Confirmamos el refugio para el viernes? 🏔️
          </Msg>
          <Msg who="Iker Mendi" tone="s" time="9:14">
            Yo me encargo de reservar. Somos 4, ¿no?
          </Msg>
          <Msg me time="9:15">
            Sí, 4. Acabo de pinear mi lista de equipo en el tablero 👀
          </Msg>
          <div className="row justify-end mb-3">
            <div className="card w-[220px] overflow-hidden bg-bg-3">
              <div className="pin__head">
                <Icon name="list" size={12} /> Pin · Lista de Marcos
              </div>
              <div className="px-3 pb-3 pt-1">
                {['Saco -5 ºC', 'Esterilla', 'Hornillo'].map((t, i) => (
                  <div key={i} className="row gap8 py-0.5">
                    <span className="gear-check" style={{ width: 13, height: 13 }} />
                    <span className="grow text-[12.5px]">{t}</span>
                  </div>
                ))}
                <button className="btn btn--ghost btn--block mt-2 py-1.5 text-xs">Abrir en el tablero</button>
              </div>
            </div>
          </div>
          <Msg who="Ana Gil" time="9:20">
            ¡Genial! Yo añadí el mapa con la ubicación del vivac 📍
          </Msg>
        </div>

        <div className="row gap10 flex-none bg-bg-2 px-3.5 py-2.5 shadow-[inset_0_1px_0_var(--line)]">
          <Icon name="plus" size={22} className="text-ink-3" />
          <div className="grow row rounded-[18px] bg-bg-3 px-3.5 py-2.5 shadow-[inset_0_0_0_1px_var(--line)]">
            <span className="faint text-[14.5px]">Mensaje al grupo…</span>
          </div>
          <span className="grid h-[38px] w-[38px] place-items-center rounded-control bg-accent text-accent-ink">
            <Icon name="send" size={18} />
          </span>
        </div>
      </div>
    </AppShell>
  );
}
