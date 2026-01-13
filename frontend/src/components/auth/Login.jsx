import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Leaf,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { authAPI } from '../../services/api';
import { AnimatePresence } from 'framer-motion';

const loginSchema = yup.object({
  username: yup.string().required('Username is required'),
  password: yup.string().required('Password is required')
}).required();

const Login = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema)
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await authAPI.login(data);
      setSuccess('Login successful! Redirecting...');
      
      // Store user data
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify({
        userId: response.data.userId,
        username: response.data.username,
        role: response.data.role,
        firstName: response.data.firstName,
        lastName: response.data.lastName,
        email: response.data.email
      }));

      // Trigger success animation
      if (onLoginSuccess) {
        onLoginSuccess();
      }

      // Redirect based on role
      setTimeout(() => {
        const role = response.data.role.toLowerCase();
        if (role === 'customer') {
          // Redirect customers to marketplace page
          window.location.href = '/products';
        } else {
          // Redirect admin and seller to their dashboards
          window.location.href = `/${role}/dashboard`;
        }
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full"
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-emerald-100/60 dark:border-emerald-900/40 bg-white/90 dark:bg-[#05281f]/90 shadow-[0_25px_80px_rgba(15,118,110,0.15)] dark:shadow-[0_40px_110px_rgba(0,0,0,0.65)] p-8 backdrop-blur-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-transparent to-green-100/40 dark:from-[#041d16] dark:via-[#093628] dark:to-[#04120e]" />
        
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-2xl font-bold text-slate-800 dark:text-emerald-50 mb-2"
            >
              Welcome Back
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-gray-600 dark:text-emerald-200/80"
            >
              Sign in to your EcoBazaarX account
            </motion.p>
          </div>

          {/* Success/Error Messages */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-green-50 dark:bg-emerald-900/30 border border-green-200 dark:border-emerald-800 rounded-lg flex items-center space-x-3"
              >
                <CheckCircle size={20} className="text-green-600" />
                <span className="text-green-800 dark:text-emerald-50 font-medium">{success}</span>
              </motion.div>
            )}
            
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-900 rounded-lg flex items-center space-x-3"
              >
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">!</span>
                </div>
                <span className="text-red-800 dark:text-red-100 font-medium">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <label className="block text-sm font-semibold text-slate-700 dark:text-emerald-100/80 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-gray-400 dark:text-emerald-300/70" />
                </div>
                <input
                  type="text"
                  {...register('username')}
                  className="auth-input pl-12 pr-4"
                  placeholder="Enter your username"
                />
              </div>
              {errors.username && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-200"
                >
                  {errors.username.message}
                </motion.p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <label className="block text-sm font-semibold text-slate-700 dark:text-emerald-100/80 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400 dark:text-emerald-300/70" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className="auth-input pl-12 pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-emerald-200/70 dark:hover:text-emerald-100 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 text-sm text-red-600 dark:text-red-200"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-500 dark:from-emerald-400 dark:to-emerald-500 text-white dark:text-[#041d16] py-3 px-6 rounded-xl font-semibold hover:from-emerald-500 hover:to-green-600 dark:hover:from-emerald-300 dark:hover:to-emerald-400 focus:ring-4 focus:ring-emerald-200/70 dark:focus:ring-emerald-500/40 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 shadow-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <Leaf size={20} />
                  <span>Sign In</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Switch to Register */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-8 text-center"
          >
            <p className="text-gray-600 dark:text-emerald-200/80">
              Don't have an account?{' '}
              <button
                onClick={onSwitchToRegister}
                className="text-green-600 dark:text-emerald-300 hover:text-green-700 dark:hover:text-emerald-200 font-semibold transition-colors duration-200 hover:underline"
              >
                Create one here
              </button>
            </p>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

export default Login;
