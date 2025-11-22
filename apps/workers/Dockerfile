FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY apps/workers/package*.json ./apps/workers/

RUN npm ci

COPY apps/workers ./apps/workers
COPY apps/api/prisma ./apps/api/prisma
COPY tsconfig.json ./

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# Build worker
RUN npm run build --workspace=apps/workers

CMD ["node", "apps/workers/dist/index.js"]
