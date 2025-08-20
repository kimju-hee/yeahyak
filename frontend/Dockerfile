# 1) Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# ⬇️ 타입체크는 CI에서 소프트로, 도커 빌드는 번들만
RUN npm run build:docker

# 2) Runtime stage
FROM nginx:1.25-alpine
RUN printf 'server { \
  listen 80; \
  server_name _; \
  root /usr/share/nginx/html; \
  location / { try_files $uri /index.html; } \
}\n' > /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
