# YourVivac — Guía de desarrollo

El plano técnico de YourVivac: stack, estructura del monorepo, librerías, modelo de datos, endpoints e infraestructura. Pensada para que un equipo (o un agente) la lea y empiece a implementar.

> **Documento hermano.** Esta guía cubre el **desarrollo**. El diseño visual (tokens, componentes, pantallas) vive en la *Guía de implementación de diseño*. La lógica de negocio, testing y workflow están en la *Guía de lógica, testing y workflow*. El scraping está en la *Guía del agregador de tiendas*.

---

## 1. Cómo usar esta guía

Define el **stack al 100%**, la organización del código y los contratos (modelo de datos + endpoints) necesarios para construir YourVivac de principio a fin.

**Decisiones cerradas:**
- Monorepo **Turborepo** + pnpm workspaces.
- **TypeScript** en todo el proyecto, sin excepción.
- Stack de frontend, backend e infraestructura (sección 2).
- Modelo de datos MongoDB y endpoints (secciones 11–12).

**A concretar en implementación:**
- Nombres exactos de carpetas/archivos internos.
- Lógica de negocio detallada de cada servicio (ver guía de Lógica).
- Tests, CI/CD y observabilidad fina (ver guía de Lógica/Testing).
- Selectores de scraping concretos por tienda (ver guía del Agregador).

---

## 2. Stack global

| Capa | Tecnologías |
|---|---|
| **Monorepo** | Turborepo · pnpm workspaces · TypeScript |
| **Web** | React · Vite · Zustand · React Router · Tailwind + DaisyUI · Axios |
| **Móvil** | React Native (Expo) · NativeWind · Zustand · React Navigation · Axios |
| **API** | Node · Express · Mongoose · MongoDB · JWT · Zod |
| **Realtime** | Socket.IO (chat de grupo + colaboración del tablero) |
| **Workers / colas** | BullMQ + Redis (imágenes, emails, notificaciones, analíticas) |
| **Auth** | Firebase (OAuth Google) · bcrypt · JWT access/refresh |
| **Imágenes** | Sharp (optimización) · Cloudinary (almacenar/servir) · moderación en worker |
| **Email** | Nodemailer + Brevo (transport) |
| **Logs** | Pino (+ pino-http, pino-pretty en dev) |
| **Microservicio** | Express + TS · Redis (cache) · scraping/APIs de tiendas · *repo aparte* |
| **Infra** | Railway (Mongo, API, workers, Redis, microservicio) · Cloudinary · Brevo · Firebase |

---

## 3. Monorepo con Turborepo

Un único repositorio con **Turborepo** y **pnpm workspaces**. El microservicio de tiendas es la **única excepción**: vive en su propio repo (ver sección 14).

```
yourvivac/
├─ apps/
│  ├─ web/            # React + Vite (DaisyUI)
│  ├─ mobile/         # React Native + NativeWind
│  └─ api/            # Express + Mongoose + workers
├─ packages/
│  ├─ types/          # Tipos TS compartidos (modelos, DTOs, enums)
│  ├─ validation/     # Esquemas Zod (request + forms) compartidos
│  ├─ sdk/            # Cliente Axios tipado de la API
│  └─ utils/          # Helpers puros (fechas, formato, unidades)
├─ turbo.json
├─ pnpm-workspace.yaml
└─ package.json
```

**Regla de oro:** tipos, validación y cliente de API se **comparten** vía packages. El frontend (web y móvil) nunca define a mano la forma de una respuesta: la importa de `@yourvivac/types` y la consume con `@yourvivac/sdk`.

---

## 4. Packages compartidos

| Package | Responsabilidad | Lo consume |
|---|---|---|
| `@yourvivac/types` | Interfaces y enums de todos los modelos y DTOs. Fuente única de la forma de los datos. | web · mobile · api · sdk |
| `@yourvivac/validation` | Esquemas **Zod** reutilizados en validación de requests (API) y formularios (react-hook-form). | web · mobile · api |
| `@yourvivac/sdk` | Cliente **Axios** tipado: interceptores de auth (access/refresh), funciones por endpoint. | web · mobile |
| `@yourvivac/utils` | Funciones puras sin estado: formato de números/fechas, conversión de unidades, slug, peso de mochila. | todos |

