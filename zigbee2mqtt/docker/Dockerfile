# ============================================
# Stage 1: Build the WindFront frontend
# ============================================
FROM node:22-alpine AS frontend-build

WORKDIR /frontend

RUN apk add --no-cache git

# Clone the frontend fork
RUN git clone --depth 1 --branch codex/china-mobile-ops \
    https://github.com/aimeeting2024/zigbee2mqtt-windfront-cn.git .

# Install frontend deps and build
RUN npm install
RUN npm run build
RUN npm pack --ignore-scripts

# ============================================
# Stage 2: Build the Zigbee2MQTT backend
# ============================================
FROM node:22-alpine AS backend-build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.18.3 --activate
RUN apk add --no-cache git

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Copy the pre-built frontend package from stage 1
COPY --from=frontend-build /frontend/zigbee2mqtt-windfront-*.tgz ./frontend.tgz

# Replace git dependency with local file
RUN sed -i 's|"zigbee2mqtt-windfront": "github:aimeeting2024/zigbee2mqtt-windfront-cn#codex/china-mobile-ops"|"zigbee2mqtt-windfront": "file:./frontend.tgz"|' package.json

# Install deps (cannot use --frozen-lockfile because we changed a dependency source)
RUN pnpm install --no-optional

# Copy source and build
COPY . .
RUN pnpm run build

# ============================================
# Stage 3: Production runtime
# ============================================
FROM node:22-alpine AS release

ENV NODE_ENV=production
ENV ZIGBEE2MQTT_DATA=/app/data

WORKDIR /app

RUN apk add --no-cache tzdata tini
RUN corepack enable && corepack prepare pnpm@10.18.3 --activate

# Copy package files and pre-built frontend
COPY --from=backend-build /app/package.json ./
COPY --from=backend-build /app/pnpm-lock.yaml ./
COPY --from=backend-build /app/frontend.tgz ./frontend.tgz

# Install production deps only
RUN pnpm install --prod --no-optional

# Copy compiled backend
COPY --from=backend-build /app/dist ./dist
COPY --from=backend-build /app/scripts ./scripts
COPY --from=backend-build /app/index.js ./index.js
COPY --from=backend-build /app/data/configuration.example.yaml ./data/
COPY --from=backend-build /app/LICENSE ./

# Entrypoint
COPY docker/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

RUN mkdir -p /app/data

EXPOSE 8090

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["/sbin/tini", "--", "node", "scripts/start-local-data.cjs"]
