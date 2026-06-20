import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { Icon } from '@/ui';

const FAQ: { q: string; a: string }[] = [
  { q: '¿Cómo creo una salida?', a: 'Pulsa “Nueva salida” (botón + en la barra inferior o en el rail), rellena nombre, fechas, lugar y dificultad, invita a tu gente y continúa al tablero.' },
  { q: '¿Qué es el tablero?', a: 'Es el espacio colaborativo de cada salida: pines de notas, fotos, enlaces, mapas y listas de equipo. En escritorio puedes arrastrarlos libremente; en móvil se reordenan por intercambio.' },
  { q: '¿Cómo añado material a una lista?', a: 'En “Mi equipo” crea una lista, añade ítems a mano o búscalos en las tiendas (Amazon, Decathlon, Deporvillage, Barrabés, Forum y Coleman) y se añaden con su precio y peso.' },
  { q: '¿Cómo me hago guía?', a: 'En Ajustes → “Solicitar rol de guía”, sube tu titulación y documentación. Un administrador la revisa y, si se aprueba, obtienes la insignia de guía.' },
  { q: '¿Quién ve mis salidas?', a: 'Cada salida tiene visibilidad privada o pública. Las públicas aparecen en Explorar. Puedes elegir la visibilidad por defecto en Ajustes → Preferencias.' },
  { q: '¿Cómo cambio mi contraseña o email?', a: 'En Ajustes → Privacidad y seguridad puedes cambiar tu email, tu contraseña y si tu perfil es público o privado.' },
];

export function HelpScreen() {
  const navigate = useNavigate();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <AppShell topbar={{ title: 'Centro de ayuda', sub: 'Soporte' }} mobileFullscreen>
      <div className="mx-auto w-full max-w-2xl px-[18px] pb-12 pt-2 lg:px-7 lg:pt-4">
        <div className="row gap10 pb-3 lg:hidden">
          <button onClick={() => navigate(-1)} aria-label="Volver"><Icon name="back" size={26} /></button>
          <h1 className="text-[22px]">Centro de ayuda</h1>
        </div>

        <p className="muted mb-4 text-[14.5px]">Preguntas frecuentes sobre YourVivac.</p>

        <div className="stack gap10">
          {FAQ.map((f, i) => (
            <div key={i} className="card overflow-hidden">
              <button className="spread w-full px-4 py-3.5 text-left" onClick={() => setOpen((o) => (o === i ? null : i))}>
                <span className="font-display text-[16px]">{f.q}</span>
                <Icon name={open === i ? 'chevdown' : 'chevron'} size={18} className="text-ink-3" />
              </button>
              {open === i && <p className="muted border-t border-[var(--line)] px-4 py-3.5 text-[14px] leading-relaxed">{f.a}</p>}
            </div>
          ))}
        </div>

        <div className="card mt-5 bg-bg-3 p-4">
          <div className="row gap8">
            <Icon name="chat" size={18} className="text-accent" />
            <strong className="text-[14.5px]">¿No encuentras lo que buscas?</strong>
          </div>
          <p className="faint mt-1.5 text-[13px]">Escríbenos a <span className="accent">hola@yourvivac.app</span> y te ayudamos.</p>
        </div>
      </div>
    </AppShell>
  );
}