Los **design tokens** de la Guía de diseño (preset de Tailwind / NativeWind) se añaden como packages adicionales (`design-tokens`, `tailwind-preset`).

---

## 5. App web — React + Vite

| Pieza | Elección | Notas |
|---|---|---|
| Build / dev | Vite | TS, HMR, build de producción. |
| UI / estilos | Tailwind + DaisyUI | CSS en el propio componente (ver §6). Temas claro/oscuro de DaisyUI mapeados a los tokens. |
| Estado cliente | Zustand | Stores por dominio (auth, ui, board, draft de salida). |
| Estado servidor | TanStack Query | Cache, revalidación y mutaciones sobre el SDK Axios. |
| Routing | React Router | Rutas protegidas por rol (user / guide / admin). |
| HTTP | Axios | Vía `@yourvivac/sdk`, con interceptor de refresh. |
| Formularios | react-hook-form + Zod | Esquemas de `@yourvivac/validation`. |

---

## 6. Convención de componentes

Todos los componentes siguen el mismo patrón: **un objeto `styles` con clases de Tailwind** al principio del archivo y el JSX limpio debajo. TypeScript siempre, props tipadas, sin estilos sueltos repartidos.

```tsx
// TripCard.tsx
import { Mountain, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Trip } from '@yourvivac/types';

interface Props {
  trip: Trip;
  onOpen?: (id: string) => void;
}

const styles = {
  card:    'flex flex-col font-body cursor-pointer w-full min-w-0 group rounded-card',
  cover:   'relative w-full aspect-[16/10] rounded-card overflow-hidden bg-bg-3',
  badge:   'absolute top-2 left-2 badge badge-sm bg-black/55 text-white border-0',
  title:   'mt-2 text-lg font-display text-ink leading-tight',
  metaRow: 'flex items-center gap-3 mt-1 text-xs text-ink-3 font-mono',
};

export default function TripCard({ trip, onOpen }: Props) {
  const navigate = useNavigate();
  return (
    <div className={styles.card} onClick={() => onOpen?.(trip.id)}>
      <div className={styles.cover}>
        {trip.cover && <img src={trip.cover.url} alt={trip.title} className="w-full h-full object-cover" />}
        <span className={styles.badge}>{trip.status}</span>
      </div>
      <p className={styles.title}>{trip.title}</p>
      <div className={styles.metaRow}>
        <span className="flex items-center gap-1"><Mountain size={14} />{trip.elevationGain} m</span>
        <span className="flex items-center gap-1"><Users size={14} />{trip.members.length}</span>
      </div>
    </div>
  );
}
```

**Reglas:** objeto `styles` por componente · props con `interface Props` · iconos con `lucide-react`.
**Tokens:** clases de marca (`bg-bg-2`, `text-ink`, `text-accent`), radios (`rounded-card`), fuentes (`font-display/body/mono`).
**Móvil:** mismo patrón con **NativeWind** sobre `View/Text/Pressable`.

---

## 7. App móvil — React Native

React Native (recomendado con **Expo**). Comparte stores, tipos, validación y SDK con la web; cambia la capa de UI por componentes nativos.

| Pieza | Elección |
|---|---|
| Estilos | NativeWind (Tailwind para RN, mismo preset de tokens) |
| Navegación | React Navigation (stack + bottom tabs) |
| Estado / datos | Zustand + TanStack Query + @yourvivac/sdk (compartidos) |
| Mapas | react-native-maps (Google Maps provider) |
| Gestos / DnD | react-native-gesture-handler + react-native-reanimated |
| Markdown | react-native-markdown-display |
| Auth Google | @react-native-firebase/auth (o expo-auth-session) |

---

## 8. Librerías por funcionalidad

