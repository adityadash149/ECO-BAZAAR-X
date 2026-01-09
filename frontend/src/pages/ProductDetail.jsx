import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  ArrowLeft, 
  Leaf,
  Truck, 
  Shield, 
  Award,
  Filter,
  Grid,
  List,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { productsAPI, categoriesAPI, customerAPI, authAPI } from '../services/api';
import ProductCard from '../components/common/ProductCard';
import CarbonScore from '../components/common/CarbonScore';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [ecoFriendlyOnly, setEcoFriendlyOnly] = useState(false);
  
  const isAuthenticated = authAPI.isAuthenticated();
  
  // Helper function to get proper image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    // If it's a relative path (uploaded image), prepend backend URL
    if (imageUrl.startsWith('/uploads/')) {
      return `http://localhost:8080${imageUrl}`;
    }
    // If it's already a full URL, return as is
    return imageUrl;
  };

  useEffect(() => {
    if (id) {
      loadProduct();
    } else {
      loadProducts();
    }
  }, [id]);

    const loadProduct = async () => {
      try {
        setLoading(true);
        const response = await productsAPI.getProductById(id);
        setProduct(response.data);
      
      if (isAuthenticated) {
        checkWishlistStatus(id);
      }
    } catch (err) {
      console.error('Error loading product:', err);
      setError('Failed to load product. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const [productsResponse, categoriesResponse] = await Promise.all([
        productsAPI.getAllProducts(),
        categoriesAPI.getAllCategories()
      ]);
      
      // Transform product data
      const transformedProducts = productsResponse.data.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        originalPrice: product.price * 1.2,
        rating: 4.5,
        reviews: Math.floor(Math.random() * 200) + 50,
        image: product.imageUrl,
        ecoScore: product.isEcoFriendly ? 95 : 70,
        category: product.category?.name || 'General',
        carbonScore: product.carbonScore,
        isEcoFriendly: product.isEcoFriendly,
        stockQuantity: product.stockQuantity,
        sellerId: product.seller?.id
      }));
      
      setProducts(transformedProducts);
      setCategories(categoriesResponse.data);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const checkWishlistStatus = async (productId) => {
    try {
      const response = await customerAPI.checkWishlistStatus(productId);
      setIsWishlisted(response.data.isInWishlist);
    } catch (error) {
      console.error('Error checking wishlist status:', error);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { returnPath: `/product/${id}` } });
      return;
    }

    try {
      if (isWishlisted) {
        await customerAPI.removeFromWishlist(product.id);
        setIsWishlisted(false);
      } else {
        await customerAPI.addToWishlist(product.id);
        setIsWishlisted(true);
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const handleAddToCart = async () => {
    try {
      // Add to client-side cart (localStorage) via customerAPI
      await customerAPI.addToCart({
        id: product.id, // use product id as cart item id
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.imageUrl,
        quantity: 1,
        ecoScore: product.ecoScore || 90,
        carbonScore: product.carbonScore,
        isEcoFriendly: product.isEcoFriendly,
      });

      alert(`✅ ${product.name} added to cart!`);
      // Dispatch event to update cart count in navbar
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('❌ Failed to add to cart. Please try again.');
    }
  };

  const getEcoPoints = (carbonScore, price) => {
    // Only eco-friendly products (carbon score <= 3) earn points
    if (carbonScore <= 3) {
      // 10% of product price as eco points (1 point = ₹1)
      return Math.floor(price * 0.10);
    }
    return 0;
  };

  // Filter and sort products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    const matchesEco = !ecoFriendlyOnly || product.isEcoFriendly;
    
    return matchesSearch && matchesCategory && matchesPrice && matchesEco;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'eco-score':
        return b.ecoScore - a.ecoScore;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Single Product View
  if (product) {
  return (
    <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
            className="flex items-center text-primary-600 hover:text-primary-700 mb-6"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Products
              </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
            <div>
              <img
                src={getImageUrl(product.imageUrl)}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg shadow-lg"
              />
          </div>

          {/* Product Info */}
            <div>
              <div className="flex items-center mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <Leaf size={14} className="mr-1" />
                  {product.isEcoFriendly ? 'Eco-Friendly' : 'Standard'}
                </span>
            </div>

              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

              <div className="flex items-center mb-6">
              <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                      size={20}
                      className={i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                    />
                  ))}
                </div>
                <span className="ml-2 text-gray-600">(4.5 rating • 128 reviews)</span>
              </div>

              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">₹{product.price}</span>
                <span className="text-lg text-gray-500 line-through ml-3">₹{(product.price * 1.2).toFixed(2)}</span>
                <span className="ml-3 text-green-600 font-semibold">20% OFF</span>
              </div>

              <p className="text-gray-600 mb-8">{product.description}</p>

              {/* Carbon Score Information */}
              {product.carbonScore !== undefined && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3 text-gray-700">Environmental Impact</h3>
                  <CarbonScore 
                    carbonScore={product.carbonScore} 
                    isEcoFriendly={product.isEcoFriendly}
                    size="medium"
                    showLabel={true}
                  />
                </div>
              )}

              {/* Eco Points Information */}
              {product.carbonScore !== undefined && (
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Award className="w-5 h-5 text-green-600 mr-2" />
                        <span className="text-sm font-semibold text-green-800">Eco Points Reward</span>
                      </div>
                      <span className="text-xl font-bold text-green-600">
                        +{getEcoPoints(product.carbonScore, product.price)}
                      </span>
                    </div>
                    <p className="text-sm text-green-700">
                      Earn {getEcoPoints(product.carbonScore, product.price)} eco points for this purchase! 
                      {getEcoPoints(product.carbonScore, product.price) > 0 && ' Points will be added to your account after order completion.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stockQuantity === 0}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center ${
                    product.stockQuantity === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  <ShoppingCart size={20} className="mr-2" />
                  {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>

                <button
                  onClick={handleWishlist}
                  className={`p-3 rounded-lg border-2 ${
                    isWishlisted
                      ? 'border-red-500 bg-red-50 text-red-600'
                      : 'border-gray-300 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
                </button>
              </div>

              {/* Product Features */}
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold mb-4">Product Features</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <Truck size={20} className="text-green-600 mr-3" />
                    <span>Free Shipping</span>
                  </div>
                  <div className="flex items-center">
                    <Shield size={20} className="text-green-600 mr-3" />
                    <span>Quality Guarantee</span>
                  </div>
                  <div className="flex items-center">
                    <Award size={20} className="text-green-600 mr-3" />
                    <span>Eco-Certified</span>
                  </div>
                  <div className="flex items-center">
                    <Leaf size={20} className="text-green-600 mr-3" />
                    <span>Carbon Neutral</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Products Listing View
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Products</h1>
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter size={20} className="mr-2" />
              Filters
            </button>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-400'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
                  <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-6 rounded-lg shadow mb-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.name}>{category.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="name">Name</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Rating</option>
                    <option value="eco-score">Eco Score</option>
                  </select>
            </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-20 border border-gray-300 rounded px-2 py-1"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-20 border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
              </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={ecoFriendlyOnly}
                      onChange={(e) => setEcoFriendlyOnly(e.target.checked)}
                      className="mr-2"
                    />
                    Eco-Friendly Only
                  </label>
              </div>
              </div>
            </motion.div>
          )}

          {/* Results Info */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {sortedProducts.length} of {products.length} products
            </p>
          </div>
        </div>

        {/* Products Grid/List */}
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {sortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* No Results */}
        {sortedProducts.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">No products found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search criteria or filters</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('');
                setPriceRange([0, 10000]);
                setEcoFriendlyOnly(false);
              }}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;