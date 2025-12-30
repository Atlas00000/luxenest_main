# Deployment Guide

This guide covers deploying LuxeNest to production environments.

## Prerequisites

- Production server (VPS, cloud instance, etc.)
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)
- PostgreSQL database (managed or self-hosted)
- Redis instance (managed or self-hosted)
- Node.js 20+ installed
- pnpm installed

## Environment Setup

### Production Environment Variables

#### Client (`client/.env.production`)

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

#### Server (`server/.env`)

```env
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@host:5432/luxenest?schema=public

# Redis
REDIS_URL=redis://host:6379

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-production-jwt-secret-min-32-chars
JWT_REFRESH_SECRET=your-production-refresh-secret-min-32-chars
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d

# CORS
FRONTEND_URL=https://yourdomain.com
CORS_ORIGIN=https://yourdomain.com

# File Upload
UPLOAD_MAX_SIZE=5242880
UPLOAD_DIR=./uploads
```

### Generate Secure Secrets

```bash
# Generate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Setup

### 1. Create Production Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE luxenest_production;

# Create user (optional, for better security)
CREATE USER luxenest_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE luxenest_production TO luxenest_user;
```

### 2. Run Migrations

```bash
cd server
pnpm prisma migrate deploy
pnpm prisma generate
```

### 3. Seed Initial Data (Optional)

```bash
pnpm prisma:seed
```

## Redis Setup

### Option 1: Managed Redis (Recommended)

Use a managed Redis service:
- **AWS ElastiCache**
- **Redis Cloud**
- **DigitalOcean Managed Redis**
- **Upstash**

### Option 2: Self-Hosted Redis

```bash
# Install Redis
sudo apt-get install redis-server

# Configure Redis
sudo nano /etc/redis/redis.conf

# Set password (requirepass)
requirepass your_redis_password

# Restart Redis
sudo systemctl restart redis
```

Update `REDIS_URL`:
```
redis://:your_redis_password@localhost:6379
```

## Build and Deploy

### 1. Build Client

```bash
cd client
pnpm install
pnpm build
```

The build output will be in `client/.next/`

### 2. Build Server

```bash
cd server
pnpm install
pnpm build
```

The build output will be in `server/dist/`

### 3. Start Services

#### Using PM2 (Recommended)

```bash
# Install PM2 globally
npm install -g pm2

# Start server
cd server
pm2 start dist/server.js --name luxenest-server

# Start Next.js (if not using static export)
cd ../client
pm2 start npm --name luxenest-client -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

#### Using systemd

Create `/etc/systemd/system/luxenest-server.service`:

```ini
[Unit]
Description=LuxeNest API Server
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/luxenest/server
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable luxenest-server
sudo systemctl start luxenest-server
```

## Reverse Proxy (Nginx)

### Nginx Configuration

Create `/etc/nginx/sites-available/luxenest`:

```nginx
# API Server
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File upload size limit
    client_max_body_size 10M;
}

# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /path/to/luxenest/client/.next;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static assets
    location /_next/static {
        alias /path/to/luxenest/client/.next/static;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Uploaded files
    location /uploads {
        alias /path/to/luxenest/server/uploads;
        expires 1y;
        add_header Cache-Control "public";
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/luxenest /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

## File Storage

### Development (Current)
Files are stored locally in `server/uploads/`

### Production Options

#### Option 1: Local Storage
Ensure directory exists and has proper permissions:
```bash
mkdir -p server/uploads
chmod 755 server/uploads
```

#### Option 2: Cloud Storage (Recommended)
Consider migrating to:
- **AWS S3**
- **Cloudinary**
- **DigitalOcean Spaces**
- **Google Cloud Storage**

Update `server/+/services/upload.service.ts` to use cloud storage SDK.

## Monitoring

### Application Monitoring

#### PM2 Monitoring
```bash
pm2 monit
pm2 logs
```

#### Health Check Endpoint
Add to your server:
```typescript
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});
```

### Database Monitoring

- Monitor connection pool usage
- Set up slow query logging
- Monitor database size
- Set up backups

### Redis Monitoring

```bash
redis-cli info
redis-cli monitor
```

## Backup Strategy

### Database Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres luxenest_production > /backups/luxenest_$DATE.sql

# Keep last 30 days
find /backups -name "luxenest_*.sql" -mtime +30 -delete
```

### File Backups

```bash
# Backup uploads directory
tar -czf /backups/uploads_$(date +%Y%m%d).tar.gz /path/to/server/uploads
```

## Security Checklist

- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS/SSL
- [ ] Set secure CORS origins
- [ ] Use environment variables for secrets
- [ ] Enable database SSL connections
- [ ] Set up firewall rules
- [ ] Use Redis password authentication
- [ ] Implement rate limiting
- [ ] Set up log monitoring
- [ ] Regular security updates
- [ ] Database user with minimal privileges
- [ ] File upload validation and size limits
- [ ] Input sanitization
- [ ] SQL injection prevention (Prisma handles this)

## Performance Optimization

### Production Builds

```bash
# Client
cd client
pnpm build

# Server
cd server
pnpm build
```

### Caching

- Redis caching is already implemented
- Consider CDN for static assets
- Enable Next.js Image Optimization
- Use compression middleware

### Database

- Connection pooling (Prisma handles this)
- Indexes are already in place
- Consider read replicas for high traffic

## Scaling

### Horizontal Scaling

1. **Load Balancer**: Use Nginx or cloud load balancer
2. **Multiple Server Instances**: Run multiple Node.js processes
3. **Database**: Use read replicas
4. **Redis**: Use Redis Cluster for high availability

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Use database connection pooling

## Troubleshooting

### Common Issues

#### Database Connection Errors
- Check `DATABASE_URL` is correct
- Verify database is running
- Check firewall rules
- Verify database user permissions

#### Redis Connection Errors
- Check `REDIS_URL` is correct
- Verify Redis is running
- Check authentication
- Verify network connectivity

#### File Upload Issues
- Check directory permissions
- Verify disk space
- Check file size limits
- Verify upload directory exists

#### CORS Errors
- Verify `CORS_ORIGIN` matches frontend URL
- Check Nginx proxy headers
- Verify SSL certificate

### Logs

```bash
# Application logs
pm2 logs luxenest-server

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# System logs
sudo journalctl -u luxenest-server -f
```

## Rollback Procedure

1. Stop services
2. Restore database backup
3. Revert code to previous version
4. Rebuild and restart

```bash
# Stop services
pm2 stop all

# Restore database
psql -U postgres luxenest_production < backup.sql

# Revert code (git)
git checkout previous-version

# Rebuild and restart
cd server && pnpm build && pm2 restart luxenest-server
```

## CI/CD (Optional)

Consider setting up:
- **GitHub Actions**
- **GitLab CI**
- **Jenkins**
- **CircleCI**

Example GitHub Actions workflow:
```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          # Add deployment commands
```

## Support

For deployment issues, check:
- Application logs
- Database logs
- Nginx logs
- System resources (CPU, memory, disk)

