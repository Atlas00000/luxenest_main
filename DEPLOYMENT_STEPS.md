# Deployment Guide: Railway (Server + DB) + Vercel (Client)

This guide walks you through deploying the LuxeNest application with:
- **Server & Database**: Railway
- **Client**: Vercel

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **GitHub Repository**: Your code should be in a GitHub repository

---

## Part 1: Deploy Database on Railway

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your repository
5. Railway will create a new project

### Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will provision a PostgreSQL database
4. **Important**: Note down the connection details from the database service:
   - `DATABASE_URL` (full connection string)
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`

---

## Part 2: Deploy Server on Railway

### Step 3: Add Server Service

1. In the same Railway project, click **"+ New"**
2. Select **"GitHub Repo"** → Choose your repository
3. Railway will detect the repository

### Step 4: Configure Server Service

1. Click on the newly created service
2. Go to **"Settings"** tab
3. Set the **Root Directory** to: `server`
4. Go to **"Variables"** tab and add the following environment variables:

#### Required Environment Variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database
# (Use the DATABASE_URL from the PostgreSQL service you created)

# Server Configuration
NODE_ENV=production
PORT=5000

# CORS - Will be set after Vercel deployment (see Part 3)
CORS_ORIGIN=https://your-vercel-app.vercel.app

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis (Optional - for caching)
REDIS_URL=redis://default:password@host:port
# If you want Redis, add a Redis service in Railway and use its URL

# File Upload (Optional)
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp
```

### Step 5: Generate JWT Secrets

Run these commands to generate secure secrets:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 6: Run Database Migrations

1. In Railway, go to your server service
2. Click **"Deployments"** → **"Latest Deployment"**
3. Click **"View Logs"**
4. Once the server is running, you can run migrations via Railway CLI or add a startup script:

**Option A: Via Railway CLI (Recommended)**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run --service server pnpm prisma migrate deploy
```

**Option B: Add to package.json scripts**
Add this to `server/package.json`:
```json
"postinstall": "prisma generate",
"railway:deploy": "prisma migrate deploy && node dist/server.js"
```

### Step 7: Get Server URL

1. After deployment, Railway will provide a public URL
2. Go to **"Settings"** → **"Networking"**
3. Click **"Generate Domain"** or use the provided domain
4. **Note this URL** - you'll need it for the client configuration
5. Example: `https://your-server-name.up.railway.app`

---

## Part 3: Deploy Client on Vercel

### Step 8: Import Project to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Vercel will detect it's a Next.js project

### Step 9: Configure Vercel Project

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `client`
3. **Build Command**: `pnpm build` (or leave default)
4. **Output Directory**: `.next` (default)
5. **Install Command**: `pnpm install`

### Step 10: Add Environment Variables

In Vercel project settings, go to **"Environment Variables"** and add:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-server-name.up.railway.app/api/v1
NEXT_PUBLIC_API_HOSTNAME=your-server-name.up.railway.app

# Optional: Analytics, etc.
NEXT_PUBLIC_APP_URL=https://your-vercel-app.vercel.app
```

**Important**: 
- Replace `your-server-name.up.railway.app` with your actual Railway server URL
- Replace `your-vercel-app.vercel.app` with your actual Vercel app URL

### Step 11: Deploy Client

1. Click **"Deploy"**
2. Wait for the build to complete
3. Vercel will provide a URL (e.g., `https://your-app.vercel.app`)

### Step 12: Update CORS in Railway

1. Go back to Railway → Server service → **"Variables"**
2. Update `CORS_ORIGIN` to your Vercel URL:
   ```bash
   CORS_ORIGIN=https://your-app.vercel.app
   ```
3. If you have multiple domains (production, preview), add them separated by commas:
   ```bash
   CORS_ORIGIN=https://your-app.vercel.app,https://your-app-git-main.vercel.app
   ```
4. Railway will automatically redeploy

---

## Part 4: Update Server CORS Configuration (If Needed)

If you need to support multiple origins, update `server/src/app.ts`:

```typescript
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
const allowedOrigins = CORS_ORIGIN.split(',').map(origin => origin.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

---

## Part 5: Verify Deployment

### Test Server Health

```bash
curl https://your-server-name.up.railway.app/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test API Endpoint

```bash
curl https://your-server-name.up.railway.app/api/v1/products
```

### Test Client

1. Visit your Vercel URL
2. Check browser console for any CORS errors
3. Test API calls from the client

---

## Part 6: Database Seeding (Optional)

If you want to seed the database with initial data:

```bash
# Via Railway CLI
railway run --service server pnpm prisma:seed

# Or add to package.json and it will run automatically
```

---

## Environment Variables Summary

### Railway (Server) Variables:
```bash
DATABASE_URL=postgresql://...
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-vercel-app.vercel.app
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
REDIS_URL=redis://... (optional)
```

### Vercel (Client) Variables:
```bash
NEXT_PUBLIC_API_URL=https://your-server.up.railway.app/api/v1
NEXT_PUBLIC_API_HOSTNAME=your-server.up.railway.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## Troubleshooting

### Server Issues

1. **Database Connection Failed**
   - Verify `DATABASE_URL` is correct
   - Check Railway database service is running
   - Ensure migrations have run

2. **CORS Errors**
   - Verify `CORS_ORIGIN` matches your Vercel URL exactly
   - Check for trailing slashes
   - Ensure `credentials: true` is set

3. **Build Failures**
   - Check Railway build logs
   - Ensure `server/package.json` has correct scripts
   - Verify Prisma client is generated

### Client Issues

1. **API Connection Failed**
   - Verify `NEXT_PUBLIC_API_URL` is correct
   - Check server is running and accessible
   - Test server health endpoint

2. **Build Errors**
   - Check Vercel build logs
   - Ensure all environment variables are set
   - Verify Next.js configuration

---

## Directory Structure Verification

Ensure your project structure is properly separated:

```
luxenest/
├── client/              # Vercel deployment (separate)
│   ├── .vercelignore
│   ├── package.json
│   ├── next.config.mjs
│   └── ...
├── server/              # Railway deployment (separate)
│   ├── .railwayignore
│   ├── railway.json
│   ├── package.json
│   ├── prisma/
│   └── ...
└── docker-compose.yml   # Local development only (not deployed)
```

**No shared resources** - Each directory is completely independent.

---

## Continuous Deployment

Both Railway and Vercel support automatic deployments:

- **Railway**: Automatically deploys on push to main branch
- **Vercel**: Automatically deploys on push to main branch

To configure:
1. **Railway**: Settings → Source → Connect GitHub branch
2. **Vercel**: Settings → Git → Production Branch

---

## Monitoring

### Railway
- View logs in Railway dashboard
- Set up alerts in Railway settings
- Monitor database usage

### Vercel
- View build logs in Vercel dashboard
- Monitor analytics in Vercel dashboard
- Set up error tracking

---

## Security Checklist

- [ ] JWT secrets are strong and unique
- [ ] Database credentials are secure
- [ ] CORS is properly configured
- [ ] Environment variables are set (not hardcoded)
- [ ] HTTPS is enabled (automatic on Railway/Vercel)
- [ ] Database is not publicly accessible (Railway handles this)
- [ ] File upload limits are set
- [ ] Rate limiting is configured (if needed)

---

## Next Steps

1. Set up custom domains (optional)
2. Configure SSL certificates (automatic)
3. Set up monitoring and alerts
4. Configure backups for database
5. Set up staging environment (optional)

---

## Support

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs

