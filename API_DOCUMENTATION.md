# LuxeNest API Documentation

**Base URL:** `http://localhost:5000/api/v1`  
**Version:** 1.0.0

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Products](#products)
4. [Categories](#categories)
5. [Cart](#cart)
6. [Wishlist](#wishlist)
7. [Reviews](#reviews)
8. [Orders](#orders)
9. [Rooms](#rooms)
10. [Recommendations](#recommendations)
11. [Admin](#admin)
12. [File Upload](#file-upload)
13. [Error Handling](#error-handling)
14. [Authentication Flow](#authentication-flow)

---

## Authentication

### Register

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token"
    }
  }
}
```

### Login

Authenticate and receive access tokens.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    },
    "tokens": {
      "accessToken": "jwt-token",
      "refreshToken": "refresh-token"
    }
  }
}
```

### Refresh Token

Get a new access token using refresh token.

**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "new-jwt-token",
    "refreshToken": "new-refresh-token"
  }
}
```

### Logout

Invalidate refresh token.

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Users

### Get Current User

Get authenticated user's profile.

**Endpoint:** `GET /users/me`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "avatar": null,
    "emailVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Profile

Update authenticated user's profile.

**Endpoint:** `PATCH /users/me`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "name": "John Updated",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "uuid",
    "name": "John Updated",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg"
  }
}
```

### Change Password

Change user's password.

**Endpoint:** `PATCH /users/change-password`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Products

### Get Products

Get paginated list of products with filtering and sorting.

**Endpoint:** `GET /products`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `categoryId` (string) - Filter by category
- `minPrice` (number) - Minimum price
- `maxPrice` (number) - Maximum price
- `inStock` (boolean) - Filter in-stock items
- `sustainable` (boolean) - Filter sustainable products
- `featured` (boolean) - Filter featured products
- `isNew` (boolean) - Filter new products
- `onSale` (boolean) - Filter products on sale
- `search` (string) - Search in name, description, tags
- `sortBy` (string) - Sort field: `name`, `price`, `rating`, `createdAt`, `reviewsCount`
- `sortOrder` (string) - Sort order: `asc`, `desc`

**Example:**
```
GET /products?page=1&limit=20&featured=true&sortBy=rating&sortOrder=desc
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Serene Lounge Chair",
        "description": "A modern lounge chair...",
        "price": 599.99,
        "images": ["/images/product.jpg"],
        "category": {
          "id": "uuid",
          "name": "Living Room",
          "slug": "living-room"
        },
        "tags": ["furniture", "comfort"],
        "rating": 4.8,
        "reviewsCount": 124,
        "stock": 15,
        "featured": true,
        "isNew": false,
        "onSale": false,
        "discount": null,
        "sustainabilityScore": 4,
        "colors": ["Natural Oak", "Walnut"],
        "sizes": [],
        "materials": ["Solid Oak", "Premium Fabric"]
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### Get Product by ID

Get single product details.

**Endpoint:** `GET /products/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Serene Lounge Chair",
    "description": "A modern lounge chair...",
    "price": 599.99,
    "images": ["/images/product.jpg"],
    "category": {
      "id": "uuid",
      "name": "Living Room",
      "slug": "living-room",
      "description": "Furniture and decor..."
    },
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "title": "Excellent quality!",
        "comment": "The product exceeded my expectations.",
        "helpful": 10,
        "user": {
          "id": "uuid",
          "name": "John Doe"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Get Featured Products

Get featured products.

**Endpoint:** `GET /products/featured?limit=8`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Serene Lounge Chair",
      "price": 599.99,
      "images": ["/images/product.jpg"],
      "featured": true
    }
  ]
}
```

### Get New Products

Get new arrival products.

**Endpoint:** `GET /products/new?limit=8`

### Get Sale Products

Get products on sale.

**Endpoint:** `GET /products/sale?limit=8`

### Create Product (Admin Only)

Create a new product.

**Endpoint:** `POST /products`

**Headers:**
```
Authorization: Bearer <admin-access-token>
```

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 299.99,
  "images": ["/images/product.jpg"],
  "categoryId": "uuid",
  "tags": ["furniture"],
  "stock": 10,
  "featured": false,
  "isNew": true,
  "onSale": false,
  "discount": null,
  "sustainabilityScore": 4,
  "colors": ["Black", "White"],
  "sizes": ["Small", "Large"],
  "materials": ["Wood", "Metal"]
}
```

**Response:** `201 Created`

### Update Product (Admin Only)

Update a product.

**Endpoint:** `PATCH /products/:id`

**Headers:**
```
Authorization: Bearer <admin-access-token>
```

### Delete Product (Admin Only)

Delete a product.

**Endpoint:** `DELETE /products/:id`

**Headers:**
```
Authorization: Bearer <admin-access-token>
```

---

## Categories

### Get Categories

Get all categories.

**Endpoint:** `GET /categories?featured=true`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Living Room",
      "description": "Furniture and decor...",
      "image": "/images/category.jpg",
      "slug": "living-room",
      "featured": true,
      "_count": {
        "products": 25
      }
    }
  ]
}
```

### Get Category by ID

**Endpoint:** `GET /categories/:id`

### Get Category by Slug

**Endpoint:** `GET /categories/slug/:slug`

### Create Category (Admin Only)

**Endpoint:** `POST /categories`

**Headers:**
```
Authorization: Bearer <admin-access-token>
```

**Request Body:**
```json
{
  "name": "New Category",
  "description": "Category description",
  "image": "/images/category.jpg",
  "slug": "new-category",
  "featured": false
}
```

### Update Category (Admin Only)

**Endpoint:** `PATCH /categories/:id`

### Delete Category (Admin Only)

**Endpoint:** `DELETE /categories/:id`

---

## Cart

All cart endpoints require authentication.

### Get Cart

Get user's shopping cart.

**Endpoint:** `GET /cart`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "items": [
      {
        "id": "uuid",
        "product": {
          "id": "uuid",
          "name": "Serene Lounge Chair",
          "price": 599.99,
          "images": ["/images/product.jpg"]
        },
        "quantity": 2
      }
    ],
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Add Item to Cart

**Endpoint:** `POST /cart/items`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "productId": "uuid",
  "quantity": 1
}
```

**Response:** `201 Created`

### Update Cart Item Quantity

**Endpoint:** `PATCH /cart/items/:productId`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "quantity": 3
}
```

### Remove Item from Cart

**Endpoint:** `DELETE /cart/items/:productId`

**Headers:**
```
Authorization: Bearer <access-token>
```

### Clear Cart

**Endpoint:** `DELETE /cart`

**Headers:**
```
Authorization: Bearer <access-token>
```

---

## Wishlist

All wishlist endpoints require authentication.

### Get Wishlist

**Endpoint:** `GET /wishlist`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "items": [
      {
        "id": "uuid",
        "product": {
          "id": "uuid",
          "name": "Serene Lounge Chair",
          "price": 599.99,
          "images": ["/images/product.jpg"]
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### Check if Product in Wishlist

**Endpoint:** `GET /wishlist/items/:productId/check`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "inWishlist": true
  }
}
```

### Add to Wishlist

**Endpoint:** `POST /wishlist/items/:productId`

**Headers:**
```
Authorization: Bearer <access-token>
```

### Remove from Wishlist

**Endpoint:** `DELETE /wishlist/items/:productId`

**Headers:**
```
Authorization: Bearer <access-token>
```

---

## Reviews

### Get Product Reviews

Get reviews for a product.

**Endpoint:** `GET /products/:productId/reviews`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": "uuid",
        "rating": 5,
        "title": "Excellent quality!",
        "comment": "The product exceeded my expectations.",
        "helpful": 10,
        "user": {
          "id": "uuid",
          "name": "John Doe"
        },
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

### Get User's Review for Product

**Endpoint:** `GET /products/:productId/reviews/me`

**Headers:**
```
Authorization: Bearer <access-token>
```

### Create Review

**Endpoint:** `POST /products/:productId/reviews`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "rating": 5,
  "title": "Excellent quality!",
  "comment": "The product exceeded my expectations."
}
```

**Response:** `201 Created`

### Mark Review as Helpful

**Endpoint:** `PATCH /reviews/:id/helpful`

**Headers:**
```
Authorization: Bearer <access-token>
```

---

## Orders

### Create Order

Create order from cart.

**Endpoint:** `POST /orders`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "credit_card"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": "uuid",
    "items": [
      {
        "product": {
          "id": "uuid",
          "name": "Serene Lounge Chair"
        },
        "quantity": 2,
        "price": 599.99
      }
    ],
    "subtotal": 1199.98,
    "shipping": 10.00,
    "tax": 96.00,
    "total": 1305.98,
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get User Orders

Get authenticated user's orders.

**Endpoint:** `GET /orders`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `status` (string) - Filter by status

### Get Order by ID

**Endpoint:** `GET /orders/:id`

**Headers:**
```
Authorization: Bearer <access-token>
```

### Update Order Status (Admin Only)

**Endpoint:** `PATCH /orders/:id/status`

**Headers:**
```
Authorization: Bearer <admin-access-token>
```

**Request Body:**
```json
{
  "status": "SHIPPED"
}
```

---

## Rooms

### Get Rooms

Get all rooms for "Shop the Room" feature.

**Endpoint:** `GET /rooms`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Modern Living Room",
      "description": "A contemporary living space...",
      "image": "/images/room.jpg",
      "hotspots": [
        {
          "x": 25,
          "y": 45,
          "productId": "uuid"
        }
      ]
    }
  ]
}
```