### Tablero colaborativo (drag & drop de pines)
- `@dnd-kit/core` · `@dnd-kit/sortable` — arrastrar/colocar pines y reordenar (moderno, accesible).
- `react-rnd` (opcional) — mover + redimensionar con rotación en el mural corcho.
- RN: `gesture-handler` + `reanimated` — equivalente nativo a 60fps.
- `socket.io-client` — sincronización en tiempo real del tablero y el chat.

### Mapas y ubicación (Google Maps)
- `@vis.gl/react-google-maps` — mapa, marcadores y rutas (web).
- `@googlemaps/js-api-loader` — carga del SDK + Places Autocomplete.
- RN: `react-native-maps` — mapa nativo con provider de Google.
- `@tmcw/togeojson` (opcional) — parsear/mostrar rutas GPX.

### Markdown (notas y consejos)
- `react-markdown` + `remark-gfm` — render de notas y artículos.
- `rehype-sanitize` — saneado obligatorio del HTML (contenido de usuario).
- `@uiw/react-md-editor` — editor con vista previa (modal de publicar).
- RN: `react-native-markdown-display`.

### Panel de admin (gráficos y analíticas)
- `Recharts` — KPIs, series temporales, barras de actividad.
- `@tanstack/react-table` — tablas de usuarios, cola de guías, reportes.
- `date-fns` — rangos de fechas y formato.

### Transversales
- `lucide-react` — iconos (mismo grosor que el diseño).
- `sonner` / `react-hot-toast` — toasts.
- `clsx` + `tailwind-merge` — composición de clases.
- `firebase` (auth) — flujo OAuth de Google en cliente.

---

## 9. API — Express + Mongoose

Servidor Node con **Express** y TypeScript. Persistencia en **MongoDB** vía **Mongoose** (validadores de esquema + validación de request con Zod). Arquitectura por **middlewares**.

| Pieza | Librería | Uso |
|---|---|---|
| Framework | express | Routing + middlewares. |
| ODM | mongoose | Esquemas, validadores, índices, populate, hooks. |
| Validación request | zod | Middleware que valida `body/params/query` con esquemas de `@yourvivac/validation`. |
| Auth OAuth | firebase-admin | Verifica el ID token de Google enviado por el cliente. |
| Hash | bcrypt | Contraseñas de usuarios con email. |
| Tokens | jsonwebtoken | Patrón access + refresh (ver §10). |
| Imágenes | sharp · cloudinary · multer | Optimizar (sharp) → subir a Cloudinary; multer parsea el upload. |
| Email | nodemailer + Brevo | Transaccionales (verificación, invitaciones, reset). |
| Realtime | socket.io | Chat de grupo y eventos del tablero. |
| Colas / cache | bullmq · ioredis | Workers y cache; Redis en Railway. |
| Logs | pino + pino-http | Estructurados en prod; `pino-pretty` en dev. |

---

## 10. Seguridad y middlewares

### Cadena de middlewares (orden)

```
helmet()            → cabeceras de seguridad
cors({ origin })    → orígenes web/móvil permitidos
compression()       → gzip de respuestas
pino-http           → log de cada request
cookieParser()      → refresh token en cookie httpOnly
rateLimit           → express-rate-limit (store en Redis)
express.json()      → body parsing
validate(schema)    → Zod por ruta (body/params/query)
authGuard           → verifica access JWT → req.user
roleGuard('admin')  → autorización por rol
<controller>        → lógica
errorHandler        → captura y formatea errores
```

### Autenticación — access / refresh

| | Tipo | Detalle |
|---|---|---|
| **Access token** | JWT corto (~15 min) | Header `Authorization: Bearer`. Lleva `userId` y `role`. |
| **Refresh token** | JWT largo (~30 d) | Cookie **httpOnly** (web) / secure storage (móvil). Persistido y rotado en colección `sessions`. |
| **OAuth Google** | firebase-admin | Cliente obtiene ID token con Firebase → `POST /auth/google` → backend verifica y emite sus propios tokens. |

