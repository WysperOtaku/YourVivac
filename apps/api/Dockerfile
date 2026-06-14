# API + workers de YourVivac (monorepo pnpm). Imagen única; el comando decide
# si arranca el server (por defecto) o el proceso de workers (ver docker-compose).
FROM node:20-bookworm-slim AS base
ENV PNPM_HOME=/root/.local/share/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

# Copia el monorepo e instala todas las dependencias del workspace.
COPY . .
RUN pnpm install --frozen-lockfile

# Compila el API (genera dist/server.js y dist/workers/index.js).
RUN pnpm --filter @yourvivac/api build

EXPOSE 4000
CMD ["pnpm", "--filter", "@yourvivac/api", "start"]
