# 1) Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# 프로젝트에 맞춰 build 스크립트 사용
# RUN npm run build
RUN npm run build:ci

# 2) Runtime stage
FROM nginx:1.25-alpine
# SPA 라우팅
RUN printf 'server { \
  listen 80; \
  server_name _; \
  root /usr/share/nginx/html; \
  location / { try_files $uri /index.html; } \
}\n' > /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html