import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  Truck, 
  CheckCircle, 
  Lock, 
  Shield,
  AlertCircle,
  Loader2,
  Package,
  MapPin,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { orderAPI, authAPI, customerAPI } from '../services/api';
import CarbonScore from '../components/common/CarbonScore';
import EcoPointsRedemption from '../components/common/EcoPointsRedemption';
import GreenerAlternative from '../components/cart/GreenerAlternative';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash_on_delivery');
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  const currentUser = authAPI.getCurrentUser();

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  const [notes, setNotes] = useState('');

  // Eco Points redemption state
  const [ecoPointsRedemption, setEcoPointsRedemption] = useState({
    pointsUsed: 0,
    discountAmount: 0,
    isEcoBoost: false
  });

  const paymentMethods = [
    {
      id: 'cash_on_delivery',
      name: 'Cash on Delivery',
      icon: '💵',
      description: 'Pay when your order arrives'
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: '🏦',
      description: 'Transfer directly to our account'
    },
    {
      id: 'upi',
      name: 'UPI Payment',
      icon: '📱',
      description: 'Pay using UPI apps'
    }
  ];

  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        setLoading(true);

        // Load cart from localStorage for now (backend cart already used on Cart page)
        const localCartRaw = localStorage.getItem('cart');
        const localCart = localCartRaw ? JSON.parse(localCartRaw) : [];
        setCart(Array.isArray(localCart) ? localCart : []);
      } catch (error) {
        console.error('Error loading checkout data:', error);
        setError('Failed to load checkout data: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadCheckoutData();
  }, []);

  const handleInputChange = (section, field, value) => {
    if (section === 'shipping') {
      setShippingInfo(prev => ({ ...prev, [field]: value }));
    }
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
  };

  const calculateShipping = () => {
    return calculateSubtotal() > 2000 ? 0 : 99; // Free shipping over ₹2000
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
  };

  const handleReplaceItem = async (newItem) => {
    // Reload cart after replacement
    const localCartRaw = localStorage.getItem('cart');
    const localCart = localCartRaw ? JSON.parse(localCartRaw) : [];
    setCart(Array.isArray(localCart) ? localCart : []);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    const missing = required.filter(field => !shippingInfo[field].trim());
    
    if (missing.length > 0) {
      setError(`Please fill in: ${missing.join(', ')}`);
      return false;
    }

    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    setProcessing(true);
    setError('');
    
    try {
      const shippingAddress = `${shippingInfo.firstName} ${shippingInfo.lastName}\n${shippingInfo.address}\n${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}\n${shippingInfo.country}\nPhone: ${shippingInfo.phone}`;
      
      if (!currentUser || !currentUser.userId) {
        setError('You must be logged in to place an order.');
        setProcessing(false);
        return;
      }

      if (!cart || cart.length === 0) {
        setError('Your cart is empty. Please add items before placing an order.');
        setProcessing(false);
        return;
      }

      // Prepare cart items for backend (need productId and quantity)
      const cartItems = cart.map(item => ({
        productId: item.productId || item.id,
        quantity: item.quantity || 1
      }));

      // Prepare order data
      const orderData = {
        cartItems: cartItems,
        shippingAddress: shippingAddress,
        paymentMethod: selectedPaymentMethod.toUpperCase(),
        notes: notes || '',
        ecoPointsUsed: ecoPointsRedemption.pointsUsed || 0,
        ecoPointsDiscount: ecoPointsRedemption.discountAmount || 0,
        isEcoBoost: ecoPointsRedemption.isEcoBoost || false
      };

      // Create order using backend API
      const response = await orderAPI.createOrder(orderData);

      // Clear cart after successful order
      await customerAPI.clearCart();
      window.dispatchEvent(new Event('cartUpdated'));

      setOrderId(response.data.id || response.data.orderId || '');
      setOrderComplete(true);
    } catch (error) {
      console.error('Error placing order:', error);
      
      // More detailed error handling
      if (error.response) {
        // Backend responded with error
        console.error('Backend error:', error.response.data);
        const data = error.response.data || {};
        setError(`Order failed: ${data.error || data.message || error.response.statusText}`);
      } else if (error.request) {
        // Request was made but no response
        console.error('Network error:', error.request);
        setError('Network error: Could not connect to server. Please check if backend is running.');
      } else {
        // Something else happened
        console.error('Error:', error.message);
        setError(`Order failed: ${error.message}`);
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full text-center relative overflow-hidden"
        >
          {/* Success Animation Background */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
          
          {/* Confetti Effect */}
          <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-400 rounded-full animate-bounce"></div>
          <div className="absolute top-8 right-6 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          <div className="absolute top-6 right-12 w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
          
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Thank You!</h1>
            <h2 className="text-xl font-semibold text-green-600 mb-4">Order Placed Successfully!</h2>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Order ID:</span> #{orderId}
              </p>
              <p className="text-gray-600 text-sm">
                Your order is being processed and you'll receive updates via email and SMS.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
              <div className="flex items-center">
                <Package className="w-5 h-5 text-blue-600 mr-2" />
                <p className="text-blue-800 text-sm font-medium">
                  Status: <span className="text-orange-600">PENDING</span> - Waiting for seller confirmation
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <button
              onClick={() => navigate('/orders')}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              📋 My Orders
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => navigate('/')}
                className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                🏠 Home
              </button>
              <button
                onClick={() => navigate('/products')}
                className="bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                🛍️ Continue Shopping
              </button>
            </div>
          </motion.div>

          {/* Footer Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 pt-4 border-t border-gray-200"
          >
            <p className="text-xs text-gray-500">
              🌱 Thank you for choosing eco-friendly products and making a difference!
            </p>
          </motion.div>
        </motion.div>
          </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some products to your cart before checkout</p>
          <button
            onClick={() => navigate('/')}
            className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/cart')}
                className="flex items-center text-gray-600 hover:text-gray-800 mr-6"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back to Cart
              </button>
              <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
            </div>
            <div className="text-sm text-gray-500">
              Step 2 of 2
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="xl:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center mb-8">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <MapPin size={24} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Shipping Information</h2>
                  <p className="text-sm text-gray-500 mt-1">Enter your delivery details</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={shippingInfo.firstName}
                    onChange={(e) => handleInputChange('shipping', 'firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={shippingInfo.lastName}
                    onChange={(e) => handleInputChange('shipping', 'lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => handleInputChange('shipping', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => handleInputChange('shipping', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('shipping', 'address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={shippingInfo.city}
                    onChange={(e) => handleInputChange('shipping', 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={shippingInfo.state}
                    onChange={(e) => handleInputChange('shipping', 'state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={shippingInfo.zipCode}
                    onChange={(e) => handleInputChange('shipping', 'zipCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={shippingInfo.country}
                    onChange={(e) => handleInputChange('shipping', 'country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center mb-8">
                <div className="bg-blue-100 rounded-full p-3 mr-4">
                  <CreditCard size={24} className="text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Payment Method</h2>
                  <p className="text-sm text-gray-500 mt-1">Choose your preferred payment option</p>
                </div>
              </div>

                <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedPaymentMethod === method.id
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{method.icon}</span>
                  <div>
                          <h3 className="font-semibold text-gray-900">{method.name}</h3>
                          <p className="text-sm text-gray-600">{method.description}</p>
                  </div>
                  </div>
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        selectedPaymentMethod === method.id ? 'border-green-500 bg-green-500' : 'border-gray-300'
                      }`}>
                        {selectedPaymentMethod === method.id && (
                          <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5"></div>
                        )}
                    </div>
                    </div>
                  </div>
                ))}
                  </div>
                </div>

            {/* Order Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Notes (Optional)</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for your order..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="3"
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sticky top-6">
              <div className="flex items-center mb-8">
                <div className="bg-green-100 rounded-full p-3 mr-4">
                  <Package size={24} className="text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">Order Summary</h2>
                  <p className="text-sm text-gray-500 mt-1">Review your order</p>
                </div>
              </div>
              
              {/* Cart Items */}
              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id}>
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <img
                        src={item.image || item.imageUrl}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg shadow-sm mr-4"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                    
                    {/* Greener Alternative Suggestion */}
                    <GreenerAlternative
                      productId={item.productId || item.id}
                      currentProduct={item}
                      onReplace={handleReplaceItem}
                    />
                  </div>
                ))}
              </div>

              {/* Carbon Impact Summary */}
              <div className="border-t pt-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Environmental Impact</h3>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Total Carbon Impact</span>
                    <span className="text-sm font-semibold text-green-600">
                      {cart.reduce((sum, item) => sum + ((item.carbonScore || 2.5) * item.quantity), 0).toFixed(1)} kg CO₂
                    </span>
                  </div>
                  <div className="flex items-center text-xs text-green-600 mb-2">
                    <Package size={12} className="mr-1" />
                    <span>Eco-friendly order! You're making a positive impact.</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    This order helps reduce environmental impact compared to conventional products.
                  </div>
                </div>
              </div>

              {/* Eco Points Redemption */}
              <div className="border-t pt-6 mb-6">
                <EcoPointsRedemption
                  orderTotal={calculateSubtotal()}
                  productIds={cart.map(item => item.id)}
                  onRedemptionChange={(pointsUsed, discountAmount, isEcoBoost) => {
                    setEcoPointsRedemption({
                      pointsUsed,
                      discountAmount,
                      isEcoBoost
                    });
                  }}
                />
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{calculateSubtotal().toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {calculateShipping() === 0 ? 'Free' : `₹${calculateShipping()}`}
                  </span>
                </div>
                {ecoPointsRedemption.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Eco Points Discount {ecoPointsRedemption.isEcoBoost ? '(3x Boost!)' : ''}</span>
                    <span className="font-semibold">-₹{ecoPointsRedemption.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-green-600">₹{(calculateTotal() - ecoPointsRedemption.discountAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>


      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle size={16} className="text-red-500 mr-2" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}


              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={processing}
                className="w-full mt-6 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Processing Order...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-3" />
                    Place Order
                  </>
                )}
              </button>

              {/* Security Notice */}
              <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
                <Shield size={16} className="mr-2" />
                Your order information is secure
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;