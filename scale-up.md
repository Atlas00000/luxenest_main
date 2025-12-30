# LuxeNest Full-Stack Conversion Plan

## Architecture Overview

### Tech Stack (MERN + PostgreSQL)

- **Frontend**: Next.js 15 (App Router) - Keep existing
- **Backend**: Node.js + Express.js (TypeScript)
- **Database**: PostgreSQL 15+ with Prisma ORM
- **Cache**: Redis (sessions, cart, rate limiting)
- **Authentication**: JWT + Refresh Tokens
- **File Upload**: Multer + Cloudinary (or local for dev)
- **Validation**: Zod (already in use)
- **API Client**: Axios

### Why PostgreSQL over MongoDB?

- **Relational Data**: Better for orders, reviews, and user relationships
- **ACID Compliance**: Critical for e-commerce transactions
- **Complex Queries**: Better support for filtering, sorting, and aggregations
- **Data Integrity**: Foreign keys and constraints ensure data consistency
- **Mature Ecosystem**: Well-established for production applications

## Project Structure

```
luxenest/
├── client/                    # Next.js Frontend
│   ├── app/                  # App Router pages
│   ├── components/            # React components
│   ├── lib/                  # Utilities, API client
│   │   ├── api/             # API service functions
│   │   │   ├── auth.ts
│   │   │   ├── products.ts
│   │   │   ├── cart.ts
│   │   │   └── wishlist.ts
│   │   └── utils.ts
│   ├── public/              # Static assets
│   ├── package.json
│   └── .env.local           # Client env vars
│
├── server/                    # Express Backend
│   ├── src/
│   │   ├── config/          # Database, Redis config
│   │   │   ├── database.ts
│   │   │   └── redis.ts
│   │   ├── controllers/     # Route controllers
│   │   │   ├── auth.controller.ts
│   │   │   ├── product.controller.ts
│   │   │   ├── cart.controller.ts
│   │   │   └── wishlist.controller.ts
│   │   ├── models/          # Prisma models (auto-generated)
│   │   ├── routes/          # API routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── product.routes.ts
│   │   │   └── index.ts
│   │   ├── middleware/      # Auth, validation, error handling
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── validate.middleware.ts
│   │   ├── services/        # Business logic
│   │   │   ├── auth.service.ts
│   │   │   └── product.service.ts
│   │   ├── utils/          # Helpers
│   │   │   ├── jwt.util.ts
│   │   │   └── bcrypt.util.ts
│   │   ├── types/          # TypeScript types
│   │   │   └── index.ts
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── seed.ts        # Database seeding
│   ├── package.json
│   └── .env                 # Server env vars
│
├── docker-compose.yml        # PostgreSQL + Redis
├── .gitignore
└── README.md
```

## Database Schema (PostgreSQL + Prisma)

### Prisma Schema

