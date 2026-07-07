# syntax=docker/dockerfile:1

FROM node:22-slim AS base
LABEL org.opencontainers.image.source=https://github.com/reedjosh/anki-frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Dev image: Vite dev server with HMR. Tilt live_update syncs src/ into
# this container, so edits hot-reload without an image rebuild.
FROM base AS dev
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Prod image: static build served by nginx.
FROM base AS build
RUN npm run build

FROM nginx:1.29-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