- **helmet** para cabeceras; **cors** con allow-list de orígenes.
- **Rate limiting** global + estricto en `/auth/*` (store en Redis).
- Contraseñas con **bcrypt** (coste ≥ 12); nunca se devuelven.
- Autorización por **rol** (`user` · `guide` · `admin`) y por **pertenencia** (miembro de la salida).
- Saneado de markdown y validación de subidas (tipo MIME + tamaño).

---

## 11. Modelo de datos MongoDB

Diseñado para cubrir **todas** las funcionalidades sin añadir campos sobre la marcha. **Convenciones:** todos los documentos llevan `_id`, `createdAt`, `updatedAt`. Relaciones con `ObjectId` + `ref`. Enums en `@yourvivac/types`.

### users (colección raíz)
| Campo | Tipo | Notas |
|---|---|---|
| `displayName` | string | Nombre visible. |
| `username` | string · unique | Handle público (`@marcosvidal`). |
| `email` | string · unique | + `emailVerified: boolean`. |
| `passwordHash` | string? | Solo auth email (bcrypt). `select:false`. |
| `authProviders[]` | subdoc[] | `{ provider:'password'|'google', providerId, linkedAt }`. |
| `avatar` | Media-ref | `{ url, publicId }`. |
| `bio` · `location` | mixed | `location: { name, coords? }`. |
| `role` | enum | `'user' | 'guide' | 'admin'`. |
| `guide` | subdoc? | `{ status, certification, certBody, verifiedAt, verifiedBy }`. |
| `stats` | subdoc | `{ trips, vivacs, distanceKm, elevationGain }` denormalizado. |
| `achievements[]` | subdoc[] | `{ key, label, earnedAt }`. |
| `settings` | subdoc | `{ theme, density, fontPair, units, defaultTripVisibility, notifications:{push,email,...} }`. |
| `counts` | subdoc | `{ followers, following }`. |
| `status` | enum | `'active' | 'suspended' | 'banned'`. |
| `lastActiveAt` | Date | Para "usuarios activos". |

### guideApplications (admin · verificación)
`userId` (ref) · `certification` · `certBody` · `documents[]` (Media) · `status` (`pending|in_review|approved|rejected`) · `reviewedBy` · `reviewedAt` · `notes`. Índice por `status`.

### trips (salidas / excursiones)
| Campo | Tipo | Notas |
|---|---|---|
| `title` · `slug` | string | `slug` indexado. |
| `cover` · `description` | mixed | Portada (Media) + descripción. |
| `owner` | ref users | Creador. Índice. |
| `members[]` | subdoc[] | `{ userId, role:'owner'|'member', rsvp:'invited'|'going'|'maybe'|'declined', joinedAt }`. |
| `startDate` · `endDate` | Date | Ventana de la salida. |
| `location` | subdoc | `{ name, coords:{lat,lng}, placeId }`. Índice `2dsphere`. |
| `difficulty` | enum | `'facil'|'moderada'|'dificil'|'alpina'`. |
| `distanceKm` · `elevationGain` | number | Métricas. |
| `visibility` | enum | `'private' | 'public'`. |
| `status` | enum | `'planning'|'confirmed'|'completed'|'cancelled'`. |
| `gpx` | Media? | Track descargable. |
| `stats` | subdoc | `{ pinCount, photoCount, kudos, commentCount }`. |
| `completedAt` | Date? | Marca de finalización. |

### pins (tablero · discriminado por type)
| Campo | Tipo | Notas |
|---|---|---|
| `tripId` | ref trips | Índice. |
| `authorId` | ref users | Quién lo creó. |
| `type` | enum | `'note'|'photo'|'link'|'list'|'map'|'text'`. |
| `layout` | subdoc | `{ x, y, rotation, z, w }`. |
| `note` / `text` | subdoc? | `note:{markdown}` · `text:{body,color}`. |
| `photo` | subdoc? | `{ media, caption }`. |
| `link` | subdoc? | `{ url, title, description, image, domain }`. |
| `map` | subdoc? | `{ label, coords, placeId, address, elevation }`. |
| `list` | subdoc? | `{ gearListId }` → ref `gearLists`. |
| `reactions[]` | subdoc[] | `{ userId, emoji }`. |

