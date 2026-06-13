<div align="center">

# 🏔️ YourVivac

**El campamento base para preparar excursiones y vivacs en grupo.**

Crea una salida, reúne a tu gente y montad juntos el tablero: rutas, listas de equipo, mapas y consejos en un mismo sitio.

`Turborepo` · `React` · `React Native` · `Express` · `MongoDB` · `TypeScript`

</div>

---

## ¿Qué es YourVivac?

YourVivac es una plataforma (web + móvil) para planificar excursiones de montaña de forma colaborativa. Cada salida tiene un **tablero tipo mural** donde el grupo añade pines —notas en Markdown, fotos, enlaces, mapas y **listas de equipo**— además de un **chat de grupo**. Las listas de equipo enlazan productos de varias tiendas (Amazon, Decathlon, Deporvillage, Barrabés, Forum Sport, Coleman…) a través de un servicio de **búsqueda agregada**. La comunidad comparte salidas públicas y consejos, y los **guías de montaña certificados** reciben un rol especial para ayudar a montar excursiones.

### Funcionalidades núcleo

- 🔐 **Acceso** con Google (OAuth) o email.
- 🗺️ **Salidas** — crear excursión, invitar amigos, fechas, dificultad y ubicación.
- 📌 **Tablero colaborativo** — pines de nota (Markdown), foto, enlace, lista, mapa y texto.
- 💬 **Chat de grupo** por salida, con pines compartibles.
- 🎒 **Listas de equipo** con productos enlazados a tiendas y buscador unificado.
- 🧭 **Explorar** — salidas y consejos públicos de la comunidad.
- 👤 **Perfil** con contadores (salidas, vivacs, desnivel) y rol de guía.
- 🛡️ **Panel de administración** — verificación de guías, reportes y analíticas.

---

## Estado del proyecto

> 🏗️ **Fase actual: construcción.** El **andamiaje (base) está montado y compila en verde**: monorepo
> Turborepo + pnpm, packages compartidos (`types`, `utils`, `validation`, `sdk`, `design-tokens`,
> `tailwind-preset`), esqueleto del **API** (cadena de middlewares, todos los modelos Mongoose, rutas
> de cada dominio cableadas) y de la **web** (Vite + Tailwind/DaisyUI con los tokens, primitivos de UI,
> stores, router y pantallas). Los dominios concretos (lógica de cada endpoint y contenido de cada
> pantalla) se rellenan por módulos. `apps/mobile` está scaffoldeado (ver su README).
>
> Verificación de la base: `pnpm install && pnpm -r typecheck && pnpm -r test && pnpm build` en verde.

---

## Arquitectura

Monorepo gestionado con **Turborepo** + **pnpm workspaces**. El microservicio de búsqueda agregada de tiendas vive en un **repositorio aparte** (`vivac-aggregator`).

```
yourvivac/
├─ apps/
│  ├─ web/            # React + Vite + Tailwind + DaisyUI
│  ├─ mobile/         # React Native + NativeWind
│  └─ api/            # Express + Mongoose + workers (BullMQ)
├─ packages/
│  ├─ types/          # Tipos TS compartidos
│  ├─ validation/     # Esquemas Zod (request + forms)
│  ├─ sdk/            # Cliente Axios tipado de la API
│  └─ utils/          # Helpers puros
└─ docs/              # 📚 Documentación (ver abajo)
```

### Stack

| Capa                     | Tecnologías                                                        |
| ------------------------ | ------------------------------------------------------------------ |
| **Web**                  | React · Vite · Zustand · React Router · Tailwind + DaisyUI · Axios |
| **Móvil**                | React Native (Expo) · NativeWind · Zustand · React Navigation      |
| **API**                  | Node · Express · Mongoose · MongoDB · JWT · Zod · Socket.IO        |
| **Workers**              | BullMQ + Redis (imágenes, emails, notificaciones, analíticas)      |
| **Auth / media / email** | Firebase (OAuth) · Sharp + Cloudinary · Nodemailer + Brevo         |
| **Agregador**            | Express + Crawlee + Redis · _repo aparte_                          |
| **Infra**                | Railway · Cloudinary · Brevo · Firebase                            |

---

## 📚 Documentación

Toda la documentación vive en [`docs/`](./docs). Punto de entrada navegable: [`docs/index.html`](./docs/index.html).

| #   | Guía                                                                                                 | Contenido                                                 |
| --- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 0   | [Diseño navegable](./docs/YourVivac.html)                                                            | Todas las pantallas (móvil + escritorio), temas y tweaks. |
| 1   | [Implementación de diseño](./docs/YourVivac%20—%20Guía%20de%20implementación.md)                     | Tokens, componentes y pantallas.                          |
| 2   | [Desarrollo](./docs/YourVivac%20—%20Guía%20de%20desarrollo.md)                                       | Stack, monorepo, modelo de datos y endpoints.             |
| 3   | [Agregador de tiendas (Cordal)](./docs/YourVivac%20—%20Guía%20del%20agregador%20de%20tiendas.md)     | Scraping con Crawlee, caché y matching.                   |
| 4   | [Lógica, testing y workflow](./docs/YourVivac%20—%20Guía%20de%20lógica,%20testing%20y%20workflow.md) | Casos de uso, Jest + Playwright, CI/CD y contribución.    |

Cada guía está en **`.md`** (lectura / agentes) y **`.html`** (revisión en pantalla).

---

## Primeros pasos

> ⚙️ Pendiente de la fase de implementación. El flujo previsto:

```bash
# Requisitos: Node ≥ 20, pnpm ≥ 9
pnpm install            # instala dependencias del monorepo
pnpm dev                # levanta apps en desarrollo (turbo)
pnpm build              # build de producción
pnpm test               # tests unitarios e integración (Jest)
pnpm test:e2e           # tests end-to-end (Playwright)
pnpm lint               # ESLint + Prettier
```

Las variables de entorno necesarias están listadas en la [Guía de desarrollo](./docs/YourVivac%20—%20Guía%20de%20desarrollo.md#16-variables-de-entorno).

---

## Cómo contribuir

El flujo completo (ramas, convenciones, pipeline y Definition of Done) está en la [Guía de lógica, testing y workflow](./docs/YourVivac%20—%20Guía%20de%20lógica,%20testing%20y%20workflow.md). En resumen:

1. Define el **caso de uso** (actor · entrada · reglas · salida · errores).
2. Actualiza los contratos compartidos (`types` · `validation` · `sdk`).
3. Implementa backend (modelo → servicio → ruta) y frontend (sdk → store → componente) **con tests**.
4. Abre una PR: CI verde + 1 review. Conventional Commits.

---

<div align="center">
<sub>YourVivac · planifica tu vivac, reúne a tu gente.</sub>
</div>
