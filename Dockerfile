FROM node:22-alpine AS base

# deps
FROM base AS deps
WORKDIR /usr/src/app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

# builder
FROM base AS builder
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
ARG git_hash
ARG api_url
ARG self_url
ENV GIT_HASH=$git_hash
ENV NEXT_PUBLIC_API_BASE_URL=$api_url
ENV NEXT_PUBLIC_SELF_BASE_URL=$self_url
RUN npm run build

# server
FROM base AS server
WORKDIR /usr/src/app
ARG git_hash
ARG api_url
ARG self_url
ENV GIT_HASH=$git_hash
ENV NEXT_PUBLIC_API_BASE_URL=$api_url
ENV NEXT_PUBLIC_SELF_BASE_URL=$self_url
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /usr/src/app/public ./public
RUN mkdir .next
RUN chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /usr/src/app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENTRYPOINT ["node", "server.js"]