```prisma
// User Model
model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  password      String
  role          Role      @default(USER)
  avatar        String?
  emailVerified Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  cart          Cart?
  wishlist      Wishlist?
  orders        Order[]
  reviews       Review[]
  
  @@map("users")
}

enum Role {
  USER
  ADMIN
}

// Category Model
model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  description String?
  image       String
  slug        String    @unique
  featured    Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  products    Product[]
  
  @@map("categories")
}

// Product Model
model Product {
  id                 String    @id @default(uuid())
  name               String
  description        String    @db.Text
  price              Decimal   @db.Decimal(10, 2)
  images             String[]
  categoryId         String
  category           Category  @relation(fields: [categoryId], references: [id])
  tags               String[]
  rating             Float     @default(0)
  reviewsCount       Int      @default(0)
  stock              Int       @default(0)
  featured           Boolean   @default(false)
  isNew              Boolean   @default(false)
  onSale             Boolean   @default(false)
  discount           Int?      @default(0)
  sustainabilityScore Int?      @default(0)
  colors             String[]
  sizes              String[]
  materials          String[]
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt
  
  cartItems          CartItem[]
  wishlistItems      WishlistItem[]
  orderItems         OrderItem[]
  reviews            Review[]
  
  @@index([categoryId])
  @@index([featured])
  @@index([onSale])
  @@map("products")
}

// Review Model
model Review {
  id        String   @id @default(uuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  rating    Int      @db.SmallInt
  title     String
  comment   String   @db.Text
  helpful   Int      @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([productId, userId])
  @@index([productId])
  @@index([userId])
  @@map("reviews")
}

// Cart Model
model Cart {
  id        String     @id @default(uuid())
  userId    String     @unique
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]
  updatedAt DateTime   @updatedAt
  
  @@map("carts")
}

// CartItem Model
model CartItem {
  id        String   @id @default(uuid())
  cartId    String
  cart      Cart     @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantity  Int      @default(1)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([cartId, productId])
  @@index([cartId])
  @@map("cart_items")
}

// Wishlist Model
model Wishlist {
  id        String          @id @default(uuid())
  userId    String          @unique
  user      User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     WishlistItem[]
  updatedAt DateTime        @updatedAt
  
  @@map("wishlists")
}

// WishlistItem Model
model WishlistItem {
  id        String    @id @default(uuid())
  wishlistId String
  wishlist  Wishlist @relation(fields: [wishlistId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  
  @@unique([wishlistId, productId])
  @@index([wishlistId])
  @@map("wishlist_items")
}

// Order Model
model Order {
  id              String      @id @default(uuid())
  userId          String
  user            User        @relation(fields: [userId], references: [id])
  items           OrderItem[]
  subtotal        Decimal     @db.Decimal(10, 2)
  shipping        Decimal     @db.Decimal(10, 2)
  tax             Decimal     @db.Decimal(10, 2)
  total           Decimal     @db.Decimal(10, 2)
  shippingAddress Json
  status          OrderStatus @default(PENDING)
  paymentMethod   String
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([userId])
  @@index([status])
  @@map("orders")
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

// OrderItem Model
model OrderItem {
  id        String   @id @default(uuid())
  orderId   String
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id])
  quantity  Int
  price     Decimal  @db.Decimal(10, 2)
  createdAt DateTime @default(now())
  
  @@index([orderId])
  @@map("order_items")
}

// Room Model (Shop the Room)
model Room {
  id          String     @id @default(uuid())
  name        String
  description String?
  image       String
  hotspots    Json       // Array of {x, y, productId}
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  @@map("rooms")
}
```

## Environment Variables

### Server (.env)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/luxenest?schema=public
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000
```

### Client (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Docker Compose Setup

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: luxenest-postgres
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: luxenest
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - luxenest-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: luxenest-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - luxenest-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  redis_data:

networks:
  luxenest-network:
    driver: bridge
```

## Weekly Implementation Plan

### Week 1: Project Setup & Foundation

#### Day 1-2: Project Restructuring
- [ ] Create `client/` directory and move existing Next.js app
- [ ] Create `server/` directory structure
- [ ] Update root `.gitignore` for both client and server
- [ ] Create `docker-compose.yml` in root
- [ ] Update root `README.md` with new structure
- [ ] Test that existing client still works after move

#### Day 3-4: Docker & Database Setup
- [ ] Set up Docker Compose with PostgreSQL and Redis
- [ ] Initialize Prisma in server directory
- [ ] Create Prisma schema based on design above
- [ ] Set up database connection configuration
- [ ] Test database connection
- [ ] Create initial migration
- [ ] Set up Redis connection configuration
- [ ] Test Redis connection

#### Day 5: Backend Foundation
- [ ] Initialize Express server with TypeScript
- [ ] Set up project structure (controllers, routes, middleware, services)
- [ ] Configure environment variables
- [ ] Set up CORS middleware
- [ ] Set up error handling middleware
- [ ] Set up request logging middleware
- [ ] Create API response utility functions
- [ ] Test basic server startup

### Week 2: Authentication & User Management

#### Day 1-2: Authentication Backend
- [ ] Create User model in Prisma schema
- [ ] Create authentication service (register, login, logout)
- [ ] Implement JWT token generation
- [ ] Implement refresh token mechanism
- [ ] Create password hashing utility (bcrypt)
- [ ] Create authentication middleware
- [ ] Create auth routes (POST /register, POST /login, POST /logout, POST /refresh)
- [ ] Add input validation with Zod
- [ ] Test authentication endpoints

