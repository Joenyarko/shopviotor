import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';

// Public Pages
import Landing from '../pages/Landing';
const ProductList = React.lazy(() => import('../pages/catalog/ProductList'));
const ProductDetails = React.lazy(() => import('../pages/catalog/ProductDetails'));
const Categories = React.lazy(() => import('../pages/catalog/Categories'));
const About = React.lazy(() => import('../pages/static/About'));
const Contact = React.lazy(() => import('../pages/static/Contact'));
const FAQ = React.lazy(() => import('../pages/static/FAQ'));
const Privacy = React.lazy(() => import('../pages/static/Privacy'));
const Terms = React.lazy(() => import('../pages/static/Terms'));
const NotFound = React.lazy(() => import('../pages/static/NotFound'));

// Auth Pages
const Login = React.lazy(() => import('../pages/auth/Login'));
const Register = React.lazy(() => import('../pages/auth/Register'));
const ForgotPassword = React.lazy(() => import('../pages/auth/ForgotPassword'));
const ResetPassword = React.lazy(() => import('../pages/auth/ResetPassword'));
const GoogleCallback = React.lazy(() => import('../pages/auth/GoogleCallback'));

// Customer Protected Pages
const Dashboard = React.lazy(() => import('../pages/customer/Dashboard'));
const Wishlist = React.lazy(() => import('../pages/customer/Wishlist'));
const Messages = React.lazy(() => import('../pages/customer/Messages'));
const Orders = React.lazy(() => import('../pages/customer/Orders'));
const MyTickets = React.lazy(() => import('../pages/customer/MyTickets'));
const SellRequest = React.lazy(() => import('../pages/services/SellRequest'));
const BarterRequest = React.lazy(() => import('../pages/services/BarterRequest'));
const HirePurchase = React.lazy(() => import('../pages/services/HirePurchase'));
const Layaway = React.lazy(() => import('../pages/services/Layaway'));
const PreOrders = React.lazy(() => import('../pages/services/PreOrders'));
const PreOrderDetail = React.lazy(() => import('../pages/services/PreOrderDetail'));
const MyPreOrders = React.lazy(() => import('../pages/customer/MyPreOrders'));
const Raffles = React.lazy(() => import('../pages/services/Raffles'));
const RaffleDetail = React.lazy(() => import('../pages/services/RaffleDetail'));
const RaffleWinners = React.lazy(() => import('../pages/services/RaffleWinners'));
const Checkout = React.lazy(() => import('../pages/commerce/Checkout'));
const PaymentCallback = React.lazy(() => import('../pages/commerce/PaymentCallback'));
const Cart = React.lazy(() => import('../pages/commerce/Cart'));

