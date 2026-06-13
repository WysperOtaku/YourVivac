# @yourvivac/mobile — app React Native (Expo)

> **Estado:** scaffold inicial. **No** está incluido en `pnpm-workspace.yaml` todavía
> para no inflar la instalación de cada worker con el toolchain de Expo/React Native.
> Para activarlo: añade `apps/mobile` a `pnpm-workspace.yaml`, ejecuta `pnpm install`
> y luego `pnpm --filter @yourvivac/mobile start`.

Comparte `@yourvivac/types`, `@yourvivac/sdk`, `@yourvivac/utils` y los tokens de
`@yourvivac/design-tokens` con la web. La capa de UI usa **NativeWind** (Tailwind para RN)
con el mismo preset de tokens; el tema se aplica por theme provider (RN no tiene cascada CSS).

## Estructura
- `App.tsx` — root: providers (Query) + navegación.
- `src/navigation/` — stack + bottom tabs (React Navigation).
- `src/theme/` — tokens compartidos + colores por tema.
- `src/screens/` — pantallas núcleo (stubs): Home, Board, Profile.

Workers de móvil: rellenad las pantallas reutilizando stores/sdk y NativeWind.
