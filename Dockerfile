FROM node:22-slim

# Instalar dependencias del sistema necesarias para Baileys/sharp
RUN apt-get update && apt-get install -y \
    python3 make g++ git \
    libvips-dev \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Instalar pnpm
RUN npm install -g pnpm@10

WORKDIR /app

# Copiar archivos de configuración del workspace
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.base.json ./
COPY tsconfig.json ./

# Copiar packages de lib
COPY lib/ ./lib/

# Copiar el artifact principal
COPY artifacts/api-server/ ./artifacts/api-server/

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# El dist ya está pre-compilado en el repo
# Si querés compilar en el container: RUN pnpm --filter @workspace/api-server run build

# Crear directorio para auth y data
RUN mkdir -p /app/auth /app/logs /app/artifacts/api-server/data

EXPOSE 5000

ENV NODE_ENV=production
ENV PORT=5000

CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]
