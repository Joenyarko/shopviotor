import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import TopBanner from '../components/TopBanner';
import BottomNav from '../components/BottomNav';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-secondary-950 transition-colors pb-16 md:pb-0">
      <TopBanner />
      <Navbar />
      
      {/* Subnavigation banner for main modules (Desktop layout) */}
      <div className="hidden md:block bg-secondary-900 border-b border-secondary-800 py-2.5 transition-colors">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 flex justify-center items-center space-x-3 md:space-x-4 lg:space-x-6 text-xs font-semibold whitespace-nowrap">
          <NavLink 
            to="/products" 
            end
            className={({ isActive }) => (isActive && !window.location.search.includes('condition=used')) ? "text-primary-500 underline decoration-2 underline-offset-4 font-bold" : "text-white/80 hover:text-white transition-colors"}
          >
            All Products
          </NavLink>
          <span className="text-white/30">|</span>
          <NavLink 
            to="/products?condition=used" 
            className={() => window.location.search.includes('condition=used') ? "text-primary-500 underline decoration-2 underline-offset-4 font-bold" : "text-white/80 hover:text-white transition-colors"}
          >
            Second Hand
          </NavLink>
          <span className="text-white/30">|</span>
          <NavLink 
            to="/sell" 
            className={({ isActive }) => isActive ? "text-primary-500 underline decoration-2 underline-offset-4 font-bold" : "text-white/80 hover:text-white transition-colors"}
          >
            Sell to SHOP VIOTOR
          </NavLink>
          <span className="text-white/30">|</span>
          <div className="relative group flex items-center h-full">
            <button className="text-white/80 hover:text-white transition-colors font-medium flex items-center gap-1 py-2">
              Viotor Exclusives
              <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div className="absolute top-full left-0 pt-1 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="bg-secondary-900 border border-secondary-700 rounded-lg shadow-xl overflow-hidden">
              <NavLink to="/barter" className={({ isActive }) => isActive ? "block px-4 py-2.5 text-sm bg-primary-500/10 text-primary-400" : "block px-4 py-2.5 text-sm text-secondary-300 hover:bg-secondary-800 hover:text-white"}>Trade by Barter</NavLink>
              <NavLink to="/hire-purchase" className={({ isActive }) => isActive ? "block px-4 py-2.5 text-sm bg-primary-500/10 text-primary-400" : "block px-4 py-2.5 text-sm text-secondary-300 hover:bg-secondary-800 hover:text-white"}>Hire Purchase</NavLink>
              <NavLink to="/layaway" className={({ isActive }) => isActive ? "block px-4 py-2.5 text-sm bg-primary-500/10 text-primary-400" : "block px-4 py-2.5 text-sm text-secondary-300 hover:bg-secondary-800 hover:text-white"}>Layaway</NavLink>
              <NavLink to="/pre-orders" className={({ isActive }) => isActive ? "block px-4 py-2.5 text-sm bg-primary-500/10 text-primary-400" : "block px-4 py-2.5 text-sm text-secondary-300 hover:bg-secondary-800 hover:text-white"}>Pre-Orders</NavLink>
              <NavLink to="/raffles" className={({ isActive }) => isActive ? "block px-4 py-2.5 text-sm bg-primary-500/10 text-primary-400" : "block px-4 py-2.5 text-sm text-secondary-300 hover:bg-secondary-800 hover:text-white"}>Raffles</NavLink>
              </div>
            </div>
          </div>
          <span className="text-white/30">|</span>
          <NavLink 
            to="/professionals" 
            className={({ isActive }) => isActive ? "text-primary-500 underline decoration-2 underline-offset-4 font-bold" : "text-white/80 hover:text-white transition-colors"}
          >
            Buy ATU
          </NavLink>
          <span className="text-white/30">|</span>
          <NavLink 
            to="/become-a-vendor" 
            className={({ isActive }) => isActive ? "text-primary-500 underline decoration-2 underline-offset-4 font-bold" : "text-white/80 hover:text-white transition-colors"}
          >
            Become a Vendor
          </NavLink>
        </div>
      </div>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      
      <Footer />
      <BottomNav />
    </div>
  );
};

export default MainLayout;
export { MainLayout };

