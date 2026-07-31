import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import MegaMenu from './MegaMenu';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  MessageSquare, 
  User, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Ticket,
  Package,
  Store
} from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isAdmin, isVendor } = useAuth();
  const { cartItemsCount } = useCart();
  const { darkMode, toggleDarkMode } = useTheme();
  
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [categoriesDropdownOpen, setCategoriesDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await import('../services/productService').then(m => m.default.getCategories());
        setCategories(res.data?.data || res.data || []);
      } catch (e) {
        console.error('Navbar failed to load categories', e);
      }
    };
    fetchCats();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-800 sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center gap-4">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <img src="/shopviotorlogo2.png" alt="SHOP VIOTOR Logo" className="h-14 sm:h-16 w-auto object-contain rounded-md dark:bg-white dark:p-1" />
              <span className="text-xl font-bold text-primary-500 tracking-tight hidden sm:block">
                SHOP VIOTOR
              </span>
            </Link>
          </div>

          {/* Mobile centered text */}
          <div className="sm:hidden flex-1 flex justify-center">
            <span className="text-lg font-bold text-primary-500 tracking-tight text-center whitespace-nowrap">
                SHOP VIOTOR
            </span>
          </div>

          {/* Mega Category Dropdown */}
          <div 
            className="hidden lg:block relative"
            onMouseEnter={() => setCategoriesDropdownOpen(true)}
            onMouseLeave={() => setCategoriesDropdownOpen(false)}
          >
            <button
              onClick={() => setCategoriesDropdownOpen(!categoriesDropdownOpen)}
              className="inline-flex items-center text-sm font-medium text-secondary-700 dark:text-secondary-200 hover:text-primary-600 dark:hover:text-primary-400 gap-1 h-20"
            >
              Categories <ChevronDown className="w-4 h-4" />
            </button>
            {categoriesDropdownOpen && (
              <MegaMenu categories={categories} closeMenu={() => setCategoriesDropdownOpen(false)} />
            )}
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-lg relative hidden sm:block">
            <input
              type="text"
              placeholder="Search products, brands, services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-full bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-secondary-400" />
          </form>

          {/* Navigation Action Links */}
          <div className="hidden md:flex items-center gap-6">
            
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-full"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Wishlist */}
            <Link to="/wishlist" className="p-2 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-full relative">
              <Heart className="w-5 h-5" />
            </Link>

            {/* Messages / Chat */}
            <Link to="/messages" className="p-2 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-full relative">
              <MessageSquare className="w-5 h-5" />
            </Link>

            {/* Cart */}
            <Link to="/checkout" className="p-2 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-full relative">
              <ShoppingCart className="w-5 h-5" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xxs font-bold leading-none text-white bg-primary-500 rounded-full">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Auth Dropdown */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 border border-secondary-300 dark:border-secondary-700 px-3 py-1.5 rounded-full hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                >
                  <User className="w-4 h-4 text-secondary-600 dark:text-secondary-300" />
                  <span className="text-sm font-medium text-secondary-700 dark:text-secondary-200">{user?.first_name}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-secondary-800 ring-1 ring-black ring-opacity-5 z-50 py-1">
                    {isAdmin() && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                      >
                        <LayoutDashboard className="w-4 h-4" /> Admin Portal
                      </Link>
                    )}
                    {isVendor() ? (
                      <Link
                        to="/vendor"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors border-b border-emerald-100 dark:border-emerald-900/30"
                      >
                        <Store className="w-4 h-4 text-emerald-500" /> Vendor Hub (My Store)
                      </Link>
                    ) : (
                      <Link
                        to="/become-a-vendor"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-amber-600 dark:text-amber-400 font-semibold hover:bg-secondary-100 dark:hover:bg-secondary-700"
                      >
                        <Store className="w-4 h-4" /> My Store / Become Vendor
                      </Link>
                    )}
                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                    >
                      <User className="w-4 h-4" /> Profile Dashboard
                    </Link>
                    <Link
                      to="/my-service-profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                    >
                      <User className="w-4 h-4" /> My Service Profile
                    </Link>
                    <Link
                      to="/my-tickets"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                    >
                      <Ticket className="w-4 h-4" /> My Tickets
                    </Link>
                    <Link
                      to="/my-pre-orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                    >
                      <Package className="w-4 h-4" /> My Pre-Orders
                    </Link>
                    <Link
                      to="/my-layaways"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                    >
                      <Package className="w-4 h-4" /> My Layaways
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-accent-600 hover:bg-secondary-100 dark:hover:bg-secondary-700"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="premium-button-primary px-5 py-2 rounded-full text-sm">
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 text-secondary-600 dark:text-secondary-300 rounded-full"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-md"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-secondary-900/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-primary-500 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-primary-600/50">
          <span className="text-lg font-bold text-secondary-900">Menu</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-secondary-900 hover:bg-primary-600/30 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-32 space-y-8">
          <form onSubmit={handleSearch} className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-none rounded-full bg-white text-secondary-900 focus:ring-2 focus:ring-secondary-900 transition-all placeholder:text-secondary-400 shadow-sm"
            />
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-secondary-400" />
          </form>

          <div>
            <h3 className="text-xs font-bold text-secondary-900/60 uppercase tracking-wider mb-4">Services</h3>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/products" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center py-3 bg-white hover:bg-secondary-50 text-secondary-900 rounded-xl text-sm font-medium transition-colors shadow-sm">Products</Link>
              <Link to="/products?condition=used" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center py-3 bg-white hover:bg-secondary-50 text-secondary-900 rounded-xl text-sm font-medium transition-colors shadow-sm">Second Hand</Link>
              <Link to="/sell" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center py-3 bg-secondary-900 hover:bg-secondary-800 text-white rounded-xl text-sm font-bold transition-colors shadow-sm">Sell Item</Link>
              <Link to="/professionals" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center py-3 bg-white hover:bg-secondary-50 text-secondary-900 rounded-xl text-sm font-medium transition-colors shadow-sm">Hire Pro</Link>
              <Link to="/barter" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center py-3 bg-white hover:bg-secondary-50 text-secondary-900 rounded-xl text-sm font-medium transition-colors shadow-sm">Barter</Link>
              <Link to="/hire-purchase" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center py-3 bg-white hover:bg-secondary-50 text-secondary-900 rounded-xl text-sm font-medium transition-colors shadow-sm">Hire Purchase</Link>
              <Link to="/raffles" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center py-3 bg-white hover:bg-secondary-50 text-secondary-900 rounded-xl text-sm font-medium transition-colors shadow-sm">Raffles</Link>
              <Link to="/layaway" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center py-3 bg-white hover:bg-secondary-50 text-secondary-900 rounded-xl text-sm font-medium transition-colors shadow-sm">Layaway</Link>
              <Link to="/pre-orders" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center col-span-2 py-3 bg-white hover:bg-secondary-50 text-secondary-900 rounded-xl text-sm font-medium transition-colors shadow-sm">Pre-Orders</Link>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-secondary-900/60 uppercase tracking-wider mb-4">Account</h3>
            <div className="flex flex-col space-y-1">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="py-3 px-4 text-secondary-900 hover:bg-primary-600/30 rounded-xl font-medium transition-colors">My Profile</Link>
                  <Link to="/wishlist" onClick={() => setMobileMenuOpen(false)} className="py-3 px-4 text-secondary-900 hover:bg-primary-600/30 rounded-xl font-medium transition-colors">My Wishlist</Link>
                  <Link to="/my-tickets" onClick={() => setMobileMenuOpen(false)} className="py-3 px-4 text-secondary-900 hover:bg-primary-600/30 rounded-xl font-medium transition-colors">My Tickets</Link>
                  <Link to="/my-pre-orders" onClick={() => setMobileMenuOpen(false)} className="py-3 px-4 text-secondary-900 hover:bg-primary-600/30 rounded-xl font-medium transition-colors">My Pre-Orders</Link>
                  <Link to="/my-layaways" onClick={() => setMobileMenuOpen(false)} className="py-3 px-4 text-secondary-900 hover:bg-primary-600/30 rounded-xl font-medium transition-colors">My Layaways</Link>
                  <Link to="/messages" onClick={() => setMobileMenuOpen(false)} className="py-3 px-4 text-secondary-900 hover:bg-primary-600/30 rounded-xl font-medium transition-colors">Messages</Link>
                  <button onClick={() => { setMobileMenuOpen(false); handleLogout(); }} className="w-full text-left py-3 px-4 text-accent-700 hover:bg-primary-600/30 rounded-xl font-bold transition-colors">Logout</button>
                </>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center w-full py-3.5 bg-secondary-900 hover:bg-secondary-800 text-white rounded-xl font-bold transition-colors shadow-sm">Login to Your Account</Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
export { Navbar };
