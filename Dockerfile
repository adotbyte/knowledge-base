# --- 1 etapas: Build ---
FROM node:22-alpine AS builder
WORKDIR /app

# Įdiegiame OpenSSL (reikalinga Prisma)
RUN apk add --no-cache openssl

# Nukopijuojame package failus
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./prisma.config.ts

# Įdiegiame priklausomybes (su legacy-peer-deps, kad išvengtume konfliktų)
RUN --mount=type=cache,target=/root/.npm \
    npm ci --legacy-peer-deps --prefer-offline --no-audit

# Nukopijuojame visą kodą
COPY . .
# Nukopijuojame PDF workerį į public katalogą
RUN cp node_modules/pdfjs-dist/build/pdf.worker.mjs public/

# Nustatome netikrą DATABASE_URL, kad Prisma generate nesugriūtų per build'ą
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Sugeneruojame Prisma klientą
RUN npx prisma generate --schema=prisma/schema.prisma

# Turnstile
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=$NEXT_PUBLIC_TURNSTILE_SITE_KEY

# Pastatome Next.js aplikaciją
RUN --mount=type=cache,target=/app/.next/cache \
    npm run build

# --- 2 etapas: Production ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache openssl

# Sukuriame ne-root vartotoją saugumui
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Nukopijuojame standalone build (jau turi reikiamus node_modules)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# ✅ SVARBU: Nukopijuojame VISĄ node_modules iš builder stadijos
COPY --from=builder /app/node_modules ./node_modules

# Nukopijuojame Prisma schemą, config failą IR migracijas
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts
# ✅ PRIDĖTA: Migracijų katalogas
COPY --from=builder /app/prisma/migrations ./prisma/migrations

# Sukuriame uploads katalogą ir suteikiame teises
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

# Suteikiame teises
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]