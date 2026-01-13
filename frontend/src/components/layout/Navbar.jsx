import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, 
  Menu, 
  X,
  Package,
  Home,
  Info,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '../../services/api';
import Logo from '../common/Logo';
import ThemeToggle from '../common/ThemeToggle';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  // Cart state
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  // Initialize authentication state
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      // Only show profile if we have both token and user data
      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setIsAuthenticated(true);
          setUser(parsedUser);
          
        } catch (error) {
          // If user data is corrupted, clear everything
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(null);
          
        }
      } else {
        // Clear any partial data
        setIsAuthenticated(false);
        setUser(null);
        
      }
    };
    
    // Check if this is the first time the app is loaded
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (!hasVisited) {
      // First time visiting - clear any existing auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.setItem('hasVisited', 'true');
      setIsAuthenticated(false);
      setUser(null);
      
    } else {
      checkAuth();
    }
    
    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Load cart items and listen for cart updates
  useEffect(() => {
    const loadCart = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.reduce((total, item) => total + (item?.quantity || 0), 0));
      } catch (error) {
        console.error('Error loading cart:', error);
        setCartCount(0);
      }
    };

    // Load cart on mount
    loadCart();

    // Listen for cart updates
    const handleCartUpdate = () => {
      loadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] px-5 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto h-16 rounded-full eco-glass bg-white/80 dark:bg-[#062d23]/80 px-5 sm:px-6 flex items-center justify-between shadow-xl shadow-emerald-900/5 transition-colors duration-300">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <Logo size="h-12 w-12" />
          <span className="font-black text-xl text-slate-900 dark:text-emerald-50 tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
            ECOBAZAARX
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 font-bold text-slate-600 dark:text-emerald-100">
          <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors">Home</Link>
          {isAuthenticated && (
            <Link to="/products" className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors">Marketplace</Link>
          )}
          <Link to="/about" className="hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors">About</Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <ThemeToggle />

          {isAuthenticated && (
            <>
              <Link
                to="/orders"
                className="hidden sm:flex items-center gap-1 px-3 py-2 font-bold text-slate-700 dark:text-emerald-50 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors"
              >
                <ShoppingBag size={18} />
                <span>Orders</span>
              </Link>
              <Link to="/cart" className="relative px-3 py-2 font-bold text-slate-700 dark:text-emerald-50 hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors">
                <span>Smart Cart</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-2 bg-emerald-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>
            </>
          )}

          {/* Auth/Profile */}
          {isAuthenticated ? (
            <div className="relative ml-1.5">
              <div 
                onClick={() => navigate('/profile')}
                className="flex items-center gap-1.5 bg-slate-900 text-white dark:bg-emerald-400 dark:text-[#041d16] rounded-full pl-2 pr-3 py-1 cursor-pointer hover:opacity-90 transition"
              >
                 <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-slate-900 text-sm">
                   {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
                 </div>
                 <span className="text-xs font-bold hidden sm:block">{user?.firstName || 'User'}</span>
              </div>
            </div>
          ) : (
            <button onClick={() => navigate('/auth')} className="btn-lush py-2 px-5 text-sm">
              Sign In
            </button>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-slate-600 dark:text-emerald-100 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white/90 dark:bg-[#041d16]/90 backdrop-blur-md border-t border-emerald-100 dark:border-emerald-900 shadow-sm mx-6 rounded-b-3xl overflow-hidden"
          >
            <div className="px-6 py-6 space-y-2">
              <Link 
                to="/" 
                className="flex items-center px-5 py-4 text-slate-700 dark:text-emerald-100 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors duration-200 font-medium text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-5 h-5 mr-4 text-slate-400 dark:text-emerald-400" />
                Home
              </Link>
              {isAuthenticated && (
                <Link 
                  to="/products" 
                  className="flex items-center px-5 py-4 text-slate-700 dark:text-emerald-100 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors duration-200 font-medium text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Package className="w-5 h-5 mr-4 text-slate-400 dark:text-emerald-400" />
                  Marketplace
                </Link>
              )}
              {isAuthenticated && (
                <Link
                  to="/orders"
                  className="flex items-center px-5 py-4 text-slate-700 dark:text-emerald-100 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors duration-200 font-medium text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingBag className="w-5 h-5 mr-4 text-slate-400 dark:text-emerald-400" />
                  Orders
                </Link>
              )}
              <Link 
                to="/about" 
                className="flex items-center px-5 py-4 text-slate-700 dark:text-emerald-100 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors duration-200 font-medium text-base"
                onClick={() => setIsMenuOpen(false)}
              >
                <Info className="w-5 h-5 mr-4 text-slate-400 dark:text-emerald-400" />
                About
              </Link>
              {isAuthenticated && (
                <Link
                  to="/cart"
                  className="flex items-center px-5 py-4 text-slate-700 dark:text-emerald-100 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors duration-200 font-medium text-base"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="w-5 h-5 mr-4 rounded-full border border-emerald-200 dark:border-emerald-700 text-[10px] flex items-center justify-center text-emerald-500 dark:text-emerald-300 font-bold">
                    SC
                  </span>
                  Smart Cart
                </Link>
              )}
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/profile" 
                    className="flex items-center px-5 py-4 text-slate-700 dark:text-emerald-100 hover:text-emerald-600 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-lg transition-colors duration-200 font-medium text-base"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5 mr-4 text-slate-400 dark:text-emerald-400" />
                    Profile
                  </Link>
                </>
              ) : (
                <Link 
                  to="/auth" 
                  className="flex items-center px-5 py-4 text-white dark:text-[#041d16] bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 dark:hover:bg-emerald-400 rounded-lg transition-colors duration-200 font-bold text-base justify-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
