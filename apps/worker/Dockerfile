FROM node:20-alpine AS builder

WORKDIR /app

# Bağımlılık dosyalarını kopyala
COPY package*.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/worker/package.json ./apps/worker/

# Bağımlılıkları kur
RUN npm install --workspace=@chaintrigger/shared --workspace=@chaintrigger/worker

# Kodları kopyala ve derle
COPY packages/shared ./packages/shared
COPY apps/worker ./apps/worker

RUN cd packages/shared && npm run build
RUN cd apps/worker && npm run build

# --- Runner ---
FROM node:20-alpine AS runner

WORKDIR /app

# Sadece production için gerekli olanları builder'dan al
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/apps/worker/package.json ./apps/worker/

# Sadece üretim bağımlılıklarını kur (Hızlıdır)
RUN npm install --workspace=@chaintrigger/shared --workspace=@chaintrigger/worker --production

# Derlenmiş kodları al
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist

ENV NODE_ENV=production
CMD ["npm", "run", "start", "--workspace=@chaintrigger/worker"]
