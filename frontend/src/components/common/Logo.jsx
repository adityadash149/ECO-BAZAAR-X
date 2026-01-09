import React from 'react';

const Logo = ({ size = 'h-12 w-12' }) => (
  <div className={`${size} bg-slate-900 rounded-full flex items-center justify-center shadow-lg border-2 border-emerald-500/20`}>
    <span className="text-white font-black text-2xl tracking-tighter">E</span>
  </div>
);

export default Logo;
