import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, List, ShoppingCart, Heart, User } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const BottomNav = () => {
  const location = useLocation();
  const { cartItemsCount } = useCart();

  const navItems = [
    { name: 'Home', path: '/', icon: <Home className="w-6 h-6" /> },
    { name: 'Categories', path: '/categories', icon: <List className="w-6 h-6" /> },
    { name: 'Cart', path: '/cart', icon: (
      <div className="relative">
        <ShoppingCart className="w-6 h-6" />
        {cartItemsCount > 0 && (
          <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xxs font-bold leading-none text-white bg-primary-500 rounded-full">
            {cartItemsCount}
          </span>
        )}
      </div>
    )},
    { name: 'Wishlist', path: '/wishlist', icon: <Heart className="w-6 h-6" /> },
    { name: 'Account', path: '/dashboard', icon: <User className="w-6 h-6" /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-secondary-900 border-t border-secondary-200 dark:border-secondary-800 z-50 px-2 py-2 pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center w-full py-1 ${isActive ? 'text-primary-600 dark:text-primary-500' : 'text-secondary-500 dark:text-secondary-400'}`}
            >
              {item.icon}
              <span className="text-[10px] mt-1 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
