# Multi-stage build for production PWA
FROM node:20.11.1-slim as build

WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application code
COPY . .

# Build the PWA
RUN npm run build:pwa

# Production stage with nginx for PWA
FROM nginx:alpine

# Copy custom nginx config for PWA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app
COPY --from=build /app/build /usr/share/nginx/html

# Add cache headers for service worker
RUN echo 'location /service-worker.js { add_header Cache-Control "no-cache, no-store, must-revalidate"; add_header Pragma "no-cache"; add_header Expires "0"; }' > /etc/nginx/conf.d/sw.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]