import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import Logo from '../components/common/Logo';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [defaultAccountType, setDefaultAccountType] = useState('CUSTOMER');

  useEffect(() => {
    const justRegistered = searchParams.get('registered');
    if (justRegistered === 'true') {
      setIsLogin(true);
    }

    if (location.state?.accountType === 'SELLER' && location.state?.isRegister) {
      setIsLogin(false);
      setDefaultAccountType('SELLER');
    }
  }, [searchParams, location.state]);

  const switchToRegister = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  const handleRegistrationSuccess = () => {
    navigate('/auth?registered=true');
  };

  const handleLoginSuccess = () => {
    setShowSuccessAnimation(true);
    setTimeout(() => setShowSuccessAnimation(false), 1600);
  };

  return (
    <div className="min-h-screen w-full relative bg-[#f8faf9] dark:bg-[#041d16] text-slate-900 dark:text-emerald-50 flex items-center justify-center p-4 overflow-x-hidden transition-colors">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-emerald-100/30 dark:from-[#041d16] dark:via-[#05241d] dark:to-[#03130f]" />
        <div className="absolute -top-32 -right-24 w-64 h-64 rounded-full bg-emerald-200/20 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-teal-100/30 blur-3xl dark:bg-teal-500/10" />
      </div>
      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            className="fixed inset-0 bg-emerald-600/90 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="text-center text-white"
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, rotate: 10 }}
              transition={{ duration: 0.6, type: 'spring' }}
            >
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="mb-6 flex justify-center"
              >
                <Logo size="h-16 w-16" />
              </motion.div>
              <h2 className="text-3xl font-black mb-2">Welcome to EcoBazaarX</h2>
              <p className="text-lg text-emerald-100">You are now part of the green economy.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-5xl min-h-[85vh] bg-white dark:bg-[#062d23] rounded-[2rem] border border-emerald-50 dark:border-emerald-900/20 shadow-[0_30px_90px_rgba(15,118,110,0.15)] dark:shadow-[0_40px_120px_rgba(0,0,0,0.75)] overflow-hidden grid lg:grid-cols-2"
      >
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-10 text-white hidden lg:flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-8">
            <Logo size="h-10 w-10" />
            <h1 className="text-xl font-black tracking-tight">ECOBAZAARX</h1>
          </div>
          <div>
            <h2 className="text-3xl font-bold mb-4">
              Welcome to the <br />
              <span className="text-emerald-400">Green Movement.</span>
            </h2>
            <p className="text-emerald-100/60 text-sm leading-relaxed">
              Join thousands of conscious shoppers making a real impact on the planet with every purchase.
            </p>
          </div>
          <div className="flex items-center gap-3 mt-8">
            <Logo size="h-10 w-10" />
            <p className="text-xs font-semibold text-emerald-100/80 tracking-wide uppercase">Certified carbon-neutral marketplace</p>
          </div>
        </div>

        <div className="p-8 lg:p-12 flex flex-col justify-center bg-white dark:bg-[#062d23]">
          <div className="max-w-sm mx-auto w-full">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <Login onSwitchToRegister={switchToRegister} onLoginSuccess={handleLoginSuccess} />
              ) : (
                <Register
                  onSwitchToLogin={switchToLogin}
                  onRegistrationSuccess={handleRegistrationSuccess}
                  defaultAccountType={defaultAccountType}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
