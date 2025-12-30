# Test Credentials

## Admin Account
- **Email:** `admin@luxenest.com`
- **Password:** `Admin1234!`
- **Role:** ADMIN

## Test User Account
- **Email:** `test@example.com`
- **Password:** `Test1234!`
- **Role:** USER

## Usage
These credentials are created by the Prisma seed script (`server/prisma/seed.ts`). To reset the database and recreate these accounts, run:

```bash
cd server
pnpm prisma:seed
```

## Notes
- All passwords are hashed using bcrypt with 10 salt rounds
- Admin account has full access to admin dashboard and all admin endpoints
- Test user account can perform regular user operations (browse products, add to cart, create orders, etc.)

