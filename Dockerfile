FROM node as build

# Variables
ARG NODE_ENV=prod
ARG NODE_OPTIONS="--max_old_space_size=4096"
ENV NG_CLI_ANALYTICS=ci \
    NODE_ENV=${NODE_ENV} \
    NODE_OPTIONS=${NODE_OPTIONS}

# Setup
WORKDIR /app
COPY . .

# Install & build
RUN if [ ! -d "dist" ]; then npm ci && npm run build; fi

# Use Nginx to serve
FROM nginx:1.20-alpine
COPY --from=build /app/dist/browser /usr/share/nginx/html
COPY docker/robots.txt /usr/share/nginx/html/robots.txt
COPY docker/nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
