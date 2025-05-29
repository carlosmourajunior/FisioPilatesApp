#!/bin/bash

# Script to configure nginx with environment variables
# This will replace the nginx.conf template with actual values

# Default values if environment variables are not set
HOST_DOMAIN=${HOST_DOMAIN:-localhost}
BACKEND_HOST=${BACKEND_HOST:-backend}
BACKEND_PORT=${BACKEND_PORT:-8000}

# Create nginx configuration from template
envsubst '$HOST_DOMAIN $BACKEND_HOST $BACKEND_PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx
nginx -g "daemon off;"
