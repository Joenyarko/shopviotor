import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary-500 text-white/80 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-2">
              <img src="/shopviotorlogo2.png" alt="SHOP VIOTOR Logo" className="h-16 md:h-20 w-auto object-contain rounded-md" />
              <span className="text-2xl font-extrabold text-white tracking-wider">SHOP VIOTOR</span>
            </Link>
            <p className="mt-4 text-sm text-white/70">
              The premier Ghanaian marketplace to buy, sell, trade, hire purchase, layaway, or raffle products.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Marketplace</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/products" className="text-white/80 hover:text-white transition-colors text-sm">All Products</Link></li>
              <li><Link to="/sell" className="text-white/80 hover:text-white transition-colors text-sm">Sell to SHOP VIOTOR</Link></li>
              <li><Link to="/barter" className="text-white/80 hover:text-white transition-colors text-sm">Trade by Barter</Link></li>
              <li><Link to="/hire-purchase" className="text-white/80 hover:text-white transition-colors text-sm">Hire Purchase</Link></li>
              <li><Link to="/raffles" className="text-white/80 hover:text-white transition-colors text-sm">Raffles</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Support</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/about" className="text-white/80 hover:text-white transition-colors text-sm">About Us</Link></li>
              <li><Link to="/contact" className="text-white/80 hover:text-white transition-colors text-sm">Contact Support</Link></li>
              <li><Link to="/faq" className="text-white/80 hover:text-white transition-colors text-sm">FAQs</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Legal</h3>
            <ul className="mt-4 space-y-2">
              <li><Link to="/privacy" className="text-white/80 hover:text-white transition-colors text-sm">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-white/80 hover:text-white transition-colors text-sm">Terms & Conditions</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-xs text-white/60">
            &copy; {new Date().getFullYear()} SHOP VIOTOR Ltd. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="text-xs text-white/60">Base Currency: GHS (Ghana Cedis)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
