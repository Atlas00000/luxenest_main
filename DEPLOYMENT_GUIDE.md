# LuxeNest Deployment Guide

## Overview

LuxeNest is designed with **complete separation** between client and server, allowing for flexible deployment strategies. This guide covers multiple deployment scenarios.

## Deployment Strategies

### Strategy 1: Monorepo Deployment (Development)
- **Client & Server**: Same repository, same deployment
- **Use Case**: Development, staging, small projects
- **Platforms**: Single VPS, Docker Compose

### Strategy 2: Separate Deployments (Production Recommended)
- **Client**: Deploy independently (Vercel, Netlify, Cloudflare Pages)
- **Server**: Deploy independently (Railway, Render, Heroku, AWS)
- **Use Case**: Production, scalability, independent scaling
- **Benefits**: 
  - Independent scaling
  - Different deployment schedules
  - Cost optimization
  - Better performance (CDN for client)

### Strategy 3: Containerized Deployment
- **Client & Server**: Both containerized with Docker
- **Use Case**: Kubernetes, Docker Swarm, cloud container services
- **Platforms**: AWS ECS, Google Cloud Run, Azure Container Instances

---

## Prerequisites

- Node.js 20+ installed
- pnpm package manager
- Docker and Docker Compose (for local development)
- Git repository access
- Environment variables configured

---

## Environment Variables

### Client Environment Variables

Create `client/.env.local` (or use `.env.example` as template):

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_API_HOSTNAME=api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

### Server Environment Variables

Create `server/.env` (or use `.env.example` as template):

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/luxenest?schema=public
REDIS_URL=redis://host:6379
JWT_SECRET=your-production-secret-key
JWT_REFRESH_SECRET=your-production-refresh-secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CORS_ORIGIN=https://yourdomain.com
FRONTEND_URL=https://yourdomain.com
```

---

## Deployment Scenarios

### Scenario A: Vercel (Client) + Railway (Server)

#### Deploy Client to Vercel

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Login
   vercel login
   
   # Deploy from client directory
   cd client
   vercel
   ```

2. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add:
     - `NEXT_PUBLIC_API_URL` = `https://your-api.railway.app/api/v1`
     - `NEXT_PUBLIC_API_HOSTNAME` = `your-api.railway.app`
     - `NEXT_PUBLIC_APP_URL` = `https://yourdomain.com`

3. **Configure Build Settings**
   - Root Directory: `client`
   - Build Command: `pnpm build`
   - Output Directory: `.next`

#### Deploy Server to Railway

1. **Create New Project**
   - Go to Railway dashboard
   - New Project → Deploy from GitHub

2. **Configure Service**
   - Root Directory: `server`
   - Build Command: `pnpm install && pnpm prisma generate && pnpm build`
   - Start Command: `pnpm start`

3. **Add Environment Variables**
   - Add all variables from `server/.env.example`
   - Set `DATABASE_URL` to Railway PostgreSQL
   - Set `REDIS_URL` to Railway Redis (or external)

4. **Run Migrations**
   ```bash
   # Via Railway CLI or dashboard
   railway run pnpm prisma migrate deploy
   railway run pnpm prisma:seed
   ```

---

### Scenario B: Netlify (Client) + Render (Server)

#### Deploy Client to Netlify

1. **Connect Repository**
   - Go to Netlify Dashboard
   - Add new site → Import from Git

2. **Build Settings**
   - Base directory: `client`
   - Build command: `pnpm build`
   - Publish directory: `client/.next`

3. **Environment Variables**
   - Add all `NEXT_PUBLIC_*` variables
   - Set API URL to Render service URL

#### Deploy Server to Render

1. **Create Web Service**
   - New → Web Service
   - Connect repository
   - Root Directory: `server`

2. **Build & Start Commands**
   - Build: `pnpm install && pnpm prisma generate && pnpm build`
   - Start: `pnpm start`

3. **Environment Variables**
   - Add all variables from `.env.example`
   - Use Render PostgreSQL and Redis

4. **Run Migrations**
   ```bash
   render run pnpm prisma migrate deploy
   ```

---

### Scenario C: Docker Compose (Full Stack)

