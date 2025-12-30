# LuxeNest - Premium Home Decor E-Commerce Platform

A modern, full-stack e-commerce platform built with Next.js, Express.js, PostgreSQL, and Redis.

## Project Structure

```
luxenest/
├── client/                    # Next.js Frontend Application
│   ├── app/                  # Next.js App Router pages
│   ├── components/           # React components
│   ├── lib/                  # Utilities, API client, types
│   ├── public/               # Static assets
│   ├── styles/               # Global styles
│   ├── hooks/                # Custom React hooks
│   ├── package.json
│   └── ...
│
├── server/                    # Express.js Backend API
│   ├── +/                    # Source code (Note: + is the actual directory name)
│   │   ├── config/          # Database, Redis configuration
│   │   ├── controllers/     # Route controllers
│   │   ├── routes/          # API routes
│   │   ├── middleware/      # Auth, validation, error handling
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   └── types/           # TypeScript types
│   ├── prisma/              # Prisma schema and migrations
│   ├── uploads/             # Uploaded files
│   ├── package.json
│   └── ...
│
├── docker-compose.yml        # PostgreSQL + Redis services
├── scale-up.md              # Full-stack conversion plan
└── README.md                # This file
```

## Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui (Radix UI)
- **Animations**: Framer Motion
- **State Management**: React Context API
- **Package Manager**: pnpm

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15+
- **ORM**: Prisma
- **Cache**: Redis
- **Authentication**: JWT + Refresh Tokens
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 20+ 
- pnpm (package manager)
- Docker and Docker Compose

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd luxenest
   ```

2. **Start Docker services (PostgreSQL + Redis)**
   ```bash
   docker-compose up -d
   ```

3. **Install client dependencies**
   ```bash
   cd client
   pnpm install
   ```

4. **Install server dependencies**
   ```bash
   cd ../server
   pnpm install
   ```

5. **Set up environment variables**
   
   Create `client/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
   
   Create `server/.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL=postgresql://postgres:password@localhost:5432/luxenest?schema=public
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your-super-secret-jwt-key
   JWT_REFRESH_SECRET=your-super-secret-refresh-key
   JWT_EXPIRE=15m
   JWT_REFRESH_EXPIRE=7d
   FRONTEND_URL=http://localhost:3000
   CORS_ORIGIN=http://localhost:3000
   ```

6. **Run database migrations and seed data**
   ```bash
   cd server
   pnpm prisma migrate dev
   pnpm prisma generate
   pnpm prisma:seed
   ```
   
   This will:
   - Create database tables
   - Seed initial data (categories, products, users)
   - Create test accounts (see `test-credentials.md`)

### Development

**Start the client (Next.js)**
```bash
cd client
pnpm dev
```
Client runs on http://localhost:3000

**Start the server (Express)**
```bash
cd server
pnpm dev
```
Server runs on http://localhost:5000

### Docker Services

**Start services**
```bash
docker-compose up -d
```

**Stop services**
```bash
docker-compose down
```

**View logs**
```bash
docker-compose logs -f
```

**Reset database** (⚠️ This will delete all data)
```bash
docker-compose down -v
docker-compose up -d
```

## Available Services

- **PostgreSQL**: `localhost:5432`
  - User: `postgres`
  - Password: `password`
  - Database: `luxenest`

- **Redis**: `localhost:6379`

## Project Status

✅ **Full-stack conversion complete!** All features have been implemented.

### Completed Features

- ✅ **Week 1**: Project Setup & Foundation
- ✅ **Week 2**: Authentication & User Management
- ✅ **Week 3**: Products & Categories
- ✅ **Week 4**: Cart & Wishlist
- ✅ **Week 5**: Reviews & Advanced Features
- ✅ **Week 6**: Orders & Checkout
- ✅ **Week 7**: Admin Dashboard & File Upload
- ✅ **Week 8**: Data Migration, Testing & Documentation

### Features

- 🔐 **Authentication**: JWT-based auth with refresh tokens
- 🛍️ **E-Commerce**: Products, categories, cart, wishlist
- 📦 **Orders**: Order creation, tracking, management
- ⭐ **Reviews**: Product reviews with ratings
- 🎨 **Admin Dashboard**: Statistics, user/product/order management
- 📤 **File Upload**: Image upload for products/categories
- 🚀 **Performance**: Redis caching, database indexes
- 📱 **Responsive**: Mobile-first design

## Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- **[Testing Guide](./TESTING.md)** - Testing checklist and guidelines
- **[Test Credentials](./test-credentials.md)** - Test account information
- **[Deployment Guide](./DEPLOYMENT.md)** - Production deployment instructions
- **[Scale-Up Plan](./scale-up.md)** - Implementation roadmap

## Scripts

### Client Scripts
```bash
cd client
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Server Scripts
```bash
cd server
pnpm dev              # Start development server (with hot reload)
pnpm build            # Build TypeScript to JavaScript
pnpm start            # Start production server
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:migrate   # Run database migrations
pnpm prisma:seed      # Seed database with initial data
pnpm prisma:studio    # Open Prisma Studio (database GUI)
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Your License Here]

## Quick Start

```bash
# 1. Start Docker services
docker-compose up -d

# 2. Install dependencies
cd client && pnpm install
cd ../server && pnpm install

# 3. Set up database
cd server
pnpm prisma migrate dev
pnpm prisma:seed

# 4. Start development servers
# Terminal 1: Client
cd client && pnpm dev

# Terminal 2: Server
cd server && pnpm dev
```

Visit:
- Frontend: http://localhost:3000
- API: http://localhost:5000/api/v1
- Test credentials: See `test-credentials.md`

## API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## Testing

See [TESTING.md](./TESTING.md) for testing guidelines and checklist.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

## Support

For issues and questions, please open an issue on the repository.

