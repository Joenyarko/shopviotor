import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages
import Landing from '../pages/Landing';
import ProductList from '../pages/catalog/ProductList';
import ProductDetails from '../pages/catalog/ProductDetails';
import Categories from '../pages/catalog/Categories';
import About from '../pages/static/About';
import Contact from '../pages/static/Contact';
import FAQ from '../pages/static/FAQ';
import Privacy from '../pages/static/Privacy';
import Terms from '../pages/static/Terms';
import NotFound from '../pages/static/NotFound';

// Auth Pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';

// Customer Protected Pages
import Dashboard from '../pages/customer/Dashboard';
import Wishlist from '../pages/customer/Wishlist';
import Messages from '../pages/customer/Messages';
import Orders from '../pages/customer/Orders';
import MyTickets from '../pages/customer/MyTickets';
import SellRequest from '../pages/services/SellRequest';
import BarterRequest from '../pages/services/BarterRequest';
import HirePurchase from '../pages/services/HirePurchase';
import Layaway from '../pages/services/Layaway';
import PreOrders from '../pages/services/PreOrders';
import PreOrderDetail from '../pages/services/PreOrderDetail';
import MyPreOrders from '../pages/customer/MyPreOrders';
import Raffles from '../pages/services/Raffles';
import RaffleDetail from '../pages/services/RaffleDetail';
import RaffleWinners from '../pages/services/RaffleWinners';
import Checkout from '../pages/commerce/Checkout';
import PaymentCallback from '../pages/commerce/PaymentCallback';
import Cart from '../pages/commerce/Cart';

// Admin Protected Pages
import AdminDashboard from '../pages/admin/Dashboard';
import AdminUsers from '../pages/admin/Users';
import AdminProducts from '../pages/admin/Products';
import AdminOrders from '../pages/admin/Orders';
import AdminPayments from '../pages/admin/Payments';
import AdminTradeRequests from '../pages/admin/TradeRequests';
import AdminSellRequests from '../pages/admin/SellRequests';
import AdminRaffles from '../pages/admin/Raffles';
import AdminReports from '../pages/admin/Reports';
import AdminSettings from '../pages/admin/Settings';
import AdsManager from '../pages/admin/AdsManager';
import AdminCategories from '../pages/admin/Categories';
import AdminBrands from '../pages/admin/Brands';
import AdminCampaigns from '../pages/admin/Campaigns';
import AdminFlashSales from '../pages/admin/FlashSales';
import AdminCollections from '../pages/admin/Collections';
import AdminHirePurchase from '../pages/admin/HirePurchase';
import AdminLayaway from '../pages/admin/AdminLayaway';
import AdminPreOrders from '../pages/admin/AdminPreOrders';
import VendorStores from '../pages/admin/VendorStores';
import VendorLayout from '../layouts/VendorLayout';
import VendorDashboard from '../pages/vendor/VendorDashboard';
import VendorProducts from '../pages/vendor/VendorProducts';
import StoreApplication from '../pages/vendor/StoreApplication';
import StoreList from '../pages/catalog/StoreList';
import StoreFront from '../pages/catalog/StoreFront';
import LayawayDetail from '../pages/services/LayawayDetail';
import MyLayaways from '../pages/customer/MyLayaways';

// Helper Component: Protect user routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center dark:bg-secondary-950 dark:text-white">Loading session...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Helper Component: Protect admin routes
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center dark:bg-secondary-950 dark:text-white">Loading session...</div>;
  return isAuthenticated && isAdmin() ? children : <Navigate to="/" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      
      {/* ─── PUBLIC STOREFRONT FLOW ────────────────────────────────────────── */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:uuid" element={<ProductDetails />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cart" element={<Cart />} />
        {/* Vendor Storefronts (public) */}
        <Route path="/shops" element={<StoreList />} />
        <Route path="/shops/:slug" element={<StoreFront />} />
      </Route>

      {/* ─── AUTHENTICATION FLOW ───────────────────────────────────────────── */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* ─── CUSTOMER PORTAL FLOW (PROTECTED) ──────────────────────────────── */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/my-tickets" element={<ProtectedRoute><MyTickets /></ProtectedRoute>} />
        
        {/* Marketplace Services */}
        <Route path="/sell" element={<ProtectedRoute><SellRequest /></ProtectedRoute>} />
        <Route path="/barter" element={<ProtectedRoute><BarterRequest /></ProtectedRoute>} />
        <Route path="/hire-purchase" element={<ProtectedRoute><HirePurchase /></ProtectedRoute>} />
        <Route path="/layaway" element={<ProtectedRoute><Layaway /></ProtectedRoute>} />
        <Route path="/layaway/start" element={<ProtectedRoute><LayawayDetail /></ProtectedRoute>} />
        <Route path="/my-layaways" element={<ProtectedRoute><MyLayaways /></ProtectedRoute>} />
        
        <Route path="/pre-orders" element={<ProtectedRoute><PreOrders /></ProtectedRoute>} />
        <Route path="/pre-orders/:uuid" element={<ProtectedRoute><PreOrderDetail /></ProtectedRoute>} />
        <Route path="/my-pre-orders" element={<ProtectedRoute><MyPreOrders /></ProtectedRoute>} />

        <Route path="/become-a-vendor" element={<ProtectedRoute><StoreApplication /></ProtectedRoute>} />
        <Route path="/raffles" element={<ProtectedRoute><Raffles /></ProtectedRoute>} />
        <Route path="/raffles/:uuid" element={<ProtectedRoute><RaffleDetail /></ProtectedRoute>} />
        <Route path="/raffles/winners" element={<ProtectedRoute><RaffleWinners /></ProtectedRoute>} />
        
        {/* Commerce */}
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/payments/callback/:gateway" element={<ProtectedRoute><PaymentCallback /></ProtectedRoute>} />
      </Route>

      {/* ─── VENDOR DASHBOARD (PROTECTED) ───────────────────────────────────── */}
      <Route element={<ProtectedRoute><VendorLayout /></ProtectedRoute>}>
        <Route path="/vendor" element={<VendorDashboard />} />
        <Route path="/vendor/products" element={<VendorProducts />} />
      </Route>

      {/* ─── ADMIN FLOW (PROTECTED) ────────────────────────────────────────── */}
      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/brands" element={<AdminBrands />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/trades" element={<AdminTradeRequests />} />
        <Route path="/admin/sells" element={<AdminSellRequests />} />
        <Route path="/admin/hire-purchase" element={<AdminHirePurchase />} />
        <Route path="/admin/layaway" element={<AdminLayaway />} />
        <Route path="/admin/pre-orders" element={<AdminPreOrders />} />
        <Route path="/admin/vendor-stores" element={<VendorStores />} />
        <Route path="/admin/raffles" element={<AdminRaffles />} />
        <Route path="/admin/ads" element={<AdsManager />} />
        <Route path="/admin/campaigns" element={<AdminCampaigns />} />
        <Route path="/admin/flash-sales" element={<AdminFlashSales />} />
        <Route path="/admin/collections" element={<AdminCollections />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Route>

      {/* ─── FALLBACKS ─────────────────────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />

    </Routes>
  );
};

export default AppRoutes;
export { AppRoutes };
