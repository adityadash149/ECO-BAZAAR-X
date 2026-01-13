import axios from 'axios';

// Create axios instance with base configuration
// EcoBazaar backend runs on port 8081 with REST endpoints prefixed by `/api`
const API_BASE_URL = 'http://localhost:8081/api';

// Smart Cart backend runs on port 8080 (for suggestions)
const SMART_CART_API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Smart Cart API instance for suggestions
const smartCartApi = axios.create({
  baseURL: SMART_CART_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token (from localStorage)
// but skip it for public endpoints like products and categories.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const url = config.url || '';

    const isPublicEndpoint =
      url.startsWith('/products') ||
      url.startsWith('/categories');

    if (token && !isPublicEndpoint) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Mock product data for realistic e-commerce experience
export const mockProducts = [
  {
    id: 1,
    name: "Organic Cotton T-Shirt",
    description: "Premium organic cotton t-shirt made from 100% certified organic cotton. Comfortable, breathable, and eco-friendly.",
    price: 29.99,
    originalPrice: 39.99,
    rating: 4.5,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop"
    ],
    ecoScore: 95,
    category: "Fashion",
    stock: 45,
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Black", "Navy", "Green"],
    features: ["100% Organic Cotton", "Fair Trade Certified", "Biodegradable", "Low Carbon Footprint"],
    shipping: "Free shipping on orders over ₹2000"
  },
  {
    id: 2,
    name: "Bamboo Water Bottle",
    description: "Sustainable bamboo water bottle with stainless steel interior. Keeps drinks cold for 24 hours and hot for 12 hours.",
    price: 24.99,
    originalPrice: 34.99,
    rating: 4.8,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1589365278144-c9e705f843ba?w=400&h=400&fit=crop"
    ],
    ecoScore: 98,
    category: "Home",
    stock: 32,
    sizes: ["500ml", "750ml", "1L"],
    colors: ["Natural Bamboo", "Charcoal", "Rose Gold"],
    features: ["Bamboo Exterior", "Stainless Steel Interior", "BPA Free", "Leak Proof"],
    shipping: "Free shipping on orders over ₹2000"
  },
  {
    id: 3,
    name: "Solar Power Bank",
    description: "Portable solar charger with 20,000mAh capacity. Perfect for outdoor adventures and emergency charging.",
    price: 49.99,
    originalPrice: 69.99,
    rating: 4.3,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1609592806598-ef155b6f4b0c?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1609592806598-ef155b6f4b0c?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1609592806598-ef155b6f4b0c?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1609592806598-ef155b6f4b0c?w=400&h=400&fit=crop"
    ],
    ecoScore: 92,
    category: "Electronics",
    stock: 28,
    sizes: ["20,000mAh"],
    colors: ["Black", "Blue", "Green"],
    features: ["Solar Charging", "20,000mAh Capacity", "Water Resistant", "LED Flashlight"],
    shipping: "Free shipping on orders over ₹2000"
  },
  {
    id: 4,
    name: "Recycled Paper Notebook",
    description: "Premium notebook made from 100% recycled paper. Perfect for eco-conscious students and professionals.",
    price: 12.99,
    originalPrice: 16.99,
    rating: 4.6,
    reviews: 203,
    image: "https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1531346680769-a1d79b57de5c?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=400&fit=crop"
    ],
    ecoScore: 97,
    category: "Office",
    stock: 67,
    sizes: ["A5", "A4", "A6"],
    colors: ["Natural", "Kraft", "White"],
    features: ["100% Recycled Paper", "Acid Free", "Lined Pages", "Elastic Closure"],
    shipping: "Free shipping on orders over ₹2000"
  },
  {
    id: 5,
    name: "Hemp Backpack",
    description: "Durable hemp backpack with laptop compartment. Water-resistant and perfect for daily use or travel.",
    price: 39.99,
    originalPrice: 49.99,
    rating: 4.7,
    reviews: 94,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1547949003-9792a18a2601?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=400&h=400&fit=crop"
    ],
    ecoScore: 96,
    category: "Fashion",
    stock: 23,
    sizes: ["15\"", "17\""],
    colors: ["Natural Hemp", "Black", "Olive"],
    features: ["Hemp Fabric", "Laptop Compartment", "Water Resistant", "Multiple Pockets"],
    shipping: "Free shipping on orders over ₹2000"
  },
  {
    id: 6,
    name: "LED Grow Light",
    description: "Energy-efficient LED grow light for indoor plants. Promotes healthy growth with full spectrum lighting.",
    price: 34.99,
    originalPrice: 44.99,
    rating: 4.4,
    reviews: 78,
    image: "https://images.unsplash.com/photo-1609592806598-ef155b6f4b0c?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1609592806598-ef155b6f4b0c?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1609592806598-ef155b6f4b0c?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1609592806598-ef155b6f4b0c?w=400&h=400&fit=crop"
    ],
    ecoScore: 88,
    category: "Home",
    stock: 41,
    sizes: ["Small", "Medium", "Large"],
    colors: ["White", "Pink", "Blue"],
    features: ["Full Spectrum LED", "Energy Efficient", "Timer Function", "Adjustable Brightness"],
    shipping: "Free shipping on orders over ₹2000"
  },
  {
    id: 7,
    name: "Bamboo Toothbrush Set",
    description: "Set of 4 biodegradable bamboo toothbrushes with soft bristles. Eco-friendly alternative to plastic toothbrushes.",
    price: 8.99,
    originalPrice: 12.99,
    rating: 4.9,
    reviews: 312,
    image: "https://images.unsplash.com/photo-1559591935-c7cc5c248ce1?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1559591935-c7cc5c248ce1?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1559591935-c7cc5c248ce1?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1559591935-c7cc5c248ce1?w=400&h=400&fit=crop"
    ],
    ecoScore: 99,
    category: "Personal Care",
    stock: 89,
    sizes: ["Soft", "Medium"],
    colors: ["Natural Bamboo"],
    features: ["Bamboo Handle", "Soft Bristles", "Biodegradable", "BPA Free"],
    shipping: "Free shipping on orders over ₹2000"
  },
  {
    id: 8,
    name: "Recycled Glass Vase",
    description: "Beautiful vase made from 100% recycled glass. Perfect for flowers or as a decorative piece.",
    price: 19.99,
    originalPrice: 24.99,
    rating: 4.2,
    reviews: 67,
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"
    ],
    ecoScore: 94,
    category: "Home",
    stock: 34,
    sizes: ["Small", "Medium", "Large"],
    colors: ["Clear", "Blue", "Green"],
    features: ["100% Recycled Glass", "Handcrafted", "Microwave Safe", "Dishwasher Safe"],
    shipping: "Free shipping on orders over ₹2000"
  }
];

