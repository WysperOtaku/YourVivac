# Web de YourVivac (Vite). Build estático + servidor de previsualización.
FROM node:20-bookworm-slim AS base
RUN corepack enable
WORKDIR /app

COPY . .
RUN pnpm install --frozen-lockfile

# VITE_API_URL se incrusta en el build → debe apuntar a la URL que el NAVEGADOR
# usará para llegar al API (en local, el puerto publicado del servicio api).
ARG VITE_API_URL=http://localhost:4000/api/v1
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm --filter @yourvivac/web build

EXPOSE 8080
CMD ["pnpm", "--filter", "@yourvivac/web", "exec", "vite", "preview", "--host", "0.0.0.0", "--port", "8080"]
