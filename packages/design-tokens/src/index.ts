// @yourvivac/design-tokens — fuente única de tokens (portados de docs/yourvivac.css).
// Web los consume vía tailwind-preset; móvil vía NativeWind + theme provider.

export const palette = {
  dark: {
    bg: '#0e1411',
    'bg-2': '#141d17',
    'bg-3': '#1c271f',
    'bg-4': '#243029',
    ink: '#e9ece3',
    'ink-2': '#a9b4a6',
    'ink-3': '#76836f',
    line: 'rgba(180,205,180,0.13)',
    'line-2': 'rgba(180,205,180,0.22)',
    accent: '#a8d77c',
    'accent-2': '#86b75f',
    'accent-ink': '#11160f',
    terra: '#d68a57',
    'terra-2': '#b06a3c',
    sky: '#79b8c4',
    paper: '#e7ddc6',
    'paper-ink': '#2c2519',
    board: '#232c22',
  },
  light: {
    bg: '#ece5d6',
    'bg-2': '#f4eee2',
    'bg-3': '#fbf7ee',
    'bg-4': '#ffffff',
    ink: '#1d241d',
    'ink-2': '#515a4c',
    'ink-3': '#8a9082',
    line: 'rgba(40,52,35,0.14)',
    'line-2': 'rgba(40,52,35,0.24)',
    accent: '#3f7a4d',
    'accent-2': '#326140',
    'accent-ink': '#f7f4ea',
    terra: '#b96e3c',
    'terra-2': '#9a5829',
    sky: '#3d7d8c',
    paper: '#f2ead4',
    'paper-ink': '#3a3120',
    board: '#d9cdb0',
  },
} as const;

/** Colores identificativos por tienda (Guía de implementación §7). */
export const storeColors = {
  amazon: '#ff9900',
  decathlon: '#3779c2',
  deporvillage: '#e2483a',
  barrabes: '#d8b24a',
  forum: '#6aa1d8',
  coleman: '#d35b4a',
} as const;

export const fonts = {
  display: '"Young Serif", Georgia, serif',
  body: '"Newsreader", Georgia, serif',
  mono: '"Spline Sans Mono", ui-monospace, "SF Mono", Menlo, monospace',
} as const;

/** Parejas tipográficas conmutables (data-type a|b|c). */
export const fontPairs = {
  a: { display: '"Young Serif", Georgia, serif', body: fonts.body, mono: fonts.mono },
  b: { display: '"Newsreader", Georgia, serif', body: fonts.body, mono: fonts.mono },
  c: { display: '"DM Serif Display", Georgia, serif', body: fonts.body, mono: fonts.mono },
} as const;

/** Multiplicador de densidad (--d). */
export const density = {
  compact: 0.82,
  regular: 1,
  comfy: 1.18,
} as const;

export const radii = {
  card: '18px',
  control: '12px',
  pin: '10px',
  pill: '999px',
  square: '14px',
} as const;

export const shadows = {
  dark: {
    DEFAULT: '0 2px 4px rgba(0,0,0,.35), 0 12px 34px rgba(0,0,0,.34)',
    sm: '0 1px 2px rgba(0,0,0,.35), 0 4px 14px rgba(0,0,0,.28)',
  },
  light: {
    DEFAULT: '0 2px 4px rgba(60,48,28,.10), 0 14px 36px rgba(60,48,28,.13)',
    sm: '0 1px 2px rgba(60,48,28,.10), 0 5px 16px rgba(60,48,28,.10)',
  },
} as const;

export const fontSizes = {
  h1: '25px',
  h3: '20px',
  body: '16px',
  eyebrow: '11px',
  data: '13px',
} as const;

export type ThemeName = keyof typeof palette;
export type Density = keyof typeof density;
export type FontPairKey = keyof typeof fontPairs;
export type StoreColorKey = keyof typeof storeColors;
export type ColorToken = keyof (typeof palette)['dark'];

export const tokens = {
  palette,
  storeColors,
  fonts,
  fontPairs,
  density,
  radii,
  shadows,
  fontSizes,
} as const;

export default tokens;
