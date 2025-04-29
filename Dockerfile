FROM node:22-alpine AS build
RUN corepack enable

WORKDIR /app
COPY . .

RUN pnpm install
RUN pnpm build
RUN apk add --no-cache postgresql-client

FROM node:22-alpine
ENV HOST=0.0.0.0
ENV NODE_PORT=9090
ENV NODE_ENV=production
WORKDIR /app
COPY package.json .
COPY pnpm-lock.yaml .
COPY drizzle.config.ts .
COPY drizzle/ ./drizzle/
COPY data/ ./data/

RUN corepack enable
RUN pnpm install --prod
COPY --from=build /app/dist/server.js server.js

EXPOSE 9090
CMD ["node", "./server.js"]
