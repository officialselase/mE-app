import { query } from '../config/database.js';

/**
 * Seed shop data with sample products
 */
const seedShopData = () => {
  console.log('🛍️ Seeding shop data...');

  // Sample products
  const products = [
    {
      title: 'Premium Web Development Course',
      description: 'Complete full-stack web development course with React, Node.js, and MongoDB',
      price: 199.99,
      currency: 'USD',
      images: JSON.stringify([
        '/images/products/web-dev-course.jpg',
        '/images/products/web-dev-preview.jpg'
      ]),
      category: 'courses',
      stock: 100,
      featured: 1
    },
    {
      title: 'JavaScript Mastery Ebook',
      description: 'Comprehensive guide to modern JavaScript development',
      price: 29.99,
      currency: 'USD',
      images: JSON.stringify([
        '/images/products/js-ebook.jpg'
      ]),
      category: 'ebooks',
      stock: 500,
      featured: 1
    },
    {
      title: 'React Component Library',
      description: 'Professional React component library with TypeScript support',
      price: 79.99,
      currency: 'USD',
      images: JSON.stringify([
        '/images/products/react-components.jpg'
      ]),
      category: 'templates',
      stock: 50,
      featured: 0
    },
    {
      title: 'Portfolio Template Bundle',
      description: 'Collection of 5 modern portfolio templates',
      price: 49.99,
      currency: 'USD',
      images: JSON.stringify([
        '/images/products/portfolio-bundle.jpg',
        '/images/products/portfolio-preview-1.jpg',
        '/images/products/portfolio-preview-2.jpg'
      ]),
      category: 'templates',
      stock: 25,
      featured: 1
    },
    {
      title: 'API Development Masterclass',
      description: 'Learn to build scalable REST APIs with Node.js and Express',
      price: 149.99,
      currency: 'USD',
      images: JSON.stringify([
        '/images/products/api-course.jpg'
      ]),
      category: 'courses',
      stock: 75,
      featured: 0
    }
  ];

  // Insert products
  const insertProductSql = `
    INSERT INTO products (
      title, description, price, currency, images, category, stock, featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  let insertedCount = 0;

  products.forEach(product => {
    try {
      // Check if product already exists
      const existing = query(
        'SELECT id FROM products WHERE title = ?',
        [product.title]
      );

      if (existing.rows.length === 0) {
        query(insertProductSql, [
          product.title,
          product.description,
          product.price,
          product.currency,
          product.images,
          product.category,
          product.stock,
          product.featured
        ]);
        insertedCount++;
        console.log(`✅ Added product: ${product.title}`);
      } else {
        console.log(`⏭️ Product already exists: ${product.title}`);
      }
    } catch (error) {
      console.error(`❌ Failed to add product ${product.title}:`, error.message);
    }
  });

  console.log(`🎉 Shop seeding completed! Added ${insertedCount} new products.`);
  
  // Display summary
  const totalProducts = query('SELECT COUNT(*) as count FROM products').rows[0].count;
  const featuredProducts = query('SELECT COUNT(*) as count FROM products WHERE featured = 1').rows[0].count;
  
  console.log(`📊 Shop Summary:`);
  console.log(`   Total products: ${totalProducts}`);
  console.log(`   Featured products: ${featuredProducts}`);
  console.log(`   Categories: ${products.map(p => p.category).filter((v, i, a) => a.indexOf(v) === i).join(', ')}`);
};

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  try {
    seedShopData();
  } catch (error) {
    console.error('❌ Shop seeding failed:', error);
    process.exit(1);
  }
} else {
  // Also run if this is the main module
  seedShopData();
}

export { seedShopData };