### gearLists (listas de equipo)
`ownerId` (ref) · `name`/`description`/`icon` · `items[]` `{ name, weightGrams, checked, addedBy, product? }` · `items[].product` `{ storeKey, title, url, price, currency, image, externalId }` · `totalWeight` (number) · `isTemplate` (bool) · `usedInTrips[]` (ref) · `visibility` (`private|trip|public`).

### messages (chat de grupo)
`tripId` (ref, índice `{tripId,createdAt}`) · `authorId` (ref, null si system) · `type` (`text|pin_share|system`) · `body` · `pinRef`/`attachments[]` · `readBy[]` `{userId,at}` · `editedAt`/`deletedAt`.

### tips (consejos / artículos)
`authorId` (ref) · `title`/`slug`/`cover`/`excerpt` · `category` (`material|seguridad|rutas|vivac|meteo`) · `contentMarkdown` · `readMinutes`/`tags[]` · `status` (`draft|published|archived`) · `moderation` `{status:'ok'|'flagged'|'removed',reviewedBy}` · `counts` `{likes,comments,views}` · `publishedAt`.

### follows · reactions · comments
- **follows:** `followerId`, `followingId` (índice único compuesto).
- **reactions:** `userId`, `targetType` (enum), `targetId` — likes polimórficos (tip, trip, pin).
- **comments:** `authorId`, `targetType/Id` (poly), `body`, `parentId?` — anidables.

### notifications
`userId` (ref, índice `{userId,read,createdAt}`) · `type` (`trip_invite·trip_join·new_message·pin_added·tip_like·comment·follow·guide_approved·guide_rejected·help_request·mention`) · `actorId` (ref) · `target` `{type,id}` · `data` (mixed) · `read`/`readAt` · `channels` `{push,email}`.

### activities (feed de inicio)
`actorId` (ref) · `type` (`trip_completed|tip_published|achievement`) · `tripId`/`tipId` (ref?) · `visibility` (enum, índice `{actorId,createdAt}`). Fan-out para construir el feed de "tu cordada".

### reports · sessions · media · dailyMetrics
- **reports:** `reporterId`, `targetType/Id`, `reason`, `description`, `status`, `handledBy`, `resolvedAt`.
- **sessions:** `userId`, `tokenHash`, `device`/`ip`/`userAgent`, `expiresAt`/`revokedAt`.
- **media:** `uploaderId`, `url`/`publicId`, `width`/`height`/`bytes`, `moderation` `{status:'pending'|'approved'|'rejected',labels[],provider}`.
- **dailyMetrics:** `date` (unique), `newUsers`, `activeUsers`, `tripsCreated`, `tipsPublished`, `guidesVerified`, `reports`. Snapshot diario agregado por worker.

---

## 12. Endpoints de la API

Contrato REST base (`/api/v1`). **auth** = requiere access token · **admin** = requiere rol admin. El realtime (chat/tablero) va por Socket.IO.

### Auth
- `POST /auth/google` — verifica ID token de Firebase → tokens propios.
- `POST /auth/register` — registro con email + contraseña.
- `POST /auth/login` — login con email.
- `POST /auth/refresh` — rota refresh → nuevo access.
- `POST /auth/logout` — revoca la sesión.
- `POST /auth/verify-email · /forgot-password · /reset-password` — flujos por email (Brevo).
- `GET /auth/me` *(auth)* — usuario actual + settings.

### Usuarios · perfil · social
- `GET /users/:username` — perfil público + stats.
- `PATCH /users/me` *(auth)* — editar perfil.
- `PATCH /users/me/settings` *(auth)* — tema, densidad, unidades, notificaciones.
- `POST /users/me/avatar` *(auth)* — subida de avatar (sharp→Cloudinary).
- `GET /users/:id/trips · /tips` — salidas y consejos del usuario.
- `POST /users/:id/follow` *(auth)* — seguir.
- `DELETE /users/:id/follow` *(auth)* — dejar de seguir.

