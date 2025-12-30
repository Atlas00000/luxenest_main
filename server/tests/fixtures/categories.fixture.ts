import { testPrisma } from '../helpers/test-db';

let categoryCounter = 0;

export const createCategoryFixture = (overrides = {}) => {
  categoryCounter++;
  return {
    name: `Test Category ${categoryCounter}`,
    slug: `test-category-${categoryCounter}`,
    description: `This is a test category description ${categoryCounter}`,
    image: 'https://example.com/images/test-category.jpg',
    featured: false,
    ...overrides
  };
};

export const createCategory = async (overrides = {}) => {
  const categoryData = createCategoryFixture(overrides);
  return testPrisma.category.create({
    data: categoryData,
  });
};

