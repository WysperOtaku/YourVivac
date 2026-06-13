# YourVivac — Guía de implementación de diseño

> **Importante · alcance.** Este documento describe **únicamente cómo implementar el diseño** (UI, tokens y componentes visuales). **No** contiene arquitectura de la aplicación, modelo de datos, lógica de negocio, autenticación, APIs ni decisiones de desarrollo: **todo eso se define en otras guías**. Lo único fijado a nivel técnico es que el proyecto será un **monorepo con Turborepo** que usa **React** (web) y **React Native** (móvil), con **Tailwind** siempre que sea posible (NativeWind en móvil).

Cómo traducir el diseño de YourVivac a código: tokens, componentes y pantallas. Referencia única para el equipo que construirá la interfaz.

---

## 1. Alcance de este documento

**Sí cubre:**
- Tokens de diseño: color, tipografía, espaciado, radios, sombras.
- Inventario de componentes de UI y su equivalencia web / móvil.
- Inventario de pantallas y estados.
- Tipos de pin del tablero y sus variantes.
- Temas claro / oscuro y niveles de densidad.
- Dónde vive el diseño dentro del monorepo.

**No cubre (se hace en otras guías):**
- Arquitectura de backend, base de datos o APIs.
- Lógica de negocio, estados de servidor, validaciones.
- Autenticación real (Google OAuth) y permisos.
- El "scrapper" de tiendas y su integración.
- Routing, gestión de estado o librerías concretas.
- CI/CD, testing, despliegue.

**Entregables de diseño:**

| Archivo | Qué es |
|---|---|
| `YourVivac.html` | Lienzo navegable con todas las pantallas (móvil + escritorio), temas y tweaks. Es la **fuente visual de verdad**. |
| `yourvivac.css` | Hoja con todos los **tokens** (variables CSS) y utilidades base. Punto de partida del preset de Tailwind. |
| Esta guía | Documento de referencia para implementar el diseño. |

---

## 2. Estructura del monorepo (dónde vive el diseño)

Lo único fijado técnicamente. Se muestra **solo para situar dónde vive el diseño**; la organización interna se decide en desarrollo.

**Stack fijado:** Turborepo · React (web) · React Native (móvil) · Tailwind en web y NativeWind (Tailwind para RN) en móvil.

```
yourvivac/
├─ apps/
│  ├─ web/                # React — consume tokens + UI web (Tailwind)
│  └─ mobile/             # React Native — mismos tokens (NativeWind)
├─ packages/
│  ├─ design-tokens/      # Fuente única: color, tipografía, espaciado…
│  ├─ tailwind-preset/    # Preset de Tailwind generado desde los tokens
│  ├─ ui-web/             # Componentes React (web)
│  └─ ui-native/          # Componentes React Native
├─ turbo.json
└─ package.json
```

**Principio: una sola fuente de tokens.** Los valores de `yourvivac.css` se trasladan a `packages/design-tokens` como objeto compartido y, desde ahí, se genera el **preset de Tailwind**. Web usa Tailwind y móvil usa NativeWind, pero **ambos leen los mismos tokens**.

---

## 3. Color

Paleta "bosque nocturno" con acento verde salvia y terracota para el rol de guía y destacados. Cada token existe en **tema oscuro (principal)** y **claro**.

### Tema oscuro (por defecto)

| Token | Hex | | Token | Hex |
|---|---|---|---|---|
| `bg` | `#0e1411` | | `ink` | `#e9ece3` |
| `bg-2` | `#141d17` | | `ink-2` | `#a9b4a6` |
| `bg-3` | `#1c271f` | | `ink-3` | `#76836f` |
| `bg-4` | `#243029` | | `accent` | `#a8d77c` |
| `accent-2` | `#86b75f` | | `accent-ink` | `#11160f` |
| `terra` | `#d68a57` | | `terra-2` | `#b06a3c` |
| `sky` | `#79b8c4` | | `paper` | `#e7ddc6` |
| `line` | `rgba(180,205,180,0.13)` | | `board` | `#232c22` |

### Tema claro

| Token | Hex | | Token | Hex |
|---|---|---|---|---|
| `bg` | `#ece5d6` | | `ink` | `#1d241d` |
| `bg-2` | `#f4eee2` | | `ink-2` | `#515a4c` |
| `bg-3` | `#fbf7ee` | | `ink-3` | `#8a9082` |
| `bg-4` | `#ffffff` | | `accent` | `#3f7a4d` |
| `accent-2` | `#326140` | | `accent-ink` | `#f7f4ea` |
| `terra` | `#b96e3c` | | `terra-2` | `#9a5829` |
| `sky` | `#3d7d8c` | | `paper` | `#f2ead4` |

### Roles semánticos

| Token | Uso |
|---|---|
| `accent` | Acción primaria, estado activo, marca, métricas de "vivac". |
| `terra` | Rol de guía certificado, destacados, avisos, badges. |
| `sky` | Mapas, rutas, enlaces y elementos de ubicación. |
| `paper` | Fondo de las notas de papel pineadas en el tablero. |
| `bg → bg-4` | Superficies por elevación (fondo → tarjeta → control). |
| `ink → ink-3` | Texto por jerarquía (principal → secundario → débil). |

