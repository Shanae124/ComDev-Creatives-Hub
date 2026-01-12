# ProtexxaLearn - Production Deployment Guide

## Pre-Launch Checklist

### Security
- [ ] Change JWT_SECRET to a strong random string (32+ chars)
- [ ] Enable HTTPS/SSL certificates
- [ ] Set secure database password
- [ ] Configure firewall rules
- [ ] Enable CORS with specific domains
- [ ] Set up rate limiting
- [ ] Enable request logging
- [ ] Configure security headers

### Database
- [ ] Set up PostgreSQL backups (daily)
- [ ] Test backup restoration
- [ ] Enable connection pooling
- [ ] Configure query timeouts
- [ ] Set up monitoring alerts
- [ ] Enable slow query logging

### Performance
- [ ] Configure CDN for static assets
- [ ] Enable gzip compression
- [ ] Set up caching headers
- [ ] Configure database connection pooling
- [ ] Set up load balancing (if multiple servers)
- [ ] Test under 1000+ concurrent users
- [ ] Enable minification for frontend

### Monitoring
- [ ] Set up error tracking (Sentry, New Relic, etc.)
- [ ] Configure performance monitoring
- [ ] Set up uptime monitoring
- [ ] Enable access logs
- [ ] Create alert thresholds

### Infrastructure
- [ ] Choose hosting provider (AWS, Azure, DigitalOcean, etc.)
- [ ] Set up CI/CD pipeline
- [ ] Configure auto-scaling
- [ ] Set up health check endpoints
- [ ] Enable automatic backups

## Deployment Steps

### 1. Environment Setup

Create production `.env`:
```bash
# Backend
NODE_ENV=production
PORT=3000
DB_USER=postgres
DB_PASSWORD=strong_secure_password
DB_HOST=prod-db.example.com
DB_NAME=protexxalearn_prod
JWT_SECRET=your_very_long_secure_random_string_here_min_32_chars
LOG_LEVEL=INFO
MAX_FILE_SIZE=52428800
```

### 2. Database Setup

```bash
# Create production database
createdb -U postgres -h prod-db.example.com protexxalearn_prod

# Initialize schema
NODE_ENV=production node initdb.js
```

### 3. Backend Deployment

```bash
# Install dependencies
npm install --production

# Start with process manager (PM2, forever, etc.)
pm2 start server.js -n "protexxalearn-backend"

# Or with systemd
sudo systemctl start protexxalearn
```

### 4. Frontend Deployment

```bash
cd frontend

# Install dependencies
npm install --production

# Build production bundle
npm run build

# Serve with production server
pm2 start "npm run preview" -n "protexxalearn-frontend"
```

## Scaling Architecture

### Single Server
```
┌─────────────────────────────────┐
│   Nginx (Reverse Proxy)         │
├─────────────────────────────────┤
│   Node.js Backend (Port 3000)   │
├─────────────────────────────────┤
│   PostgreSQL                    │
└─────────────────────────────────┘
```

### Multi-Server (Load Balanced)
```
┌──────────────────────────────────────────┐
│   Load Balancer (HAProxy / AWS LB)       │
├──────────┬──────────┬──────────┬─────────┤
│ Server 1 │ Server 2 │ Server 3 │ Server N│
│ Backend  │ Backend  │ Backend  │ Backend │
└──────────┴──────────┴──────────┴─────────┘
                │
        ┌───────┴────────┐
        │  PostgreSQL    │
        │  Master        │
        └────────────────┘
```

## Configuration Examples

### Nginx Reverse Proxy

```nginx
upstream backend {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
    keepalive 32;
}

server {
    listen 80;
    server_name api.example.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.example.com;
    
    ssl_certificate /etc/ssl/certs/cert.pem;
    ssl_certificate_key /etc/ssl/private/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;
    
    # Backend routing
    location / {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
    }
}
```

### PM2 Ecosystem File

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'protexxalearn-backend',
      script: './server.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: '1G'
    },
    {
      name: 'protexxalearn-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: './frontend',
      env: {
        NODE_ENV: 'production',
        PORT: 5173
      }
    }
  ],
  deploy: {
    production: {
      user: 'ubuntu',
      host: 'prod.example.com',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/protexxalearn.git',
      path: '/var/www/protexxalearn',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
};
```

## Monitoring & Maintenance

### Health Check Endpoint

```javascript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date(),
    uptime: process.uptime()
  });
});
```

### Database Maintenance

```bash
# Weekly: Vacuum and analyze
psql -U postgres -d protexxalearn_prod -c "VACUUM ANALYZE;"

# Monthly: Backup
pg_dump -U postgres -h prod-db.example.com protexxalearn_prod | gzip > backup-$(date +%Y%m%d).sql.gz

# Test backup restoration
gunzip < backup-20240101.sql.gz | psql -U postgres -d test_restore
```

### Log Rotation

```bash
# /etc/logrotate.d/protexxalearn
/var/www/protexxalearn/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

## Performance Tuning

### PostgreSQL Configuration

```bash
# Edit /etc/postgresql/14/main/postgresql.conf

# Connection settings
max_connections = 300
shared_buffers = 256MB
effective_cache_size = 1GB

# Performance
work_mem = 16MB
maintenance_work_mem = 64MB
random_page_cost = 1.1
effective_io_concurrency = 200

# Logging
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_statement = 'ddl'
log_min_duration_statement = 5000
```

### Node.js Tuning

```javascript
// Increase file descriptor limit
const os = require('os');
process.setMaxListeners(100);

// Monitor memory
setInterval(() => {
  const mem = process.memoryUsage();
  console.log(`Memory: ${Math.round(mem.heapUsed / 1024 / 1024)}MB / ${Math.round(mem.heapTotal / 1024 / 1024)}MB`);
}, 60000);
```

## Disaster Recovery

### Backup Strategy

1. **Daily automated backups** (stored to S3/cloud)
2. **Weekly full backups** (stored offline)
3. **Test restoration monthly**
4. **Document recovery procedure**

### Recovery Procedure

```bash
# 1. Stop application
pm2 stop protexxalearn-backend

# 2. Restore database
gunzip < backup-20240101.sql.gz | psql -U postgres -d protexxalearn_prod

# 3. Verify integrity
psql -U postgres -d protexxalearn_prod -c "SELECT COUNT(*) FROM users;"

# 4. Restart application
pm2 start protexxalearn-backend
```

## Support & Maintenance

- Monitor logs daily
- Review performance metrics weekly
- Update dependencies monthly
- Security patches: immediately
- Plan capacity upgrades quarterly
- Review and update documentation

---

For questions or issues, contact your DevOps team or create an issue on GitHub.
