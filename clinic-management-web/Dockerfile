# Stage 1 — build the React/Vite app
FROM node:20-alpine AS build
WORKDIR /app

# Copy lockfile + manifest first for layer caching
COPY package.json package-lock.json* ./
RUN npm ci

# Build arg lets docker-compose inject the API URL at build time
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

COPY . .
RUN npm run build

# Stage 2 — serve with Nginx
FROM nginx:alpine AS runtime
# Remove default config
RUN rm /etc/nginx/conf.d/default.conf
# Copy our custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
