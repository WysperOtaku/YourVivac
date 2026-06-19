# Web de YourVivac (Vite). Build estático + servidor de previsualización.
FROM node:20-bookworm-slim AS base
RUN corepack enable
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile

# Las VITE_* se incrustan en el build (cliente). VITE_API_URL debe apuntar a la
# URL que el NAVEGADOR usará para llegar al API (en local, el puerto publicado).
ARG VITE_API_URL=http://localhost:4000/api/v1
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
