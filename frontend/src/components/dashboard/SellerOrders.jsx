import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertCircle,
  RefreshCw,
  Eye,
  Calendar,
  MapPin,
  User
} from 'lucide-react';
import { orderAPI } from '../../services/api';

const SellerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState({});

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getSellerOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error loading seller orders:', error);
      setError('Failed to load orders: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'text-orange-600 bg-orange-100';
      case 'CONFIRMED': return 'text-blue-600 bg-blue-100';
      case 'SHIPPED': return 'text-purple-600 bg-purple-100';
      case 'DELIVERED': return 'text-green-600 bg-green-100';
      case 'CANCELLED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock size={16} />;
      case 'CONFIRMED': return <CheckCircle size={16} />;
      case 'SHIPPED': return <Truck size={16} />;
      case 'DELIVERED': return <Package size={16} />;
      case 'CANCELLED': return <AlertCircle size={16} />;
      default: return <Package size={16} />;
    }
  };

  const handleConfirmOrder = async (orderId) => {
    try {
      setProcessing(prev => ({ ...prev, [orderId]: true }));
      await orderAPI.confirmOrder(orderId);
      await loadOrders(); // Reload orders
      alert('✅ Order confirmed successfully!');
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('❌ Failed to confirm order: ' + error.message);
    } finally {
      setProcessing(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const handleMarkAsShipped = async (orderId) => {
    try {
      const trackingNumber = prompt('Enter tracking number (optional):');
      setProcessing(prev => ({ ...prev, [orderId]: true }));
      await orderAPI.markAsShipped(orderId, { trackingNumber: trackingNumber || undefined });
      await loadOrders(); // Reload orders
      alert('✅ Order marked as shipped successfully!');
    } catch (error) {
      console.error('Error marking order as shipped:', error);
      alert('❌ Failed to mark order as shipped: ' + error.message);
    } finally {
      setProcessing(prev => ({ ...prev, [orderId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
        <button
          onClick={loadOrders}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle size={16} className="text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-4">No orders yet</h3>
          <p className="text-gray-600">Orders from customers will appear here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Order #{order.id}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Calendar size={14} className="mr-1" />
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-2">{order.status}</span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <User size={16} className="text-gray-600 mr-2" />
                    <span className="font-medium text-gray-900">Customer Information</span>
                  </div>
                  <p className="text-sm text-gray-700">
                    {order.user?.firstName} {order.user?.lastName} ({order.user?.email})
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total Amount</p>
                    <p className="text-lg font-bold text-green-600">₹{order.totalPrice?.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Payment Method</p>
                    <p className="text-sm text-gray-900">{order.paymentMethod || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Carbon Score</p>
                    <p className="text-sm text-green-600">{order.totalCarbonScore || 0} CO₂ saved</p>
                  </div>
                </div>

                {order.shippingAddress && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Shipping Address</p>
                    <div className="flex items-start">
                      <MapPin size={14} className="text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-600 whitespace-pre-line">{order.shippingAddress}</p>
                    </div>
                  </div>
                )}

                {order.trackingNumber && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Tracking Number</p>
                    <p className="text-sm font-mono text-blue-600">{order.trackingNumber}</p>
                  </div>
                )}

                {order.notes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700">Customer Notes</p>
                    <p className="text-sm text-gray-600">{order.notes}</p>
                  </div>
                )}

                {/* Order Items */}
                {order.orderItems && order.orderItems.length > 0 && (
                  <div className="border-t pt-4 mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-3">Order Items ({order.orderItems.length})</p>
                    <div className="space-y-2">
                      {order.orderItems.map((item, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div>
                            <p className="font-medium text-gray-900">{item.product?.name || 'Product'}</p>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity} × ₹{item.price?.toLocaleString('en-IN')}
                            </p>
                          </div>
                          <p className="font-semibold text-gray-900">
                            ₹{(item.price * item.quantity)?.toLocaleString('en-IN')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => handleConfirmOrder(order.id)}
                      disabled={processing[order.id]}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {processing[order.id] ? 'Confirming...' : 'Confirm Order'}
                    </button>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleMarkAsShipped(order.id)}
                      disabled={processing[order.id]}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {processing[order.id] ? 'Shipping...' : 'Mark as Shipped'}
                    </button>
                  )}
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye size={16} className="inline mr-2" />
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SellerOrders;