### Guías
- `POST /guide/apply` *(auth)* — solicitar rol de guía + documentos.
- `GET /guide/application` *(auth)* — estado de la propia solicitud.

### Salidas (trips)
- `POST /trips` *(auth)* — crear salida.
- `GET /trips` *(auth)* — mis salidas.
- `GET /trips/:id` *(auth)* — detalle (miembro).
- `PATCH /trips/:id` *(auth)* — editar (owner).
- `DELETE /trips/:id` *(auth)* — eliminar (owner).
- `POST /trips/:id/invite` *(auth)* — invitar amigos.
- `PATCH /trips/:id/rsvp` *(auth)* — confirmar asistencia.
- `POST /trips/:id/complete` *(auth)* — marcar completada → actividad.
- `GET /explore/trips` — salidas públicas (filtros, geo).

### Tablero · pines
- `GET /trips/:id/board` *(auth)* — pines del tablero.
- `POST /trips/:id/pins` *(auth)* — crear pin (note/photo/link/list/map/text).
- `PATCH /pins/:id` *(auth)* — editar / mover (layout).
- `DELETE /pins/:id` *(auth)* — eliminar pin.
- `POST /pins/:id/reactions` *(auth)* — reaccionar.

### Listas de equipo · productos
- `GET /gear-lists` *(auth)* — mi biblioteca de listas.
- `POST /gear-lists` *(auth)* — crear lista.
- `PATCH /gear-lists/:id/items/:itemId` *(auth)* — editar/marcar ítem.
- `GET /products/search?q=&stores=` *(auth)* — proxy al microservicio de tiendas.
- `GET /products/:store/:externalId` *(auth)* — detalle de producto.

### Chat (REST + Socket.IO)
- `GET /trips/:id/messages` *(auth)* — historial paginado.
- `POST /trips/:id/messages` *(auth)* — enviar (también emite por socket).
- `DELETE /messages/:id` *(auth)* — borrado suave.

### Consejos
- `GET /tips?category=` — feed de consejos publicados.
- `POST /tips` *(auth)* — publicar / borrador.
- `GET /tips/:slug` — detalle.
- `PATCH /tips/:id` *(auth)* — editar (autor).
- `POST /tips/:id/like · /comments` *(auth)* — like / comentar.

### Notificaciones · media
- `GET /notifications` *(auth)* — listado + no leídas.
- `POST /notifications/read-all` *(auth)* — marcar todo leído.
- `POST /media/upload` *(auth)* — optimiza (sharp) → Cloudinary → encola moderación.

### Admin
- `GET /admin/metrics · /metrics/timeseries` *(admin)* — KPIs y series.
- `GET /admin/users` *(admin)* — tabla de usuarios.
- `PATCH /admin/users/:id` *(admin)* — rol / suspender / banear.
- `GET /admin/guide-applications` *(admin)* — cola de verificación.
- `PATCH /admin/guide-applications/:id` *(admin)* — aprobar / rechazar guía.
- `GET /admin/reports` *(admin)* — reportes.
- `PATCH /admin/reports/:id` *(admin)* — resolver / descartar.

---

## 13. Workers y colas

Procesos en segundo plano con **BullMQ** sobre **Redis**, desplegados como servicio(s) aparte en Railway.

| Cola | Trabajo |
|---|---|
| `image-moderation` | Tras subir a Cloudinary: analiza con proveedor de moderación (Cloudinary AI / Google Vision / AWS Rekognition) y actualiza `media.moderation`; oculta si se rechaza. |
| `email` | Envíos transaccionales (Nodemailer + Brevo). |
| `notifications` | Fan-out de notificaciones in-app + push/email según `settings.notifications`. |
| `feed` | Genera `activities` al completar salidas o publicar consejos. |
| `analytics` | Cron que agrega `dailyMetrics` para el panel admin. |

---

## 14. Microservicio agregador de tiendas

