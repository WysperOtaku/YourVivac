import { create } from 'zustand';
import type { Density, FontPair, ThemeName } from '@yourvivac/types';

interface UiState {
  theme: ThemeName;
  fontPair: FontPair;
  density: Density;
  setTheme: (t: ThemeName) => void;
  setFontPair: (f: FontPair) => void;
  setDensity: (d: Density) => void;
}

function apply(attr: string, value: string) {
  if (typeof document !== 'undefined') document.documentElement.setAttribute(attr, value);
}

/** Preferencias de presentación; reflejan los conmutadores data-* del diseño. */
export const useUiStore = create<UiState>((set) => ({
  theme: 'dark',
  fontPair: 'a',
  density: 'regular',
  setTheme: (theme) => {
    apply('data-theme', theme);
    set({ theme });
  },
  setFontPair: (fontPair) => {
    apply('data-type', fontPair);
    set({ fontPair });
  },
  setDensity: (density) => {
    apply('data-density', density);
    set({ density });
  },
}));
