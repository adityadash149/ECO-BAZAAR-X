import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, RefreshCw, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { customerAPI } from '../services/api';
import ProductCard from '../components/common/ProductCard';

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const mockWishlistItems = [
    {
      id: 1,
      wishlistId: 101,
      name: 'Organic Cotton T-Shirt',
      price: 29.99,
      originalPrice: 39.99,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
      ecoScore: 95,
      rating: 4.5,
      reviews: 128,
      category: 'Fashion',
      stockQuantity: 45,
      isEcoFriendly: true,
      carbonScore: 2.1,
      shipping: 'Free Shipping',
    },
    {
      id: 2,
      wishlistId: 102,
      name: 'Bamboo Water Bottle',
      price: 24.99,
      originalPrice: 34.99,
      image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop',
      ecoScore: 98,
      rating: 4.8,
      reviews: 89,
      category: 'Home & Living',
      stockQuantity: 32,
      isEcoFriendly: true,
      carbonScore: 1.8,
      shipping: 'Free Shipping',
    },
    {
      id: 3,
      wishlistId: 103,
      name: 'Solar Power Bank',
      price: 49.99,
      originalPrice: 69.99,
      image: 'https://images.unsplash.com/photo-1609592806598-ef155b6f4b0c?w=400&h=400&fit=crop',
      ecoScore: 92,
      rating: 4.3,
      reviews: 156,
      category: 'Tech',
      stockQuantity: 0,
      isEcoFriendly: true,
      carbonScore: 2.9,
      shipping: 'Ships in 2 days',
    },
  ];

  const transformWishlist = (data = []) =>
    data.map((item) => ({
      id: item.productId || item.id,
      wishlistId: item.id,
      name: item.productName || item.name,
      price: Number(item.productPrice ?? item.price ?? 0),
      originalPrice: Number(item.productPrice ?? item.price ?? 0) * 1.15,
      image: item.productImageUrl || item.image,
      imageUrl: item.productImageUrl || item.image,
      ecoScore: item.isEcoFriendly ? 95 : 70,
      rating: item.rating || 4.5,
      reviews: item.reviews || Math.floor(Math.random() * 200) + 50,
      category: item.categoryName || item.category || 'Sustainable Picks',
      stockQuantity: item.stockQuantity ?? item.stock ?? 0,
      isEcoFriendly: item.isEcoFriendly ?? true,
      carbonScore: item.carbonScore ?? 2.4,
      shipping: item.shipping || 'Free Shipping',
    }));

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await customerAPI.getWishlist();
        setWishlistItems(transformWishlist(response.data || []));
      } catch (err) {
        console.error('Error loading wishlist:', err);
        setError('Unable to load wishlist. Showing saved mock items.');
        setWishlistItems(transformWishlist(mockWishlistItems));
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, []);

  const handleRemoveFromWishlist = async (wishlistId) => {
    try {
      await customerAPI.removeWishlistItem(wishlistId);
      setWishlistItems((prev) => prev.filter((item) => item.wishlistId !== wishlistId));
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#f8faf9] dark:bg-[#041d16] text-slate-900 dark:text-emerald-50 transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-emerald-500 mx-auto mb-4 animate-spin" />
          <p className="text-slate-500 dark:text-emerald-100/70">Loading your wishlist...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#f8faf9] dark:bg-[#041d16] text-slate-900 dark:text-emerald-50 transition-colors duration-300 pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-16">
          <div>
            <h1 className="text-5xl font-black text-slate-900 dark:text-emerald-50 leading-tight">My Wishlist</h1>
            <p className="text-slate-500 dark:text-emerald-100/70 mt-4 max-w-2xl">Curate the products that will shape your greener future. Each save keeps your eco-intentions front and center.</p>
          </div>
          <div className="bg-white dark:bg-[#062d23] px-8 py-4 rounded-[1.5rem] border border-emerald-100 dark:border-emerald-800 shadow-sm dark:shadow-black/30">
            <p className="text-xs text-slate-400 dark:text-emerald-200/70 font-bold uppercase tracking-widest">Items Saved</p>
            <p className="text-3xl font-black text-emerald-600">{wishlistItems.length}</p>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-200 font-medium">
            {error}
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="text-center bg-white dark:bg-[#062d23] rounded-[2.5rem] border border-emerald-50 dark:border-emerald-900/30 p-12 shadow-xl dark:shadow-black/30">
            <Heart className="w-14 h-14 text-emerald-400 mx-auto mb-6" />
            <h2 className="text-3xl font-black text-slate-900 dark:text-emerald-50 mb-4">No favorites yet</h2>
            <p className="text-slate-500 dark:text-emerald-100/70 mb-8">Explore the marketplace and save items that inspire your sustainable lifestyle.</p>
            <Link to="/products" className="btn-lush inline-flex items-center gap-2 px-10 py-3">
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
            {wishlistItems.map((item) => (
              <div key={item.wishlistId || item.id} className="relative group">
                <ProductCard product={item} />
                <button
                  onClick={() => handleRemoveFromWishlist(item.wishlistId)}
                  className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 text-slate-400 hover:text-red-500 hover:bg-white shadow-md transition-colors"
                  title="Remove from wishlist"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Wishlist;
