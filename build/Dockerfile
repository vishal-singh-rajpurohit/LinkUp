# Use a lightweight Nginx web server to serve static assets
FROM nginx:stable-alpine

# Copy pre-built production assets from host dist directory to Nginx html directory
COPY dist /usr/share/nginx/html

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
