# Quick Deployment Reference

## Railway (Server + DB) Setup

### 1. Create Railway Project
- Go to railway.app → New Project → Deploy from GitHub
- Add PostgreSQL database service
- Add server service (set root directory to `server`)

### 2. Server Environment Variables (Railway)
```bash
DATABASE_URL=<from-postgres-service>
NODE_ENV=production
PORT=5000
CORS_ORIGIN=https://your-vercel-app.vercel.app
JWT_SECRET=<generate-32-char-secret>
JWT_REFRESH_SECRET=<generate-32-char-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 3. Run Migrations
```bash
railway run --service server pnpm prisma migrate deploy
```

### 4. Get Server URL
- Railway provides: `https://your-server.up.railway.app`

---

## Vercel (Client) Setup

### 1. Import Project
- Go to vercel.com → Add New Project → Import GitHub repo
- Set root directory to `client`

### 2. Client Environment Variables (Vercel)
```bash
NEXT_PUBLIC_API_URL=https://your-server.up.railway.app/api/v1
NEXT_PUBLIC_API_HOSTNAME=your-server.up.railway.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 3. Deploy
- Click Deploy
- Get Vercel URL: `https://your-app.vercel.app`

### 4. Update CORS in Railway
- Go back to Railway → Server → Variables
- Update `CORS_ORIGIN` to your Vercel URL

---

## Directory Separation

✅ **Server** (`server/`) → Railway
- Has its own `package.json`
- Has its own `node_modules/`
- Has its own `.env` variables
- Independent deployment

✅ **Client** (`client/`) → Vercel
- Has its own `package.json`
- Has its own `node_modules/`
- Has its own `.env.local` variables
- Independent deployment

✅ **No Shared Resources**
- No shared `node_modules/`
- No shared environment files
- No shared build artifacts
- Completely separated

---

## Generate JWT Secrets

```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT_REFRESH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Test Deployment

```bash
# Test server health
curl https://your-server.up.railway.app/health

# Test API
curl https://your-server.up.railway.app/api/v1/products
```

---

## Important Notes

1. **CORS**: Must match exactly (no trailing slashes)
2. **Database**: Migrations must run before server starts
3. **Environment Variables**: Must be set in both platforms
4. **HTTPS**: Automatic on both Railway and Vercel
5. **Auto-Deploy**: Both platforms auto-deploy on git push

