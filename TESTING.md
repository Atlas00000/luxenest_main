# Testing Guide

This document provides guidelines for testing the LuxeNest application.

## Test Credentials

See `test-credentials.md` for test account credentials.

## Manual Testing Checklist

### Authentication

#### Registration
- [ ] Register with valid data
- [ ] Register with invalid email format
- [ ] Register with weak password
- [ ] Register with existing email (should fail)
- [ ] Verify tokens are returned
- [ ] Verify user role is set to USER

#### Login
- [ ] Login with valid credentials
- [ ] Login with invalid email
- [ ] Login with wrong password
- [ ] Verify tokens are returned
- [ ] Verify user data is correct

#### Token Refresh
- [ ] Refresh with valid refresh token
- [ ] Refresh with expired refresh token
- [ ] Refresh with invalid refresh token
- [ ] Verify new tokens are returned

#### Logout
- [ ] Logout with valid refresh token
- [ ] Verify refresh token is invalidated
- [ ] Try to use invalidated refresh token (should fail)

### Products

#### Get Products
- [ ] Get all products (no filters)
- [ ] Filter by category
- [ ] Filter by price range
- [ ] Filter by featured
- [ ] Filter by onSale
- [ ] Filter by isNew
- [ ] Search by name/description
- [ ] Sort by price (asc/desc)
- [ ] Sort by rating
- [ ] Sort by reviewsCount
- [ ] Pagination (page, limit)
- [ ] Verify cache is working (second request should be faster)

#### Get Product by ID
- [ ] Get existing product
- [ ] Get non-existent product (should return 404)
- [ ] Verify product details are complete
- [ ] Verify reviews are included

#### Featured/New/Sale Products
- [ ] Get featured products
- [ ] Get new products
- [ ] Get sale products
- [ ] Verify limit parameter works

#### Admin Product Management
- [ ] Create product (admin only)
- [ ] Create product as regular user (should fail)
- [ ] Update product (admin only)
- [ ] Delete product (admin only)
- [ ] Verify cache invalidation after create/update/delete

### Categories

#### Get Categories
- [ ] Get all categories
- [ ] Get featured categories only
- [ ] Verify product counts are included

#### Get Category by ID/Slug
- [ ] Get category by ID
- [ ] Get category by slug
- [ ] Get non-existent category (should return 404)

#### Admin Category Management
- [ ] Create category (admin only)
- [ ] Update category (admin only)
- [ ] Delete category (admin only)
- [ ] Delete category with products (should fail)
- [ ] Verify cache invalidation

### Cart

#### Get Cart
- [ ] Get empty cart (new user)
- [ ] Get cart with items
- [ ] Verify items are populated with product data

#### Add to Cart
- [ ] Add product to cart
- [ ] Add same product again (should update quantity)
- [ ] Add product with quantity > stock (should fail)
- [ ] Add non-existent product (should fail)

#### Update Cart Item
- [ ] Update quantity
- [ ] Update to quantity > stock (should fail)
- [ ] Update to 0 (should remove item)

#### Remove from Cart
- [ ] Remove existing item
- [ ] Remove non-existent item (should fail)

#### Clear Cart
- [ ] Clear cart with items
- [ ] Clear empty cart

### Wishlist

#### Get Wishlist
- [ ] Get empty wishlist
- [ ] Get wishlist with items

#### Check Item in Wishlist
- [ ] Check existing item (should return true)
- [ ] Check non-existent item (should return false)

#### Add to Wishlist
- [ ] Add product to wishlist
- [ ] Add same product again (should fail or be idempotent)
- [ ] Add non-existent product (should fail)

#### Remove from Wishlist
- [ ] Remove existing item
- [ ] Remove non-existent item (should fail)

### Reviews

#### Get Product Reviews
- [ ] Get reviews for product
- [ ] Get reviews with pagination
- [ ] Get reviews for product with no reviews

#### Get User Review
- [ ] Get user's review for product
- [ ] Get review when user hasn't reviewed (should return 404)

#### Create Review
- [ ] Create review for product
- [ ] Create second review for same product (should fail)
- [ ] Create review with invalid rating (should fail)
- [ ] Verify product rating is updated

#### Mark Review Helpful
- [ ] Mark review as helpful
- [ ] Mark same review multiple times (should increment)

### Orders

#### Create Order
- [ ] Create order from cart
- [ ] Create order with empty cart (should fail)
- [ ] Create order with out-of-stock items (should fail)
- [ ] Verify cart is cleared after order
- [ ] Verify stock is decremented
- [ ] Verify shipping and tax are calculated

#### Get User Orders
- [ ] Get orders with pagination
- [ ] Filter by status
- [ ] Get orders for user with no orders

#### Get Order by ID
- [ ] Get existing order
- [ ] Get order belonging to another user (should fail)
- [ ] Get non-existent order (should return 404)

#### Update Order Status (Admin)
- [ ] Update order status (admin only)
- [ ] Update as regular user (should fail)
- [ ] Update to invalid status (should fail)

### Admin Dashboard

