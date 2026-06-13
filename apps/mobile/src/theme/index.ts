import { palette, fonts } from '@yourvivac/design-tokens';
import type { ThemeName } from '@yourvivac/types';

/** Tokens resueltos por tema (RN no tiene variables CSS: se inyectan por provider). */
export function getTheme(name: ThemeName) {
  return { colors: palette[name], fonts };
}

export type Theme = ReturnType<typeof getTheme>;
