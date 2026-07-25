import React from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { LayoutDashboard, Package, ShoppingCart, Settings, Store, LogOut, Sun, Moon, Menu, X, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const VendorLayout = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/vendor', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/vendor/products', label: 'My Products', icon: Package },
    { to: '/vendor/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/vendor/settings', label: 'Store Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 flex transition-colors">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-secondary-900 border-r border-secondary-200 dark:border-secondary-800 flex flex-col transform lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:flex-shrink-0 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-secondary-200 dark:border-secondary-800">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Store className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-secondary-900 dark:text-white">Vendor <span className="text-emerald-600">Hub</span></span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="p-5 border-b border-secondary-200 dark:border-secondary-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
              {user?.first_name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-secondary-900 dark:text-white truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-emerald-600 font-semibold">Vendor</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navLinks.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800'}`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-4 h-4" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-secondary-200 dark:border-secondary-800 space-y-1">
          <button onClick={toggleDarkMode} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <Link to="/" className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800">
            <Store className="w-5 h-5" />
            <span>Back to Storefront</span>
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-800 flex items-center px-6 gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 rounded-lg">
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-base font-semibold text-secondary-900 dark:text-white">Vendor Dashboard</h1>
        </header>
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
export { VendorLayout };
