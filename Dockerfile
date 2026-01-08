# Combined Frontend + Backend Dockerfile
FROM node:20-alpine

# Install supervisor for process management
RUN apk add --no-cache supervisor

WORKDIR /app

# Copy backend package files and install
COPY backend/package*.json ./backend/
RUN cd backend && npm ci

# Copy frontend package files and install
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

# Copy source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build frontend
RUN cd frontend && npm run build

# Create uploads directory
RUN mkdir -p backend/uploads

# Create supervisor config
RUN mkdir -p /etc/supervisor.d
COPY <<EOF /etc/supervisor.d/app.ini
[supervisord]
nodaemon=true
logfile=/dev/stdout
logfile_maxbytes=0

[program:backend]
command=npm start
directory=/app/backend
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0

[program:frontend]
command=npm start -- -p 3000
directory=/app/frontend
environment=PORT="3000"
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
EOF

# Expose single port (backend proxies to frontend internally)
EXPOSE 5000

CMD ["supervisord", "-c", "/etc/supervisor.d/app.ini"]
