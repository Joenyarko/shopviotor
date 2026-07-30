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
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 flex justify-center space-x-3 md:space-x-4 lg:space-x-6 text-xs font-semibold whitespace-nowrap overflow-x-auto no-scrollbar">
          <NavLink 
            to="/products" 
            className={({ isActive }) => isActive ? "text-primary-500 underline decoration-2 underline-offset-4 font-bold" : "text-white/80 hover:text-white transition-colors"}
          >
            All Products
          </NavLink>
          <span className="text-white/30">|</span>
          <NavLink 
            to="/products?condition=used" 
            className={({ isActive }) => isActive ? "text-primary-500 underline decoration-2 underline-offset-4 font-bold" : "text-white/80 hover:text-white transition-colors"}
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
          <NavLink 
            to="/barter" 
            className={({ isActive }) => isActive ? "text-primary-500 underline decoration-2 underline-offset-4 font-bold" : "text-white/80 hover:text-white transition-colors"}
          >
            Trade by Barter
          </NavLink>
          <span className="text-white/30">|</span>
          <NavLink 
            to="/hire-purchase" 
            className={({ isActive }) => isActive ? "text-primary-500 underline decoration-2 underline-offset-4 font-bold" : "text-white/80 hover:text-white transition-colors"}
          >
            Hire Purchase
          </NavLink>
          <span className="text-white/30">|</span>
          <NavLink 
            to="/layaway" 
            className={({ isActive }) => isActive ? "text-primary-500 underline decoration-2 underline-offset-4 font-bold" : "text-white/80 hover:text-white transition-colors"}
          >
            Layaway
          </NavLink>
          <span className="text-white/30">|</span>
          <NavLink 
            to="/raffles" 
            className={({ isActive }) => isActive ? "text-primary-500 underline decoration-2 underline-offset-4 font-bold" : "text-white/80 hover:text-white transition-colors"}
          >
            Raffles
          </NavLink>
          <span className="text-white/30">|</span>
          <NavLink 
            to="/pre-orders" 
            className={({ isActive }) => isActive ? "text-primary-500 underline decoration-2 underline-offset-4 font-bold" : "text-white/80 hover:text-white transition-colors"}
          >
            Pre-Orders
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

