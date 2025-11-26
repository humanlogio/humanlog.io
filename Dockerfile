FROM node:22-alpine AS base

# deps
FROM base AS deps
WORKDIR /usr/src/app
RUN apk add --no-cache libc6-compat git
ARG GITHUB_TOKEN

RUN echo "GITHUB_TOKEN is set: $(if [ -n "$GITHUB_TOKEN" ]; then echo 'YES'; else echo 'NO'; fi)"
RUN git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "ssh://git@github.com/"
RUN git config --global --list | grep url || echo "No git url config found"
COPY package.json package-lock.json* ./
RUN npm ci
RUN git config --global --unset-all url."https://${GITHUB_TOKEN}@github.com/".insteadOf || true

# builder
FROM base AS builder
WORKDIR /usr/src/app
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
ARG git_hash
ARG api_url
ARG self_url
ARG default_release_channel
ARG posthog_key
ARG posthog_host
ARG is_prod
ARG build_heap_size=4096
ENV GIT_HASH=$git_hash
ENV NEXT_PUBLIC_API_BASE_URL=$api_url
ENV NEXT_PUBLIC_SELF_BASE_URL=$self_url
ENV NEXT_PUBLIC_DEFAULT_RELEASE_CHANNEL=$default_release_channel
ENV NEXT_PUBLIC_IS_PROD=$is_prod
ENV NEXT_PUBLIC_POSTHOG_KEY=$posthog_key
ENV NEXT_PUBLIC_POSTHOG_HOST=$posthog_host
ENV NODE_OPTIONS="--max_old_space_size=$build_heap_size"
ENV GENERATE_SOURCEMAP=false
RUN npm run build

# server
FROM base AS server
WORKDIR /usr/src/app
ARG git_hash
ARG api_url
ARG self_url
ARG default_release_channel
ARG is_prod
ENV GIT_HASH=$git_hash
ENV NEXT_PUBLIC_API_BASE_URL=$api_url
ENV NEXT_PUBLIC_SELF_BASE_URL=$self_url
ENV NEXT_PUBLIC_DEFAULT_RELEASE_CHANNEL=$default_release_channel
ENV NEXT_PUBLIC_IS_PROD=$is_prod
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
