FROM node:23-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install -g pnpm && pnpm install

COPY . .

# pnpm build is not working. throwing 404 page error
# https://stackoverflow.com/questions/79482694/nextjs-15-build-error-occurred-prerendering-page-404
# check why
RUN npm run build

FROM node:23-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/next-env.d.ts ./

EXPOSE 3000

CMD ["pnpm", "start"]