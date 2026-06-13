# YourVivac — Documentación

Centro de documentación de **YourVivac**: la plataforma para preparar excursiones y vivacs en grupo (tablero colaborativo, listas de equipo enlazadas a tiendas, mapas, consejos y rol de guía certificado).

Cada guía existe en dos formatos:
- **`.md`** — para leer y para que un agente la consuma sin boilerplate.
- **`.html`** — misma información, navegable y con diagramas, para revisar en pantalla.

---

## Orden de lectura recomendado

| # | Documento | Para qué | Tema |
|---|---|---|---|
| 0 | **Diseño navegable** ([`YourVivac.html`](./YourVivac.html)) | Ver todas las pantallas (móvil + escritorio), temas y tweaks. Fuente visual de verdad. | — |
| 1 | **Guía de implementación de diseño** | Traducir el diseño a código: tokens, componentes y pantallas. | Claro |
| 2 | **Guía de desarrollo** | Stack, monorepo Turborepo, librerías, modelo de datos y endpoints. | Claro |
| 3 | **Guía del agregador de tiendas (Cordal)** | El microservicio de scraping: Crawlee, caché y matching. *Repo aparte.* | Oscuro |
| 4 | **Guía de lógica, testing y workflow** | Casos de uso, tests (Jest + Playwright), CI/CD y cómo contribuir. | Claro |

> **Recomendación:** empieza por el **diseño navegable** para tener el contexto visual, luego sigue el orden 1 → 4. El stack está **100% definido**; TypeScript en todo el proyecto; monorepo Turborepo con React (web) y React Native (móvil).

---

## Documentos

### 1 · Guía de implementación de diseño
Cómo construir la interfaz: paletas claro/oscuro, tipografía, espaciado/densidad, radios, sombras, iconografía, etiquetas de tienda, mapa de componentes (web ↔ React Native), inventario de pantallas y tipos de pin.
→ [`Guía de implementación.md`](./YourVivac%20—%20Guía%20de%20implementación.md) · [`.html`](./YourVivac%20—%20Guía%20de%20implementación.html)

### 2 · Guía de desarrollo
El plano técnico: stack global, monorepo Turborepo + packages compartidos (`types`, `validation`, `sdk`, `utils`), frontend web (React/Vite/Zustand/Tailwind+DaisyUI) y móvil (RN/NativeWind), librerías por funcionalidad, backend (Express/Mongoose), seguridad, **modelo de datos MongoDB completo**, **endpoints**, workers e infraestructura (Railway).
→ [`Guía de desarrollo.md`](./YourVivac%20—%20Guía%20de%20desarrollo.md) · [`.html`](./YourVivac%20—%20Guía%20de%20desarrollo.html)

### 3 · Guía del agregador de tiendas (Cordal)
El servicio independiente de búsquedas agregadas (repo `vivac-aggregator`): postura legal del scraping, stack con **Crawlee**, arquitectura, caché **hit/miss/SWR**, patrón de adaptadores por tienda, normalización y **matching de productos**, resiliencia, endpoints y despliegue. Incluye diagramas Mermaid.
→ [`Guía del agregador de tiendas.md`](./YourVivac%20—%20Guía%20del%20agregador%20de%20tiendas.md) · [`.html`](./YourVivac%20—%20Guía%20del%20agregador%20de%20tiendas.html)

### 4 · Guía de lógica, testing y workflow
El manual operativo: reglas de negocio transversales, **casos de uso por dominio** (actor/entrada/reglas/salida/errores), máquinas de estado, estrategia de testing (**Jest** unitario + **Playwright** E2E), **pipeline CI/CD**, modelo de ramas y contribución, cómo añadir una funcionalidad y Definition of Done. Incluye diagramas Mermaid.
→ [`Guía de lógica, testing y workflow.md`](./YourVivac%20—%20Guía%20de%20lógica,%20testing%20y%20workflow.md) · [`.html`](./YourVivac%20—%20Guía%20de%20lógica,%20testing%20y%20workflow.html)

---

## Índice navegable

Abre [`index.html`](./index.html) para un punto de entrada visual a toda la documentación.

---

## Mantenimiento

Cada guía vive en `.md` (fuente para agentes/lectura) y `.html` (revisión en pantalla). **Si actualizas una, refleja el cambio en ambos formatos.** Los archivos `yourvivac.css` y `yourvivac-doc.css` aportan los estilos compartidos de los HTML.
