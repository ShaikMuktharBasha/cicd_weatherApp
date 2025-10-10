# Serve static files with nginx and backend URL injection
FROM nginx:alpine

# Install envsubst
RUN apk add --no-cache gettext

# Accept backend URL as build argument
ARG BACKEND_URL=http://backend:8085

# Set environment variable from build arg
ENV BACKEND_URL=${BACKEND_URL}

# Copy static files to nginx
COPY . /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Substitute environment variables in HTML
RUN envsubst '$BACKEND_URL' < /usr/share/nginx/html/index.html > /tmp/index.html && mv /tmp/index.html /usr/share/nginx/html/index.html

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
