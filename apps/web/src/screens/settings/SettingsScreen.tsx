import { useUiStore } from '@/stores/uiStore';
import { Card, Toggle } from '@/ui';
import { ScreenStub } from '@/components/ScreenStub';

// Worker (perfil+ajustes): cuenta, preferencias (tema/densidad/unidades/notif), rol guía.
export function SettingsScreen() {
  const { theme, setTheme } = useUiStore();
  return (
    <ScreenStub unit="Ajustes" title="Cuenta y preferencias">
      <Card className="mt-2 flex items-center justify-between p-4">
        <span className="text-ink">Tema oscuro</span>
        <Toggle
          checked={theme === 'dark'}
          onChange={(v) => setTheme(v ? 'dark' : 'light')}
          label="Tema oscuro"
        />
      </Card>
    </ScreenStub>
  );
}
