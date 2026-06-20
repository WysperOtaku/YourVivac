# Web de YourVivac (Vite). Build estático + servidor de previsualización.
FROM node:20-bookworm-slim AS base
RUN corepack enable
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile

# Las VITE_* se incrustan en el build (cliente). VITE_API_URL debe ser una ruta
# RELATIVA (/api/v1) para que el navegador llame a su propio origen y el servidor
# web haga de proxy (API_PROXY_TARGET) — así funciona también para clientes remotos.
# Railway puede sobreescribirla con la URL absoluta del API si los sirve por separado.
ARG VITE_API_URL=/api/v1
ARG VITE_FIREBASE_API_KEY=
ARG VITE_FIREBASE_AUTH_DOMAIN=
ARG VITE_FIREBASE_PROJECT_ID=
ARG VITE_FIREBASE_APP_ID=
ARG VITE_GOOGLE_MAPS_API_KEY=
ENV VITE_API_URL=$VITE_API_URL \
    VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY \
    VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN \
    VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID \
    VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID \
    VITE_GOOGLE_MAPS_API_KEY=$VITE_GOOGLE_MAPS_API_KEY
RUN pnpm --filter @yourvivac/web build

EXPOSE 8080
CMD ["pnpm", "--filter", "@yourvivac/web", "exec", "vite", "preview", "--host", "0.0.0.0", "--port", "8080"]
