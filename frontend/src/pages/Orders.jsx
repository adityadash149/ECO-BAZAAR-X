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
  TreePine
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
    
    // Set up auto-refresh for real-time updates every 30 seconds
    const interval = setInterval(() => {
      if (currentUser && currentUser.userId) {
        loadOrders();
      }
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

  const loadTreePlantingSubmissions = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/tree-planting/my-submissions', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const submissions = await response.json();
        setTreePlantingSubmissions(submissions || []);
      } else {
        setTreePlantingSubmissions([]);
      }
    } catch (error) {
      setTreePlantingSubmissions([]);
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

  const handleMarkAsDelivered = async (orderId) => {
    try {
      await orderAPI.markAsDelivered(orderId);
      await loadOrders(); // Reload orders
      alert('✅ Order marked as delivered! You earned eco points!');
    } catch (error) {
      console.error('Error marking order as delivered:', error);
      alert('❌ Failed to mark order as delivered: ' + error.message);
    }
  };

  const canPlantTree = (order) => {
    if (order.status !== 'DELIVERED') return false;
    
    // Check if order was delivered within the last 24 hours
    const deliveredDate = new Date(order.deliveredAt || order.createdAt);
    const now = new Date();
    const hoursSinceDelivery = (now - deliveredDate) / (1000 * 60 * 60);
    
    return hoursSinceDelivery <= 24;
  };

  const getTreePlantingStatus = (order) => {
    // Check if there's already a submission for this order
    const submission = treePlantingSubmissions.find(sub => 
      sub.order?.id === order.id || sub.orderId === order.id
    );
    
    if (submission) {
      switch (submission.status) {
        case 'PENDING':
          return { 
            status: 'pending', 
            message: '🟠 Submitted - Waiting for Approval', 
            color: 'orange',
            ecoPoints: submission.ecoPointsAwarded || 0
          };
        case 'APPROVED':
          return { 
            status: 'approved', 
            message: `✅ Approved - You earned ${submission.ecoPointsAwarded || 0} eco points!`, 
            color: 'green',
            ecoPoints: submission.ecoPointsAwarded || 0
          };
        case 'REJECTED':
          return { 
            status: 'rejected', 
            message: '❌ Rejected - Try again with your next order', 
            color: 'red',
            ecoPoints: 0
          };
        default:
          return { status: 'unknown', message: '❓ Unknown Status', color: 'gray' };
      }
    }
    
    // No submission found - check if customer can plant tree
    if (canPlantTree(order)) {
      return { status: 'available', message: '🌱 Plant Tree', color: 'green' };
    } else if (order.status === 'DELIVERED') {
      return { status: 'expired', message: '⏰ Time Expired', color: 'gray' };
    } else {
      return { status: 'not_delivered', message: '📦 Not Delivered Yet', color: 'gray' };
    }
  };

  const handlePlantTree = (order) => {
    setTreePlantingOrder(order);
    setShowTreePlanting(true);
  };

  const handleTreePlantingSuccess = () => {
    // Refresh orders and tree planting submissions
    loadOrders();
    loadTreePlantingSubmissions();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-green-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your orders...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <button
              onClick={() => {
                loadOrders();
                loadTreePlantingSubmissions();
              }}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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
                      <p className="text-sm font-medium text-gray-700">Notes</p>
                      <p className="text-sm text-gray-600">{order.notes}</p>
                    </div>
                  )}

                  {/* Order Items */}
                  {order.orderItems && order.orderItems.length > 0 && (
                    <div className="border-t pt-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Order Items ({order.orderItems.length})</p>
                      <div className="space-y-2">
                        {order.orderItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                            <div>
                              <p className="font-medium text-gray-900">{item.product?.name || 'Product'}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-gray-900">₹{item.price?.toLocaleString('en-IN')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}


                  {/* Actions */}
                  <div className="flex flex-col gap-3 mt-4 pt-4 border-t">
                    {order.status === 'SHIPPED' && (
                      <button
                        onClick={() => handleMarkAsDelivered(order.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Mark as Delivered
                      </button>
                    )}
                    {/* Tree Planting Status - Always Show */}
                    <div className="w-full">
                      {(() => {
                        const treeStatus = getTreePlantingStatus(order);
                        
                        const colorClasses = {
                          green: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200',
                          orange: 'bg-orange-100 text-orange-700 border-orange-200',
                          red: 'bg-red-100 text-red-700 border-red-200',
                          gray: 'bg-gray-100 text-gray-500 border-gray-200'
                        };
                        
                        const iconClasses = {
                          green: 'text-green-600',
                          orange: 'text-orange-600',
                          red: 'text-red-600',
                          gray: 'text-gray-500'
                        };
                        
                        if (treeStatus.status === 'available') {
                          return (
                            <button
                              onClick={() => handlePlantTree(order)}
                              className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 border-2 ${colorClasses[treeStatus.color]} hover:shadow-md`}
                            >
                              <TreePine size={18} className={`mr-3 ${iconClasses[treeStatus.color]}`} />
                              <div className="text-left">
                                <div className="font-semibold">{treeStatus.message}</div>
                                <div className="text-xs opacity-75">Click to submit tree planting photo</div>
                              </div>
                            </button>
                          );
                        } else {
                          return (
                            <div className={`w-full flex items-center px-4 py-3 rounded-lg border-2 ${colorClasses[treeStatus.color]}`}>
                              <TreePine size={18} className={`mr-3 ${iconClasses[treeStatus.color]}`} />
                              <div className="flex-1">
                                <div className="font-semibold text-sm">{treeStatus.message}</div>
                                {treeStatus.ecoPoints > 0 && (
                                  <div className="text-xs font-medium mt-1">
                                    🌟 +{treeStatus.ecoPoints} eco points earned!
                                  </div>
                                )}
                                {treeStatus.status === 'pending' && (
                                  <div className="text-xs opacity-75 mt-1">
                                    Admin will review within 24-48 hours
                                  </div>
                                )}
                                {treeStatus.status === 'rejected' && (
                                  <div className="text-xs opacity-75 mt-1">
                                    Please ensure you upload a clear photo next time
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tree Planting Submission Modal */}
        {showTreePlanting && treePlantingOrder && (
          <TreePlantingSubmission
            order={treePlantingOrder}
            onClose={() => {
              setShowTreePlanting(false);
              setTreePlantingOrder(null);
            }}
            onSuccess={handleTreePlantingSuccess}
          />
        )}
      </div>
    </div>
  );
};

export default Orders;
