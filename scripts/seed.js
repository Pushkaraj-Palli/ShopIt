const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

// Check if we have a MongoDB URI
if (!process.env.MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

// Connect to MongoDB
async function connectToDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB successfully!');
    console.log('Database:', mongoose.connection.name);
    return mongoose.connection;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
}

// Define Schema and Models
const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a category name'],
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Please provide a category slug'],
      trim: true,
      unique: true,
      lowercase: true,
    },
    image: {
      type: String,
      required: [true, 'Please provide a category image URL'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a category description'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    featured: {
      type: Boolean,
      default: false,
    },
    subCategories: [{
      type: String,
      trim: true,
    }],
  },
  { timestamps: true }
);

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please provide a product price'],
      maxlength: [10, 'Price cannot exceed 10 characters'],
      default: 0.0,
    },
    category: {
      type: String,
      required: [true, 'Please select a category'],
      trim: true,
    },
    categorySlug: {
      type: String,
      required: [true, 'Category slug is required'],
      trim: true,
    },
    subCategory: {
      type: String,
      trim: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      required: [true, 'Please provide a product image URL'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a product description'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
  },
  { timestamps: true }
);

// Models
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// Unsplash image collections by category
const unsplashImages = {
  'Electronics': [
    'https://images.unsplash.com/photo-1588508065123-287b28e013da?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1587033411391-5d9e51cce126?w=800&auto=format&fit=crop',
  ],
  'Clothing': [
    'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503341733017-1901578f9f1e?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop',
  ],
  'Home & Kitchen': [
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1583845112203-29329902332e?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1522128418537-301c09a20c50?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1556911220-dabc1f02913a?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1589577484087-9e1e1cb13d4c?w=800&auto=format&fit=crop',
  ],
  'Books': [
    'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop',
  ],
  'Accessories': [
    'https://images.unsplash.com/photo-1611010344444-5f9e4d86a6e1?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1589782182134-104c9d25632d?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1631017263067-41b1bde222c5?w=800&auto=format&fit=crop',
  ],
  'Home & Living': [
    'https://images.unsplash.com/photo-1547166541-b0663230a00c?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=800&auto=format&fit=crop',
  ],
};

// Get random image from category collection
function getRandomImage(category) {
  const categoryImages = unsplashImages[category] || unsplashImages['Electronics'];
  return categoryImages[Math.floor(Math.random() * categoryImages.length)];
}

// Sample categories data
const categories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop',
    description: 'Latest electronic devices and gadgets',
    featured: true,
    subCategories: ['Smartphones', 'Laptops', 'Tablets', 'Accessories', 'Audio', 'Gaming', 'Wearables']
  },
  {
    name: 'Clothing',
    slug: 'clothing',
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop',
    description: 'Trendy clothing for men and women',
    featured: true,
    subCategories: ['Men', 'Women', 'Kids', 'Sports', 'Activewear', 'Formal']
  },
  {
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop',
    description: 'Everything for your home and kitchen',
    featured: true,
    subCategories: ['Furniture', 'Kitchen Appliances', 'Decor', 'Bedding', 'Lighting']
  },
  {
    name: 'Books',
    slug: 'books',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&auto=format&fit=crop',
    description: 'Explore a vast collection of books',
    featured: false,
    subCategories: ['Fiction', 'Non-Fiction', 'Educational', 'Comics', 'Self-Help']
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    image: 'https://images.unsplash.com/photo-1611010344444-5f9e4d86a6e1?w=800&auto=format&fit=crop',
    description: 'Complete your look with stylish accessories',
    featured: true,
    subCategories: ['Bags', 'Jewelry', 'Watches', 'Belts', 'Sunglasses']
  },
  {
    name: 'Home & Living',
    slug: 'home',
    image: 'https://images.unsplash.com/photo-1616627561950-9f746e330187?w=800&auto=format&fit=crop',
    description: 'Elevate your space with stylish decor',
    featured: true,
    subCategories: ['Furniture', 'Decor', 'Kitchen', 'Bedding', 'Lighting']
  },
];

