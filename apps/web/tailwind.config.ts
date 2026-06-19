import type { Config } from 'tailwindcss';
import preset from '@yourvivac/tailwind-preset';

// El sistema de diseño es propio (styles/yv.css + tokens del preset). No usamos
// DaisyUI: colisionaba con clases del diseño (.stack, .btn, .card → se apilaban).
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  presets: [preset as Config],
  plugins: [],
};

export default config;
