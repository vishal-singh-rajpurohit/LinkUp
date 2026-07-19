# Use a lightweight Nginx web server to serve static assets
FROM nginx:alpine

# Copy pre-built production assets from the local dist directory to Nginx html directory
COPY dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
