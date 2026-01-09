import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Award, ShieldCheck, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Testimonials from '../components/Testimonials';


const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen overflow-hidden bg-[#f8faf9] dark:bg-[#041d16] text-slate-900 dark:text-emerald-50 transition-colors duration-500">
      {/* LUSH HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center pt-20 px-6">
        {/* Organic Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-50 dark:bg-[#062d23] rounded-bl-[10rem] -z-10 hidden lg:block transition-colors duration-500" />
        <div className="absolute top-20 right-20 w-64 h-64 bg-emerald-200/30 dark:bg-emerald-500/10 blur-3xl rounded-full -z-10 animate-pulse" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl lg:text-7xl font-black text-slate-900 dark:text-emerald-50 leading-tight mb-6">
              Shop with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                Pure Purpose.
              </span>
            </h1>
            <p className="text-xl text-slate-600 dark:text-emerald-100/80 mb-8 max-w-lg leading-relaxed">
              Discover verified sustainable products that reward the planet and your wallet. 
              Earn Eco-Points for every carbon-neutral choice.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => navigate('/products')} className="btn-lush text-lg px-8">
                Explore Marketplace <ArrowRight size={20} />
              </button>
              <button onClick={() => navigate('/about')} className="px-8 py-3 rounded-full font-bold border-2 border-slate-200 dark:border-emerald-800 dark:text-emerald-100 hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors">
                Our Mission
              </button>
            </div>
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <img 
              src="https://media.licdn.com/dms/image/v2/D5612AQGUof2koLEZBg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1708560395648?e=1769644800&v=beta&t=5faDGSgxdrePIY5htqIwuLwoOyUSFtmT1BnezGgbyNQ" 
              alt="Sustainability" 
              className="rounded-[3rem] shadow-2xl shadow-emerald-900/10 dark:shadow-emerald-900/40 rotate-2 hover:rotate-0 transition-transform duration-700"
            />
            {/* Impact Float Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white dark:bg-[#062d23] p-6 rounded-3xl shadow-xl shadow-emerald-900/10 flex items-center gap-4 animate-float">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <Award className="text-white" />
              </div>
              <div>
                <p className="text-sm text-slate-500 dark:text-emerald-200/80 font-medium">Carbon Neutral</p>
                <p className="text-xl font-bold text-slate-900 dark:text-emerald-50">100% Verified</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Testimonials />

      {/* CALL TO ACTION: SELLERS */}
      <section className="py-20 px-6 transition-colors duration-500">
        <div className="max-w-7xl mx-auto rounded-[3rem] bg-slate-900 dark:bg-[#010a07] border border-emerald-900/40 p-12 lg:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[100px]" />
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">Grow Your Green Brand</h2>
              <p className="text-emerald-100/70 text-lg mb-8">Join the largest community of sustainable creators and sellers. Reach conscious customers globally.</p>
              <button onClick={() => navigate('/auth?type=seller&register=true')} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-8 py-4 rounded-full font-bold text-lg transition-all">
                Become a Seller
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Users className="text-emerald-400 mb-4" />
                <h4 className="text-white font-bold text-xl">10k+</h4>
                <p className="text-white/50 text-sm">Active Buyers</p>
              </div>
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <ShieldCheck className="text-emerald-400 mb-4" />
                <h4 className="text-white font-bold text-xl">Verified</h4>
                <p className="text-white/50 text-sm">Sellers Only</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