---

## 4. Tipografía

Serif editorial con carácter para títulos, serif de lectura para cuerpo y monoespaciada para datos técnicos (altitud, distancia, coordenadas, tiendas). Tres parejas conmutables vía tweak.

- **Display · Young Serif** — títulos, nombres de salida, cifras grandes.
- **Body · Newsreader** — texto corrido, descripciones, markdown.
- **Mono · Spline Sans Mono** — datos, etiquetas, coordenadas.

### Variables y parejas

| Variable | Pareja A (def.) | Pareja B | Pareja C |
|---|---|---|---|
| `--font-display` | Young Serif | Newsreader | DM Serif Display |
| `--font-body` | Newsreader | Newsreader | Newsreader |
| `--font-mono` | Spline Sans Mono | Spline Sans Mono | Spline Sans Mono |

La pareja se cambia con `data-type="a|b|c"` en el contenedor raíz. En Tailwind se exponen como `font-display`, `font-body` y `font-mono`.

### Escala recomendada

| Rol | Móvil | Escritorio | Familia |
|---|---|---|---|
| Título de pantalla (H1) | 25–27 | 25 | display |
| Título de tarjeta (H3) | 17–21 | 18–22 | display |
| Cuerpo | 14.5–16.5 | 15–16.5 | body |
| Eyebrow / etiqueta | 11–12 | 11–12 | mono · uppercase · .16em |
| Dato técnico | 10–16 | 10–30 | mono · tabular-nums |

---

## 5. Espaciado y densidad

El espaciado escala con un único multiplicador `--d`, controlado por el tweak de densidad.

| Densidad | `--d` | Uso |
|---|---|---|
| Compacto | 0.82 | Listas densas, usuarios avanzados, escritorio con mucha info. |
| Regular (def.) | 1.0 | Valor por defecto en todas las plataformas. |
| Cómodo | 1.18 | Más aire, mejor accesibilidad táctil. |

**Reglas base:**
- Padding de pantalla móvil: `18px` lateral.
- Gap entre tarjetas: `12–16px`.
- Hit target mínimo táctil: **44×44px**.
- Layout siempre con **flex / grid + gap**, nunca márgenes sueltos entre hermanos.

---

## 6. Radios, sombras e iconografía

**Radios:**

| Elemento | Radio |
|---|---|
| Tarjeta | 18px |
| Input / control | 12px |
| Pin del tablero | 10px |
| Botón / chip | 999px |
| Botón cuadrado (FAB, icon) | 12–16px |

**Sombras:** `--shadow` (pines, hojas modales, elevados) · `--shadow-sm` (tarjetas flotantes, controles sobre mapa). Bordes: `--line` / `--line-2`.

**Iconografía:** set lineal propio, trazo `1.6`, `stroke-linecap/join: round`, sin relleno (salvo el pin de mapa). Tamaños `18 / 22 / 26px`. ~50 iconos (`home, compass, pin, list, note, link, image, route, shield, trophy…`). En implementación se sustituyen por un set equivalente (p. ej. Lucide) manteniendo grosor y estilo.

---

## 7. Etiquetas de tienda

Cada producto de una lista de equipo puede enlazar a una tienda. La etiqueta usa un color identificativo por comercio (texto monoespaciado + borde sutil).

| Tienda | Color |
|---|---|
| Amazon | `#ff9900` |
| Decathlon | `#3779c2` |
| Deporvillage | `#e2483a` |
| Barrabés | `#d8b24a` |
| Forum Sport | `#6aa1d8` |
| Coleman | `#d35b4a` |

El conjunto es **ampliable**: el buscador unificado de tiendas crece a medida que se incorporen más comercios. La integración real (scrapper) queda fuera de esta guía.

---

## 8. Mapa de componentes (HTML → React / React Native)

Componentes en `packages/ui-web` y `packages/ui-native` compartiendo tokens.

| Componente | Descripción | Web | Móvil (RN) |
|---|---|---|---|
| Logo / Mark | Pico + anillos de nivel · wordmark | `<svg>` | `react-native-svg` |
| Button | primary · ghost · terra · block · lg | `<button>` | `Pressable` |
| Chip / Pill | neutro · accent · terra · guía | `<span>` | `View+Text` |
| Card | superficie con borde interior | `<div>` | `View` |
| Avatar | iniciales · tonos · ring | `<div>` | `View+Text` |
| Icon | set lineal, 3 tamaños | SVG / Lucide | `react-native-svg` |
| AppBar / TabBar | cabecera + navegación inferior | `<nav>` | `SafeArea` + tabs |
| Field / Input | campo etiquetado | `<input>` | `TextInput` |
| Toggle | interruptor on/off | `<button>` | `Switch` estilado |
| TripCard | tarjeta de salida (carrusel/grid) | compartido (tokens + layout) | compartido |
| FeedCard | actividad de un usuario | compartido | compartido |
| TipCard | tarjeta de consejo | compartido | compartido |
| Pin (Note/Photo/Link/List/Map/Text) | elementos del tablero | ver §10 | ver §10 |
| GearRow + Store tag | fila de equipo con tienda | compartido | compartido |
| Stat | cifra + etiqueta (contadores) | compartido | compartido |
| Modal / Bottom-sheet | hoja inferior sobre fondo atenuado | `dialog`/portal | `Modal` + gesto |