// Mock categories
export const mockCategories = [
  { id: 1, name: "Electronics", icon: "📱", description: "Electronic devices and gadgets" },
  { id: 2, name: "Clothing", icon: "👕", description: "Fashion and apparel" },
  { id: 3, name: "Home & Garden", icon: "🏠", description: "Home improvement and gardening" },
  { id: 4, name: "Books", icon: "📚", description: "Books and publications" },
  { id: 5, name: "Food & Beverages", icon: "🍽️", description: "Organic and sustainable food products" },
  { id: 6, name: "Personal Care", icon: "🧴", description: "Natural and organic personal care" }
];

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);



// Authentication API calls
export const authAPI = {
  // Test connection
  testConnection: () => api.get('/auth/test'),
  
  // User registration
  register: (userData) => api.post('/auth/register', userData),
  
  // User login
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Logout (client-side)
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  // Get user role
  getUserRole: () => {
    const user = authAPI.getCurrentUser();
    return user?.role || null;
  },

  // Generic API methods for other endpoints
  get: (url) => api.get(url),
  post: (url, data) => api.post(url, data),
  put: (url, data) => api.put(url, data),
  delete: (url) => api.delete(url)
};

// Products API calls
export const productsAPI = {
  // Get all products
  getAllProducts: () => api.get('/products'),
  
  // Get product by ID
  getProductById: (id) => api.get(`/products/${id}`),
  
  // Get products by category
  getProductsByCategory: (categoryId) => api.get(`/products/category/${categoryId}`),
  
  // Get eco-friendly products
  getEcoFriendlyProducts: () => api.get('/products/eco-friendly'),
  
  // Seller product management
  getSellerProducts: () => api.get('/seller/products'),
  
  addSellerProduct: (productData) => {
    // Always send as FormData to handle both file uploads and URL-based images
    if (productData instanceof FormData) {
      return api.post('/seller/products', productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // Convert to FormData for consistency
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (productData[key] !== null && productData[key] !== undefined) {
          formData.append(key, productData[key]);
        }
      });
      
      return api.post('/seller/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
  },
  
  updateSellerProduct: (id, productData) => {
    // Always send as FormData to handle both file uploads and URL-based images
    if (productData instanceof FormData) {
      return api.put(`/seller/products/${id}`, productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } else {
      // Convert to FormData for consistency
      const formData = new FormData();
      Object.keys(productData).forEach(key => {
        if (productData[key] !== null && productData[key] !== undefined) {
          formData.append(key, productData[key]);
        }
      });
      
      return api.put(`/seller/products/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
  },
  
  deleteSellerProduct: (id) => api.delete(`/seller/products/${id}`),
  
  updateProductStock: (id, stockData) => {
    const product = {
      stockQuantity: parseInt(stockData.stockQuantity)
    };
    return api.put(`/seller/products/${id}`, product);
  },
  
  // Admin product management
  getAdminProducts: () => api.get('/admin/products'),
  updateProductStatus: (id, status) => api.put(`/admin/products/${id}/status?status=${status}`)
};

// Lightweight product API used by storefront pages
export const productAPI = {
  getAllProducts: () => productsAPI.getAllProducts(),
  getProductById: (id) => productsAPI.getProductById(id)
};

// Categories API calls
export const categoriesAPI = {
  // Get all categories
  getAllCategories: () => api.get('/categories'),
  
  // Get category by ID
  getCategoryById: (id) => api.get(`/categories/${id}`),
  
  // Admin category management
  getAdminCategories: () => api.get('/admin/categories')
};

// Payment API calls
export const paymentAPI = {
  // Process payment
  processPayment: (paymentData) => {
    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: {
            success: true,
            transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            amount: paymentData.amount,
            currency: 'INR',
            status: 'completed',
            timestamp: new Date().toISOString()
          }
        });
      }, 2000);
    });
  },
  
  // Get payment methods
  getPaymentMethods: () => {
    return Promise.resolve({
      data: [
        {
          id: 'card',
          type: 'credit_card',
          name: 'Credit/Debit Card',
          icon: '💳',
          description: 'Visa, Mastercard, American Express'
        },
        {
          id: 'paypal',
          type: 'paypal',
          name: 'PayPal',
          icon: '🔵',
          description: 'Pay with your PayPal account'
        },
        {
          id: 'apple_pay',
          type: 'apple_pay',
          name: 'Apple Pay',
          icon: '🍎',
          description: 'Quick and secure payment'
        },
        {
          id: 'google_pay',
          type: 'google_pay',
          name: 'Google Pay',
          icon: '🤖',
          description: 'Fast and easy payment'
        }
      ]
    });
  }
};

// Cart API calls
export const cartAPI = {
  // Add item to cart for a specific user
  addToCart: (userId, productId, quantity = 1) =>
    api.post(`/cart/${userId}/add`, null, {
      params: { productId, quantity }
    }),

  // Get cart for a user
  getCart: (userId) => api.get(`/cart/${userId}`),

  // Remove item from cart
  removeFromCart: (userId, cartItemId) => api.delete(`/cart/${userId}/remove/${cartItemId}`),

  // Update cart item quantity (fallback for flows that still edit cart items directly)
  updateCartItem: (cartItemId, quantity) => api.put(`/cart/${cartItemId}`, { quantity })
};

// Customer API calls
export const customerAPI = {
  // Profile management
  getProfile: () => api.get('/customer/profile'),
  updateProfile: (profileData) => api.put('/customer/profile', profileData),
  
  // Enhanced profile management
  getCustomerProfile: (userId) => api.get(`/customer/profile/${userId}`),
  updateCustomerProfile: (userId, profileData) => api.put(`/customer/profile/${userId}`, profileData),
  getCarbonAnalytics: (userId) => api.get(`/customer/profile/${userId}/carbon-analytics`),
  updateEcoPoints: (userId) => api.post(`/customer/profile/${userId}/update-eco-points`),
  
  // Eco Points management
  getEcoPointsBalance: () => api.get('/eco-points/balance'),
  validateEcoPointsRedemption: (pointsToRedeem, orderTotal, productIds) => api.post('/eco-points/validate-redemption', {
    pointsToRedeem,
    orderTotal,
    productIds
  }),
  redeemEcoPoints: (pointsToRedeem, orderTotal, productIds) => api.post('/eco-points/redeem', {
    pointsToRedeem,
    orderTotal,
    productIds
  }),
  getEcoPointsRules: () => api.get('/eco-points/rules'),
  
  // Wishlist management
  getWishlist: () => api.get('/customer/wishlist'),
  addToWishlist: (productId) => api.post('/customer/wishlist', { productId }),
  removeFromWishlist: (productId) => api.delete(`/customer/wishlist/product/${productId}`),
  removeWishlistItem: (wishlistItemId) => api.delete(`/customer/wishlist/${wishlistItemId}`),
  checkWishlistStatus: (productId) => api.get(`/customer/wishlist/check/${productId}`),
  getWishlistCount: () => api.get('/customer/wishlist/count'),
  clearWishlist: () => api.delete('/customer/wishlist'),

  // Get customer cart (stored client-side, synced to backend only at checkout)
  getCart: () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    return Promise.resolve({ data: cart });
  },
  
  // Add item to cart
  addToCart: (cartData) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.productId === cartData.productId);
    
    if (existingItem) {
      existingItem.quantity += cartData.quantity;
    } else {
      cart.push(cartData);
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    return Promise.resolve({ data: cart });
  },
  
  // Update cart item
  updateCartItem: (itemId, cartData) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const itemIndex = cart.findIndex(item => item.id === itemId);
    
    if (itemIndex !== -1) {
      cart[itemIndex] = { ...cart[itemIndex], ...cartData };
      localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    return Promise.resolve({ data: cart });
  },
  
  // Remove item from cart
  removeFromCart: (itemId) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const filteredCart = cart.filter(item => item.id !== itemId);
    localStorage.setItem('cart', JSON.stringify(filteredCart));
    return Promise.resolve({ data: filteredCart });
  },
  
  // Clear cart
  clearCart: () => {
    localStorage.removeItem('cart');
    return Promise.resolve({ data: [] });
  },
  
  // Get customer orders (backend uses JWT to infer current user)
  getOrders: () => api.get('/orders/customer')
};

// Order API calls
export const orderAPI = {
  // Customer order management
  createOrder: (orderData) => api.post('/orders/create', orderData),
  getCustomerOrders: () => api.get('/orders/customer'),
  getOrder: (orderId) => api.get(`/orders/${orderId}`),
  markAsDelivered: (orderId) => api.put(`/orders/${orderId}/delivered`),
  
  // Seller order management
  getSellerOrders: () => api.get('/orders/seller'),
  confirmOrder: (orderId) => api.put(`/orders/${orderId}/confirm`),
  markAsShipped: (orderId, trackingData) => api.put(`/orders/${orderId}/ship`, trackingData)
};

// Mock seller products storage
let mockSellerProducts = [
  {
    id: 101,
    name: "Organic Cotton T-Shirt",
    description: "Premium organic cotton t-shirt made from 100% certified organic cotton.",
    price: 29.99,
    categoryId: 1,
    category: "Fashion",
    stockQuantity: 45,
    weight: 0.2,
    shippingDistance: 50,
    carbonFootprintScore: 95,
    ecoFriendly: true,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    status: "ACTIVE",
    sellerId: 1
  },
  {
    id: 102,
    name: "Bamboo Water Bottle",
    description: "Sustainable bamboo water bottle with stainless steel interior.",
    price: 24.99,
    categoryId: 2,
    category: "Home",
    stockQuantity: 32,
    weight: 0.5,
    shippingDistance: 30,
    carbonFootprintScore: 98,
    ecoFriendly: true,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
    status: "ACTIVE",
    sellerId: 1
  }
];

// ---------------- SELLER API (FINAL FIXED VERSION) ----------------

export const sellerAPI = {

  // Dashboard stats
  getDashboardStats: () => api.get('/seller/dashboard/stats'),

  // Get all seller products
  getSellerProducts: () => api.get('/seller/products'),

  // Add product
  addProduct: (data) => {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", data.price);
    formData.append("categoryId", data.categoryId);
    formData.append("stockQuantity", data.stockQuantity);
    formData.append("weight", data.weight);
    formData.append("shippingDistance", data.shippingDistance);
    formData.append("carbonFootprintScore", data.carbonFootprintScore);
    formData.append("ecoFriendly", data.ecoFriendly);

    // Image Handling
    if (data.imageFile) {
      formData.append("image", data.imageFile); // Backend expects MultipartFile "image"
    } else if (data.imageUrl) {
      formData.append("imageUrl", data.imageUrl); // Backend expects "imageUrl"
    }

    return api.post('/seller/products', formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },

  // Update product
  updateProduct: (id, data) => {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", data.price);
    formData.append("categoryId", data.categoryId);
    formData.append("stockQuantity", data.stockQuantity);
    formData.append("weight", data.weight);
    formData.append("shippingDistance", data.shippingDistance);
    formData.append("carbonFootprintScore", data.carbonFootprintScore);
    formData.append("ecoFriendly", data.ecoFriendly);

    if (data.imageFile) {
      formData.append("image", data.imageFile);
    } else if (data.imageUrl) {
      formData.append("imageUrl", data.imageUrl);
    }

    return api.put(`/seller/products/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },

  uploadProductImage: (id, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return api.put(`/seller/products/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Delete product
  deleteProduct: (id) => api.delete(`/seller/products/${id}`),

  // Seller orders
  getOrders: () => api.get('/seller/orders'),

  // Update order status
  updateOrderStatus: (orderId, status) =>
    api.put(`/seller/orders/${orderId}/status?status=${status}`),

  // Seller profile
  getProfile: () => api.get('/seller/profile'),
  updateProfile: (profileData) => api.put('/seller/profile', profileData)
};

// Admin API calls
export const adminAPI = {
  // Overview Dashboard
  getAdminOverview: () => api.get('/admin/overview'),
  getRecentActivity: () => api.get('/admin/recent-activity'),
  
  // User Management
  getAllUsers: () => api.get('/admin/users'),
  getUsersByRole: (role) => api.get(`/admin/users/role/${role}`),
  updateUserStatus: (userId, isActive) => api.put(`/admin/users/${userId}/status`, { isActive }),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role }),
  
  // Seller Management
  getAllSellers: () => api.get('/admin/sellers'),
  approveSeller: (sellerId, adminNotes) => api.put(`/admin/sellers/${sellerId}/approve`, { adminNotes }),
  rejectSeller: (sellerId, adminNotes) => api.put(`/admin/sellers/${sellerId}/reject`, { adminNotes }),
  blockSeller: (sellerId, reason) => api.put(`/admin/sellers/${sellerId}/block`, { reason }),
  
  // Product Oversight
  getAllProducts: () => api.get('/admin/products'),
  getProductsBySeller: (sellerId) => api.get(`/admin/products/seller/${sellerId}`),
  removeProduct: (productId, reason) => api.delete(`/admin/products/${productId}`, { data: { reason } }),
  updateProductStatus: (productId, isActive) => api.put(`/admin/products/${productId}/status`, { isActive }),
  approveProduct: (productId, adminNotes) => api.put(`/admin/products/${productId}/approve`, { adminNotes }),
  rejectProduct: (productId, reason) => api.put(`/admin/products/${productId}/reject`, { reason }),
  updateProductEcoData: (productId, carbonScore, isEcoFriendly, adminNotes) => api.put(`/admin/products/${productId}/update-eco-data`, { 
    carbonScore, 
    isEcoFriendly, 
    adminNotes 
  }),
  
  // Customer Monitoring
  getAllCustomerOrders: () => api.get('/admin/customers/orders'),
  getCustomerOrders: (userId) => api.get(`/admin/customers/${userId}/orders`),
  
  // Category Management
  getAllCategories: () => api.get('/admin/categories'),
  createCategory: (name, description) => api.post('/admin/categories', { name, description }),
  updateCategory: (categoryId, name, description, isActive) => api.put(`/admin/categories/${categoryId}`, { name, description, isActive }),
  deleteCategory: (categoryId) => api.delete(`/admin/categories/${categoryId}`),
  
  // Notifications
  getUserNotifications: (userId) => api.get(`/notifications/user/${userId}`),
  getUnreadNotifications: (userId) => api.get(`/notifications/user/${userId}/unread`),
  getUnreadNotificationCount: (userId) => api.get(`/notifications/user/${userId}/count`),
  markNotificationAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllNotificationsAsRead: (userId) => api.put(`/notifications/user/${userId}/read-all`),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  seedNotifications: (userId) => api.post(`/notifications/seed/${userId}`)
};

// Tree Planting API
export const treePlantingAPI = {
  submitTreePlanting: (formData) => api.post('/tree-planting/submit', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
  getMySubmissions: () => api.get('/tree-planting/my-submissions'),
  getAllSubmissions: () => api.get('/tree-planting/all'),
  getPendingSubmissions: () => api.get('/tree-planting/pending'),
  reviewSubmission: (submissionId, approved, adminNotes) => api.post(`/tree-planting/review/${submissionId}`, {
    approved,
    adminNotes
  }),
  getStats: () => api.get('/tree-planting/stats')
};

// Suggestion API (uses smart-cart-backend)
export const suggestionAPI = {
  // Get greener alternative for a product
  getGreenerAlternative: (productId) => smartCartApi.get(`/suggestions/product/${productId}`)
};

export default api;
