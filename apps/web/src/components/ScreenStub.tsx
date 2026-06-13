import type { ReactNode } from 'react';

interface Props {
  title: string;
  unit: string;
  children?: ReactNode;
}

/** Marcador de pantalla pendiente. El worker del dominio sustituye el contenido. */
export function ScreenStub({ title, unit, children }: Props) {
  return (
    <section className="flex flex-col gap-3 py-6">
      <p className="eyebrow">{unit}</p>
      <h1 className="text-[26px]">{title}</h1>
      <p className="text-ink-2">
        Pantalla pendiente de implementar. Este stub forma parte del esqueleto cableado: el worker de
        este dominio rellena el contenido reutilizando <code className="font-mono">@/ui</code>, el SDK y
        los stores.
      </p>
      {children}
    </section>
  );
}