// Process the products to ensure they have valid images
function processProducts(products) {
  return products.map(product => {
    // Keep existing images from Unsplash or valid URLs
    if (product.image.startsWith('https://images.') || product.image.startsWith('https://source.unsplash.com/')) {
      return product;
    }
    
    // For products with local image paths, assign appropriate Unsplash images
    return {
      ...product,
      image: getRandomImage(product.category)
    };
  });
}

// Sample products data
const baseProducts = [
  // Electronics
  {
    name: 'Smartphone X Pro',
    price: 79999,
    category: 'Electronics',
    categorySlug: 'electronics',
    subCategory: 'Smartphones',
    rating: 4.5,
    image: '/products/smartphone.jpg',
    description: 'The latest flagship smartphone with advanced camera system and powerful processor'
  },
  {
    name: 'Ultrabook Slim',
    price: 89999,
    category: 'Electronics',
    categorySlug: 'electronics',
    subCategory: 'Laptops',
    rating: 4.7,
    image: '/products/laptop.jpg',
    description: 'Ultra-thin and powerful laptop with long battery life'
  },
  {
    name: 'Wireless Earbuds',
    price: 8999,
    category: 'Electronics',
    categorySlug: 'electronics',
    subCategory: 'Accessories',
    rating: 4.3,
    image: '/products/earbuds.jpg',
    description: 'Premium wireless earbuds with active noise cancellation'
  },
  {
    name: 'Smart Watch Series 5',
    price: 29999,
    category: 'Electronics',
    categorySlug: 'electronics',
    subCategory: 'Accessories',
    rating: 4.4,
    image: '/products/smartwatch.jpg',
    description: 'Advanced smartwatch with health monitoring and cellular connectivity'
  },
  {
    name: 'Professional DSLR Camera',
    price: 65999,
    category: 'Electronics',
    categorySlug: 'electronics',
    subCategory: 'Cameras',
    rating: 4.8,
    image: '/products/camera.jpg',
    description: 'High-resolution camera with advanced shooting modes and interchangeable lenses'
  },
  {
    name: 'Gaming Console Pro',
    price: 49999,
    category: 'Electronics',
    categorySlug: 'electronics',
    subCategory: 'Gaming',
    rating: 4.9,
    image: '/products/console.jpg',
    description: '4K gaming with high performance graphics and expandable storage'
  },
  {
    name: 'Bluetooth Speaker',
    price: 4999,
    category: 'Electronics',
    categorySlug: 'electronics',
    subCategory: 'Accessories',
    rating: 4.2,
    image: '/products/speaker.jpg',
    description: 'Portable wireless speaker with rich sound and long battery life'
  },
  // Clothing
  {
    name: 'Men\'s Casual Shirt',
    price: 1999,
    category: 'Clothing',
    categorySlug: 'clothing',
    subCategory: 'Men',
    rating: 4.2,
    image: '/products/mens-shirt.jpg',
    description: 'Comfortable casual shirt for everyday wear'
  },
  {
    name: 'Women\'s Summer Dress',
    price: 2499,
    category: 'Clothing',
    categorySlug: 'clothing',
    subCategory: 'Women',
    rating: 4.6,
    image: '/products/womens-dress.jpg',
    description: 'Elegant summer dress with floral pattern'
  },
  {
    name: 'Kids\' Sports Set',
    price: 1499,
    category: 'Clothing',
    categorySlug: 'clothing',
    subCategory: 'Kids',
    rating: 4.4,
    image: '/products/kids-sportswear.jpg',
    description: 'Comfortable and durable sportswear for active kids'
  },
  {
    name: 'Men\'s Formal Suit',
    price: 12999,
    category: 'Clothing',
    categorySlug: 'clothing',
    subCategory: 'Men',
    rating: 4.8,
    image: '/products/mens-suit.jpg',
    description: 'Classic formal suit for special occasions'
  },
  {
    name: 'Women\'s Winter Coat',
    price: 4999,
    category: 'Clothing',
    categorySlug: 'clothing',
    subCategory: 'Women',
    rating: 4.7,
    image: '/products/womens-coat.jpg',
    description: 'Warm and stylish winter coat for cold weather'
  },
  {
    name: 'Organic Cotton T-Shirt',
    price: 3999,
    category: 'Clothing',
    categorySlug: 'clothing',
    subCategory: 'Men',
    rating: 4.5,
    image: 'https://images.pexels.com/photos/5709665/pexels-photo-5709665.jpeg',
    description: 'Stay comfortable and eco-friendly with our organic cotton t-shirt.'
  },
  {
    name: 'Designer Leather Jacket',
    price: 34999,
    category: 'Clothing',
    categorySlug: 'clothing',
    subCategory: 'Men',
    rating: 4.9,
    image: 'https://images.pexels.com/photos/2849742/pexels-photo-2849742.jpeg',
    description: 'Elevate your style with this luxurious leather jacket, perfect for any occasion.'
  },
  // Home & Kitchen
  {
    name: 'Non-stick Cookware Set',
    price: 3999,
    category: 'Home & Kitchen',
    categorySlug: 'home-kitchen',
    subCategory: 'Kitchen Appliances',
    rating: 4.5,
    image: '/products/cookware.jpg',
    description: 'Complete cookware set with non-stick coating for easy cooking'
  },
  {
    name: 'Smart LED TV',
    price: 59999,
    category: 'Home & Kitchen',
    categorySlug: 'home-kitchen',
    subCategory: 'Electronics',
    rating: 4.7,
    image: '/products/smart-tv.jpg',
    description: '4K Ultra HD smart TV with voice control and HDR'
  },
  {
    name: 'Minimalist Desk Lamp',
    price: 8999,
    category: 'Home & Living',
    categorySlug: 'home',
    subCategory: 'Lighting',
    rating: 4.6,
    image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg',
    description: 'Add a touch of elegance to your workspace with our minimalist desk lamp.'
  },
  {
    name: 'Modern Coffee Table',
    price: 24999,
    category: 'Home & Living',
    categorySlug: 'home',
    subCategory: 'Furniture',
    rating: 4.7,
    image: 'https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg',
    description: 'Upgrade your living space with this sleek, modern coffee table.'
  },
  {
    name: 'Luxury Bedding Set',
    price: 6999,
    category: 'Home & Kitchen',
    categorySlug: 'home-kitchen',
    subCategory: 'Bedding',
    rating: 4.8,
    image: '/products/bedding-set.jpg',
    description: 'Premium cotton bedding set for a comfortable night\'s sleep'
  },
  {
    name: 'Robot Vacuum Cleaner',
    price: 19999,
    category: 'Home & Kitchen',
    categorySlug: 'home-kitchen',
    subCategory: 'Appliances',
    rating: 4.3,
    image: '/products/vacuum.jpg',
    description: 'Smart robot vacuum with mapping technology and app control'
  },
  {
    name: 'Microwave Oven',
    price: 8999,
    category: 'Home & Kitchen',
    categorySlug: 'home-kitchen',
    subCategory: 'Kitchen Appliances',
    rating: 4.2,
    image: '/products/microwave.jpg',
    description: 'Versatile microwave oven with grill and convection functions'
  },
  // Books
  {
    name: 'The Great Adventure',
    price: 499,
    category: 'Books',
    categorySlug: 'books',
    subCategory: 'Fiction',
    rating: 4.9,
    image: '/products/fiction-book.jpg',
    description: 'Bestselling adventure novel that will keep you on the edge of your seat'
  },
  {
    name: 'Cooking Masterclass',
    price: 799,
    category: 'Books',
    categorySlug: 'books',
    subCategory: 'Non-Fiction',
    rating: 4.7,
    image: '/products/cooking-book.jpg',
    description: 'Comprehensive cooking guide with recipes from around the world'
  },
  {
    name: 'History of Ancient Civilizations',
    price: 599,
    category: 'Books',
    categorySlug: 'books',
    subCategory: 'Educational',
    rating: 4.5,
    image: '/products/history-book.jpg',
    description: 'Detailed exploration of ancient civilizations and their contributions'
  },
  {
    name: 'Mind and Meditation',
    price: 399,
    category: 'Books',
    categorySlug: 'books',
    subCategory: 'Self-Help',
    rating: 4.6,
    image: '/products/meditation-book.jpg',
    description: 'Guide to mindfulness and meditation techniques for beginners'
  },
  // Accessories
  {
    name: 'Premium Wireless Headphones',
    price: 24999,
    category: 'Electronics',
    categorySlug: 'electronics',
    subCategory: 'Audio',
    rating: 4.8,
    image: 'https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg',
    description: 'Experience unparalleled sound quality with our premium wireless headphones.'
  },
  {
    name: 'Smart Watch Series X',
    price: 29999,
    category: 'Electronics',
    categorySlug: 'electronics',
    subCategory: 'Wearables',
    rating: 4.7,
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg',
    description: 'Track your fitness and stay connected with our latest smart watch.'
  },
  {
    name: 'Premium Sunglasses',
    price: 17999,
    category: 'Accessories',
    categorySlug: 'accessories',
    subCategory: 'Sunglasses',
    rating: 4.8,
    image: 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg',
    description: 'Protect your eyes in style with our premium UV-protected sunglasses.'
  },
  {
    name: 'Wireless Earbuds',
    price: 12999,
    category: 'Electronics',
    categorySlug: 'electronics',
    subCategory: 'Audio',
    rating: 4.4,
    image: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg',
    description: 'Experience freedom with our lightweight wireless earbuds.'
  },
  {
    name: 'Leather Wallet',
    price: 2999,
    category: 'Accessories',
    categorySlug: 'accessories',
    subCategory: 'Bags',
    rating: 4.6,
    image: '/products/wallet.jpg',
    description: 'Premium leather wallet with multiple card slots and coin pocket'
  },
  {
    name: 'Designer Backpack',
    price: 3499,
    category: 'Accessories',
    categorySlug: 'accessories',
    subCategory: 'Bags',
    rating: 4.5,
    image: '/products/backpack.jpg',
    description: 'Stylish and functional backpack for everyday use'
  },
  // Additional products from data.ts
  {
    name: 'Minimalist Desk Lamp',
    price: 8999,
    category: 'Home & Living',
    categorySlug: 'home',
    subCategory: 'Lighting',
    rating: 4.6,
    image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg',
    description: 'Add a touch of elegance to your workspace with our minimalist desk lamp.'
  },
  {
    name: 'Modern Coffee Table',
    price: 24999,
    category: 'Home & Living',
    categorySlug: 'home',
    subCategory: 'Furniture',
    rating: 4.7,
    image: 'https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg',
    description: 'Upgrade your living space with this sleek, modern coffee table.'
  }
];

