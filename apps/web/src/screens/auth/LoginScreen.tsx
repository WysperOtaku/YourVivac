import { Button, Card, Logo } from '@/ui';

// Worker (auth web): implementa login Google + email (oscuro/claro), store auth.
export function LoginScreen() {
  return (
    <div className="grid min-h-full place-items-center p-6">
      <Card className="flex w-full max-w-sm flex-col items-center gap-5 p-8 text-center">
        <Logo size={40} />
        <div>
          <h1 className="text-2xl">Prepara tu próximo vivac</h1>
          <p className="mt-1 text-ink-2">Tablero colaborativo, listas de equipo y mapas, en grupo.</p>
        </div>
        <Button block disabled>
          Continuar con Google
        </Button>
        <p className="eyebrow">auth · pendiente de implementar</p>
      </Card>
    </div>
  );
}
