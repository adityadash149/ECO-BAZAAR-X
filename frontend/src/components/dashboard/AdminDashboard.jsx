import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  TrendingUp, 
  Shield, 
  LogOut, 
  Eye, 
  UserCheck, 
  UserX, 
  AlertTriangle,
  BarChart3,
  Activity,
  Leaf,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Filter,
  ShoppingCart,
  Database,
  Bell,
  Star,
  Clock,
  TrendingDown,
  DollarSign,
  MapPin,
  Mail,
  Phone,
  Ban,
  Check,
  X,
  Calendar,
  Edit2,
  FolderTree,
  FolderOpen,
  Tag,
  FileText,
  Save,
  MessageCircle,
  Zap
} from 'lucide-react';
import { adminAPI, authAPI, treePlantingAPI } from '../../services/api';
import AdminCarbonAnalytics from './AdminCarbonAnalytics';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // Overview data
  const [overviewData, setOverviewData] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  
  // User management data
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // Seller management data
  const [sellers, setSellers] = useState([]);
  
  // Product oversight data
  const [products, setProducts] = useState([]);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [sellerProducts, setSellerProducts] = useState([]);
  
  // Customer monitoring data
  const [customerOrders, setCustomerOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrderDetails, setCustomerOrderDetails] = useState([]);
  
  // Tree planting data
  const [treePlantingSubmissions, setTreePlantingSubmissions] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionReview, setSubmissionReview] = useState({ approved: false, adminNotes: '' });
  const [submissionLoading, setSubmissionLoading] = useState(false);
  
  // Category management data
  const [categories, setCategories] = useState([]);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  
  // Notification data
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  // Form data
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  
  // Admin product management
  const [showProductEditModal, setShowProductEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productEditForm, setProductEditForm] = useState({ 
    carbonScore: '', 
    isEcoFriendly: false, 
    adminNotes: '' 
  });

  // Get current user
  const currentUser = authAPI.getCurrentUser();
  

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.admin-notifications')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadOverviewData(),
        loadUsers(),
        loadTreePlantingData(),
        loadCustomerData(),
        currentUser && currentUser.userId ? loadNotifications() : Promise.resolve()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOverviewData = async () => {
    try {
      const [overviewResponse, activityResponse] = await Promise.all([
        adminAPI.getAdminOverview(),
        adminAPI.getRecentActivity()
      ]);
      setOverviewData(overviewResponse.data);
      setRecentActivity(activityResponse.data);
    } catch (error) {
      console.error('Error loading overview data:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadSellers = async () => {
    try {
      const response = await adminAPI.getAllSellers();
      setSellers(response.data);
    } catch (error) {
      console.error('Error loading sellers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await adminAPI.getAllProducts();
      setProducts(response.data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCustomerOrders = async () => {
    try {
      const response = await adminAPI.getAllCustomerOrders();
      setCustomerOrders(response.data);
    } catch (error) {
      console.error('Error loading customer orders:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await adminAPI.getAllCategories();
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadTreePlantingData = async () => {
    try {
      const response = await treePlantingAPI.getAllSubmissions();
      const submissions = response.data || [];
      
      // Transform the data to match the expected format
      const transformedSubmissions = submissions.map(submission => ({
        id: submission.id,
        user: {
          id: submission.user?.id || 0,
          firstName: submission.user?.firstName || 'Unknown',
          lastName: submission.user?.lastName || 'User'
        },
        order: {
          id: submission.order?.id || 0
        },
        imageUrl: submission.imageUrl,
        description: submission.description,
        status: submission.status,
        submittedAt: submission.submittedAt,
        isEcoFriendlyProduct: submission.isEcoFriendlyProduct || false,
        ecoPointsAwarded: submission.ecoPointsAwarded || 0
      }));
      
      setTreePlantingSubmissions(transformedSubmissions);
      setPendingSubmissions(transformedSubmissions.filter(s => s.status === "PENDING"));
    } catch (error) {
      console.error('Error loading tree planting data:', error);
      // Fallback to mock data
      const mockSubmissions = [
        {
          id: 1,
          user: { id: 7, firstName: "Pushpa", lastName: "Priya" },
          order: { id: 3 },
          imageUrl: "/uploads/tree-planting/7582e985-b39e-4a43-82ab-061d920a6ea7.jpg",
          description: "Planted a beautiful mango tree in my backyard!",
          status: "PENDING",
          submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          isEcoFriendlyProduct: true,
          ecoPointsAwarded: 0
        },
        {
          id: 2,
          user: { id: 7, firstName: "Pushpa", lastName: "Priya" },
          order: { id: 2 },
          imageUrl: "/uploads/tree-planting/7582e985-b39e-4a43-82ab-061d920a6ea7.jpg",
          description: "Planted a neem tree in my garden!",
          status: "APPROVED",
          submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          isEcoFriendlyProduct: true,
          ecoPointsAwarded: 70
        },
        {
          id: 3,
          user: { id: 7, firstName: "Pushpa", lastName: "Priya" },
          order: { id: 1 },
          imageUrl: "/uploads/tree-planting/7582e985-b39e-4a43-82ab-061d920a6ea7.jpg",
          description: "Planted a banyan tree!",
          status: "REJECTED",
          submittedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          isEcoFriendlyProduct: false,
          ecoPointsAwarded: 0
        }
      ];
      
      setTreePlantingSubmissions(mockSubmissions);
      setPendingSubmissions(mockSubmissions.filter(s => s.status === "PENDING"));
    }
  };

  const loadCustomerData = async () => {
    try {
      // Mock customer data
      const mockCustomers = [
        {
          id: 7,
          name: "Pushpa Priya",
          email: "pushpapriya@gmail.com",
          orders: [],
          totalOrders: 3,
          totalSpent: 2596.00,
          carbonImpact: 6.8
        }
      ];
      
      const mockCustomerOrders = [
        {
          id: 1,
          user: { id: 7, firstName: "Pushpa", lastName: "Priya", email: "pushpapriya@gmail.com" },
          totalPrice: 249.00,
          totalCarbonScore: 1.8,
          status: "DELIVERED",
          createdAt: "2025-09-18T16:24:47",
          items: [
            { productName: "Bamboo Toothbrush (Pack of 4)", quantity: 1, totalPrice: 249.00 }
          ]
        },
        {
          id: 2,
          user: { id: 7, firstName: "Pushpa", lastName: "Priya", email: "pushpapriya@gmail.com" },
          totalPrice: 1048.00,
          totalCarbonScore: 3.2,
          status: "DELIVERED",
          createdAt: "2025-09-21T13:21:14",
          items: [
            { productName: "Bamboo Toothbrush (Pack of 4)", quantity: 1, totalPrice: 249.00 },
            { productName: "Natural Dyed Scarf", quantity: 1, totalPrice: 799.00 }
          ]
        },
        {
          id: 3,
          user: { id: 7, firstName: "Pushpa", lastName: "Priya", email: "pushpapriya@gmail.com" },
          totalPrice: 1299.00,
          totalCarbonScore: 1.8,
          status: "DELIVERED",
          createdAt: "2025-09-27T14:32:00",
          items: [
            { productName: "Cork Sandals", quantity: 1, totalPrice: 1299.00 }
          ]
        }
      ];
      
      setCustomerOrders(mockCustomerOrders);
      setCustomers(mockCustomers);
    } catch (error) {
      console.error('Error loading customer data:', error);
    }
  };

  const loadCustomerOrderDetails = async (customerId) => {
    try {
      const response = await adminAPI.getCustomerOrders(customerId);
      setCustomerOrderDetails(response.data);
    } catch (error) {
      console.error('Error loading customer order details:', error);
    }
  };

  const loadNotifications = async () => {
    if (currentUser && currentUser.userId) {
      try {
        const [notificationsResponse, countResponse] = await Promise.all([
          adminAPI.getUserNotifications(currentUser.userId),
          adminAPI.getUnreadNotificationCount(currentUser.userId)
        ]);
        
        setNotifications(notificationsResponse.data);
        setUnreadCount(countResponse.data);
    } catch (error) {
        console.error('Error loading notifications:', error);
        
        // If no notifications exist, try to seed them
        if (error.response?.status === 404 || notifications.length === 0) {
          try {
            await adminAPI.seedNotifications(currentUser.userId);
            
            // Reload notifications after seeding
            const [notificationsResponse, countResponse] = await Promise.all([
              adminAPI.getUserNotifications(currentUser.userId),
              adminAPI.getUnreadNotificationCount(currentUser.userId)
            ]);
            setNotifications(notificationsResponse.data);
            setUnreadCount(countResponse.data);
          } catch (seedError) {
            console.error('❌ Error seeding notifications:', seedError);
            setNotifications([]);
            setUnreadCount(0);
          }
        } else {
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    } else {
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      loadNotifications();
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await adminAPI.markNotificationAsRead(notificationId);
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (currentUser && currentUser.userId) {
      try {
        await adminAPI.markAllNotificationsAsRead(currentUser.userId);
        setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
        setUnreadCount(0);
      } catch (error) {
        console.error('Error marking all notifications as read:', error);
      }
    }
  };

  const handleSubmissionReview = async (approved) => {
    try {
      setSubmissionLoading(true);
      const response = await treePlantingAPI.reviewSubmission(
        selectedSubmission.id,
        approved,
        submissionReview.adminNotes
      );
      
      // Reload tree planting data
      await loadTreePlantingData();
      
      // Close modal
      setShowSubmissionModal(false);
      setSelectedSubmission(null);
      setSubmissionReview({ approved: false, adminNotes: '' });
      
      const isReApproval = selectedSubmission.status === 'REJECTED' && approved;
      alert(`Submission ${approved ? 'approved' : 'rejected'} successfully! ${isReApproval ? 'Re-approval completed - ' : ''}Eco points will be ${approved ? 'awarded' : 'not awarded'} to the customer.`);
    } catch (error) {
      console.error('Error reviewing submission:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Error reviewing submission: ${error.response?.data?.error || error.message}`);
    } finally {
      setSubmissionLoading(false);
    }
  };

  const openSubmissionModal = (submission) => {
    setSelectedSubmission(submission);
    setSubmissionReview({ approved: false, adminNotes: '' });
    setShowSubmissionModal(true);
  };

  const handleCustomerViewOrders = (customer) => {
    setSelectedCustomer(customer);
    loadCustomerOrderDetails(customer.id);
  };

  const deleteNotification = async (notificationId) => {
    try {
      await adminAPI.deleteNotification(notificationId);
      // Remove from local state immediately for instant UI update
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
      // Recalculate unread count
      const remainingNotifications = notifications.filter(notif => notif.id !== notificationId);
      const newUnreadCount = remainingNotifications.filter(notif => !notif.isRead).length;
      setUnreadCount(newUnreadCount);
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  };

  const openNotificationModal = (notification) => {
    setSelectedNotification(notification);
    setShowNotificationModal(true);
    // Mark as read when opened
    if (!notification.isRead) {
      markNotificationAsRead(notification.id);
    }
  };

  const closeNotificationModal = () => {
    setSelectedNotification(null);
    setShowNotificationModal(false);
  };

  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notifTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'SELLER_REGISTRATION': return <UserCheck className="notification-type-icon" />;
      case 'PRODUCT_APPROVAL': return <Package className="notification-type-icon" />;
      case 'REPORT': return <BarChart3 className="notification-type-icon" />;
      case 'ORDER': return <ShoppingCart className="notification-type-icon" />;
      default: return <Bell className="notification-type-icon" />;
    }
  };

  const filterUsers = () => {
    let filtered = users;
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole.toUpperCase());
    }
    
    setFilteredUsers(filtered);
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    
    // Load data specific to each tab
    switch (tab) {
      case 'overview':
        await loadOverviewData();
        break;
      case 'users':
        await loadUsers();
        break;
      case 'sellers':
        await loadSellers();
        break;
             case 'products':
         await loadSellers(); // Load sellers first for product oversight
         break;
      case 'customers':
        await loadCustomerData();
        break;
      case 'categories':
        await loadCategories();
        break;
      default:
        break;
    }
  };

  const handleUserStatusChange = async (userId, isActive) => {
    try {
      await adminAPI.updateUserStatus(userId, isActive);
      await loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleUserRoleChange = async (userId, role) => {
    try {
      await adminAPI.updateUserRole(userId, role);
      await loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleSellerApproval = async (sellerId, approve) => {
    try {
      const adminNotes = approve ? 
        'Seller application approved after review' : 
        'Application requires additional review';
      
      if (approve) {
        await adminAPI.approveSeller(sellerId, adminNotes);
      } else {
        await adminAPI.rejectSeller(sellerId, adminNotes);
      }
      
      await loadSellers();
    } catch (error) {
      console.error('Error updating seller status:', error);
    }
  };

  const handleSellerBlock = async (sellerId) => {
    const reason = prompt('Please provide a reason for blocking this seller:', 'Policy violations or selling non-compliant products');
    if (reason && window.confirm('Are you sure you want to block this seller? This action will prevent them from logging in.')) {
    try {
        await adminAPI.blockSeller(sellerId, reason);
        await loadSellers();
    } catch (error) {
        console.error('Error blocking seller:', error);
      }
    }
  };

  const handleProductRemoval = async (productId, reason) => {
    if (window.confirm('Are you sure you want to remove this product? This action will notify the seller.')) {
      try {
        await adminAPI.removeProduct(productId, reason || 'Policy violation');
        if (selectedSeller) {
          await loadSellerProducts(selectedSeller);
        } else {
          await loadProducts();
        }
      } catch (error) {
        console.error('Error removing product:', error);
      }
    }
  };

  const handleProductApproval = async (productId, approve, reason = '') => {
    try {
      if (approve) {
        await adminAPI.approveProduct(productId, 'Product meets quality standards');
      } else {
        const rejectionReason = reason || prompt('Please provide a reason for rejection:', 'Does not meet eco-friendly standards');
        if (rejectionReason) {
          await adminAPI.rejectProduct(productId, rejectionReason);
        }
      }
      
      if (selectedSeller) {
        await loadSellerProducts(selectedSeller);
      } else {
        await loadProducts();
      }
    } catch (error) {
      console.error('Error updating product status:', error);
    }
  };

  const loadSellerProducts = async (sellerId) => {
    try {
      const response = await adminAPI.getProductsBySeller(sellerId);
      setSellerProducts(response.data);
      setSelectedSeller(sellerId);
    } catch (error) {
      console.error('Error loading seller products:', error);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminAPI.updateCategory(
          editingCategory.id, 
          categoryForm.name, 
          categoryForm.description, 
          true
        );
      } else {
        await adminAPI.createCategory(categoryForm.name, categoryForm.description);
      }
      
      setCategoryForm({ name: '', description: '' });
      setShowCategoryForm(false);
      setEditingCategory(null);
      await loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const handleCategoryDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await adminAPI.deleteCategory(categoryId);
        await loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert(error.response?.data || 'Error deleting category');
      }
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    window.location.href = '/auth';
  };

  // Admin Product Management Methods
  const openProductEditModal = (product) => {
    setEditingProduct(product);
    setProductEditForm({
      carbonScore: product.carbonScore || '',
      isEcoFriendly: product.isEcoFriendly || false,
      adminNotes: ''
    });
    setShowProductEditModal(true);
  };

  const closeProductEditModal = () => {
    setShowProductEditModal(false);
    setEditingProduct(null);
    setProductEditForm({ carbonScore: '', isEcoFriendly: false, adminNotes: '' });
  };

  const handleProductEcoDataUpdate = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.updateProductEcoData(
        editingProduct.id,
        parseFloat(productEditForm.carbonScore),
        productEditForm.isEcoFriendly,
        productEditForm.adminNotes
      );
      
      // Refresh the products list
      if (selectedSeller) {
        await loadSellerProducts(selectedSeller);
      } else {
        await loadProducts();
      }
      
      closeProductEditModal();
      alert('Product eco-data updated successfully!');
    } catch (error) {
      console.error('Error updating product eco-data:', error);
      alert('Error updating product eco-data: ' + (error.response?.data || error.message));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInMinutes = Math.floor((now - past) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': 
      case 'ACTIVE': 
      case 'COMPLETED': return 'green';
      case 'PENDING': return 'yellow';
      case 'REJECTED': 
      case 'BLOCKED': 
      case 'CANCELLED': return 'red';
      case 'PROCESSING': 
      case 'SHIPPED': return 'blue';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'REJECTED':
      case 'BLOCKED':
      case 'CANCELLED':
        return <XCircle className="w-4 h-4" />;
      case 'PROCESSING':
      case 'SHIPPED':
        return <Package className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-logo">
            <img 
              src="/Main Navigator Logo.png" 
              alt="EcoBazaarX Logo" 
              className="admin-logo-image"
            />
          </div>
        </div>
        <div className="admin-header-right">
          <div className="admin-notifications" onClick={toggleNotifications}>
            <Bell className="admin-notification-icon" />
            {unreadCount > 0 && (
              <span className="admin-notification-badge">{unreadCount}</span>
            )}
            
            {showNotifications && (
              <div className="green-notification-dropdown">
                <div className="green-notification-header">
                  <div className="green-notification-title">
                    <Bell className="green-notification-header-icon" />
                    <h3>Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="green-notification-count">{unreadCount}</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button 
                      className="green-mark-all-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAllNotificationsAsRead();
                      }}
                    >
                      <Check size={16} />
                      Mark all read
                    </button>
                  )}
                </div>
                
                <div className="green-notification-list">
                  {notifications.length === 0 ? (
                    <div className="green-no-notifications">
                      <div className="green-no-notifications-icon">
                        <Bell />
                      </div>
                      <h4>All caught up!</h4>
                      <p>No new notifications at the moment</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`green-notification-item ${!notification.isRead ? 'unread' : 'read'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          openNotificationModal(notification);
                        }}
                      >
                        <div className="green-notification-icon">
                          {getNotificationIcon(notification.notificationType)}
                        </div>
                        <div className="green-notification-content">
                          <div className="green-notification-meta">
                            <h4 className="green-notification-title">{notification.title}</h4>
                            <span className="green-notification-time">
                              <Clock size={12} />
                              {formatNotificationTime(notification.createdAt)}
                            </span>
                          </div>
                          <p className="green-notification-message">
                            {notification.message.length > 80 
                              ? `${notification.message.substring(0, 80)}...` 
                              : notification.message
                            }
                          </p>
                          <div className="green-notification-actions">
                            <button 
                              className="green-read-more-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                openNotificationModal(notification);
                              }}
                            >
                              <MessageCircle size={14} />
                              Read More
                            </button>
                            <button 
                              className="green-delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </div>
                        {!notification.isRead && (
                          <div className="green-unread-indicator">
                            <Zap size={12} />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="green-notification-footer">
                    <button 
                      className="green-view-all-btn"
                      onClick={() => {
                        // Mark all as read and show success message
                        markAllNotificationsAsRead();
                        setTimeout(() => setShowNotifications(false), 1000);
                      }}
                    >
                      <Eye size={16} />
                      View all notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="admin-user-info">
            <div className="admin-avatar">
              <Shield className="admin-avatar-icon" />
            </div>
            <div className="admin-user-details">
              <span className="admin-user-name">
                {currentUser?.firstName} {currentUser?.lastName}
              </span>
              <span className="admin-user-role">Super Administrator</span>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogOut className="admin-logout-icon" />
            Logout
          </button>
        </div>
      </header>

      <div className="admin-content">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <nav className="admin-nav">
            <button 
              className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => handleTabChange('overview')}
            >
              <BarChart3 className="admin-nav-icon" />
              Overview
            </button>
            <button 
              className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => handleTabChange('users')}
            >
              <Users className="admin-nav-icon" />
              User Management
            </button>
            <button 
              className={`admin-nav-item ${activeTab === 'customers' ? 'active' : ''}`}
              onClick={() => handleTabChange('customers')}
            >
              <UserCheck className="admin-nav-icon" />
              Customer Monitoring
            </button>
            <button 
              className={`admin-nav-item ${activeTab === 'sellers' ? 'active' : ''}`}
              onClick={() => handleTabChange('sellers')}
            >
              <UserCheck className="admin-nav-icon" />
              Seller Management
            </button>
            <button 
              className={`admin-nav-item ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => handleTabChange('products')}
            >
              <Package className="admin-nav-icon" />
              Product Oversight
            </button>
            <button 
              className={`admin-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              <Activity className="admin-nav-icon" />
              Analytics
            </button>
            <button 
              className={`admin-nav-item ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => handleTabChange('categories')}
            >
              <Database className="admin-nav-icon" />
              Categories
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="admin-main">
          {loading && (
            <div className="admin-loading">
              <RefreshCw className="admin-loading-icon spinning" />
              <span>Loading...</span>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="admin-overview">
              <div className="admin-page-header">
                <h2>Dashboard Overview</h2>
                <p>Monitor and manage your eco-friendly marketplace</p>
                <button className="admin-refresh-btn" onClick={loadOverviewData}>
                  <RefreshCw className="admin-refresh-icon" />
                  Refresh Data
                </button>
              </div>

              {/* Stats Cards */}
              <div className="admin-stats-grid">
                <div className="admin-stat-card admin-stat-blue">
                  <div className="admin-stat-icon">
                    <Users className="admin-stat-icon-svg" />
                  </div>
                  <div className="admin-stat-content">
                    <h3>Total Users</h3>
                    <p className="admin-stat-value">{overviewData.totalUsers || 0}</p>
                    <span className="admin-stat-change positive">+12.5%</span>
                  </div>
                </div>

                <div className="admin-stat-card admin-stat-green">
                  <div className="admin-stat-icon">
                    <UserCheck className="admin-stat-icon-svg" />
                  </div>
                  <div className="admin-stat-content">
                    <h3>Active Sellers</h3>
                    <p className="admin-stat-value">{overviewData.activeSellers || 0}</p>
                    <span className="admin-stat-change positive">+8.2%</span>
                  </div>
                </div>

                <div className="admin-stat-card admin-stat-purple">
                  <div className="admin-stat-icon">
                    <Package className="admin-stat-icon-svg" />
                  </div>
                  <div className="admin-stat-content">
                    <h3>Products Listed</h3>
                    <p className="admin-stat-value">{overviewData.totalProducts || 0}</p>
                    <span className="admin-stat-change positive">+15.3%</span>
                  </div>
                </div>

                <div className="admin-stat-card admin-stat-emerald">
                  <div className="admin-stat-icon">
                    <Leaf className="admin-stat-icon-svg" />
                  </div>
                  <div className="admin-stat-content">
                    <h3>Carbon Impact</h3>
                    <p className="admin-stat-value">{(overviewData.totalCarbonImpact || 0).toFixed(2)}t</p>
                    <span className="admin-stat-change negative">-18.7%</span>
                  </div>
                </div>

                <div className="admin-stat-card admin-stat-orange">
                  <div className="admin-stat-icon">
                    <AlertTriangle className="admin-stat-icon-svg" />
                  </div>
                  <div className="admin-stat-content">
                    <h3>Pending Applications</h3>
                    <p className="admin-stat-value">{overviewData.pendingApplications || 0}</p>
                    <span className="admin-stat-change neutral">New</span>
                  </div>
                </div>

                <div className="admin-stat-card admin-stat-red">
                  <div className="admin-stat-icon">
                    <ShoppingCart className="admin-stat-icon-svg" />
                  </div>
                  <div className="admin-stat-content">
                    <h3>Total Orders</h3>
                    <p className="admin-stat-value">{overviewData.totalOrders || 0}</p>
                    <span className="admin-stat-change positive">+22.1%</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="admin-quick-actions">
                <h3>Quick Actions</h3>
                <div className="admin-actions-grid">
                  <button className="admin-action-btn" onClick={() => handleTabChange('sellers')}>
                    <UserCheck className="admin-action-icon" />
                    Review Applications
                  </button>
                  <button className="admin-action-btn" onClick={() => handleTabChange('products')}>
                    <Package className="admin-action-icon" />
                    Review Products
                  </button>
                  <button className="admin-action-btn" onClick={() => handleTabChange('users')}>
                    <Users className="admin-action-icon" />
                    Manage Users
                  </button>
                  <button className="admin-action-btn" onClick={() => handleTabChange('analytics')}>
                    <BarChart3 className="admin-action-icon" />
                    View Analytics
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="admin-recent-activity">
                <h3>Recent Activity</h3>
                <div className="admin-activity-list">
                  {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                    <div key={index} className="admin-activity-item">
                    <div className="admin-activity-icon">
                        {activity.activityType === 'USER_REGISTRATION' && <UserCheck className="admin-activity-icon-svg" />}
                        {activity.activityType === 'PRODUCT_ADDED' && <Package className="admin-activity-icon-svg" />}
                        {activity.activityType === 'ORDER_PLACED' && <ShoppingCart className="admin-activity-icon-svg" />}
                    </div>
                    <div className="admin-activity-content">
                        <p>{activity.description}</p>
                        <span className="admin-activity-time">{getTimeAgo(activity.timestamp)}</span>
                    </div>
                      <span className={`admin-activity-status ${activity.status.toLowerCase()}`}>
                        {activity.status}
                      </span>
                  </div>
                  )) : (
                    <div className="admin-no-data">
                      <p>No recent activity</p>
                    </div>
                  )}
                    </div>
              </div>
            </div>
          )}

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <div className="admin-users">
              <div className="admin-page-header">
                <h2>User Management</h2>
                <p>View all registered users (Sellers & Customers) with comprehensive options</p>
              </div>

              {/* Search and Filter */}
              <div className="admin-search-filter">
                <div className="admin-search">
                  <Search className="admin-search-icon" />
                  <input
                    type="text"
                    placeholder="Search users by name, email, or username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-search-input"
                  />
                </div>
                <div className="admin-filter">
                  <Filter className="admin-filter-icon" />
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="admin-filter-select"
                  >
                    <option value="all">All Roles</option>
                    <option value="customer">Customers</option>
                    <option value="seller">Sellers</option>
                    <option value="admin">Admins</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Eco Points</th>
                      <th>Total Orders</th>
                      <th>Total Spent</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div className="admin-user-info-cell">
                            <div className="admin-user-avatar">
                              {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </div>
                            <div>
                              <p className="admin-user-name">{user.firstName} {user.lastName}</p>
                              <p className="admin-user-email">{user.email}</p>
                              <p className="admin-user-username">@{user.username}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`admin-role-badge admin-role-${user.role.toLowerCase()}`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span className={`admin-status-badge admin-status-${getStatusColor(user.isActive ? 'ACTIVE' : 'BLOCKED')}`}>
                            {getStatusIcon(user.isActive ? 'ACTIVE' : 'BLOCKED')}
                            {user.isActive ? 'ACTIVE' : 'BLOCKED'}
                          </span>
                        </td>
                        <td>{user.ecoPoints || 0}</td>
                        <td>{user.totalOrders || 0}</td>
                        <td>{formatCurrency(user.totalSpent || 0)}</td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <div className="admin-actions">
                            <select
                              onChange={(e) => handleUserStatusChange(user.id, e.target.value === 'true')}
                              className="admin-action-select"
                              value={user.isActive}
                            >
                              <option value={true}>Active</option>
                              <option value={false}>Blocked</option>
                            </select>
                            <select
                              onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                              className="admin-action-select"
                              value={user.role}
                            >
                              <option value="CUSTOMER">Customer</option>
                              <option value="SELLER">Seller</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Customer Monitoring Tab */}
          {activeTab === 'customers' && (
            <div className="admin-customers">
              <div className="admin-page-header">
                <h2>Customer Monitoring</h2>
                <p>Monitor customer behavior, purchase patterns, and tree planting submissions</p>
                <div className="admin-tab-buttons">
                  <button 
                    className={`admin-tab-btn ${!selectedCustomer ? 'active' : ''}`}
                    onClick={() => setSelectedCustomer(null)}
                  >
                    All Customers
                  </button>
                  <button 
                    className={`admin-tab-btn ${selectedCustomer ? 'active' : ''}`}
                    onClick={() => selectedCustomer && loadCustomerOrderDetails(selectedCustomer.id)}
                  >
                    Tree Planting Submissions
                  </button>
                </div>
              </div>

              {!selectedCustomer ? (
                // Customer List View
                <div className="admin-customers-grid">
                  {customers.map((customer) => (
                    <div key={customer.id} className="admin-customer-card">
                      <div className="admin-customer-header">
                      <div className="admin-customer-info">
                          <div className="admin-customer-avatar">
                            {customer.name.split(' ').map(n => n.charAt(0)).join('')}
                </div>
                          <div>
                            <h3>{customer.name}</h3>
                            <p>{customer.email}</p>
                          </div>
                        </div>
                        <button
                          className="admin-view-btn"
                          onClick={() => handleCustomerViewOrders(customer)}
                        >
                          <Eye className="admin-action-icon" />
                          View Orders
                        </button>
                      </div>
                      
                      <div className="admin-customer-stats">
                        <div className="admin-stat-item">
                          <span className="admin-stat-label">Orders</span>
                          <span className="admin-stat-value">{customer.totalOrders}</span>
                        </div>
                        <div className="admin-stat-item">
                          <span className="admin-stat-label">Total Spent</span>
                          <span className="admin-stat-value">₹{customer.totalSpent.toFixed(2)}</span>
                        </div>
                        <div className="admin-stat-item">
                          <span className="admin-stat-label">Carbon Impact</span>
                          <span className="admin-stat-value">{customer.carbonImpact.toFixed(1)}kg</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Customer Order Details View
                <div className="admin-customer-details">
                  <div className="admin-customer-details-header">
                    <button 
                      className="admin-back-btn"
                      onClick={() => setSelectedCustomer(null)}
                    >
                      ← Back to Customers
                    </button>
                    <h3>{selectedCustomer.name} - Order History</h3>
                  </div>
                  
                  <div className="admin-orders-list">
                    {customerOrderDetails.map((order) => (
                      <div key={order.id} className="admin-order-card">
                        <div className="admin-order-header">
                      <div className="admin-order-meta">
                            <span className="admin-order-id">Order #{order.id}</span>
                            <span className="admin-order-date">{formatDate(order.createdAt)}</span>
              </div>
                          <span className={`admin-order-status admin-status-${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                          </span>
                    </div>
                        
                    <div className="admin-order-details">
                      <div className="admin-order-amount">
                            <strong>Total: ₹{order.totalPrice}</strong>
                      </div>
                      <div className="admin-order-carbon">
                        <Leaf className="admin-carbon-icon" />
                        <span>Carbon Score: {order.totalCarbonScore}kg</span>
                      </div>
                    </div>
                        
                    {order.items && order.items.length > 0 && (
                      <div className="admin-order-items">
                        <h4>Items:</h4>
                        {order.items.map((item, index) => (
                          <div key={index} className="admin-order-item">
                            <span>{item.productName}</span>
                            <span>Qty: {item.quantity}</span>
                                <span>₹{item.totalPrice}</span>
                          </div>
                        ))}
                      </div>
                        )}
                      </div>
                ))}
                  </div>
                </div>
              )}

              {/* Tree Planting Submissions Section */}
              <div className="admin-tree-planting-section">
                <div className="admin-section-header">
                  <h3>Tree Planting Submissions</h3>
                  <div className="flex items-center gap-4">
                    <span className="admin-pending-count">
                      {pendingSubmissions.length} Pending Review
                    </span>
                  </div>
                </div>
                
                <div className="admin-submissions-grid">
                  {treePlantingSubmissions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No submissions found</p>
                    </div>
                  ) : (
                    treePlantingSubmissions.map((submission) => (
                    <div key={submission.id} className="admin-submission-card">
                      <div className="admin-submission-header">
                        <div className="admin-submission-info">
                          <h4>{submission.user.firstName} {submission.user.lastName}</h4>
                          <p>Order #{submission.order.id}</p>
                          <p>Submitted: {formatDate(submission.submittedAt)}</p>
                        </div>
                        <div className="admin-submission-meta">
                          <span className={`admin-eco-badge ${submission.isEcoFriendlyProduct ? 'eco' : 'regular'}`}>
                            {submission.isEcoFriendlyProduct ? 'Eco-Friendly' : 'Regular'}
                          </span>
                          <span className="admin-points-badge">
                            {submission.isEcoFriendlyProduct ? '70' : '50'} Points
                          </span>
                          <span className={`admin-status-badge ${submission.status.toLowerCase()}`}>
                            {submission.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="admin-submission-image">
                        <img 
                          src={`http://localhost:8080${submission.imageUrl || '/uploads/tree-planting/7582e985-b39e-4a43-82ab-061d920a6ea7.jpg'}`} 
                          alt="Tree planting submission"
                          className="admin-submission-img"
                          onError={(e) => {
                            console.error('Image load error:', e);
                            e.target.src = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=400&fit=crop';
                          }}
                          onLoad={() => {}}
                        />
                      </div>
                      
                      {submission.description && (
                        <div className="admin-submission-description">
                          <p>{submission.description}</p>
                        </div>
                      )}
                      
                      <div className="admin-submission-actions">
                        {submission.status === 'PENDING' && (
                          <button
                            className="admin-approve-btn"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setShowSubmissionModal(true);
                            }}
                          >
                            <CheckCircle className="admin-action-icon" />
                            Review
                          </button>
                        )}
                        {submission.status === 'REJECTED' && (
                          <button
                            className="admin-approve-btn"
                            onClick={() => {
                              setSelectedSubmission(submission);
                              setShowSubmissionModal(true);
                            }}
                          >
                            <CheckCircle className="admin-action-icon" />
                            Re-Review
                          </button>
                        )}
                        {submission.status === 'APPROVED' && (
                          <span className="admin-status-display">
                            ✅ Approved - {submission.ecoPointsAwarded} points awarded
                          </span>
                        )}
                      </div>
                    </div>
                    ))
                  )}
                </div>
                    </div>
            </div>
          )}

          {/* Seller Management Tab */}
          {activeTab === 'sellers' && (
            <div className="admin-sellers">
              <div className="admin-page-header">
                <h2>Seller Management</h2>
                <p>Manage seller applications and monitor seller activity</p>
              </div>

              <div className="admin-sellers-grid">
                {sellers.map((seller) => (
                  <div key={seller.id} className="admin-seller-card">
                    <div className="admin-seller-header">
                      <div className="admin-seller-info">
                        <div className="admin-seller-avatar">
                          {seller.firstName?.charAt(0)}{seller.lastName?.charAt(0)}
                        </div>
                        <div>
                          <h3>{seller.firstName} {seller.lastName}</h3>
                          <p>{seller.email}</p>
                          <p>@{seller.username}</p>
                        </div>
                      </div>
                      <span className={`admin-seller-status admin-status-${getStatusColor(seller.isActive ? 'APPROVED' : 'PENDING')}`}>
                        {getStatusIcon(seller.isActive ? 'APPROVED' : 'PENDING')}
                        {seller.isActive ? 'APPROVED' : 'PENDING'}
                      </span>
                    </div>
                    
                    <div className="admin-seller-stats">
                      <div className="admin-stat-item">
                        <span className="admin-stat-label">Products</span>
                        <span className="admin-stat-value">{seller.totalProducts || 0}</span>
                      </div>
                      <div className="admin-stat-item">
                        <span className="admin-stat-label">Active</span>
                        <span className="admin-stat-value">{seller.activeProducts || 0}</span>
                      </div>
                      <div className="admin-stat-item">
                        <span className="admin-stat-label">Revenue</span>
                        <span className="admin-stat-value">{formatCurrency(seller.totalRevenue || 0)}</span>
                      </div>
                      <div className="admin-stat-item">
                        <span className="admin-stat-label">Orders</span>
                        <span className="admin-stat-value">{seller.totalOrders || 0}</span>
                      </div>
                    </div>

                    <div className="admin-seller-actions">
                      {!seller.isActive && (
                        <>
                          <button
                            className="admin-approve-btn"
                            onClick={() => handleSellerApproval(seller.id, true)}
                          >
                            <Check className="admin-action-icon" />
                            Approve
                          </button>
                          <button
                            className="admin-reject-btn"
                            onClick={() => handleSellerApproval(seller.id, false)}
                          >
                            <X className="admin-action-icon" />
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        className="admin-view-btn"
                        onClick={() => loadSellerProducts(seller.id)}
                      >
                        <Eye className="admin-action-icon" />
                        View Products
                      </button>
                                             {seller.isActive && (
                         <button
                           className="admin-block-btn"
                           onClick={() => handleSellerBlock(seller.id)}
                         >
                           <Ban className="admin-action-icon" />
                           Block
                         </button>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Product Oversight Tab */}
          {activeTab === 'products' && (
            <div className="admin-products">
              <div className="admin-page-header">
                <h2>Product Oversight</h2>
                {!selectedSeller ? (
                  <p>View all sellers and their products. Click "View Products" to see individual products.</p>
                ) : (
                  <>
                    <p>Products by selected seller</p>
                    <button 
                      className="admin-back-btn" 
                      onClick={() => {setSelectedSeller(null); setSellerProducts([]);}}
                    >
                      ← Back to Sellers
                    </button>
                  </>
                )}
              </div>

              {!selectedSeller ? (
                // Show sellers with product counts
                <div className="admin-sellers-grid">
                  {sellers.map((seller) => (
                    <div key={seller.id} className="admin-seller-card">
                      <div className="admin-seller-header">
                        <div className="admin-seller-info">
                          <div className="admin-seller-avatar">
                            {seller.firstName?.charAt(0)}{seller.lastName?.charAt(0)}
                        </div>
                        <div>
                            <h3>{seller.firstName} {seller.lastName}</h3>
                            <p>{seller.email}</p>
                            <p>@{seller.username}</p>
                        </div>
                      </div>
                        <span className={`admin-seller-status admin-status-${getStatusColor(seller.isActive ? 'APPROVED' : 'PENDING')}`}>
                          {getStatusIcon(seller.isActive ? 'APPROVED' : 'PENDING')}
                          {seller.isActive ? 'APPROVED' : 'PENDING'}
                      </span>
                    </div>
                      
                      <div className="admin-seller-stats">
                        <div className="admin-stat-item">
                          <span className="admin-stat-label">Total Products</span>
                          <span className="admin-stat-value">{seller.totalProducts || 0}</span>
                        </div>
                        <div className="admin-stat-item">
                          <span className="admin-stat-label">Active Products</span>
                          <span className="admin-stat-value">{seller.activeProducts || 0}</span>
                        </div>
                        <div className="admin-stat-item">
                          <span className="admin-stat-label">Revenue</span>
                          <span className="admin-stat-value">{formatCurrency(seller.totalRevenue || 0)}</span>
                        </div>
                        <div className="admin-stat-item">
                          <span className="admin-stat-label">Orders</span>
                          <span className="admin-stat-value">{seller.totalOrders || 0}</span>
                      </div>
                    </div>

                      <div className="admin-seller-actions">
                        <button
                          className="admin-view-btn"
                          onClick={() => loadSellerProducts(seller.id)}
                        >
                          <Eye className="admin-action-icon" />
                          View Products ({seller.totalProducts || 0})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Show products for selected seller
                <div className="admin-products-grid">
                  {sellerProducts.map((product) => (
                    <div key={product.id} className="admin-product-card">
                      <div className="admin-product-image">
                        <img src={product.imageUrl?.startsWith('/uploads/') ? `http://localhost:8080${product.imageUrl}` : product.imageUrl} alt={product.name} />
                      </div>
                      <div className="admin-product-content">
                        <div className="admin-product-header">
                          <h3>{product.name}</h3>
                          <span className={`admin-product-status admin-status-${getStatusColor(product.isActive ? 'ACTIVE' : 'BLOCKED')}`}>
                            {getStatusIcon(product.isActive ? 'ACTIVE' : 'BLOCKED')}
                            {product.isActive ? 'APPROVED' : 'PENDING'}
                          </span>
                        </div>
                        
                        <p className="admin-product-description">{product.description}</p>
                        
                        <div className="admin-product-meta">
                          <span className="admin-product-price">{formatCurrency(product.price)}</span>
                          <span className="admin-product-seller">by {product.sellerName}</span>
                          <span className="admin-product-category">{product.categoryName}</span>
                        </div>
                        
                        <div className="admin-product-carbon">
                          <Leaf className="admin-carbon-icon" />
                          <span>Carbon Score: {product.carbonScore}</span>
                          {product.isEcoFriendly && (
                            <span className="admin-eco-badge">Eco-Friendly</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="admin-product-actions">
                        {!product.isActive ? (
                          <>
                        <button
                          className="admin-approve-btn"
                              onClick={() => handleProductApproval(product.id, true)}
                        >
                              <Check className="admin-action-icon" />
                          Approve
                        </button>
                        <button
                          className="admin-reject-btn"
                              onClick={() => handleProductApproval(product.id, false)}
                        >
                              <X className="admin-action-icon" />
                          Reject
                        </button>
                          </>
                        ) : (
                          <button
                            className="admin-block-btn"
                            onClick={() => handleProductApproval(product.id, false, 'Product review required')}
                          >
                            <Ban className="admin-action-icon" />
                            Suspend
                          </button>
                        )}
                        <button
                          className="admin-remove-btn"
                          onClick={() => handleProductRemoval(product.id, 'High carbon footprint or fake product')}
                        >
                          <Trash2 className="admin-action-icon" />
                          Remove
                        </button>
                        <button 
                          className="admin-edit-btn"
                          onClick={() => openProductEditModal(product)}
                        >
                          <Edit className="admin-action-icon" />
                          Edit Eco-Data
                        </button>
                        <button className="admin-view-btn">
                          <Eye className="admin-action-icon" />
                          Details
                        </button>
                      </div>
                  </div>
                ))}
                  {sellerProducts.length === 0 && (
                    <div className="admin-no-data">
                      <p>This seller has no products yet.</p>
              </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <AdminCarbonAnalytics />
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="admin-categories">
              <div className="admin-categories-header">
                <div className="admin-categories-title">
                  <div className="admin-categories-icon-wrapper">
                    <div className="admin-categories-icon">
                      <FolderTree className="admin-categories-icon-svg" />
                    </div>
                  </div>
                  <div className="admin-categories-text">
                <h2>Category Management</h2>
                    <p>Organize your eco-friendly marketplace with intelligent category management</p>
                  </div>
                </div>
                <div className="admin-categories-actions">
                  <div className="admin-categories-stats">
                    <div className="admin-stat-mini">
                      <span className="admin-stat-mini-value">{categories.length}</span>
                      <span className="admin-stat-mini-label">Total Categories</span>
                    </div>
                    <div className="admin-stat-mini">
                      <span className="admin-stat-mini-value">{categories.filter(c => c.isActive).length}</span>
                      <span className="admin-stat-mini-label">Active</span>
                    </div>
                    <div className="admin-stat-mini">
                      <span className="admin-stat-mini-value">{categories.reduce((sum, c) => sum + (c.productCount || 0), 0)}</span>
                      <span className="admin-stat-mini-label">Total Products</span>
                    </div>
                  </div>
                  <button className="admin-add-category-btn" onClick={() => setShowCategoryForm(true)}>
                    <div className="admin-btn-content">
                      <Plus className="admin-btn-icon" />
                      <span>Create Category</span>
                    </div>
                    <div className="admin-btn-glow"></div>
                </button>
                </div>
              </div>

              {showCategoryForm && (
                <div className="admin-modal-overlay">
                  <div className="admin-modal-container">
                    <div className="admin-modal-header">
                      <div className="admin-modal-title">
                        <div className="admin-modal-icon">
                          {editingCategory ? <Edit2 /> : <Plus />}
                    </div>
                        <h3>{editingCategory ? 'Edit Category' : 'Create New Category'}</h3>
                      </div>
                      <button 
                        className="admin-modal-close"
                        onClick={() => {
                          setShowCategoryForm(false);
                          setEditingCategory(null);
                          setCategoryForm({name: '', description: '', isActive: true});
                        }}
                      >
                        <X />
                      </button>
                    </div>
                    <div className="admin-modal-body">
                      <form onSubmit={handleCategorySubmit}>
                        <div className="admin-form-layout">
                          <div className="admin-form-group">
                            <label className="admin-form-label">
                              <span>Category Name</span>
                              <span className="admin-form-required">*</span>
                            </label>
                            <div className="admin-input-wrapper">
                              <input
                                type="text"
                                className="admin-form-input"
                                placeholder="Enter category name (e.g., Sustainable Fashion)"
                                value={categoryForm.name}
                                onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                                required
                              />
                              <Tag className="admin-input-icon" />
                            </div>
                          </div>
                          
                          <div className="admin-form-group">
                            <label className="admin-form-label">
                              <span>Description</span>
                              <span className="admin-form-required">*</span>
                            </label>
                            <div className="admin-input-wrapper">
                              <textarea
                                className="admin-form-textarea"
                                placeholder="Describe what products belong to this category and their eco-friendly benefits..."
                                value={categoryForm.description}
                                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                                rows="4"
                                required
                              />
                              <FileText className="admin-textarea-icon" />
                            </div>
                          </div>

                          <div className="admin-form-group">
                            <label className="admin-form-label">Status</label>
                            <div className="admin-toggle-wrapper">
                              <input
                                type="checkbox"
                                id="categoryStatus"
                                className="admin-toggle-input"
                                checked={categoryForm.isActive !== false}
                                onChange={(e) => setCategoryForm({...categoryForm, isActive: e.target.checked})}
                              />
                              <label htmlFor="categoryStatus" className="admin-toggle-label">
                                <div className="admin-toggle-slider">
                                  <div className="admin-toggle-dot"></div>
                                </div>
                                <span className={`admin-toggle-text ${(categoryForm.isActive !== false) ? 'active' : 'inactive'}`}>
                                  {(categoryForm.isActive !== false) ? 'Active' : 'Inactive'}
                                </span>
                              </label>
                            </div>
                          </div>
                        </div>
                        
                        <div className="admin-form-actions">
                          <button type="button" className="admin-btn-secondary" onClick={() => {
                            setShowCategoryForm(false);
                            setEditingCategory(null);
                            setCategoryForm({name: '', description: '', isActive: true});
                          }}>
                            <X className="admin-btn-icon" />
                            Cancel
                      </button>
                          <button type="submit" className="admin-btn-primary">
                            <div className="admin-btn-content">
                              {editingCategory ? <Save /> : <Plus />}
                              <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                    </div>
                            <div className="admin-btn-glow"></div>
                          </button>
                  </div>
                      </form>
                    </div>
              </div>
            </div>
          )}

              <div className="admin-categories-container">
              <div className="admin-categories-grid">
                  {categories.map((category, index) => (
                    <div key={category.id} className={`admin-category-card admin-category-card-${index % 4}`}>
                      <div className="admin-category-card-glow"></div>
                    <div className="admin-category-header">
                        <div className="admin-category-icon-container">
                          <div className="admin-category-icon-bg">
                            <FolderOpen className="admin-category-icon" />
                    </div>
                          <div className="admin-category-status-indicator">
                            <div className={`admin-status-dot ${category.isActive ? 'active' : 'inactive'}`}></div>
                          </div>
                        </div>
                        <div className="admin-category-meta">
                          <h3 className="admin-category-name">{category.name}</h3>
                          <span className={`admin-category-badge ${category.isActive ? 'active' : 'inactive'}`}>
                            {category.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
              </div>

                      <div className="admin-category-content">
                    <p className="admin-category-description">{category.description}</p>
                        
                        <div className="admin-category-metrics">
                          <div className="admin-metric-item">
                            <div className="admin-metric-icon">
                              <Package className="admin-metric-icon-svg" />
                    </div>
                            <div className="admin-metric-content">
                              <span className="admin-metric-value">{category.productCount || 0}</span>
                              <span className="admin-metric-label">Products</span>
                            </div>
                          </div>
                          <div className="admin-metric-item">
                            <div className="admin-metric-icon">
                              <Calendar className="admin-metric-icon-svg" />
                            </div>
                            <div className="admin-metric-content">
                              <span className="admin-metric-value">{formatDate(category.createdAt)}</span>
                              <span className="admin-metric-label">Created</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="admin-category-footer">
                    <div className="admin-category-actions">
                          <button
                            className="admin-action-btn-icon edit"
                            onClick={() => {
                              setEditingCategory(category);
                              setCategoryForm({
                                name: category.name,
                                description: category.description,
                                isActive: category.isActive
                              });
                              setShowCategoryForm(true);
                            }}
                            title="Edit Category"
                          >
                            <Edit2 className="admin-action-icon" />
                      </button>
                          <button
                            className="admin-action-btn-icon delete"
                            onClick={() => handleCategoryDelete(category.id)}
                            title="Delete Category"
                          >
                        <Trash2 className="admin-action-icon" />
                      </button>
                        </div>
                        <div className="admin-category-trend">
                          <TrendingUp className="admin-trend-icon" />
                          <span className="admin-trend-text">Growing</span>
                        </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Green Notification Modal */}
      {showNotificationModal && selectedNotification && (
        <div className="green-notification-modal-overlay" onClick={closeNotificationModal}>
          <div className="green-notification-modal" onClick={(e) => e.stopPropagation()}>
            <div className="green-modal-header">
              <div className="green-modal-title">
                <div className="green-modal-icon">
                  {getNotificationIcon(selectedNotification.notificationType)}
                </div>
                <div className="green-modal-title-content">
                  <h2>{selectedNotification.title}</h2>
                  <div className="green-modal-meta">
                    <span className="green-modal-type">
                      {selectedNotification.notificationType.replace('_', ' ').toLowerCase()}
                    </span>
                    <span className="green-modal-time">
                      <Calendar size={14} />
                      {new Date(selectedNotification.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              <button className="green-modal-close" onClick={closeNotificationModal}>
                <X size={24} />
              </button>
              </div>

            <div className="green-modal-body">
              <div className="green-modal-message">
                <MessageCircle className="green-message-icon" />
                <div className="green-message-content">
                  <h3>Message Details</h3>
                  <p>{selectedNotification.message}</p>
                    </div>
                    </div>
              
              <div className="green-modal-status">
                <div className={`green-status-indicator ${selectedNotification.isRead ? 'read' : 'unread'}`}>
                  {selectedNotification.isRead ? (
                    <>
                      <Check size={16} />
                      <span>Read</span>
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      <span>Unread</span>
                    </>
                  )}
                  </div>
              </div>
            </div>
            
            <div className="green-modal-footer">
              <div className="green-modal-actions">
                {!selectedNotification.isRead && (
                  <button 
                    className="green-modal-mark-read"
                    onClick={() => {
                      markNotificationAsRead(selectedNotification.id);
                      setSelectedNotification({...selectedNotification, isRead: true});
                    }}
                  >
                    <Check size={16} />
                    Mark as Read
                  </button>
                )}
                <button 
                  className="green-modal-delete"
                  onClick={() => {
                    deleteNotification(selectedNotification.id);
                    closeNotificationModal();
                  }}
                >
                  <Trash2 size={16} />
                  Delete Notification
                </button>
                <button className="green-modal-close-btn" onClick={closeNotificationModal}>
                  Close
                </button>
      </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Product Edit Modal */}
      {showProductEditModal && editingProduct && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-container">
            <div className="admin-modal-header">
              <div className="admin-modal-title">
                <div className="admin-modal-icon">
                  <Edit2 />
                </div>
                <h3>Update Product Eco-Data</h3>
              </div>
              <button 
                className="admin-modal-close"
                onClick={closeProductEditModal}
              >
                <X />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-product-edit-info">
                <h4>{editingProduct.name}</h4>
                <p>by {editingProduct.sellerName}</p>
              </div>
              
              <form onSubmit={handleProductEcoDataUpdate}>
                <div className="admin-form-layout">
                  <div className="admin-form-group">
                    <label className="admin-form-label">
                      <span>Carbon Score</span>
                      <span className="admin-form-required">*</span>
                    </label>
                    <div className="admin-input-wrapper">
                      <input
                        type="number"
                        step="0.01"
                        className="admin-form-input"
                        placeholder="Enter carbon score (e.g., 2.5)"
                        value={productEditForm.carbonScore}
                        onChange={(e) => setProductEditForm({...productEditForm, carbonScore: e.target.value})}
                        required
                      />
                      <Leaf className="admin-input-icon" />
                    </div>
                  </div>
                  
                  <div className="admin-form-group">
                    <label className="admin-form-label">Eco-Friendly Status</label>
                    <div className="admin-toggle-wrapper">
                      <input
                        type="checkbox"
                        id="isEcoFriendly"
                        className="admin-toggle-input"
                        checked={productEditForm.isEcoFriendly}
                        onChange={(e) => setProductEditForm({...productEditForm, isEcoFriendly: e.target.checked})}
                      />
                      <label htmlFor="isEcoFriendly" className="admin-toggle-label">
                        <div className="admin-toggle-slider">
                          <div className="admin-toggle-dot"></div>
                        </div>
                        <span className={`admin-toggle-text ${productEditForm.isEcoFriendly ? 'active' : 'inactive'}`}>
                          {productEditForm.isEcoFriendly ? 'Eco-Friendly' : 'Not Eco-Friendly'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-form-label">Admin Notes</label>
                    <div className="admin-input-wrapper">
                      <textarea
                        className="admin-form-textarea"
                        placeholder="Add notes about the changes made..."
                        value={productEditForm.adminNotes}
                        onChange={(e) => setProductEditForm({...productEditForm, adminNotes: e.target.value})}
                        rows="3"
                      />
                      <FileText className="admin-textarea-icon" />
                    </div>
                  </div>
                </div>
                
                <div className="admin-form-actions">
                  <button type="button" className="admin-btn-secondary" onClick={closeProductEditModal}>
                    <X className="admin-btn-icon" />
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn-primary">
                    <div className="admin-btn-content">
                      <Save />
                      <span>Update Eco-Data</span>
                    </div>
                    <div className="admin-btn-glow"></div>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      
      {/* Simple Tree Planting Review Modal */}
      {showSubmissionModal && selectedSubmission && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => {
                setShowSubmissionModal(false);
                setSelectedSubmission(null);
              }}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                fontWeight: 'bold'
              }}
            >
              ×
            </button>

            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ margin: '0 0 10px 0', color: '#111827' }}>
                {selectedSubmission.status === 'PENDING' ? 'Review' : 
                 selectedSubmission.status === 'REJECTED' ? 'Re-Review (Re-approve rejected submission)' : 
                 'Review'} Tree Planting Submission
              </h2>
              <p style={{ margin: '0', color: '#6b7280' }}>
                {selectedSubmission.user?.firstName || 'Unknown'} {selectedSubmission.user?.lastName || 'User'} • 
                Order #{selectedSubmission.order?.id || 'N/A'} • 
                {new Date(selectedSubmission.submittedAt).toLocaleDateString()}
              </p>
              <div style={{ marginTop: '10px' }}>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600',
                  backgroundColor: selectedSubmission.status === 'PENDING' ? '#fef3c7' : 
                                 selectedSubmission.status === 'APPROVED' ? '#dcfce7' : '#fee2e2',
                  color: selectedSubmission.status === 'PENDING' ? '#92400e' : 
                        selectedSubmission.status === 'APPROVED' ? '#166534' : '#dc2626'
                }}>
                  Status: {selectedSubmission.status}
                </span>
                {selectedSubmission.status === 'APPROVED' && (
                  <span style={{ marginLeft: '10px', color: '#166534', fontWeight: '600' }}>
                    ✅ {selectedSubmission.ecoPointsAwarded} points awarded
                  </span>
                )}
                {selectedSubmission.status === 'REJECTED' && (
                  <span style={{ marginLeft: '10px', color: '#dc2626', fontWeight: '600' }}>
                    🔄 Can be re-approved
                  </span>
                )}
              </div>
              {selectedSubmission.status === 'REJECTED' && (
                <div style={{ 
                  marginTop: '10px', 
                  padding: '10px', 
                  backgroundColor: '#fef3c7', 
                  border: '1px solid #f59e0b',
                  borderRadius: '6px',
                  color: '#92400e'
                }}>
                  <strong>Re-approval Notice:</strong> This submission was previously rejected but can be re-approved. 
                  If you approve it now, the customer will receive eco-points and an approval notification.
                </div>
              )}
            </div>

            {/* Image */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              <img 
                src={`http://localhost:8080${selectedSubmission.imageUrl || '/uploads/tree-planting/7582e985-b39e-4a43-82ab-061d920a6ea7.jpg'}`} 
                alt="Tree planting submission"
                style={{
                  maxWidth: '100%',
                  maxHeight: '400px',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  border: '2px solid #e5e7eb'
                }}
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=400&fit=crop';
                }}
              />
            </div>

            {/* Description */}
            {selectedSubmission.description && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#111827' }}>Customer Description:</h4>
                <p style={{ margin: '0', color: '#374151', padding: '10px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                  {selectedSubmission.description}
                </p>
              </div>
            )}

            {/* Admin Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#111827' }}>
                Admin Notes
              </label>
              <textarea
                value={submissionReview.adminNotes}
                onChange={(e) => setSubmissionReview({...submissionReview, adminNotes: e.target.value})}
                placeholder="Add notes about your decision..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
              {selectedSubmission.status !== 'APPROVED' && (
                <button
                  onClick={() => {
                    handleSubmissionReview(false);
                  }}
                  disabled={submissionLoading}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: submissionLoading ? 'not-allowed' : 'pointer',
                    opacity: submissionLoading ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {submissionLoading ? '⏳' : '❌'} {submissionLoading ? 'Processing...' : 'Reject'}
                </button>
              )}
              {selectedSubmission.status !== 'APPROVED' && (
                <button
                  onClick={() => {
                    handleSubmissionReview(true);
                  }}
                  disabled={submissionLoading}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: submissionLoading ? 'not-allowed' : 'pointer',
                    opacity: submissionLoading ? 0.6 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {submissionLoading ? '⏳' : '✅'} {submissionLoading ? 'Processing...' : 
                    selectedSubmission.status === 'REJECTED' ? 'Re-Approve' : 'Approve'}
                </button>
              )}
              {selectedSubmission.status === 'APPROVED' && (
                <div style={{ 
                  padding: '12px 24px', 
                  backgroundColor: '#dcfce7', 
                  color: '#166534', 
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  ✅ Already Approved - {selectedSubmission.ecoPointsAwarded} points awarded
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