// Process products to ensure valid images
const products = processProducts(baseProducts);

// Helper function to download an image
function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    // Skip download if file already exists
    if (fs.existsSync(filepath)) {
      console.log(`Image already exists: ${filepath}`);
      return resolve(filepath);
    }
    
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // For URLs that start with http(s)://, download them
    if (url.startsWith('http')) {
      const file = fs.createWriteStream(filepath);
      
      console.log(`Downloading image: ${url}`);
      
      https.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }
        
        response.pipe(file);
        
        file.on('finish', () => {
          console.log(`Downloaded image to: ${filepath}`);
          file.close();
          resolve(filepath);
        });
      }).on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete file on error
        reject(err);
      });
    } else {
      // For relative paths, use a fallback image
      console.log(`Using fallback image for: ${filepath}`);
      resolve(filepath);
    }
  });
}

// Main function to seed the database
async function seedDatabase() {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Delete existing data
    console.log('Deleting existing categories and products...');
    await Category.deleteMany({});
    await Product.deleteMany({});
    
    // Insert categories
    console.log('Inserting categories...');
    const insertedCategories = await Category.insertMany(categories);
    console.log(`Inserted ${insertedCategories.length} categories`);
    
    // Insert products
    console.log('Inserting products...');
    const insertedProducts = await Product.insertMany(products);
    console.log(`Inserted ${insertedProducts.length} products`);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function
seedDatabase().catch(console.error); 