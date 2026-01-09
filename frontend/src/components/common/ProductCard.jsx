import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { authAPI, cartAPI } from '../../services/api';

const resolveCategoryName = (categoryValue) => {
  if (!categoryValue) return 'Sustainable Picks';
  if (typeof categoryValue === 'string') return categoryValue;
  if (typeof categoryValue === 'object') return categoryValue.name || 'Sustainable Picks';
  return 'Sustainable Picks';
};

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const isListView = viewMode === 'list';
  const navigate = useNavigate();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);
  const categoryLabel = product.categoryName || resolveCategoryName(product.category);
  const normalizedPrice = Number(product.price ?? 0);
  const originalPrice = Number(product.originalPrice ?? product.price ?? 0);
  const reviewsCount = product.reviews ?? 24;
  const stockQuantity = product.stockQuantity ?? product.stock ?? 0;
  const imageSrc = product.imageUrl || product.image || product.images?.[0] || 'https://via.placeholder.com/300';

  const handleAddToCart = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!authAPI.isAuthenticated()) {
      navigate('/auth', { state: { returnPath: `/product/${product.id}` } });
      return;
    }

    const currentUser = authAPI.getCurrentUser();
    if (!currentUser?.userId) {
      alert('Please login again to add items to your cart.');
      return;
    }

    setIsAddingToCart(true);
    try {
      await cartAPI.addToCart(currentUser.userId, product.id, 1);
      window.dispatchEvent(new Event('cartUpdated'));
      setIsAddedFeedback(true);
      toast.success(`${product.name} added to Smart Cart!`, {
        duration: 2000,
        position: 'bottom-right',
        style: {
          background: '#1f2937',
          color: '#fff',
          borderRadius: '10px'
        }
      });
      setTimeout(() => {
        setIsAddedFeedback(false);
      }, 1500);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add item to cart. Please try again.');
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden ${
        isListView ? 'flex flex-row h-48 w-full' : 'flex flex-col h-full'
      }`}
    >
      <div className={`relative overflow-hidden ${isListView ? 'w-1/3 min-w-[150px]' : 'w-full h-64'}`}>
        <Link to={`/product/${product.id}`} className="block h-full w-full">
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(event) => {
              event.currentTarget.src = 'https://via.placeholder.com/300';
            }}
          />
        </Link>

        {product.badge && (
          <span className="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
            {product.badge}
          </span>
        )}
      </div>

      <div className={`flex flex-col ${isListView ? 'w-2/3 p-6 justify-between' : 'p-4 flex-grow'}`}>
        <div>
          <div className="text-xs text-green-600 dark:text-green-400 font-semibold mb-1 uppercase tracking-wide">
            {categoryLabel}
          </div>

          <Link to={`/product/${product.id}`} className="block">
            <h3 className="font-bold text-gray-800 dark:text-white hover:text-green-700 transition-colors mb-2 line-clamp-2 text-lg">
              {product.name}
            </h3>
          </Link>

          {isListView && product.description && (
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
          )}

          <div className="flex items-center gap-2 mb-3">
            <div className="flex text-yellow-400 text-sm">★★★★☆</div>
            <span className="text-xs text-gray-400 dark:text-gray-500">({reviewsCount} reviews)</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            {originalPrice > normalizedPrice && (
              <span className="text-gray-400 dark:text-gray-500 text-xs line-through">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-xl font-bold text-gray-900 dark:text-white">₹{normalizedPrice.toLocaleString('en-IN')}</span>
          </div>

          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm flex items-center gap-2 transition-all disabled:opacity-60 ${
              stockQuantity === 0
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed'
                : isAddedFeedback
                  ? 'bg-green-600 text-white scale-105'
                  : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-green-600 dark:hover:bg-green-400'
            }`}
            onClick={handleAddToCart}
            disabled={isAddingToCart || isAddedFeedback || stockQuantity === 0}
          >
            {stockQuantity === 0
              ? 'Sold Out'
              : isAddedFeedback
                ? 'Added ✓'
                : isAddingToCart
                  ? 'Adding...'
                  : isListView
                    ? 'Add to Smart Cart'
                    : 'Add'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

