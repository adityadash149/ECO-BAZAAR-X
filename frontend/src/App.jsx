import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Auth from './pages/Auth';
import Cart from './pages/Cart';

import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Profile from './pages/Profile';
import AdminDashboard from './components/dashboard/AdminDashboard';
import SellerDashboard from './components/dashboard/SellerDashboard';
import { authAPI } from './services/api';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Component to conditionally render layout
const AppLayout = ({ children }) => {
  const location = useLocation();
  
  // Check if current route is a dashboard route or auth route
  const isDashboardRoute = location.pathname.includes('/admin/dashboard') || 
                          location.pathname.includes('/seller/dashboard');
  const isAuthRoute = location.pathname === '/auth';
  
  const wrapperClasses = "min-h-screen bg-[#f8faf9] dark:bg-[#041d16] text-slate-900 dark:text-emerald-50 transition-colors duration-300";

  if (isDashboardRoute || isAuthRoute) {
    // For dashboard routes and auth routes, render without navbar and footer but retain theme background
    return <div className={wrapperClasses}>{children}</div>;
  }
  
  // For public routes, render with navbar and footer
  return (
    <div className={`App ${wrapperClasses} flex flex-col`}>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authenticated = authAPI.isAuthenticated();
        if (authenticated) {
          const role = authAPI.getUserRole();
          setIsAuthenticated(true);
          setUserRole(role);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="loading-spinner"></div>
        <p className="ml-3 text-gray-600">Loading EcoBazaarX...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff'
          },
          success: {
            iconTheme: {
              primary: '#4ade80',
              secondary: 'black'
            }
          }
        }}
      />
      <Router>
        <AppLayout>
          <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <Cart />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products"
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            }
          />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin" 
            element={
              isAuthenticated && userRole === 'ADMIN' ? (
                <Navigate to="/admin/dashboard" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              isAuthenticated && userRole === 'ADMIN' ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
          
          {/* Protected Seller Routes */}
          <Route 
            path="/seller" 
            element={
              isAuthenticated && userRole === 'SELLER' ? (
                <Navigate to="/seller/dashboard" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
          <Route 
            path="/seller/dashboard" 
            element={
              isAuthenticated && userRole === 'SELLER' ? (
                <SellerDashboard />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
          
          {/* Protected Customer Routes - Redirect to home page instead of dashboard */}
          <Route 
            path="/customer" 
            element={
              isAuthenticated && userRole === 'CUSTOMER' ? (
                <Navigate to="/" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
          <Route 
            path="/customer/dashboard" 
            element={
              isAuthenticated && userRole === 'CUSTOMER' ? (
                <Navigate to="/" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            } 
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </>
  );
}

export default App;