#### Day 3: User Profile APIs
- [ ] Create user profile route (GET /users/me)
- [ ] Create update profile route (PATCH /users/me)
- [ ] Add email validation
- [ ] Add password change functionality
- [ ] Test user profile endpoints

#### Day 4-5: Frontend Auth Integration
- [ ] Create API client service in client (`lib/api/auth.ts`)
- [ ] Update `auth-provider.tsx` to use real API
- [ ] Remove localStorage-based auth
- [ ] Add token refresh logic
- [ ] Update login page to use API
- [ ] Update registration flow
- [ ] Add error handling for auth failures
- [ ] Test complete auth flow (register → login → protected routes)

### Week 3: Products & Categories

#### Day 1-2: Product Backend
- [ ] Create Product and Category models in Prisma
- [ ] Create product service (CRUD operations)
- [ ] Create product controller
- [ ] Create product routes:
  - [ ] GET /products (list with pagination, filtering, sorting)
  - [ ] GET /products/:id (single product)
  - [ ] POST /products (admin only)
  - [ ] PATCH /products/:id (admin only)
  - [ ] DELETE /products/:id (admin only)
- [ ] Implement product filtering (category, price, stock, sustainability)
- [ ] Implement product sorting
- [ ] Add search functionality
- [ ] Test product endpoints

#### Day 3: Category Backend
- [ ] Create category service
- [ ] Create category controller
- [ ] Create category routes:
  - [ ] GET /categories (list all)
  - [ ] GET /categories/:id (single category)
  - [ ] POST /categories (admin only)
- [ ] Test category endpoints

#### Day 4-5: Frontend Product Integration
- [ ] Create API client for products (`lib/api/products.ts`)
- [ ] Create API client for categories (`lib/api/categories.ts`)
- [ ] Update products page to fetch from API
- [ ] Update product detail page to fetch from API
- [ ] Update homepage featured products to use API
- [ ] Update categories component to use API
- [ ] Remove all `lib/data.ts` imports
- [ ] Delete `lib/data.ts` file
- [ ] Test product browsing flow

### Week 4: Cart & Wishlist

