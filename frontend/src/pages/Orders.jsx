import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  RefreshCw,
  Calendar,
  MapPin,
  TreePine,
  ShoppingBag
} from 'lucide-react';
import { orderAPI, authAPI } from '../services/api';
import TreePlantingSubmission from '../components/tree-planting/TreePlantingSubmission';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTreePlanting, setShowTreePlanting] = useState(false);
  const [treePlantingOrder, setTreePlantingOrder] = useState(null);
  const [treePlantingSubmissions, setTreePlantingSubmissions] = useState([]);
  const currentUser = authAPI.getCurrentUser();

  useEffect(() => {
    if (currentUser && currentUser.userId) {
      loadOrders();
    }
    const interval = setInterval(() => {
      if (currentUser && currentUser.userId) loadOrders();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      if (!currentUser || !currentUser.userId) {
        setOrders([]);
        setLoading(false);
        return;
      }
      const response = await orderAPI.getCustomerOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Failed to load orders: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400';
      case 'CONFIRMED':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'SHIPPED':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400';
      case 'DELIVERED':
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock size={16} />;
      case 'CONFIRMED':
        return <CheckCircle size={16} />;
      case 'SHIPPED':
        return <Truck size={16} />;
      case 'DELIVERED':
        return <Package size={16} />;
      case 'CANCELLED':
        return <AlertCircle size={16} />;
      default:
        return <Package size={16} />;
    }
  };

  const handleMarkAsDelivered = async (orderId) => {
    try {
      await orderAPI.markAsDelivered(orderId);
      await loadOrders();
      alert('✅ Order marked as delivered! You earned eco points!');
    } catch (error) {
      alert('❌ Failed to mark order: ' + error.message);
    }
  };

  const canPlantTree = (order) => {
    if (order.status !== 'DELIVERED') return false;
    const deliveredDate = new Date(order.deliveredAt || order.createdAt);
    const now = new Date();
    const hoursSinceDelivery = (now - deliveredDate) / (1000 * 60 * 60);
    return hoursSinceDelivery <= 24;
  };

  const getTreePlantingStatus = (order) => {
    const submission = treePlantingSubmissions.find((sub) => sub.order?.id === order.id || sub.orderId === order.id);
    if (submission) {
      switch (submission.status) {
        case 'PENDING':
          return { status: 'pending', message: '🟠 Submitted - Waiting for Approval', color: 'orange', ecoPoints: submission.ecoPointsAwarded || 0 };
        case 'APPROVED':
          return { status: 'approved', message: `✅ Approved - You earned ${submission.ecoPointsAwarded || 0} eco points!`, color: 'green', ecoPoints: submission.ecoPointsAwarded || 0 };
        case 'REJECTED':
          return { status: 'rejected', message: '❌ Rejected - Try again with your next order', color: 'red', ecoPoints: 0 };
        default:
          return { status: 'unknown', message: '❓ Unknown Status', color: 'gray', ecoPoints: 0 };
      }
    }
    if (canPlantTree(order)) return { status: 'available', message: '🌱 Plant Tree', color: 'green', ecoPoints: 0 };
    if (order.status === 'DELIVERED') return { status: 'expired', message: '⏰ Time Expired', color: 'gray', ecoPoints: 0 };
    return { status: 'not_delivered', message: '📦 Not Delivered Yet', color: 'gray', ecoPoints: 0 };
  };

  const handlePlantTree = (order) => {
    setTreePlantingOrder(order);
    setShowTreePlanting(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600 dark:text-gray-300">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ShoppingBag className="text-emerald-600" /> My Orders
          </h1>
          <button
            onClick={loadOrders}
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-600/20"
          >
            <RefreshCw size={16} className="mr-2" />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle size={16} className="text-red-500 dark:text-red-400 mr-2" />
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <Package className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No orders yet</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Start shopping to see your orders here!</p>
            <a
              href="/products"
              className="inline-flex items-center px-6 py-3 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-colors"
            >
              Start Shopping
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Order #{order.id}</h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                          {order.orderItems?.length || 0} Items
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
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
                    <div className={`flex items-center px-4 py-2 rounded-full text-sm font-bold w-fit ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-2">{order.status}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Amount</p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">₹{order.totalPrice?.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Payment</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : order.paymentMethod || 'N/A'}
                      </p>
                    </div>
                    {order.shippingAddress && (
                      <div>
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Ship To</p>
                        <div className="flex items-start text-sm font-medium text-gray-900 dark:text-white mt-1">
                          <MapPin size={14} className="text-gray-400 mr-1 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2" title={order.shippingAddress}>
                            {order.shippingAddress.split(',')[0]}...
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {order.orderItems && order.orderItems.length > 0 && (
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
                      <div className="space-y-3">
                        {order.orderItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                <img
                                  src={item.product?.imageUrl || 'https://via.placeholder.com/150'}
                                  alt="product"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                  {item.product?.name || 'Product'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">
                              ₹{item.price?.toLocaleString('en-IN')}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {order.status === 'SHIPPED' && (
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => handleMarkAsDelivered(order.id)}
                        className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-bold"
                      >
                        Confirm Delivery
                      </button>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                    {(() => {
                      const treeStatus = getTreePlantingStatus(order);
                      const colorClasses = {
                        green: 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
                        orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800',
                        red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
                        gray: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700'
                      };

                      if (treeStatus.status === 'available') {
                        return (
                          <button
                            onClick={() => handlePlantTree(order)}
                            className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 border-2 ${
                              colorClasses[treeStatus.color]
                            } hover:shadow-md`}
                          >
                            <TreePine size={18} className="mr-3" />
                            <div className="text-left">
                              <div className="font-semibold">{treeStatus.message}</div>
                              <div className="text-xs opacity-75">Click to submit tree planting photo</div>
                            </div>
                          </button>
                        );
                      }

                      return (
                        <div className={`w-full flex items-center px-4 py-3 rounded-lg border-2 ${colorClasses[treeStatus.color]}`}>
                          <TreePine size={18} className="mr-3" />
                          <div className="flex-1">
                            <div className="font-semibold text-sm">{treeStatus.message}</div>
                            {treeStatus.ecoPoints > 0 && (
                              <div className="text-xs font-medium mt-1">🌟 +{treeStatus.ecoPoints} eco points earned!</div>
                            )}
                            {treeStatus.status === 'pending' && (
                              <div className="text-xs opacity-75 mt-1">Admin will review within 24-48 hours</div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {showTreePlanting && treePlantingOrder && (
        <TreePlantingSubmission
          order={treePlantingOrder}
          onClose={() => setShowTreePlanting(false)}
          onSuccess={() => {
            setShowTreePlanting(false);
            loadOrders();
          }}
        />
      )}
    </div>
  );
};

export default Orders;
