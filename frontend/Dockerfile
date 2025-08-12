# 1) 빌드 단계
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# 필요 시 ENV/ARG로 VITE_* 값 세팅 가능
RUN npm run build

# 2) 런타임 단계
FROM nginx:1.25-alpine
RUN printf 'server { \
  listen 80; \
  server_name _; \
  root /usr/share/nginx/html; \
  location / { try_files $uri /index.html; } \
}\n' > /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