### Get Room by ID

**Endpoint:** `GET /rooms/:id`

---

## Recommendations

### Get Product Recommendations

Get recommended products based on a product.

**Endpoint:** `GET /products/:productId/recommendations?limit=8`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Recommended Product",
      "price": 299.99,
      "images": ["/images/product.jpg"]
    }
  ]
}
```

### Get User Recommendations

Get personalized recommendations for authenticated user.

**Endpoint:** `GET /user/recommendations?limit=8`

**Headers:**
```
Authorization: Bearer <access-token>
```

### Get Trending Products

Get trending products.

**Endpoint:** `GET /trending?limit=8`

---

## Admin

All admin endpoints require admin role.

### Get Admin Stats

Get dashboard statistics.

**Endpoint:** `GET /admin/stats?dateRange=30d`

**Headers:**
```
Authorization: Bearer <admin-access-token>
```

**Query Parameters:**
- `dateRange` (string) - `7d`, `30d`, `90d`, `1y`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "revenue": {
      "total": 50000.00,
      "growth": 15.5,
      "averageOrderValue": 125.00
    },
    "orders": {
      "total": 1000,
      "recent": 400,
      "byStatus": {
        "PENDING": 50,
        "PROCESSING": 100,
        "SHIPPED": 150,
        "DELIVERED": 100
      }
    },
    "users": {
      "total": 500,
      "new": 50
    },
    "products": {
      "total": 200,
      "lowStock": 10
    }
  }
}
```

