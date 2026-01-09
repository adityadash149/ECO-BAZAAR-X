import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white pt-20 pb-16 px-6 mt-20 rounded-t-[3rem]">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <Logo size="h-12 w-12" />
            <h2 className="font-black text-2xl tracking-tighter">ECOBAZAARX</h2>
          </div>
          <p className="text-emerald-100/60 max-w-sm leading-relaxed">
            Leading the transition to conscious consumerism through verified sustainability analytics and carbon-neutral logistics.
          </p>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-emerald-400">Navigation</h4>
          <ul className="space-y-4 text-sm text-emerald-100/60">
            <li>
              <Link to="/products" className="hover:text-emerald-400 transition-colors cursor-pointer">
                Marketplace
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-emerald-400 transition-colors cursor-pointer">
                About
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 text-emerald-400">Stay Connected</h4>
          <p className="text-sm text-emerald-100/60 mb-4">
            Verified sustainability analytics and carbon-neutral logistics updates.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center px-6 py-3 rounded-full bg-white text-slate-900 font-semibold hover:bg-emerald-100 transition-colors"
          >
            Contact Team
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
