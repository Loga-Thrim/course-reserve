FROM node:20-alpine

RUN apk add --no-cache supervisor

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm ci

COPY frontend/package*.json ./frontend/
RUN cd frontend && npm ci

COPY backend/ ./backend/
COPY frontend/ ./frontend/

RUN mkdir -p backend/uploads

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
command=sh -c "npm run build && npm run start -- -p 3000"
directory=/app/frontend
environment=PORT="3000"
autostart=true
autorestart=true
stdout_logfile=/dev/stdout
stdout_logfile_maxbytes=0
stderr_logfile=/dev/stderr
stderr_logfile_maxbytes=0
EOF

EXPOSE 5000

CMD ["supervisord", "-c", "/etc/supervisor.d/app.ini"]
