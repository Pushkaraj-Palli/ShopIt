require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// MongoDB connection
const connectDB = async () => {
  try {
    // In a real project, you would use an environment variable for the connection string
    // const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connection would be established here');
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Define Mongoose schemas
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  countInStock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false },
  createdAt: { type: Date, default: Date.now }
});

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  orderItems: [
    {
      name: { type: String, required: true },
      qty: { type: Number, required: true },
      image: { type: String, required: true },
      price: { type: Number, required: true },
      product: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' }
    }
  ],
  shippingAddress: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true }
  },
  paymentMethod: { type: String, required: true },
  paymentResult: {
    id: { type: String },
    status: { type: String },
    update_time: { type: String },
    email_address: { type: String }
  },
  taxPrice: { type: Number, required: true, default: 0.0 },
  shippingPrice: { type: Number, required: true, default: 0.0 },
  totalPrice: { type: Number, required: true, default: 0.0 },
  isPaid: { type: Boolean, required: true, default: false },
  paidAt: { type: Date },
  isDelivered: { type: Boolean, required: true, default: false },
  deliveredAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

// Since we're not actually connecting to MongoDB in this example,
// we won't create the models, but in a real app you would do:
// const Product = mongoose.model('Product', ProductSchema);
// const User = mongoose.model('User', UserSchema);
// const Order = mongoose.model('Order', OrderSchema);

// Auth middleware
const protect = (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // In a real app, you would verify the token:
      // const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // req.user = await User.findById(decoded.id).select('-password');
      
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Admin middleware
const admin = (req, res, next) => {
  // In a real app, you would check if the user is an admin:
  // if (req.user && req.user.isAdmin) {
  //   next();
  // } else {
  //   res.status(401).json({ message: 'Not authorized as an admin' });
  // }
  next();
};

// Routes

// Product routes
app.get('/api/products', (req, res) => {
  // Mocked data
  const products = [
    {
      _id: '1',
      name: 'Premium Wireless Headphones',
      price: 249.99,
      category: 'Electronics',
      rating: 4.8,
      numReviews: 12,
      countInStock: 10,
      image: 'https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      description: 'Experience unparalleled sound quality with our premium wireless headphones.'
    },
    {
      _id: '2',
      name: 'Designer Leather Jacket',
      price: 349.99,
      category: 'Clothing',
      rating: 4.9,
      numReviews: 8,
      countInStock: 7,
      image: 'https://images.pexels.com/photos/2849742/pexels-photo-2849742.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      description: 'Elevate your style with this luxurious leather jacket, perfect for any occasion.'
    },
    // Add more products as needed
  ];
  
  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  // Mocked single product
  const product = {
    _id: req.params.id,
    name: 'Premium Wireless Headphones',
    price: 249.99,
    category: 'Electronics',
    rating: 4.8,
    numReviews: 12,
    countInStock: 10,
    image: 'https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    description: 'Experience unparalleled sound quality with our premium wireless headphones.'
  };
  
  res.json(product);
});

app.post('/api/products', protect, admin, (req, res) => {
  // Create a product (admin only)
  res.status(201).json({ message: 'Product created successfully' });
});

app.put('/api/products/:id', protect, admin, (req, res) => {
  // Update a product (admin only)
  res.json({ message: 'Product updated successfully' });
});

app.delete('/api/products/:id', protect, admin, (req, res) => {
  // Delete a product (admin only)
  res.json({ message: 'Product removed successfully' });
});

// User routes
app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  
  // In a real app, you would check the credentials and return a token:
  // const user = await User.findOne({ email });
  // if (user && await bcrypt.compare(password, user.password)) {
  //   res.json({
  //     _id: user._id,
  //     name: user.name,
  //     email: user.email,
  //     isAdmin: user.isAdmin,
  //     token: generateToken(user._id)
  //   });
  // } else {
  //   res.status(401).json({ message: 'Invalid email or password' });
  // }
  
  res.json({
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    isAdmin: true,
    token: 'sample-token'
  });
});

app.post('/api/users', (req, res) => {
  const { name, email, password } = req.body;
  
  // In a real app, you would create a new user:
  // const userExists = await User.findOne({ email });
  // if (userExists) {
  //   res.status(400).json({ message: 'User already exists' });
  // } else {
  //   const hashedPassword = await bcrypt.hash(password, 10);
  //   const user = await User.create({ name, email, password: hashedPassword });
  //   res.status(201).json({
  //     _id: user._id,
  //     name: user.name,
  //     email: user.email,
  //     isAdmin: user.isAdmin,
  //     token: generateToken(user._id)
  //   });
  // }
  
  res.status(201).json({
    _id: '1',
    name,
    email,
    isAdmin: false,
    token: 'sample-token'
  });
});

// Order routes
app.post('/api/orders', protect, (req, res) => {
  // Create a new order
  res.status(201).json({ message: 'Order created successfully', orderId: '1' });
});

app.get('/api/orders/:id', protect, (req, res) => {
  // Get order by ID
  res.json({
    _id: req.params.id,
    user: '1',
    orderItems: [
      {
        name: 'Premium Wireless Headphones',
        qty: 1,
        image: 'https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
        price: 249.99,
        product: '1'
      }
    ],
    shippingAddress: {
      address: '123 Main St',
      city: 'New York',
      postalCode: '10001',
      country: 'USA'
    },
    paymentMethod: 'PayPal',
    totalPrice: 249.99,
    isPaid: false,
    isDelivered: false,
    createdAt: new Date()
  });
});

app.get('/api/orders/myorders', protect, (req, res) => {
  // Get logged in user's orders
  res.json([
    {
      _id: '1',
      totalPrice: 249.99,
      isPaid: false,
      isDelivered: false,
      createdAt: new Date()
    }
  ]);
});

// Payment route (for Stripe integration)
app.post('/api/payment', protect, (req, res) => {
  // Process payment
  res.json({ success: true });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // connectDB(); // In a real app, you would connect to MongoDB
});