// Admin Protected Pages
const AdminDashboard = React.lazy(() => import('../pages/admin/Dashboard'));
const AdminUsers = React.lazy(() => import('../pages/admin/Users'));
const AdminProducts = React.lazy(() => import('../pages/admin/Products'));
const AdminOrders = React.lazy(() => import('../pages/admin/Orders'));
const AdminPayments = React.lazy(() => import('../pages/admin/Payments'));
const AdminTradeRequests = React.lazy(() => import('../pages/admin/TradeRequests'));
const AdminSellRequests = React.lazy(() => import('../pages/admin/SellRequests'));
const AdminRaffles = React.lazy(() => import('../pages/admin/Raffles'));
const Banners = React.lazy(() => import('../pages/admin/Banners'));
const AdminReports = React.lazy(() => import('../pages/admin/Reports'));
const AdminSettings = React.lazy(() => import('../pages/admin/Settings'));
const AdminPopups = React.lazy(() => import('../pages/admin/AdminPopups'));
// const AdsManager = React.lazy(() => import('../pages/admin/AdsManager'));
const AdminCategories = React.lazy(() => import('../pages/admin/Categories'));
const AdminBrands = React.lazy(() => import('../pages/admin/Brands'));
const AdminCampaigns = React.lazy(() => import('../pages/admin/Campaigns'));
const AdminFlashSales = React.lazy(() => import('../pages/admin/FlashSales'));
const AdminCollections = React.lazy(() => import('../pages/admin/Collections'));
const AdminHirePurchase = React.lazy(() => import('../pages/admin/HirePurchase'));
const AdminLayaway = React.lazy(() => import('../pages/admin/AdminLayaway'));
const AdminPreOrders = React.lazy(() => import('../pages/admin/AdminPreOrders'));
const ServiceCategories = React.lazy(() => import('../pages/admin/ServiceCategories'));
const VendorStores = React.lazy(() => import('../pages/admin/VendorStores'));
import VendorLayout from '../layouts/VendorLayout';
const VendorDashboard = React.lazy(() => import('../pages/vendor/VendorDashboard'));
const VendorProducts = React.lazy(() => import('../pages/vendor/VendorProducts'));
const VendorOrders = React.lazy(() => import('../pages/vendor/VendorOrders'));
const VendorSettings = React.lazy(() => import('../pages/vendor/VendorSettings'));
const VendorWallet = React.lazy(() => import('../pages/vendor/VendorWallet'));
const AdminPayouts = React.lazy(() => import('../pages/admin/AdminPayouts'));
const StoreApplication = React.lazy(() => import('../pages/vendor/StoreApplication'));
const StoreList = React.lazy(() => import('../pages/catalog/StoreList'));
const StoreFront = React.lazy(() => import('../pages/catalog/StoreFront'));
const LayawayDetail = React.lazy(() => import('../pages/services/LayawayDetail'));
const MyLayaways = React.lazy(() => import('../pages/customer/MyLayaways'));
const ManageServiceProfile = React.lazy(() => import('../pages/customer/ManageServiceProfile'));
const ProfessionalsDirectory = React.lazy(() => import('../pages/services/ProfessionalsDirectory'));
const ProfessionalProfile = React.lazy(() => import('../pages/services/ProfessionalProfile'));

// Helper Component: Protect user routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="h-screen flex items-center justify-center dark:bg-secondary-950 dark:text-white">Loading session...</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

import AdminOtpVerification from '../components/auth/AdminOtpVerification';

// Helper Component: Protect admin routes
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const [verified, setVerified] = React.useState(() => {
    return sessionStorage.getItem('admin_2fa_verified') === 'true';
  });

  if (loading) return <div className="h-screen flex items-center justify-center dark:bg-secondary-950 dark:text-white">Loading session...</div>;
  if (!isAuthenticated || !isAdmin()) return <Navigate to="/" replace />;

  if (!verified) {
    return <AdminOtpVerification onVerified={() => setVerified(true)} />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <React.Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div></div>}>
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
        <Route path="/professionals" element={<ProfessionalsDirectory />} />
        <Route path="/professionals/:slug" element={<ProfessionalProfile />} />
      </Route>

      {/* ─── AUTHENTICATION FLOW ───────────────────────────────────────────── */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<GoogleCallback />} />
      </Route>

      {/* ─── CUSTOMER PORTAL FLOW (PROTECTED) ──────────────────────────────── */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/customer/dashboard" element={<Navigate to="/dashboard" replace />} />
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
        
        <Route path="/my-service-profile" element={<ProtectedRoute><ManageServiceProfile /></ProtectedRoute>} />

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
        <Route path="/vendor/orders" element={<VendorOrders />} />
        <Route path="/vendor/settings" element={<VendorSettings />} />
        <Route path="/vendor/wallet" element={<VendorWallet />} />
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
        <Route path="/admin/service-categories" element={<ServiceCategories />} />
        <Route path="/admin/vendor-stores" element={<VendorStores />} />
        <Route path="/admin/raffles" element={<AdminRaffles />} />
        <Route path="/admin/banners" element={<Banners />} />
        <Route path="/admin/popups" element={<AdminPopups />} />
        {/* <Route path="/admin/ads" element={<AdsManager />} /> */}
        <Route path="/admin/campaigns" element={<AdminCampaigns />} />
        <Route path="/admin/flash-sales" element={<AdminFlashSales />} />
        <Route path="/admin/collections" element={<AdminCollections />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/payouts" element={<AdminPayouts />} />
      </Route>

      {/* ─── FALLBACKS ─────────────────────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />

    </Routes>
      </React.Suspense>
  );
};

export default AppRoutes;
export { AppRoutes };
