FROM node:22-slim

# Prisma needs openssl
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Enables the pnpm version from "packageManager"
RUN corepack enable

WORKDIR /app

# Copy only manifests first so the install layer is cached
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Generate the Prisma client
COPY prisma ./prisma
RUN pnpm exec prisma generate --schema prisma/schema

COPY . .

EXPOSE 5000
CMD ["pnpm", "dev"]