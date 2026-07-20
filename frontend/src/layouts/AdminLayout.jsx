import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Car, 
  Settings, 
  Users, 
  Package, 
  ShoppingCart, 
  CreditCard, 
  Scale, 
  Truck, 
  Ticket, 
  Layers, 
  BarChart, 
  LogOut, 
  Sun, 
  Moon, 
  Home, 
  ChevronRight, 
  Menu, 
  X,
  Tag,
  Briefcase,
  Store,
  Layers3
} from 'lucide-react';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminMenu = [
    { name: 'Dashboard', path: '/admin', icon: Home },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tag },
    { name: 'Brands', path: '/admin/brands', icon: Layers }, // Uses Layers since it is already imported
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Trade Requests', path: '/admin/trades', icon: Scale },
    { name: 'Sell Requests', path: '/admin/sells', icon: Truck },
    { name: 'Hire Purchase', path: '/admin/hire-purchase', icon: Briefcase },
    { name: 'Layaway Plans', path: '/admin/layaway', icon: Layers3 },
    { name: 'Vendor Stores', path: '/admin/vendor-stores', icon: Store },
    { name: 'Raffles', path: '/admin/raffles', icon: Ticket },
    { name: 'Pre-Orders', path: '/admin/pre-orders', icon: Package },
    { name: 'Marketing Ads', path: '/admin/ads', icon: Layers },
    { name: 'Promo Popups', path: '/admin/campaigns', icon: Layers },
    { name: 'Flash Sales', path: '/admin/flash-sales', icon: Tag },
    { name: 'Collections', path: '/admin/collections', icon: Package },
    { name: 'Reports', path: '/admin/reports', icon: BarChart },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 flex transition-colors">
      
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)} 
          className="fixed inset-0 z-40 bg-secondary-900/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-secondary-900 border-r border-secondary-200 dark:border-secondary-800 flex flex-col transform lg:translate-x-0 lg:static transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        {/* Logo and close */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-secondary-200 dark:border-secondary-800">
          <Link to="/" className="text-xl font-bold tracking-wider text-secondary-900 dark:text-white">
            SHOP <span className="text-primary-500">VIOTOR</span> <span className="text-xs bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300 px-2 py-0.5 rounded-full ml-1">ADMIN</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-secondary-500 dark:text-secondary-400 hover:bg-secondary-100 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User profile widget */}
        <div className="p-6 border-b border-secondary-200 dark:border-secondary-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
            {user?.first_name?.charAt(0)}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-secondary-900 dark:text-white leading-tight">{user?.name}</h4>
            <span className="text-xs text-secondary-500 dark:text-secondary-400 capitalize">{user?.role}</span>
          </div>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {adminMenu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400' : 'text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800'}`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom bar inside sidebar */}
        <div className="p-4 border-t border-secondary-200 dark:border-secondary-800 flex flex-col gap-2">
          <button 
            onClick={toggleDarkMode}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950/20"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Header bar */}
        <header className="h-16 bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-800 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 rounded-md"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold text-secondary-900 dark:text-white">Admin Management Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline">
              Go to Storefront
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
export { AdminLayout };
