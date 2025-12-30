import { testPrisma } from '../helpers/test-db';

let productCounter = 0;

export const createProductFixture = (overrides = {}) => {
  productCounter++;
  const fixture = {
    name: `Test Product ${productCounter}`,
    description: `This is a test product description with at least 10 characters ${productCounter}`,
    price: 99.99,
    images: ['https://example.com/images/test-product.jpg'],
    tags: ['furniture', 'modern'],
    stock: 10,
    featured: false,
    isNew: false,
    onSale: false,
    sustainabilityScore: 4,
    colors: ['Black', 'White'],
    sizes: [],
    materials: ['Wood', 'Metal'],
    ...overrides
  };
  // Remove discount if it's null to avoid validation errors
  if ('discount' in fixture && fixture.discount === null) {
    delete fixture.discount;
  }
  return fixture;
};

export const createProduct = async (categoryId: string, overrides = {}) => {
  const productData = createProductFixture(overrides);
  return testPrisma.product.create({
    data: {
      ...productData,
      categoryId,
    },
  });
};

