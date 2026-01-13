import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaTrash, FaArrowRight, FaLeaf } from 'react-icons/fa';

const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8081/api';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const resolvedUserId = (() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.userId) return parsed.userId;
      } catch (err) {
        console.warn('Failed to parse stored user for userId', err);
      }
    }
    return localStorage.getItem('userId') || 3;
  })();

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/cart/details/${resolvedUserId}`);
      setCartItems(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching cart:', err);
      try {
        const fallbackRes = await axios.get(`${API_BASE_URL}/cart/user/${resolvedUserId}`);
        setCartItems(Array.isArray(fallbackRes.data) ? fallbackRes.data : []);
      } catch (fallbackError) {
        console.error('Fallback cart fetch failed:', fallbackError);
        setError('Unable to load your cart. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (cartId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/cart/${cartId}`);

      if (response.status === 200) {
        const successMessage = typeof response.data === 'string'
          ? response.data
          : response.data?.message;
        if (successMessage) {
          alert(successMessage);
        }
      }

      setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to remove item. Please try again.');
      alert('Failed to remove item. Please try again.');
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0), 0);
  const totalCarbonSaved = cartItems.reduce(
    (acc, item) => acc + Number(item.carbonSaved || 0) * Number(item.quantity || 0),
    0
  );
  const totalEcoPoints = cartItems.reduce(
    (acc, item) => acc + Number(item.ecoPoints || 0) * Number(item.quantity || 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors">
        <p className="text-lg font-semibold text-gray-700 dark:text-white">Loading Smart Cart...</p>
      </div>
    );
  }

  if (!loading && cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 text-center transition-colors">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Your Smart Cart is Empty</h2>
        <p className="text-gray-500 dark:text-gray-300 mb-6 max-w-md">
          Looks like you have not added anything yet. Explore our marketplace to find sustainable picks for your home.
        </p>
        <Link to="/products" className="px-6 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-all">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Smart Cart</h1>

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 dark:border-red-500/40 bg-red-50 dark:bg-red-900/30 px-4 py-3 text-red-700 dark:text-red-200 text-sm font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
              {cartItems.map((item) => (
                <div key={item.cartId} className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center gap-6 last:border-0">
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={item.image || item.imageUrl || 'https://via.placeholder.com/150'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{item.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Quantity: {item.quantity}</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-green-600 dark:text-green-400">
                      <FaLeaf />
                      <span>Saves {Number(item.carbonSaved || 0).toFixed(2)} kg CO₂ · +{Number(item.ecoPoints || 0)} pts</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      ₹{(Number(item.price || 0) * Number(item.quantity || 0)).toLocaleString('en-IN')}
                    </p>
                    <button
                      onClick={() => removeItem(item.cartId)}
                      className="mt-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm inline-flex items-center gap-1"
                    >
                      <FaTrash size={12} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:w-1/3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 sticky top-24 border border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 border-b border-gray-100 dark:border-gray-700 pb-6 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="flex items-center gap-1"><FaLeaf size={12} /> Carbon Saved</span>
                  <span>{totalCarbonSaved.toFixed(2)} kg</span>
                </div>
                <div className="flex justify-between text-blue-600 dark:text-blue-400 font-medium">
                  <span>Eco Points Earned</span>
                  <span>+{totalEcoPoints}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-700">
                  <span>Total</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <Link to="/checkout" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                Checkout <FaArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
