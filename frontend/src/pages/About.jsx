import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, ShieldCheck, Globe, Award } from 'lucide-react';

const About = () => {
  const stats = [
    { icon: <ShieldCheck className="text-emerald-600" />, label: "Verified Products", value: "500+" },
    { icon: <Leaf className="text-emerald-600" />, label: "Trees Planted", value: "1,200" },
    { icon: <Globe className="text-emerald-600" />, label: "Carbon Neutral", value: "100%" }
  ];

  return (
    <div className="min-h-screen bg-[#f8faf9] dark:bg-[#041d16] text-slate-900 dark:text-emerald-50 transition-colors duration-300 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Hero Section */}
        <section className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 dark:text-white leading-tight mb-8">
              Nurturing Nature <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Through Commerce.</span>
            </h1>
            <p className="text-slate-600 dark:text-emerald-100/70 text-lg leading-relaxed mb-8">
              EcoBazaarX was born from a simple realization: the power to save our planet lies in our daily choices. We've built an ecosystem where every purchase is an act of restoration.
            </p>
            <div className="flex gap-4">
              <div className="p-6 rounded-[2rem] bg-white dark:bg-[#062d23] border border-emerald-50 dark:border-emerald-900/30 shadow-xl shadow-emerald-900/5 dark:shadow-black/30">
                <Award className="text-emerald-600 mb-2" />
                <h4 className="font-bold text-slate-800 dark:text-emerald-50">Ethical Standards</h4>
                <p className="text-xs text-slate-500 dark:text-emerald-100/60">Every seller is hand-vetted for environmental compliance.</p>
              </div>
            </div>
          </motion.div>
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative">
              <img src="https://biofuelresource.com/wp-content/uploads/2021/05/Carbon-Neutrality.jpg" 
                 className="rounded-[3rem] shadow-2xl shadow-emerald-900/20 dark:shadow-black/40 rotate-3 hover:rotate-0 transition-transform duration-700" alt="Sustainability" />
            <div className="absolute -bottom-10 -left-10 bg-slate-900 dark:bg-[#03130f] p-10 rounded-[2.5rem] text-white shadow-2xl animate-float">
              <p className="text-4xl font-black text-emerald-400">0.0%</p>
              <p className="text-xs uppercase tracking-widest opacity-60">Plastic Waste</p>
            </div>
          </motion.div>
        </section>

        {/* Stats Grid */}
        <section className="grid md:grid-cols-3 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-[#062d23] p-10 rounded-[2.5rem] border border-emerald-50 dark:border-emerald-900/30 text-center hover:border-emerald-200 dark:hover:border-emerald-700/60 transition-colors shadow-lg shadow-emerald-900/5 dark:shadow-black/30">
              <div className="flex justify-center mb-4">{stat.icon}</div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-emerald-50">{stat.value}</h3>
              <p className="text-slate-500 dark:text-emerald-100/60 font-medium">{stat.label}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};

export default About;
