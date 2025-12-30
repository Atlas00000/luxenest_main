import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data (optional - comment out if you want to keep existing data)
  // await prisma.orderItem.deleteMany();
  // await prisma.order.deleteMany();
  // await prisma.review.deleteMany();
  // await prisma.cartItem.deleteMany();
  // await prisma.wishlistItem.deleteMany();
  // await prisma.product.deleteMany();
  // await prisma.category.deleteMany();
  // await prisma.user.deleteMany();

  // Seed Admin User
  console.log('👤 Seeding users...');
  const adminPassword = await bcrypt.hash('Admin1234!', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@luxenest.com' },
    update: {},
    create: {
      email: 'admin@luxenest.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      emailVerified: true,
    },
  });

  // Seed Test User
  const testPassword = await bcrypt.hash('Test1234!', 10);
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: testPassword,
      role: 'USER',
      emailVerified: true,
    },
  });

  console.log('✅ Users seeded');

  // Seed Categories
  console.log('📁 Seeding categories...');
  const categories = [
    {
      name: 'Living Room',
      description: 'Furniture and decor for your living space',
      image: '/images/categories/living-room.jpg',
      slug: 'living-room',
      featured: true,
    },
    {
      name: 'Dining',
      description: 'Tables, chairs and accessories for dining areas',
      image: '/images/categories/dining.jpg',
      slug: 'dining',
      featured: true,
    },
    {
      name: 'Bedroom',
      description: 'Create your perfect sleep sanctuary',
      image: '/images/categories/bedroom.jpg',
      slug: 'bedroom',
      featured: true,
    },
    {
      name: 'Lighting',
      description: 'Illuminate your space with style',
      image: '/images/categories/lighting.jpg',
      slug: 'lighting',
      featured: true,
    },
    {
      name: 'Decor',
      description: 'The finishing touches for any room',
      image: '/images/categories/decor.jpg',
      slug: 'decor',
      featured: true,
    },
    {
      name: 'Outdoor',
      description: 'Extend your living space to the outdoors',
      image: '/images/categories/outdoor.jpg',
      slug: 'outdoor',
      featured: false,
    },
    {
      name: 'Storage',
      description: 'Storage solutions for every room',
      image: '/images/categories/storage.jpg',
      slug: 'storage',
      featured: false,
    },
    {
      name: 'Textiles',
      description: 'Soft furnishings and textiles',
      image: '/images/categories/textiles.jpg',
      slug: 'textiles',
      featured: false,
    },
  ];

  const createdCategories = [];
  for (const categoryData of categories) {
    const category = await prisma.category.upsert({
      where: { slug: categoryData.slug },
      update: {},
      create: categoryData,
    });
    createdCategories.push(category);
  }

  console.log('✅ Categories seeded');

  // Seed Products
  console.log('📦 Seeding products...');
  const products = [
    {
      name: 'Serene Lounge Chair',
      description: 'A modern lounge chair with clean lines and exceptional comfort. Perfect for reading nooks or living room corners.',
      price: 599.99,
      images: [
        '/images/products/lounge-chair-1.jpg',
        '/images/products/lounge-chair-2.jpg',
        '/images/products/lounge-chair-3.jpg',
      ],
      categoryId: createdCategories.find(c => c.slug === 'living-room')!.id,
      tags: ['furniture', 'living room', 'comfort'],
      stock: 15,
      featured: true,
      isNew: false,
      onSale: false,
      discount: null,
      sustainabilityScore: 4,
      colors: ['Natural Oak', 'Walnut', 'Black'],
      sizes: [],
      materials: ['Solid Oak', 'Premium Fabric'],
    },
    {
      name: 'Harmony Dining Table',
      description: 'An elegant dining table that combines traditional craftsmanship with modern design. Seats up to 6 people comfortably.',
      price: 1299.99,
      images: [
        '/images/products/dining-table-1.jpg',
        '/images/products/dining-table-2.jpg',
        '/images/products/dining-table-3.jpg',
      ],
      categoryId: createdCategories.find(c => c.slug === 'dining')!.id,
      tags: ['furniture', 'dining room', 'wood'],
      stock: 8,
      featured: true,
      isNew: false,
      onSale: false,
      discount: null,
      sustainabilityScore: 5,
      colors: ['Natural Oak', 'Walnut'],
      sizes: [],
      materials: ['Solid Wood', 'Steel'],
    },
    {
      name: 'Tranquil Bed Frame',
      description: 'A minimalist bed frame that creates a peaceful sleeping environment. Features a sturdy construction and elegant design.',
      price: 899.99,
      images: [
        '/images/products/bed-frame-1.jpg',
        '/images/products/bed-frame-2.jpg',
        '/images/products/bed-frame-3.jpg',
      ],
      categoryId: createdCategories.find(c => c.slug === 'bedroom')!.id,
      tags: ['furniture', 'bedroom', 'sleep'],
      stock: 12,
      featured: false,
      isNew: true,
      onSale: false,
      discount: null,
      sustainabilityScore: 4,
      colors: ['Oak', 'Walnut', 'White'],
      sizes: ['Queen', 'King'],
      materials: ['Solid Wood', 'Metal'],
    },
    {
      name: 'Luminous Pendant Light',
      description: 'A striking pendant light that adds warmth and character to any space. Features adjustable height and warm lighting.',
      price: 249.99,
      images: [
        '/images/products/pendant-light-1.jpg',
        '/images/products/pendant-light-2.jpg',
        '/images/products/pendant-light-3.jpg',
      ],
      categoryId: createdCategories.find(c => c.slug === 'lighting')!.id,
      tags: ['lighting', 'ceiling', 'decor'],
      stock: 20,
      featured: true,
      isNew: false,
      onSale: false,
      discount: null,
      sustainabilityScore: 3,
      colors: ['Brass', 'Black', 'Copper'],
      sizes: [],
      materials: ['Metal', 'Glass'],
    },
    {
      name: 'Plush Area Rug',
      description: 'A soft, luxurious area rug that adds texture and warmth to your floors. Made from premium materials for durability.',
      price: 349.99,
      images: [
        '/images/products/area-rug-1.jpg',
        '/images/products/area-rug-2.jpg',
        '/images/products/area-rug-3.jpg',
      ],
      categoryId: createdCategories.find(c => c.slug === 'decor')!.id,
      tags: ['decor', 'floor', 'textile'],
      stock: 25,
      featured: false,
      isNew: false,
      onSale: true,
      discount: 15,
      sustainabilityScore: 4,
      colors: ['Ivory', 'Gray', 'Navy'],
      sizes: ['5x7', '8x10', '9x12'],
      materials: ['Wool', 'Cotton'],
    },
    {
      name: 'Artisan Ceramic Vase',
      description: 'A handcrafted ceramic vase with unique textures and glazes. Each piece is one-of-a-kind and adds artistic flair to any space.',
      price: 129.99,
      images: [
        '/images/products/ceramic-vase-1.jpg',
        '/images/products/ceramic-vase-2.jpg',
        '/images/products/ceramic-vase-3.jpg',
      ],
      categoryId: createdCategories.find(c => c.slug === 'decor')!.id,
      tags: ['decor', 'ceramic', 'handmade'],
      stock: 18,
      featured: false,
      isNew: true,
      onSale: false,
      discount: null,
      sustainabilityScore: 5,
      colors: ['White', 'Blue', 'Earth'],
      sizes: [],
      materials: ['Ceramic'],
    },
    {
      name: 'Modular Bookshelf',
      description: 'A customizable bookshelf system that adapts to your space and storage needs. Combine multiple units for a complete wall system.',
      price: 799.99,
      images: [
        '/images/products/bookshelf-1.jpg',
        '/images/products/bookshelf-2.jpg',
        '/images/products/bookshelf-3.jpg',
      ],
      categoryId: createdCategories.find(c => c.slug === 'storage')!.id,
      tags: ['furniture', 'storage', 'living room'],
      stock: 10,
      featured: true,
      isNew: false,
      onSale: false,
      discount: null,
      sustainabilityScore: 4,
      colors: ['White', 'Oak', 'Black'],
      sizes: [],
      materials: ['Engineered Wood', 'Steel'],
    },
    {
      name: 'Cozy Throw Blanket',
      description: 'A soft, luxurious throw blanket perfect for cool evenings. Made from sustainable materials with beautiful textures.',
      price: 89.99,
      images: [
        '/images/products/throw-blanket-1.jpg',
        '/images/products/throw-blanket-2.jpg',
        '/images/products/throw-blanket-3.jpg',
      ],
      categoryId: createdCategories.find(c => c.slug === 'textiles')!.id,
      tags: ['decor', 'textile', 'comfort'],
      stock: 35,
      featured: false,
      isNew: false,
      onSale: true,
      discount: 20,
      sustainabilityScore: 5,
      colors: ['Cream', 'Gray', 'Sage'],
      sizes: [],
      materials: ['Organic Cotton', 'Recycled Polyester'],
    },
  ];

  for (const productData of products) {
    const existing = await prisma.product.findFirst({
      where: { name: productData.name },
    });
    
    if (!existing) {
      await prisma.product.create({
        data: productData,
      });
    } else {
      await prisma.product.update({
        where: { id: existing.id },
        data: productData,
      });
    }
  }

  console.log('✅ Products seeded');

  // Seed some reviews
  console.log('⭐ Seeding reviews...');
  const createdProducts = await prisma.product.findMany();
  
  if (createdProducts.length > 0 && testUser) {
    const reviews = [
      {
        productId: createdProducts[0].id,
        userId: testUser.id,
        rating: 5,
        title: 'Excellent quality!',
        comment: 'The product exceeded my expectations. The quality is outstanding and it looks even better in person.',
      },
      {
        productId: createdProducts[0].id,
        userId: testUser.id,
        rating: 4,
        title: 'Great product',
        comment: 'Very satisfied with the purchase. Minor shipping delay but overall excellent.',
      },
    ];

    for (const reviewData of reviews) {
      await prisma.review.upsert({
        where: {
          productId_userId: {
            productId: reviewData.productId,
            userId: reviewData.userId,
          },
        },
        update: {},
        create: reviewData,
      });
    }

    // Update product ratings
    for (const product of createdProducts) {
      const productReviews = await prisma.review.findMany({
        where: { productId: product.id },
        select: { rating: true },
      });

      if (productReviews.length > 0) {
        const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
        await prisma.product.update({
          where: { id: product.id },
          data: {
            rating: Math.round(avgRating * 10) / 10,
            reviewsCount: productReviews.length,
          },
        });
      }
    }
  }

  console.log('✅ Reviews seeded');

  console.log('🎉 Database seeding completed!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@luxenest.com / Admin1234!');
  console.log('User: test@example.com / Test1234!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