#### Get Admin Stats
- [ ] Get stats for different date ranges (7d, 30d, 90d, 1y)
- [ ] Verify revenue calculation
- [ ] Verify user counts
- [ ] Verify order counts
- [ ] Verify low stock alerts

#### Get Admin Orders
- [ ] Get all orders
- [ ] Filter by status
- [ ] Search orders

#### Get Admin Users
- [ ] Get all users
- [ ] Search users

#### Get Admin Products
- [ ] Get all products
- [ ] Search products
- [ ] Filter low stock products

### File Upload

#### Upload Image
- [ ] Upload valid image (admin only)
- [ ] Upload as regular user (should fail)
- [ ] Upload invalid file type (should fail)
- [ ] Upload file too large (should fail)
- [ ] Verify file is saved correctly
- [ ] Verify URL is returned

## Error Scenarios

### Authentication Errors
- [ ] Access protected route without token (401)
- [ ] Access protected route with invalid token (401)
- [ ] Access protected route with expired token (401)
- [ ] Access admin route as regular user (403)

### Validation Errors
- [ ] Submit invalid email format
- [ ] Submit password too short
- [ ] Submit negative price
- [ ] Submit invalid UUID
- [ ] Submit missing required fields

### Not Found Errors
- [ ] Access non-existent product (404)
- [ ] Access non-existent category (404)
- [ ] Access non-existent order (404)
- [ ] Access non-existent user (404)

### Conflict Errors
- [ ] Register with existing email (409)
- [ ] Create duplicate category (409)
- [ ] Create duplicate review (409)

## Performance Testing

### Cache Performance
- [ ] First request to products endpoint (should hit database)
- [ ] Second request to same endpoint (should hit cache, faster)
- [ ] Request after cache invalidation (should hit database again)

### Database Performance
- [ ] Query products with multiple filters
- [ ] Query products with sorting
- [ ] Query products with pagination
- [ ] Verify indexes are being used (check query execution time)

### API Response Times
- [ ] Product listing: < 200ms (cached: < 50ms)
- [ ] Product details: < 100ms (cached: < 30ms)
- [ ] Category listing: < 100ms (cached: < 30ms)
- [ ] Admin stats: < 500ms (cached: < 100ms)

## Integration Testing

### Complete User Flow
1. [ ] Register new user
2. [ ] Browse products
3. [ ] Filter and search products
4. [ ] View product details
5. [ ] Add products to cart
6. [ ] Update cart quantities
7. [ ] Add products to wishlist
8. [ ] Create order
9. [ ] View order history
10. [ ] Create product review

### Admin Flow
1. [ ] Login as admin
2. [ ] View admin dashboard
3. [ ] Create new product
4. [ ] Upload product image
5. [ ] Update product
6. [ ] Create category
7. [ ] View all orders
8. [ ] Update order status

## Edge Cases

### Cart Edge Cases
- [ ] Add product to cart, then product stock becomes 0
- [ ] Add product to cart, then product is deleted
- [ ] Update cart item quantity to exceed stock

### Order Edge Cases
- [ ] Create order when product stock changes between cart and checkout
- [ ] Create order with multiple items
- [ ] Cancel order (if implemented)

### Review Edge Cases
- [ ] Create review, then delete product
- [ ] Create review, then delete user
- [ ] Multiple users review same product

## Security Testing

### Authentication Security
- [ ] Password is hashed (not plain text)
- [ ] JWT tokens are properly signed
- [ ] Refresh tokens are stored securely
- [ ] Tokens expire correctly

### Authorization Security
- [ ] Regular users cannot access admin routes
- [ ] Users cannot access other users' data
- [ ] Users cannot modify other users' orders

### Input Validation
- [ ] SQL injection attempts are blocked
- [ ] XSS attempts are sanitized
- [ ] File uploads are validated
- [ ] Request size limits are enforced

## API Testing Tools

### Recommended Tools
- **Postman** - For manual API testing
- **Insomnia** - Alternative to Postman
- **Thunder Client** - VS Code extension
- **curl** - Command-line testing

### Example curl Commands

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test1234!"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'

# Get Products
curl http://localhost:5000/api/v1/products?page=1&limit=20

# Get Product by ID
curl http://localhost:5000/api/v1/products/{product-id}

# Add to Cart (requires auth)
curl -X POST http://localhost:5000/api/v1/cart/items \
  -H "Authorization: Bearer {access-token}" \
  -H "Content-Type: application/json" \
  -d '{"productId":"{product-id}","quantity":1}'
```

## Automated Testing (Future)

Consider implementing:
- Unit tests for services
- Integration tests for API endpoints
- E2E tests for critical user flows
- Load testing for performance
- Security testing automation

## Test Data

Use the seed script to populate test data:
```bash
cd server
pnpm prisma:seed
```

This creates:
- Admin user: `admin@luxenest.com`
- Test user: `test@example.com`
- Sample categories
- Sample products
- Sample reviews

## Reporting Issues

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Error messages/logs
5. Environment details
6. Request/response examples

