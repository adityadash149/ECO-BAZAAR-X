import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle,
  XCircle,
  TrendingUp,
  Shield,
  LogOut,
  Activity,
  Leaf,
  AlertCircle,
  Trash2,
  Package
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
import axios from 'axios';
import { authAPI } from '../../services/api';
import Logo from '../common/Logo';
import ThemeToggle from '../common/ThemeToggle';

// Mock data for graphs (replace with live analytics when backend endpoints are available)
const ACTIVITY_DATA = [
  { name: 'Mon', visits: 4000, sales: 2400 },
  { name: 'Tue', visits: 3000, sales: 1398 },
  { name: 'Wed', visits: 2000, sales: 9800 },
  { name: 'Thu', visits: 2780, sales: 3908 },
  { name: 'Fri', visits: 1890, sales: 4800 },
  { name: 'Sat', visits: 2390, sales: 3800 },
  { name: 'Sun', visits: 3490, sales: 4300 }
];

const API_URL = 'http://localhost:8080/api/admin';

const formatCurrency = (value) => {
  const numericValue = Number(value ?? 0);
  if (!Number.isFinite(numericValue)) {
    return '₹0';
  }
  return `₹${numericValue.toLocaleString()}`;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [pendingAdmins, setPendingAdmins] = useState([]);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [stats, setStats] = useState({ users: 0, products: 0, revenue: 0 });

  const tokenConfig = useCallback(() => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  }, []);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      const config = tokenConfig();
      const [adminsRes, productsRes, marketplaceRes] = await Promise.all([
        axios.get(`${API_URL}/pending-admins`, config),
        axios.get(`${API_URL}/pending-products`, config),
        axios.get(`${API_URL}/products`, config)
      ]);

      setPendingAdmins(Array.isArray(adminsRes.data) ? adminsRes.data : []);
      setPendingProducts(Array.isArray(productsRes.data) ? productsRes.data : []);
      setAllProducts(Array.isArray(marketplaceRes.data) ? marketplaceRes.data : []);
      setStats({
        users: 1250,
        products: Array.isArray(marketplaceRes.data) ? marketplaceRes.data.length : 0,
        revenue: 89000
      });
    } catch (error) {
      console.error('Error fetching admin data', error);
    } finally {
      setLoading(false);
    }
  }, [tokenConfig]);

  useEffect(() => {
    const user = authAPI.getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      navigate('/auth');
      return;
    }
    setCurrentUser(user);
    fetchAdminData();
  }, [fetchAdminData, navigate]);

  const handleApproveAdmin = async (id) => {
    try {
      await axios.put(`${API_URL}/approve-admin/${id}`, {}, tokenConfig());
      fetchAdminData();
    } catch (err) {
      alert('Failed to approve admin');
    }
  };

  const handleApproveProduct = async (id) => {
    try {
      await axios.put(`${API_URL}/approve-product/${id}`, {}, tokenConfig());
      fetchAdminData();
    } catch (err) {
      alert('Failed to approve product');
    }
  };

  const handleReject = async (type, id) => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;
    try {
      const endpoint = type === 'user' ? 'reject-user' : 'reject-product';
      await axios.delete(`${API_URL}/${endpoint}/${id}`, tokenConfig());
      fetchAdminData();
    } catch (err) {
      alert('Failed to reject item');
    }
  };

  const handleRemoveProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this product from the marketplace?')) return;
    try {
      await axios.delete(`${API_URL}/products/${productId}`, {
        ...tokenConfig(),
        data: { reason: 'Removed by Admin' }
      });
      fetchAdminData();
    } catch (err) {
      alert('Failed to remove product');
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-300 font-sans">
      <aside className="w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed h-full z-20 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <Logo />
          <div className="mt-4 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold rounded-full w-fit uppercase tracking-wider">
            Admin Panel
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <NavButton
            active={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            icon={<Activity size={20} />}
            label="Overview"
          />
          <NavButton
            active={activeTab === 'products'}
            onClick={() => setActiveTab('products')}
            icon={<CheckCircle size={20} />}
            label="Pending Approvals"
            badge={pendingProducts.length}
          />
          <NavButton
            active={activeTab === 'manage_products'}
            onClick={() => setActiveTab('manage_products')}
            icon={<Package size={20} />}
            label="Manage Products"
          />
          <NavButton
            active={activeTab === 'admins'}
            onClick={() => setActiveTab('admins')}
            icon={<Shield size={20} />}
            label="Admin Requests"
            badge={pendingAdmins.length}
          />
          <NavButton
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            icon={<Users size={20} />}
            label="User Management"
          />
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              {currentUser?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{currentUser?.username}</p>
              <p className="text-xs text-gray-500 truncate">Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 md:ml-72 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {activeTab === 'overview' && 'System Overview'}
              {activeTab === 'products' && 'Product Approvals'}
              {activeTab === 'manage_products' && 'Product Management'}
              {activeTab === 'admins' && 'Admin Access Requests'}
              {activeTab === 'users' && 'User Management'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your eco-friendly marketplace</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard title="Total Users" value={stats.users} icon={<Users size={24} />} color="blue" />
              <StatCard title="Total Products" value={stats.products} icon={<Leaf size={24} />} color="emerald" />
              <StatCard title="Total Revenue" value={formatCurrency(stats.revenue)} icon={<TrendingUp size={24} />} color="amber" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Platform Activity</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={ACTIVITY_DATA}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                      <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderRadius: '8px', border: 'none', color: '#fff' }} />
                      <Area type="monotone" dataKey="sales" stroke="#10B981" fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Approval Trends</h3>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ACTIVITY_DATA}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#1F2937', borderRadius: '8px', border: 'none', color: '#fff' }} />
                        <Bar dataKey="visits" fill="#059669" radius={[6, 6, 0, 0]} barSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Tracks daily marketplace visits to help forecast moderation load.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Pending Tasks</h3>
                  <div className="space-y-4">
                    <TaskItem
                      title="Product Approvals"
                      count={pendingProducts.length}
                      color="orange"
                      onClick={() => setActiveTab('products')}
                    />
                    <TaskItem
                      title="Admin Requests"
                      count={pendingAdmins.length}
                      color="red"
                      onClick={() => setActiveTab('admins')}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in duration-300">
            {pendingProducts.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500" />
                <p className="text-lg font-medium">All caught up! No pending products.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Product</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Seller ID</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Price</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Carbon Score</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {pendingProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="p-4 font-medium text-gray-900 dark:text-white">{product.name || 'Unnamed Product'}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">#{product.sellerId ?? '--'}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">{formatCurrency(product.price)}</td>
                      <td className="p-4 text-emerald-600 font-medium">{product.carbonFootprintScore ?? 'N/A'} kg</td>
                      <td className="p-4 flex justify-end gap-2">
                        <button
                          onClick={() => handleApproveProduct(product.id)}
                          className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => handleReject('product', product.id)}
                          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'manage_products' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="font-bold text-gray-700 dark:text-gray-200">Marketplace Inventory</h3>
              <span className="text-xs font-mono text-gray-500">{allProducts.length} Items</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Product Name</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Seller Info</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Price</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Remove</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {allProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="p-4">
                        <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                        <div className="text-xs text-gray-500">ID: {product.id}</div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                        <div>{product.sellerName || 'Unknown Seller'}</div>
                        <div className="text-xs opacity-70">Seller ID: {product.sellerId ?? 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 text-xs font-bold rounded-full ${
                            product.isActive
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}
                        >
                          {product.isActive ? 'Active' : 'Pending'}
                        </span>
                      </td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">{formatCurrency(product.price)}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Remove Product"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-100 dark:border-yellow-900/30 flex items-center gap-3">
              <AlertCircle className="text-yellow-600 dark:text-yellow-500" size={20} />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                These users have requested Admin access. Approving them will give them full control over the platform.
              </p>
            </div>
            {pendingAdmins.length === 0 ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                <Shield size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No pending admin requests.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Username</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Email</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Role Requested</th>
                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {pendingAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="p-4 font-medium text-gray-900 dark:text-white">{admin.username || 'Unknown User'}</td>
                      <td className="p-4 text-gray-600 dark:text-gray-300">{admin.email || 'Not Provided'}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 text-xs font-bold bg-red-100 text-red-700 rounded-full">ADMIN</span>
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        <button
                          onClick={() => handleApproveAdmin(admin.id)}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject('user', admin.id)}
                          className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          Deny
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
      active
        ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-sm'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
    }`}
  >
    <div className="flex items-center gap-3">
      {icon}
      <span>{label}</span>
    </div>
    {badge > 0 && (
      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </button>
);

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600'
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color] || 'bg-gray-100 text-gray-600'}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
      </div>
    </div>
  );
};

const TASK_COLORS = {
  orange: 'bg-orange-500',
  red: 'bg-red-500'
};

const TaskItem = ({ title, count, color, onClick }) => (
  <div
    onClick={onClick}
    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
  >
    <div className="flex items-center gap-3">
      <div className={`w-2 h-2 rounded-full ${TASK_COLORS[color] || 'bg-gray-400'}`}></div>
      <span className="font-medium text-gray-700 dark:text-gray-200">{title}</span>
    </div>
    <span className="font-bold text-gray-900 dark:text-white">{count}</span>
  </div>
);

export default AdminDashboard;
