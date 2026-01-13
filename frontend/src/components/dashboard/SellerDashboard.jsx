import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  DollarSign,
  Leaf,
  LogOut,
  ShoppingBag,
  Search,
  Filter,
  X,
  User,
  Mail,
  Shield,
  MapPin,
  Calendar
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { sellerAPI, authAPI } from '../../services/api';
import SellerOrders from './SellerOrders';
import Logo from '../common/Logo';
import ThemeToggle from '../common/ThemeToggle';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    carbonSaved: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [stockData, setStockData] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '1',
    stockQuantity: '',
    weight: '0.5',
    shippingDistance: '50',
    carbonFootprintScore: '0',
    ecoFriendly: false,
    image: null,
    imageUrl: ''
  });

  useEffect(() => {
    fetchDashboardData();
    const user = authAPI.getCurrentUser();
    setCurrentUser(user || null);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const productsRes = await sellerAPI.getSellerProducts();
      const productsData = productsRes.data || [];
      setProducts(productsData);

      let ordersData = [];
      try {
        const ordersRes = await sellerAPI.getOrders();
        ordersData = ordersRes.data || [];
        setOrders(ordersData);
      } catch (err) {
        console.log('Orders fetch failed or empty', err);
        setOrders([]);
      }

      try {
        const statsRes = await sellerAPI.getDashboardStats();
        if (statsRes?.data) {
          setStats(statsRes.data);
        } else {
          throw new Error('Stats payload missing');
        }
      } catch (err) {
        console.log('Stats endpoint fallback used', err);
        setStats({
          totalSales: ordersData.reduce((acc, order) => acc + (order.totalPrice || 0), 0),
          totalOrders: ordersData.length,
          totalProducts: productsData.length,
          carbonSaved: productsData.reduce((acc, p) => acc + (p.carbonFootprintScore || 0), 0)
        });
      }

      processGraphData(productsData, ordersData);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const processGraphData = (productsData, ordersData) => {
    const sortedStock = [...productsData]
      .sort((a, b) => (b.stockQuantity || 0) - (a.stockQuantity || 0))
      .slice(0, 5)
      .map((p) => {
        const safeName = p.name || 'Product';
        const truncated = safeName.length > 15 ? `${safeName.substring(0, 15)}...` : safeName;
        return {
          name: truncated,
          stock: Number(p.stockQuantity) || 0
        };
      });
    setStockData(sortedStock);

    const last7Days = [...Array(7)].map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    const salesTrend = last7Days.map((dateStr) => {
      const dayOrders = ordersData.filter((order) => order.createdAt && order.createdAt.startsWith(dateStr));
      const dayTotal = dayOrders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
      return {
        date: new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: dayTotal
      };
    });
    setSalesData(salesTrend);
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/auth');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else if (type === 'checkbox') {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const buildProductPayload = (includeMedia = true) => {
    const payload = {
      name: formData.name,
      description: formData.description,
      price: formData.price,
      categoryId: formData.categoryId,
      stockQuantity: formData.stockQuantity,
      weight: formData.weight,
      shippingDistance: formData.shippingDistance,
      carbonFootprintScore: formData.carbonFootprintScore,
      ecoFriendly: formData.ecoFriendly
    };

    if (formData.imageUrl && formData.imageUrl.trim().length > 0) {
      payload.imageUrl = formData.imageUrl.trim();
    }

    if (includeMedia && formData.image instanceof File) {
      payload.imageFile = formData.image;
    }

    return payload;
  };

  const uploadImageToBackend = async (productId, file) => {
    await sellerAPI.uploadProductImage(productId, file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await sellerAPI.updateProduct(editingProduct.id, buildProductPayload(true));
        alert('Product Updated Successfully!');
      } else {
        const response = await sellerAPI.addProduct(buildProductPayload(false));
        const newProductId = response?.data?.id || response?.data?.productId || response?.data?.product?.id;

        console.log('Product Created. ID is:', newProductId);

        if (!newProductId) {
          throw new Error('Backend did not return a Product ID');
        }

        if (formData.image instanceof File) {
          await uploadImageToBackend(newProductId, formData.image);
        }

        alert('Product Published Successfully!');
      }
      setShowAddModal(false);
      setEditingProduct(null);
      resetForm();
      fetchDashboardData();
    } catch (err) {
      console.error('Error saving product:', err);
      alert('Failed to save product. Please check your inputs.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: '1',
      stockQuantity: '',
      weight: '0.5',
      shippingDistance: '50',
      carbonFootprintScore: '0',
      ecoFriendly: false,
      image: null,
      imageUrl: ''
    });
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      categoryId: product.categoryId,
      stockQuantity: product.stockQuantity,
      weight: product.weight || '0.5',
      shippingDistance: product.shippingDistance || '50',
      carbonFootprintScore: product.carbonFootprintScore,
      ecoFriendly: product.ecoFriendly,
      image: null,
      imageUrl: product.image || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await sellerAPI.deleteProduct(id);
        fetchDashboardData();
      } catch (err) {
        console.error('Error deleting product:', err);
      }
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-300 font-sans">
      <aside className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full z-20 transition-colors duration-300 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
          <Logo />
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Menu</p>
          <NavButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={<TrendingUp size={20} />}
            label="Overview"
          />
          <NavButton
            active={activeTab === 'products'}
            onClick={() => setActiveTab('products')}
            icon={<Package size={20} />}
            label="Products"
          />
          <NavButton
            active={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
            icon={<ShoppingBag size={20} />}
            label="Orders"
          />

          <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
            <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Account</p>
            <NavButton
              active={activeTab === 'settings'}
              onClick={() => setActiveTab('settings')}
              icon={<User size={20} />}
              label="My Account"
            />
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-72 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'products' && 'Product Management'}
              {activeTab === 'orders' && 'Order Management'}
              {activeTab === 'settings' && 'Account Settings'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Welcome back, <span className="font-semibold text-emerald-600 dark:text-emerald-400">{currentUser?.firstName || 'Seller'}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Online</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800">
              {(currentUser?.firstName?.charAt(0) || 'S').toUpperCase()}
            </div>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={<DollarSign size={24} />}
                label="Total Sales"
                value={`₹${Number(stats.totalSales || 0).toLocaleString()}`}
                color="emerald"
              />
              <StatCard
                icon={<ShoppingBag size={24} />}
                label="Total Orders"
                value={stats.totalOrders || orders.length}
                color="blue"
              />
              <StatCard
                icon={<Package size={24} />}
                label="Active Products"
                value={stats.totalProducts}
                color="amber"
              />
              <StatCard
                icon={<Leaf size={24} />}
                label="Carbon Saved"
                value={`${stats.carbonSaved} kg`}
                color="green"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                  <TrendingUp size={20} className="text-emerald-500" />
                  Sales Overview (Last 7 Days)
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                      <XAxis dataKey="date" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }}
                        itemStyle={{ color: '#10B981' }}
                      />
                      <Area type="monotone" dataKey="sales" stroke="#10B981" fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
                  <Package size={20} className="text-blue-500" />
                  Top Inventory Levels
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stockData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="#374151" opacity={0.1} />
                      <XAxis type="number" stroke="#9CA3AF" fontSize={12} hide />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={100}
                        stroke="#9CA3AF"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', borderRadius: '8px', color: '#fff' }} cursor={{ fill: 'transparent' }} />
                      <Bar dataKey="stock" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-emerald-500 to-green-600"></div>
              <div className="px-8 pb-8">
                <div className="relative flex justify-between items-end -mt-12 mb-6">
                  <div className="w-24 h-24 rounded-2xl bg-white dark:bg-gray-800 p-1.5 shadow-xl">
                    <div className="w-full h-full rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {(currentUser?.firstName?.charAt(0) || 'U').toUpperCase()}
                    </div>
                  </div>
                  <div className="flex gap-3 mb-2">
                    <button className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors">
                      Edit Profile
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {currentUser?.firstName || 'Eco'} {currentUser?.lastName || 'Seller'}
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">@{currentUser?.username || 'sustainable.seller'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg text-gray-400">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Email Address</p>
                      <p className="text-gray-900 dark:text-white font-medium">{currentUser?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg text-gray-400">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Account Role</p>
                      <p className="text-gray-900 dark:text-white font-medium capitalize">{currentUser?.role || 'Seller'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg text-gray-400">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Business Location</p>
                      <p className="text-gray-900 dark:text-white font-medium">India</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                    <div className="p-3 bg-white dark:bg-gray-800 rounded-lg text-gray-400">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Member Since</p>
                      <p className="text-gray-900 dark:text-white font-medium">Jan 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">Appearance</h3>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">Dark Mode</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Switch between light and dark themes for the dashboard.</p>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && <SellerOrders />}

        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col md:flex-row justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:text-white transition-all"
                />
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                  <Filter size={18} />
                  <span>Filter</span>
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setShowAddModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5"
                >
                  <Plus size={18} />
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                      <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Product</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Carbon Score</th>
                      <th className="p-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-600">
                              <img
                                src={product.image || product.imageUrl || 'https://via.placeholder.com/100'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{product.name}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md">
                            {getCategoryName(product.categoryId)}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-gray-900 dark:text-white">₹{product.price}</td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              product.stockQuantity < 10
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                            }`}
                          >
                            {product.stockQuantity} in stock
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                            <Leaf size={14} />
                            <span>{product.carbonFootprintScore}</span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700 animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="e.g., Organic Cotton Shirt"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      name="stockQuantity"
                      value={formData.stockQuantity}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    <option value="1">Electronics</option>
                    <option value="2">Fashion</option>
                    <option value="3">Home & Garden</option>
                    <option value="4">Books</option>
                    <option value="5">Food & Beverages</option>
                    <option value="6">Personal Care</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                    placeholder="Describe your product..."
                  ></textarea>
                </div>

                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800 space-y-4">
                  <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <Leaf size={18} />
                    Eco Impact Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Carbon Score (kg CO2e)</label>
                      <input
                        type="number"
                        name="carbonFootprintScore"
                        value={formData.carbonFootprintScore}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name="ecoFriendly"
                          checked={formData.ecoFriendly}
                          onChange={handleInputChange}
                          className="w-5 h-5 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Eco Friendly Certified</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Image URL</label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all"
                    placeholder="https://example.com/image.jpg"
                  />
                  <input
                    type="file"
                    name="image"
                    onChange={handleInputChange}
                    className="mt-2 text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/30 transition-all transform hover:-translate-y-0.5"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
      active
        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-sm'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const StatCard = ({ icon, label, value, color }) => {
  const colors = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4 transition-transform hover:-translate-y-1 duration-300">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
      </div>
    </div>
  );
};

const getCategoryName = (id) => {
  const categories = {
    '1': 'Electronics',
    '2': 'Fashion',
    '3': 'Home & Garden',
    '4': 'Books',
    '5': 'Food & Beverages',
    '6': 'Personal Care'
  };
  return categories[id] || 'Other';
};

export default SellerDashboard;