**Markdown:** las notas de texto del tablero y los consejos se escriben en **Markdown**. El diseño define los estilos de render (`.note-md`): H4, párrafo, listas, `code` y enlaces. La librería de parseo se elige en desarrollo.

---

## 9. Inventario de pantallas

Todas existen en el lienzo `YourVivac.html`. Móvil es la referencia principal; escritorio es la adaptación.

**Acceso:** `login-dark` / `login-light` — Auth Google, oscuro y claro.

**Núcleo:**
- `home-m` / `home-d` — Inicio: feed, salidas, ranking.
- `crear-m` — Crear salida: detalles + invitar.
- `board-free` / `board-wall` / `board-guided` — Tablero: 3 variantes + escritorio.
- `pin-chat` — Chat del grupo: mensajes + pin compartido.
- `perfil-user` / `perfil-guide` — Perfil: contadores + rol guía.

**Descubrir:**
- `explorar` — Salidas y consejos públicos.
- `equipo` — Mi equipo: biblioteca de listas.
- `consejos` — Feed de artículos.
- `publicar` — Modal: editor Markdown.

**Cuenta y administración:**
- `ajustes` — Cuenta, preferencias, rol guía.
- `admin` — Panel: KPIs, verificar guías, reportes.

---

## 10. Tipos de pin

El tablero es un mural colaborativo donde cada miembro añade pines. Seis tipos, cada uno con su "chincheta" de color y cabecera (autor + tipo).

| Pin | Chincheta | Contenido |
|---|---|---|
| **Nota** | terra | Texto en **Markdown** sobre fondo de papel. |
| **Foto** | sky | Imagen + autor y fecha. |
| **Enlace** | terra | Previsualización de URL (título + dominio). |
| **Lista** | accent | Lista de equipo con productos enlazados a tiendas. Cualquiera añade la suya. |
| **Mapa** | sky | Ubicación de Google Maps con coordenadas y ruta. |
| **Texto** | terra | Nota rápida de color (avisos, coche compartido…). |

**Variantes de presentación del tablero** (tweak `board`):
- **Mural corcho libre** — pines colocables con rotación natural (referencia principal en móvil).
- **Muro ordenado** — masonry tipo tablón, ideal para densidad y escritorio.
- **Feed guiado** — pines agrupados por tipo (Equipo, Fotos, Notas, Mapa), para lectura rápida.

---

## 11. Temas y paridad entre plataformas

**Conmutadores de raíz:**

| Atributo | Valores | Efecto |
|---|---|---|
| `data-theme` | dark · light | Cambia toda la paleta de tokens. |
| `data-type` | a · b · c | Pareja tipográfica. |
| `data-density` | compact · regular · comfy | Factor `--d` de espaciado. |
| `board` | free · wall · guided | Disposición del tablero. |

**Web vs. React Native:** RN no tiene cascada CSS. Los tokens se comparten como **objeto JS** desde `design-tokens`; en web alimentan el **preset de Tailwind** y en móvil **NativeWind**. El cambio de tema se hace por proveedor de tema, no por `data-*`.

---

## 12. Assets pendientes

En el diseño, las imágenes son **marcadores** (placeholder rayado con etiqueta). Falta aportar:
- **Fotografías** de montaña / vivac (portadas de salida, feed, consejos, login).
- **Logos de tienda** reales (Amazon, Decathlon, Deporvillage, Barrabés, Forum, Coleman…).
- **Mapas reales** (el diseño usa una retícula simulada; integración cartográfica en desarrollo).
- **Avatares** de usuario (hoy iniciales sobre disco de color como fallback).

Marcador en el código: clase `.imgslot` (con variante `.topo`). Cada uno lleva una etiqueta describiendo qué imagen debe ir.

---

## 13. Checklist de handoff de diseño

- [ ] Portar tokens de `yourvivac.css` a `packages/design-tokens`.
- [ ] Generar el **preset de Tailwind** desde los tokens (web) y configurar **NativeWind** (móvil).
- [ ] Cargar fuentes: Young Serif, Newsreader, DM Serif Display, Spline Sans Mono.
- [ ] Construir componentes base (Button, Card, Chip, Avatar, Icon, Field) en `ui-web` y `ui-native`.
- [ ] Implementar tema claro/oscuro mediante proveedor de tema compartido.
- [ ] Reemplazar marcadores `.imgslot` por imágenes reales.
- [ ] Sustituir el set de iconos por uno equivalente (mismo grosor y estilo).
- [ ] Validar densidad y hit targets (mín. 44px) en dispositivo real.

> **Recordatorio.** Esta guía es **solo la implementación del diseño**. Arquitectura, backend y lógica viven en las guías de Desarrollo, Agregador y Lógica/Testing/Workflow.