#### Production Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_USER: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - luxenest-network

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    networks:
      - luxenest-network

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
      - JWT_SECRET=${JWT_SECRET}
      - JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
      - CORS_ORIGIN=${CORS_ORIGIN}
    depends_on:
      - postgres
      - redis
    networks:
      - luxenest-network

  client:
    build:
      context: ./client
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NEXT_PUBLIC_API_HOSTNAME=${NEXT_PUBLIC_API_HOSTNAME}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    depends_on:
      - server
    networks:
      - luxenest-network

volumes:
  postgres_data:
  redis_data:

networks:
  luxenest-network:
    driver: bridge
```

#### Deploy

```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose -f docker-compose.prod.yml exec server pnpm prisma migrate deploy
```

---

### Scenario D: AWS ECS / Google Cloud Run

#### Build and Push Images

```bash
# Build client image
cd client
docker build -t luxenest-client:latest .

# Build server image
cd ../server
docker build -t luxenest-server:latest .

# Tag and push to registry
docker tag luxenest-client:latest your-registry/luxenest-client:latest
docker tag luxenest-server:latest your-registry/luxenest-server:latest
docker push your-registry/luxenest-client:latest
docker push your-registry/luxenest-server:latest
```

#### Deploy to Cloud Run / ECS

- Use container images in cloud service
- Configure environment variables
- Set up database and Redis (managed services)
- Configure load balancer and domain

---

## Database Setup

### Production Database

1. **Create Database**
   - Use managed PostgreSQL (AWS RDS, Railway, Render, etc.)
   - Note connection string

2. **Run Migrations**
   ```bash
   cd server
   pnpm prisma migrate deploy
   ```

3. **Seed Data (Optional)**
   ```bash
   pnpm prisma:seed
   ```

### Redis Setup

1. **Create Redis Instance**
   - Use managed Redis (Upstash, Railway, AWS ElastiCache)
   - Note connection string

2. **Update Environment**
   - Set `REDIS_URL` in server environment

---

## Post-Deployment Checklist

### Client
- [ ] Environment variables configured
- [ ] API URL points to production server
- [ ] Image optimization working (check remotePatterns)
- [ ] Build succeeds without errors
- [ ] All routes accessible
- [ ] Analytics/tracking configured (if needed)

### Server
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Redis connection working
- [ ] CORS configured for client domain
- [ ] Health check endpoint working (`/health`)
- [ ] File uploads directory has write permissions
- [ ] Logging configured
- [ ] Error tracking configured (Sentry, etc.)

### Security
- [ ] HTTPS enabled (SSL certificates)
- [ ] JWT secrets are strong and unique
- [ ] Database credentials are secure
- [ ] CORS origins are restricted
- [ ] Rate limiting configured (if needed)
- [ ] File upload validation working
- [ ] Environment variables not exposed

### Performance
- [ ] CDN configured for static assets
- [ ] Image optimization working
- [ ] Caching headers configured
- [ ] Database indexes created
- [ ] Redis caching working
- [ ] Monitoring set up (if needed)

---

## Troubleshooting

### Client Issues

**Images not loading**
- Check `NEXT_PUBLIC_API_HOSTNAME` is set correctly
- Verify `remotePatterns` in `next.config.mjs`
- Check CORS on server

**API calls failing**
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check server is running and accessible
- Verify CORS configuration

### Server Issues

**Database connection errors**
- Verify `DATABASE_URL` is correct
- Check database is accessible
- Run migrations: `pnpm prisma migrate deploy`

**Redis connection errors**
- Verify `REDIS_URL` is correct
- Check Redis is accessible
- Test connection manually

**File uploads not working**
- Check uploads directory permissions
- Verify `MAX_FILE_SIZE` is set
- Check file type validation

---

## Monitoring & Maintenance

### Recommended Tools

- **Error Tracking**: Sentry, Rollbar
- **Performance**: New Relic, Datadog
- **Logging**: Logtail, Papertrail
- **Uptime**: UptimeRobot, Pingdom
- **Analytics**: Google Analytics, Plausible

### Regular Maintenance

- Update dependencies monthly
- Review and rotate secrets quarterly
- Monitor database performance
- Review error logs weekly
- Backup database daily
- Test disaster recovery quarterly

---

## Support

For deployment issues:
1. Check environment variables
2. Review logs (client and server)
3. Verify database/Redis connections
4. Check CORS configuration
5. Review this guide

For additional help, see:
- [API Documentation](./API_DOCUMENTATION.md)
- [Testing Guide](./TESTING.md)
- [Main README](./README.md)

