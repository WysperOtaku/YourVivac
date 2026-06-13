import type { Config } from 'tailwindcss';
import preset from '@yourvivac/tailwind-preset';
import daisyui from 'daisyui';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  presets: [preset as Config],
  plugins: [daisyui],
  daisyui: {
    themes: false, // usamos nuestros tokens vía variables CSS (data-theme dark|light)
    logs: false,
  },
};

export default config;
