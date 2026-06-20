import { create } from 'zustand';
import type { Density, FontPair, ThemeName } from '@yourvivac/types';

interface UiState {
  theme: ThemeName;
  fontPair: FontPair;
  density: Density;
  /** True si el tema lo fijó el usuario (si no, sigue al navegador). */
  themeUserSet: boolean;
  setTheme: (t: ThemeName) => void;
  toggleTheme: () => void;
  setFontPair: (f: FontPair) => void;
  setDensity: (d: Density) => void;
}

const THEME_KEY = 'yv-theme';

function apply(attr: string, value: string) {
  if (typeof document !== 'undefined') document.documentElement.setAttribute(attr, value);
}

/** Tema del sistema (preferencia del navegador). */
function systemTheme(): ThemeName {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'dark';
}

/** Inicial: la elección guardada del usuario o, si no hay, la del navegador. */
function initialTheme(): { theme: ThemeName; userSet: boolean } {
  const saved = typeof localStorage !== 'undefined' ? localStorage.getItem(THEME_KEY) : null;
  if (saved === 'dark' || saved === 'light') return { theme: saved, userSet: true };
  return { theme: systemTheme(), userSet: false };
}

const init = initialTheme();

/** Preferencias de presentación; reflejan los conmutadores data-* del diseño. */
export const useUiStore = create<UiState>((set, get) => ({
  theme: init.theme,
  fontPair: 'a',
  density: 'regular',
  themeUserSet: init.userSet,
  setTheme: (theme) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(THEME_KEY, theme);
    apply('data-theme', theme);
    set({ theme, themeUserSet: true });
  },
  toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
  setFontPair: (fontPair) => {
    apply('data-type', fontPair);
    set({ fontPair });
  },
  setDensity: (density) => {
    apply('data-density', density);
    set({ density });
  },
}));

// Si el usuario no ha fijado tema, sigue los cambios del navegador en vivo.
if (typeof window !== 'undefined' && window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const s = useUiStore.getState();
    if (!s.themeUserSet) {
      const next: ThemeName = e.matches ? 'dark' : 'light';
      apply('data-theme', next);
      useUiStore.setState({ theme: next });
    }
  });
}
