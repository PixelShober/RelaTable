# RelaTable — single-container VPS image (DEC-002/019/020).
# Multi-stage: build with full deps, run as non-root with a persistent /data volume.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
# ponytail: prisma-Postinstall braucht schema.prisma — vor npm ci kopieren.
COPY prisma ./prisma
RUN npm ci
COPY . .
# Keep full deps: the entrypoint uses prisma + tsx to sync schema and seed.
RUN npx prisma generate && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# tar: backup endpoint. python3 + instaloader: Instagram-Import fetcht Followings serverseitig.
RUN addgroup -S app && adduser -S app -G app \
    && apk add --no-cache python3 py3-pip \
    && pip install --break-system-packages --no-cache-dir instaloader

COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/scripts ./scripts
COPY --from=build /app/package.json ./package.json
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh && mkdir -p /data && chown -R app:app /data /app

USER app
# XDG_CONFIG_HOME=/data → instaloader liest/schreibt die Session auf dem persistenten Volume (Rootfs ist read-only).
ENV DATABASE_URL="file:/data/relatable.db" \
    DATA_DIR="/data" \
    XDG_CONFIG_HOME="/data" \
    XDG_CACHE_HOME="/tmp" \
    PORT=3000 \
    ORIGIN="http://localhost:3000"
VOLUME ["/data"]
EXPOSE 3000

# Entrypoint applies the schema (and reference seed on first boot), then starts the server.
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "build"]
