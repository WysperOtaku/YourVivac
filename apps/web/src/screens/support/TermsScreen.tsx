import { useNavigate } from 'react-router-dom';
import { AppShell } from '@/components/AppShell';
import { Icon } from '@/ui';

const SECTIONS: { h: string; p: string }[] = [
  { h: '1. Aceptación', p: 'Al usar YourVivac aceptas estos términos. Si no estás de acuerdo, no utilices la plataforma.' },
  { h: '2. Tu cuenta', p: 'Eres responsable de la actividad de tu cuenta y de mantener la confidencialidad de tu contraseña. Debes proporcionar información veraz.' },
  { h: '3. Contenido', p: 'Conservas la propiedad del contenido que publicas (salidas, pines, consejos, fotos). Nos concedes una licencia para mostrarlo dentro del servicio. No publiques contenido ilegal, ofensivo o que infrinja derechos de terceros.' },
  { h: '4. Seguridad en montaña', p: 'YourVivac es una herramienta de planificación. La información de rutas, mapas y meteo es orientativa: la decisión y la responsabilidad de salir a la montaña son siempre tuyas. Valora tu nivel y las condiciones.' },
  { h: '5. Guías', p: 'El rol de guía se concede tras verificar la titulación aportada. La aparición como guía no implica respaldo profesional por parte de YourVivac.' },
  { h: '6. Privacidad', p: 'Tratamos tus datos para prestar el servicio. Puedes hacer tu perfil privado y gestionar tus preferencias en Ajustes. No vendemos tus datos personales.' },
  { h: '7. Cambios', p: 'Podemos actualizar estos términos. Te avisaremos de los cambios relevantes. El uso continuado implica su aceptación.' },
];

export function TermsScreen() {
  const navigate = useNavigate();
  return (
    <AppShell topbar={{ title: 'Términos y privacidad', sub: 'Legal' }} mobileFullscreen>
      <div className="mx-auto w-full max-w-2xl px-[18px] pb-12 pt-2 lg:px-7 lg:pt-4">
        <div className="row gap10 pb-3 lg:hidden">
          <button onClick={() => navigate(-1)} aria-label="Volver"><Icon name="back" size={26} /></button>
          <h1 className="text-[22px]">Términos</h1>
        </div>

        <p className="faint mono mb-5 text-[11px]">Última actualización · junio 2026</p>

        <div className="stack gap20">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h3 className="font-display text-[17px]">{s.h}</h3>
              <p className="muted mt-1.5 text-[14px] leading-relaxed">{s.p}</p>
            </section>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