Vive en **repo separado** (módulo core, posiblemente open source) aunque se despliega en el **mismo proyecto de Railway**. La API principal lo consume como proxy. **Stack:** Express + TS · Redis (cache) · scraping (Crawlee/Cheerio/Playwright) · normalización con Zod. **Ver la guía dedicada "Agregador de tiendas (Cordal)" para el detalle completo.**

Patrón de adaptadores:
```ts
interface StoreAdapter {
  key: 'amazon'|'decathlon'|'deporvillage'|'barrabes'|'forum'|'coleman';
  search(query: string, opts): Promise<ProductResult[]>;
  getProduct(externalId: string): Promise<ProductDetail>;
}
```
Endpoints: `GET /search?q=&stores=&limit=` · `GET /product/:store/:externalId` · `GET /stores` · `GET /health`.

---

## 15. Infraestructura

```
Railway (un proyecto)
├─ MongoDB              base de datos principal
├─ Redis               cache + colas BullMQ + rate limit
├─ api                 Express (web + móvil)
├─ workers             BullMQ (imágenes, email, notif, analíticas)
└─ store-service       microservicio de tiendas (repo aparte)

Externos
├─ Cloudinary          almacenar y servir imágenes (optimizadas con sharp en backend)
├─ Brevo               transporte de email (Nodemailer)
└─ Firebase            OAuth Google (verificación con firebase-admin)
```

| Servicio | Rol |
|---|---|
| **Cloudinary** | Solo almacena y sirve. La optimización (resize, formato) se hace en backend con sharp; la moderación en worker. |
| **MongoDB (Railway)** | Base de datos principal. |
| **Redis (Railway)** | Cache, colas y store de rate limiting. |
| **Brevo** | Transport SMTP/API para Nodemailer. |
| **Firebase** | Proveedor OAuth de Google. |

---

## 16. Variables de entorno

| Variable | Uso |
|---|---|
| `MONGODB_URI` | Conexión a MongoDB (Railway). |
| `REDIS_URL` | Conexión a Redis (cache + colas). |
| `JWT_ACCESS_SECRET` · `JWT_REFRESH_SECRET` | Firma de tokens. |
| `FIREBASE_PROJECT_ID` · `FIREBASE_CLIENT_EMAIL` · `FIREBASE_PRIVATE_KEY` | Credenciales de firebase-admin. |
| `CLOUDINARY_CLOUD_NAME` · `_API_KEY` · `_API_SECRET` | SDK de Cloudinary. |
| `BREVO_API_KEY` / `SMTP_*` | Transport de Nodemailer. |
| `STORE_SERVICE_URL` · `STORE_SERVICE_API_KEY` | Microservicio de tiendas. |
| `GOOGLE_MAPS_API_KEY` | Mapas (web/móvil) y Places. |
| `CORS_ORIGINS` | Allow-list de orígenes. |
| `MODERATION_PROVIDER_KEY` | Proveedor de moderación de imágenes. |

---

## 17. Checklist de desarrollo

**Fundamentos:**
- [ ] Monorepo Turborepo + pnpm + TS base.
- [ ] Packages `types · validation · sdk · utils`.
- [ ] Preset de Tailwind/NativeWind desde tokens.
- [ ] Conexión Mongo + Redis en Railway.

**Backend:**
- [ ] Cadena de middlewares (helmet/cors/rate/log).
- [ ] Auth Google + email (access/refresh).
- [ ] Modelos Mongoose (sección 11) con índices.
- [ ] Endpoints (sección 12) + validación Zod.
- [ ] Socket.IO (chat + tablero).
- [ ] Workers BullMQ (imagen/email/notif/analytics).

**Frontend:**
- [ ] Web (Vite) con DaisyUI + convención de componentes.
- [ ] Móvil (RN + NativeWind) reusando stores/SDK.
- [ ] Mapas, DnD del tablero, markdown, charts admin.
- [ ] Rutas protegidas por rol.

**Servicios:**
- [ ] Microservicio de tiendas (repo aparte) + cache Redis.
- [ ] Adapters por tienda (patrón común).
- [ ] Cloudinary + sharp + moderación.
- [ ] Brevo + Firebase configurados.
