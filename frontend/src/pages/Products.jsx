import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import ProductCard from '../components/common/ProductCard';
import { productAPI } from '../services/api';

const DEFAULT_CATEGORIES = ['Home & Living', 'Fashion', 'Electronics', 'Beauty'];

const resolveCategoryName = (categoryValue) => {
  if (!categoryValue) return 'Sustainable Picks';
  if (typeof categoryValue === 'string') return categoryValue;
  if (typeof categoryValue === 'object') return categoryValue.name || 'Sustainable Picks';
  return 'Sustainable Picks';
};

const normalizeProduct = (product = {}) => {
  const price = Number(product.price ?? product.productPrice ?? 0);
  const carbonScore = product.carbonScore ?? product.carbonFootprintScore ?? null;
  const rawCategory = product.category ?? product.categoryName ?? null;
  const categoryName = resolveCategoryName(rawCategory);

  return {
    ...product,
    price,
    originalPrice: Number(product.originalPrice ?? product.compareAtPrice ?? price),
    rating: Number(product.rating ?? product.averageRating ?? 0),
    reviews: Number(product.reviews ?? product.reviewCount ?? 0),
    carbonScore,
    isEcoFriendly:
      typeof carbonScore === 'number' ? carbonScore <= 3 : product.isEcoFriendly ?? false,
    stockQuantity: product.stockQuantity ?? product.stock ?? product.availableQuantity ?? 0,
    shipping: product.shipping || product.shippingInfo || 'Ships sustainably',
    category: rawCategory ?? categoryName,
    categoryName,
    imageUrl: product.imageUrl || product.productImageUrl || product.image || product.images?.[0] || null,
  };
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await productAPI.getAllProducts();
      const payload = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.content)
        ? response.data.content
        : [];
      setProducts(payload.map(normalizeProduct));
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const baseCategories = Array.from(new Set(DEFAULT_CATEGORIES));
    const seen = new Set(['All', ...baseCategories]);
    const dynamic = [];

    products.forEach((product) => {
      const categoryLabel = product.categoryName || resolveCategoryName(product.category);
      if (categoryLabel && !seen.has(categoryLabel)) {
        dynamic.push(categoryLabel);
        seen.add(categoryLabel);
      }
    });

    return ['All', ...baseCategories, ...dynamic];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const name = product.name?.toLowerCase() || '';
      const description = product.description?.toLowerCase() || '';
      const categoryName = (product.categoryName || resolveCategoryName(product.category)).toLowerCase();
      const matchesCategory =
        activeCategory === 'All' || categoryName === activeCategory.toLowerCase();
      const matchesQuery = !query || name.includes(query) || description.includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [products, activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#f6fbf7] dark:bg-[#041d16] text-slate-900 dark:text-emerald-50 transition-colors duration-300 pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-emerald-50 mt-4 leading-tight">
            Curated essentials for a <span className="text-emerald-600">greener</span> routine
          </h1>
          <p className="text-slate-500 dark:text-emerald-100/70 mt-4 max-w-2xl font-semibold tracking-tight uppercase">
            Shop More, Save More
          </p>
        </header>

        <div className="flex flex-col gap-6 mb-10">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 border ${
                  activeCategory === category
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/30'
                    : 'bg-white dark:bg-[#062d23] text-emerald-700 dark:text-emerald-100 border-emerald-100 dark:border-emerald-800 hover:border-emerald-300 dark:hover:border-emerald-500'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for sustainable products..."
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-[#062d23] border border-emerald-50 dark:border-emerald-900 rounded-2xl text-slate-700 dark:text-emerald-50 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 placeholder-slate-400 dark:placeholder-emerald-200/60"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="h-12 w-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin" aria-label="Loading products"></div>
          </div>
        ) : error ? (
          <div className="text-center bg-white dark:bg-[#062d23] border border-emerald-50 dark:border-emerald-900/30 rounded-3xl p-12 shadow-lg">
            <p className="text-lg font-semibold text-red-500 mb-4">{error}</p>
            <button
              onClick={loadProducts}
              className="px-6 py-3 rounded-full bg-emerald-600 text-white font-semibold hover:bg-emerald-500 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="flex flex-col gap-6">
            {filteredProducts.map((product, index) => {
              const key = product.id ?? product.productId ?? product._id ?? `product-${index}`;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <ProductCard product={product} viewMode="list" />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 mb-6">
              <SlidersHorizontal className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-emerald-50 mb-2">No products found</h3>
            <p className="text-slate-500 dark:text-emerald-100/70">
              Try adjusting your search or category filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
