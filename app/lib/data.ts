// Categories data
export const categories = [
  {
    name: 'Electronics',
    slug: 'electronics',
    image: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Top-tier gadgets and tech accessories',
    featured: true,
    subCategories: ['Smartphones', 'Laptops', 'Audio', 'Gaming', 'Wearables']
  },
  {
    name: 'Clothing',
    slug: 'clothing',
    image: 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Stylish apparel for all occasions',
    featured: true,
    subCategories: ['Men', 'Women', 'Kids', 'Activewear', 'Formal']
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    image: 'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Complete your look with premium accessories',
    featured: true,
    subCategories: ['Bags', 'Jewelry', 'Watches', 'Belts', 'Sunglasses']
  },
  {
    name: 'Home & Living',
    slug: 'home',
    image: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Elevate your space with stylish decor',
    featured: true,
    subCategories: ['Furniture', 'Decor', 'Kitchen', 'Bedding', 'Lighting']
  },
  {
    name: 'Beauty',
    slug: 'beauty',
    image: 'https://images.pexels.com/photos/2533266/pexels-photo-2533266.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Premium beauty and skincare products',
    featured: false,
    subCategories: ['Skincare', 'Makeup', 'Fragrances', 'Hair Care', 'Bath & Body']
  },
  {
    name: 'Sports & Outdoors',
    slug: 'sports',
    image: 'https://images.pexels.com/photos/416717/pexels-photo-416717.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Gear up for your active lifestyle',
    featured: false,
    subCategories: ['Fitness', 'Outdoor Recreation', 'Sports Equipment', 'Athletic Clothing', 'Camping']
  },
  {
    name: 'Books & Stationery',
    slug: 'books',
    image: 'https://images.pexels.com/photos/590493/pexels-photo-590493.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Feed your mind with quality reads',
    featured: false,
    subCategories: ['Fiction', 'Non-Fiction', 'Academic', 'Journals', 'Art Supplies']
  },
  {
    name: 'Toys & Games',
    slug: 'toys',
    image: 'https://images.pexels.com/photos/163696/toy-car-toy-box-mini-163696.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Fun for all ages and occasions',
    featured: false,
    subCategories: ['Board Games', 'Action Figures', 'Educational Toys', 'Outdoor Toys', 'Puzzles']
  }
];

// Products data
export const products = [
  {
    id: '1',
    name: 'Premium Wireless Headphones',
    price: 249.99,
    category: 'Electronics',
    categorySlug: 'electronics',
    subCategory: 'Audio',
    rating: 4.8,
    image: 'https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Experience unparalleled sound quality with our premium wireless headphones.'
  },
  {
    id: '2',
    name: 'Designer Leather Jacket',
    price: 349.99,
    category: 'Clothing',
    categorySlug: 'clothing',
    subCategory: 'Men',
    rating: 4.9,
    image: 'https://images.pexels.com/photos/2849742/pexels-photo-2849742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Elevate your style with this luxurious leather jacket, perfect for any occasion.'
  },
  {
    id: '3',
    name: 'Smart Watch Series X',
    price: 299.99,
    category: 'Electronics',
    categorySlug: 'electronics',
    subCategory: 'Wearables',
    rating: 4.7,
    image: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Track your fitness and stay connected with our latest smart watch.'
  },
  {
    id: '4',
    name: 'Minimalist Desk Lamp',
    price: 89.99,
    category: 'Home & Living',
    categorySlug: 'home',
    subCategory: 'Lighting',
    rating: 4.6,
    image: 'https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Add a touch of elegance to your workspace with our minimalist desk lamp.'
  },
  {
    id: '5',
    name: 'Premium Sunglasses',
    price: 179.99,
    category: 'Accessories',
    categorySlug: 'accessories',
    subCategory: 'Sunglasses',
    rating: 4.8,
    image: 'https://images.pexels.com/photos/701877/pexels-photo-701877.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Protect your eyes in style with our premium UV-protected sunglasses.'
  },
  {
    id: '6',
    name: 'Organic Cotton T-Shirt',
    price: 39.99,
    category: 'Clothing',
    categorySlug: 'clothing',
    subCategory: 'Men',
    rating: 4.5,
    image: 'https://images.pexels.com/photos/5709665/pexels-photo-5709665.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Stay comfortable and eco-friendly with our organic cotton t-shirt.'
  },
  {
    id: '7',
    name: 'Wireless Earbuds',
    price: 129.99,
    category: 'Electronics',
    categorySlug: 'electronics',
    subCategory: 'Audio',
    rating: 4.4,
    image: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Experience freedom with our lightweight wireless earbuds.'
  },
  {
    id: '8',
    name: 'Modern Coffee Table',
    price: 249.99,
    category: 'Home & Living',
    categorySlug: 'home',
    subCategory: 'Furniture',
    rating: 4.7,
    image: 'https://images.pexels.com/photos/1571459/pexels-photo-1571459.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Upgrade your living space with this sleek, modern coffee table.'
  }
]; 