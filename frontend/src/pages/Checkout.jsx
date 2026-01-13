import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  CreditCard, 
  CheckCircle, 
  Lock, 
  Shield,
  AlertCircle,
  Loader2,
  Package,
  MapPin,
  Banknote
} from 'lucide-react';
import { motion } from 'framer-motion';
import { orderAPI, authAPI, customerAPI } from '../services/api';
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

  const [shippingInfo, setShippingInfo] = useState({
    firstName: currentUser?.firstName || '',
    lastName: currentUser?.lastName || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  const [notes, setNotes] = useState('');
  const [ecoPointsRedemption, setEcoPointsRedemption] = useState({
    pointsUsed: 0,
    discountAmount: 0,
    isEcoBoost: false
  });

  const paymentMethods = [
    {
      id: 'cash_on_delivery',
      name: 'Cash on Delivery',
      description: 'Pay when your order arrives'
    },
    {
      id: 'upi',
      name: 'UPI / Online Payment',
      description: 'Pay via Razorpay (UPI, Card, Netbanking)'
    }
  ];

  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        setLoading(true);
        if (currentUser && currentUser.userId) {
          try {
            const response = await authAPI.get(`/cart/user/${currentUser.userId}`);
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
              setCart(response.data);
            } else {
               const localCartRaw = localStorage.getItem('cart');
               setCart(localCartRaw ? JSON.parse(localCartRaw) : []);
            }
          } catch (e) {
             const localCartRaw = localStorage.getItem('cart');
             setCart(localCartRaw ? JSON.parse(localCartRaw) : []);
          }
        } else {
          const localCartRaw = localStorage.getItem('cart');
          setCart(localCartRaw ? JSON.parse(localCartRaw) : []);
        }
      } catch (error) {
        setError('Failed to load checkout data');
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

  const calculateSubtotal = () => cart.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
  const calculateShipping = () => calculateSubtotal() > 2000 ? 0 : 99;
  const calculateTotal = () => calculateSubtotal() + calculateShipping();

  const handleReplaceItem = async () => {
      window.dispatchEvent(new Event('cartUpdated'));
  };

  const validateForm = () => {
    const required = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode'];
    return required.every(field => shippingInfo[field].trim());
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
        setError('Please fill in all required fields');
        return;
    }
    setProcessing(true);
    setError('');
    
    try {
      if (!currentUser || !currentUser.userId) throw new Error('You must be logged in to place an order.');
      if (!cart || cart.length === 0) throw new Error('Cart is empty.');

      // Final check to prevent UPI orders
      if (selectedPaymentMethod === 'upi') {
          alert("Feature in improvement! UPI payment through Razorpay will be updated soon.");
          setProcessing(false);
          return;
      }

      const shippingAddress = `${shippingInfo.firstName} ${shippingInfo.lastName}\n${shippingInfo.address}\n${shippingInfo.city}, ${shippingInfo.state} ${shippingInfo.zipCode}\n${shippingInfo.country}\nPhone: ${shippingInfo.phone}`;
      
      const cartItems = cart.map(item => ({
        productId: item.productId || item.id,
        quantity: item.quantity || 1
      }));

      const orderData = {
        cartItems: cartItems,
        shippingAddress: shippingAddress,
        paymentMethod: 'CASH_ON_DELIVERY', // Hardcoded since UPI is disabled
        notes: notes || '',
        ecoPointsUsed: ecoPointsRedemption.pointsUsed || 0,
        ecoPointsDiscount: ecoPointsRedemption.discountAmount || 0,
        isEcoBoost: ecoPointsRedemption.isEcoBoost || false
      };

      const response = await orderAPI.createOrder(orderData);
      await customerAPI.clearCart();
      window.dispatchEvent(new Event('cartUpdated'));
      setOrderId(response.data.id || response.data.orderId || '');
      setOrderComplete(true);
    } catch (error) {
      setError(error.message || 'Order failed');
    } finally {
      setProcessing(false);
    }
  };

  // Handler for Payment Method Selection
  const handlePaymentMethodClick = (methodId) => {
    if (methodId === 'upi') {
        alert("Feature in improvement! UPI payment through Razorpay will be updated soon.");
        // We do NOT update the state, so it stays on COD
    } else {
        setSelectedPaymentMethod(methodId);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><Loader2 className="animate-spin text-green-600" /></div>;

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 flex items-center justify-center p-4 transition-colors">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Order ID: #{orderId}</p>
          <button onClick={() => navigate('/orders')} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700">My Orders</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button onClick={() => navigate('/cart')} className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
            <ArrowLeft size={20} className="mr-2" /> Back to Cart
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-6">
          {/* Shipping Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center mb-6">
              <MapPin className="text-green-600 dark:text-green-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Shipping Information</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'zipCode', 'country'].map((field) => (
                <div key={field} className={field === 'address' ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={shippingInfo[field]}
                    onChange={(e) => handleInputChange('shipping', field, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center mb-6">
              <CreditCard className="text-blue-600 dark:text-blue-400 mr-3" />
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Payment Method</h2>
            </div>

            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  onClick={() => handlePaymentMethodClick(method.id)}
                  className={`border-2 rounded-lg p-4 cursor-pointer flex items-center justify-between transition-colors ${
                    selectedPaymentMethod === method.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center">
                    {method.id === 'cash_on_delivery' ? (
                      <Banknote className="mr-3 text-green-600" size={24} />
                    ) : (
                      <CreditCard className="mr-3 text-purple-600" size={24} />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{method.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{method.description}</p>
                    </div>
                  </div>
                  {selectedPaymentMethod === method.id && <div className="w-4 h-4 rounded-full bg-green-600"></div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="xl:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 sticky top-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="block">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                       <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                       <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                  <GreenerAlternative productId={item.productId || item.id} currentProduct={item} onReplace={handleReplaceItem} />
                </div>
              ))}
            </div>

            <div className="border-t dark:border-gray-700 pt-4 space-y-2">
               <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>₹{calculateSubtotal().toLocaleString('en-IN')}</span></div>
               <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Shipping</span><span>{calculateShipping() === 0 ? 'Free' : `₹${calculateShipping()}`}</span></div>
               <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white pt-2 border-t dark:border-gray-700"><span>Total</span><span>₹{(calculateTotal() - ecoPointsRedemption.discountAmount).toLocaleString('en-IN')}</span></div>
            </div>

            <EcoPointsRedemption
                  orderTotal={calculateSubtotal()}
                  productIds={cart.map(item => item.id)}
                  onRedemptionChange={(pointsUsed, discountAmount, isEcoBoost) => {
                    setEcoPointsRedemption({ pointsUsed, discountAmount, isEcoBoost });
                  }}
            />

            {error && <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-center"><AlertCircle size={16} className="mr-2"/>{error}</div>}

            <button onClick={handlePlaceOrder} disabled={processing} className="w-full mt-6 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 flex items-center justify-center">
              {processing ? <Loader2 className="animate-spin" /> : <><Lock size={18} className="mr-2" /> Place Order</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
