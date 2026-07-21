import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, ShieldCheck } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary-950 text-white mt-auto font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Section: Newsletter */}
        <div className="py-12 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-md">
            <h2 className="text-2xl font-bold text-white tracking-tight mb-1">Stay in the loop</h2>
            <p className="text-sm text-secondary-400">
              Get updates on our products and community impact — <span className="text-primary-400 font-bold">no spam, ever.</span>
            </p>
          </div>
          <div className="flex-1 max-w-lg">
            <form className="flex flex-col sm:flex-row gap-0" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="w-full bg-white/5 border border-white/10 text-white px-5 py-3.5 rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none focus:outline-none focus:border-primary-500 text-sm"
              />
              <button className="bg-primary-500 hover:bg-primary-400 text-secondary-950 font-bold px-8 py-3.5 rounded-b-xl sm:rounded-r-xl sm:rounded-bl-none transition-colors whitespace-nowrap text-sm flex items-center justify-center gap-2">
                Subscribe &rarr;
              </button>
            </form>
            <p className="text-xs text-secondary-500 mt-2 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> We respect your privacy. Unsubscribe anytime.
            </p>
          </div>
        </div>

        {/* Middle Section: Links & Info */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
          
          {/* Brand & Socials */}
          <div className="md:col-span-5 pr-0 md:pr-12">
            <Link to="/" className="inline-block mb-4">
              <img src="/shopviotorlogo2.png" alt="SHOP VIOTOR Logo" className="h-16 w-auto object-contain rounded-md bg-white p-1" />
            </Link>
            <p className="text-secondary-300 text-sm leading-relaxed mb-6 max-w-sm">
              The premier Ghanaian marketplace bringing hope, dignity, and practical support through meaningful commerce. Buy, sell, trade, and finance with ease.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white hover:bg-white/10 transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white hover:bg-white/10 transition-all">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="#" className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white hover:bg-white/10 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-6">Navigation</h3>
            <ul className="space-y-4">
              <li><Link to="/" className="text-white hover:text-primary-400 font-medium text-sm transition-colors block">Home</Link></li>
              <li><Link to="/about" className="text-white hover:text-primary-400 font-medium text-sm transition-colors block">About</Link></li>
              <li><Link to="/products" className="text-white hover:text-primary-400 font-medium text-sm transition-colors block">Products</Link></li>
              <li><Link to="/contact" className="text-white hover:text-primary-400 font-medium text-sm transition-colors block">Contact</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-4 md:text-right">
            <h3 className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-6">Contact Us</h3>
            
            <div className="mb-5">
              <span className="block text-xs text-secondary-500 uppercase tracking-wider mb-1">Email</span>
              <a href="mailto:support@shopviotor.com" className="text-white hover:text-primary-400 text-sm transition-colors">support@shopviotor.com</a>
            </div>
            
            <div className="mb-5">
              <span className="block text-xs text-secondary-500 uppercase tracking-wider mb-1">Phone</span>
              <p className="text-white text-sm">0500 708 204 / 0500 708 204</p>
            </div>
            
            <div>
              <span className="block text-xs text-secondary-500 uppercase tracking-wider mb-1">Address</span>
              <p className="text-white text-sm">Ghana, Accra</p>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Legal / Copyright Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-secondary-500">
            &copy; {new Date().getFullYear()} All Rights Reserved &middot; Design and Developed by SHOP VIOTOR
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-xs text-secondary-500 hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-secondary-500 hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
