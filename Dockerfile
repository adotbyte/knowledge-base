# --- 1 etapas: Build ---
FROM node:22-alpine AS builder
WORKDIR /app

# Įdiegiame OpenSSL (reikalinga Prisma)
RUN apk add --no-cache openssl

# Nukopijuojame package failus
COPY package*.json ./
COPY prisma ./prisma/

# Įdiegiame priklausomybes (su legacy-peer-deps, kad išvengtume konfliktų)
RUN npm ci --legacy-peer-deps

# Nukopijuojame visą kodą
COPY . .

# Nustatome netikrą DATABASE_URL, kad Prisma generate nesugriūtų per build'ą
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

# Sugeneruojame Prisma klientą
RUN npx prisma generate --schema=prisma/schema.prisma

# Pastatome Next.js aplikaciją
RUN npm run build

# --- 2 etapas: Production ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache openssl

# Sukuriame ne-root vartotoją saugumui
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Nukopijuojame tik tai, ko reikia produkcijai
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Suteikiame teises
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]