#### Day 1-2: Cart Backend
- [ ] Create Cart and CartItem models in Prisma
- [ ] Create cart service (add, remove, update quantity, clear)
- [ ] Create cart controller
- [ ] Create cart routes:
  - [ ] GET /cart (get user's cart)
  - [ ] POST /cart/items (add item)
  - [ ] PATCH /cart/items/:productId (update quantity)
  - [ ] DELETE /cart/items/:productId (remove item)
  - [ ] DELETE /cart (clear cart)
- [ ] Implement Redis caching for cart (optional optimization)
- [ ] Add cart validation (stock check, quantity limits)
- [ ] Test cart endpoints

#### Day 3: Wishlist Backend
- [ ] Create Wishlist and WishlistItem models in Prisma
- [ ] Create wishlist service (add, remove, get)
- [ ] Create wishlist controller
- [ ] Create wishlist routes:
  - [ ] GET /wishlist (get user's wishlist)
  - [ ] POST /wishlist/items (add item)
  - [ ] DELETE /wishlist/items/:productId (remove item)
- [ ] Test wishlist endpoints

#### Day 4-5: Frontend Cart & Wishlist Integration
- [ ] Create API client for cart (`lib/api/cart.ts`)
- [ ] Create API client for wishlist (`lib/api/wishlist.ts`)
- [ ] Update `cart.tsx` provider to use API
- [ ] Update `wishlist.tsx` provider to use API
- [ ] Update cart page to use API
- [ ] Update wishlist page to use API
- [ ] Remove localStorage for cart and wishlist
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test complete cart and wishlist flows

### Week 5: Reviews & Advanced Features

#### Day 1-2: Reviews Backend
- [ ] Create Review model in Prisma
- [ ] Create review service (create, get, update helpful count)
- [ ] Create review controller
- [ ] Create review routes:
  - [ ] GET /products/:id/reviews (get product reviews)
  - [ ] POST /products/:id/reviews (create review)
  - [ ] PATCH /reviews/:id/helpful (mark as helpful)
- [ ] Update product rating when review is added
- [ ] Add validation (one review per user per product)
- [ ] Test review endpoints

#### Day 3: Shop the Room Backend
- [ ] Create Room model in Prisma
- [ ] Create room service
- [ ] Create room controller
- [ ] Create room routes:
  - [ ] GET /rooms (list all rooms)
  - [ ] GET /rooms/:id (single room)
- [ ] Test room endpoints

#### Day 4-5: Frontend Reviews & Rooms Integration
- [ ] Create API client for reviews (`lib/api/reviews.ts`)
- [ ] Create API client for rooms (`lib/api/rooms.ts`)
- [ ] Update product detail page to show real reviews
- [ ] Add review submission form
- [ ] Update Shop the Room component to use API
- [ ] Test review submission flow
- [ ] Test room browsing

### Week 6: Orders & Checkout

#### Day 1-2: Order Backend
- [ ] Create Order and OrderItem models in Prisma
- [ ] Create order service (create, get user orders, update status)
- [ ] Create order controller
- [ ] Create order routes:
  - [ ] POST /orders (create order from cart)
  - [ ] GET /orders (get user's orders)
  - [ ] GET /orders/:id (get single order)
  - [ ] PATCH /orders/:id/status (admin only - update status)
- [ ] Implement order creation logic (calculate totals, tax, shipping)
- [ ] Clear cart after order creation
- [ ] Add order validation
- [ ] Test order endpoints

#### Day 3: Checkout Backend
- [ ] Create shipping calculation service
- [ ] Add shipping address validation
- [ ] Create checkout route (POST /checkout)
- [ ] Integrate with order creation
- [ ] Add payment method handling (mock for now)
- [ ] Test checkout flow

#### Day 4-5: Frontend Checkout Integration
- [ ] Create API client for orders (`lib/api/orders.ts`)
- [ ] Update checkout page to use API
- [ ] Add shipping address form
- [ ] Add order confirmation page
- [ ] Update cart to show order summary
- [ ] Add order history page
- [ ] Test complete checkout flow

### Week 7: Admin Dashboard & File Upload

#### Day 1-2: Admin APIs
- [ ] Create admin middleware (role-based access)
- [ ] Create admin dashboard routes:
  - [ ] GET /admin/stats (revenue, users, sales, products)
  - [ ] GET /admin/orders (all orders with filters)
  - [ ] GET /admin/users (user management)
  - [ ] GET /admin/products (product management)
- [ ] Add analytics endpoints
- [ ] Test admin endpoints

#### Day 3: File Upload
- [ ] Set up Multer for file uploads
- [ ] Configure Cloudinary (or local storage for dev)
- [ ] Create upload service
- [ ] Create upload route (POST /upload)
- [ ] Add image validation
- [ ] Test file upload

#### Day 4-5: Frontend Admin & Upload
- [ ] Create API client for admin (`lib/api/admin.ts`)
- [ ] Update admin dashboard to use real APIs
- [ ] Add product image upload in admin
- [ ] Add category image upload
- [ ] Test admin dashboard
- [ ] Test file uploads

### Week 8: Data Migration & Testing

#### Day 1-2: Database Seeding
- [ ] Create Prisma seed script
- [ ] Convert existing mock data to seed data
- [ ] Seed users (including admin user)
- [ ] Seed categories
- [ ] Seed products
- [ ] Seed rooms
- [ ] Test seed script
- [ ] Run migrations and seed

#### Day 3: Remove All Mock Data
- [ ] Search for all mock data references
- [ ] Remove all placeholder data
- [ ] Remove all localStorage fallbacks
- [ ] Update error messages to be API-aware
- [ ] Test all pages for missing data

#### Day 4: Performance Optimization
- [ ] Add database indexes (verify Prisma indexes are created)
- [ ] Implement Redis caching for:
  - [ ] Product listings
  - [ ] Categories
  - [ ] User sessions
- [ ] Add API response caching headers
- [ ] Optimize database queries (use Prisma select)
- [ ] Test performance improvements

#### Day 5: Final Testing & Documentation
- [ ] End-to-end testing of all features
- [ ] Test error scenarios
- [ ] Test authentication edge cases
- [ ] Update API documentation
- [ ] Update README with setup instructions
- [ ] Create deployment guide
- [ ] Code review and cleanup

## Best Practices Checklist

### Security
- [ ] Password hashing with bcrypt (salt rounds: 10+)
- [ ] JWT tokens with short expiration (15min) + refresh tokens (7 days)
- [ ] Rate limiting on auth endpoints (express-rate-limit + Redis)
- [ ] Input validation on all endpoints (Zod schemas)
- [ ] CORS properly configured
- [ ] Helmet.js for security headers
- [ ] Environment variables for all secrets
- [ ] SQL injection prevention (Prisma handles this)
- [ ] XSS prevention (input sanitization)

### Performance
- [ ] Redis caching for frequently accessed data
- [ ] Database indexes on foreign keys and search fields
- [ ] Pagination on all list endpoints
- [ ] Image optimization (Next.js Image component)
- [ ] API response compression (compression middleware)
- [ ] Connection pooling for database
- [ ] Query optimization (Prisma select specific fields)

### Code Quality
- [ ] TypeScript strict mode enabled
- [ ] ESLint configured and passing
- [ ] Prettier configured
- [ ] Consistent error handling
- [ ] Request validation on all endpoints
- [ ] Consistent API response format
- [ ] Proper logging (Winston or Pino)
- [ ] Environment-based configuration

### API Design
- [ ] RESTful conventions followed
- [ ] Consistent response format:
  ```typescript
  {
    success: boolean,
    data?: any,
    message?: string,
    error?: string
  }
  ```
- [ ] API versioning (/api/v1/)
- [ ] Proper HTTP status codes
- [ ] API documentation (Swagger/OpenAPI)

### Database
- [ ] Proper indexes on frequently queried fields
- [ ] Foreign key constraints
- [ ] Unique constraints where needed
- [ ] Timestamps (createdAt, updatedAt) on all models
- [ ] Soft deletes where appropriate
- [ ] Database migrations version controlled

## Testing Strategy

### Backend Testing
- [ ] Unit tests for services
- [ ] Integration tests for API endpoints
- [ ] Test authentication flows
- [ ] Test error handling
- [ ] Test validation

### Frontend Testing
- [ ] Component tests for critical components
- [ ] Integration tests for user flows
- [ ] Test API error handling
- [ ] Test loading states

### E2E Testing
- [ ] Complete user registration flow
- [ ] Complete product browsing and purchase flow
- [ ] Admin dashboard functionality
- [ ] Cart and wishlist operations

## Deployment Considerations

### Environment Setup
- [ ] Production database (managed PostgreSQL)
- [ ] Production Redis (managed Redis)
- [ ] Environment variables configured
- [ ] SSL certificates
- [ ] Domain configuration

### Monitoring
- [ ] Error tracking (Sentry)
- [ ] Application monitoring
- [ ] Database monitoring
- [ ] API analytics

### Backup Strategy
- [ ] Database backup schedule
- [ ] Backup restoration testing
- [ ] Disaster recovery plan

## Success Metrics

- [ ] All mock data removed
- [ ] All features working with real database
- [ ] Authentication fully functional
- [ ] Cart and wishlist persisting in database
- [ ] Orders being created successfully
- [ ] Admin dashboard functional
- [ ] API response times < 200ms for most endpoints
- [ ] Zero critical security vulnerabilities
- [ ] All tests passing

## Notes

- Keep existing frontend working during migration
- Test each feature before moving to next
- Use feature branches for each week's work
- Regular commits with clear messages
- Code review before merging to main

## Estimated Timeline

**Total Duration**: 8 weeks (40 working days)

- Week 1: Setup & Foundation
- Week 2: Authentication
- Week 3: Products & Categories
- Week 4: Cart & Wishlist
- Week 5: Reviews & Advanced Features
- Week 6: Orders & Checkout
- Week 7: Admin & File Upload
- Week 8: Migration & Testing

This plan provides a structured approach to converting LuxeNest from a frontend-only application to a full-stack application with PostgreSQL, following industry best practices.

