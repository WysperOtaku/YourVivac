// @yourvivac/tailwind-preset — preset de Tailwind generado desde design-tokens.
// Los colores apuntan a variables CSS (definidas en tokens.css) para que el
// cambio de tema funcione por `data-theme="dark|light"`.

import { radii, storeColors } from '@yourvivac/design-tokens';
import type { Config } from 'tailwindcss';

const colorVar = (name: string) => `var(--${name})`;

const preset: Partial<Config> = {
  theme: {
    extend: {
      colors: {
        bg: colorVar('bg'),
        'bg-2': colorVar('bg-2'),
        'bg-3': colorVar('bg-3'),
        'bg-4': colorVar('bg-4'),
        ink: colorVar('ink'),
        'ink-2': colorVar('ink-2'),
        'ink-3': colorVar('ink-3'),
        line: colorVar('line'),
        'line-2': colorVar('line-2'),
        accent: colorVar('accent'),
        'accent-2': colorVar('accent-2'),
        'accent-ink': colorVar('accent-ink'),
        terra: colorVar('terra'),
        'terra-2': colorVar('terra-2'),
        sky: colorVar('sky'),
        paper: colorVar('paper'),
        'paper-ink': colorVar('paper-ink'),
        board: colorVar('board'),
        store: { ...storeColors },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      borderRadius: {
        card: radii.card,
        control: radii.control,
        pin: radii.pin,
        pill: radii.pill,
        square: radii.square,
      },
      boxShadow: {
        DEFAULT: 'var(--shadow)',
        sm: 'var(--shadow-sm)',
      },
      letterSpacing: {
        eyebrow: '0.16em',
      },
    },
  },
  plugins: [],
};

export default preset;