### Get Admin Orders

**Endpoint:** `GET /admin/orders?page=1&limit=20&status=PENDING`

### Get Admin Users

**Endpoint:** `GET /admin/users?page=1&limit=20&search=john`

### Get Admin Products

**Endpoint:** `GET /admin/products?page=1&limit=20&search=chair&lowStock=true`

---

## File Upload

### Upload Single Image

Upload a single image file.

**Endpoint:** `POST /upload/single-image`

**Headers:**
```
Authorization: Bearer <admin-access-token>
Content-Type: multipart/form-data
```

**Request Body:**
```
FormData:
  image: <file>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Image uploaded successfully",
  "data": {
    "url": "/uploads/filename.jpg",
    "filename": "filename.jpg"
  }
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": "Error message",
  "statusCode": 400
}
```

### Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

### Common Errors

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Unauthorized. Please login.",
  "statusCode": 401
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "error": "Access denied. Admin role required.",
  "statusCode": 403
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Product not found",
  "statusCode": 404
}
```

**409 Conflict:**
```json
{
  "success": false,
  "error": "Email already registered",
  "statusCode": 409
}
```

---

## Authentication Flow

### 1. Register/Login

1. User registers or logs in
2. Server returns `accessToken` (15 min expiry) and `refreshToken` (7 days expiry)
3. Client stores both tokens securely

### 2. Making Authenticated Requests

Include the access token in the Authorization header:
```
Authorization: Bearer <access-token>
```

### 3. Token Refresh

When access token expires (401 response):

1. Client sends refresh token to `/auth/refresh`
2. Server validates refresh token
3. Server returns new access and refresh tokens
4. Client updates stored tokens

### 4. Logout

1. Client sends refresh token to `/auth/logout`
2. Server invalidates refresh token in Redis
3. Client clears stored tokens

### Security Notes

- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Refresh tokens are stored in Redis and can be invalidated
- Passwords are hashed using bcrypt (10 salt rounds)
- All admin endpoints require admin role verification

---

## Rate Limiting

Currently not implemented. Consider adding rate limiting for production:
- Auth endpoints: 5 requests per 15 minutes
- General endpoints: 100 requests per 15 minutes

---

## Caching

The API uses Redis caching for:
- Product listings (1 minute TTL)
- Individual products (5 minutes TTL)
- Categories (1 hour TTL)
- Admin stats (1 minute TTL)

Cache is automatically invalidated on data mutations.

---

## Pagination

Most list endpoints support pagination:

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20, max: 100)

**Response Format:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

## Testing

See `TESTING.md` for testing documentation and examples.

---

## Support

For API issues or questions, please open an issue on the repository.

