import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import vendorService from '../../services/vendorService';
import { BarChart2, Package, ShoppingCart, DollarSign, RefreshCw, ArrowRight, Plus, TrendingUp, Clock, Percent, Scale, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

const VendorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    vendorService.getDashboard()
      .then(res => setData(res?.data?.data || res?.data || res || null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentOrders = data?.recent_orders || [];
  const store = data?.store || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Welcome back, {store.name}!
          </h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1 flex items-center gap-1.5">
            <span className={`inline-block w-2 h-2 rounded-full ${store.status === 'active' ? 'bg-emerald-500' : 'bg-yellow-500'}`} />
            Store is <span className="font-semibold capitalize">{store.status}</span>
          </p>
        </div>
        <Link
          to="/vendor/products/new"
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Products', value: stats.total_products ?? 0, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/20' },
          { label: 'Active Listings', value: stats.active_products ?? 0, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Total Orders', value: stats.total_orders ?? 0, icon: ShoppingCart, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/20' },
          { label: 'Total Revenue', value: `GHS ${(stats.total_revenue ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-950/20' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-5 shadow-sm">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-black text-secondary-900 dark:text-white">{value}</p>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Permitted Selling Models Card Grid */}
      <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-base sm:text-lg text-secondary-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary-500" /> My Store Selling Capabilities & Models
            </h2>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">
              These are the e-commerce and specialized selling models currently authorized for your store by Shop Viotor administration.
            </p>
          </div>
          <span className="text-xxs font-extrabold uppercase px-2.5 py-1 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-lg border border-primary-200 dark:border-primary-800 hidden sm:inline-block">
            Tiered Access
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* E-Commerce (Always active) */}
          <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/10 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Enabled
              </span>
            </div>
            <div>
              <p className="font-bold text-sm text-secondary-900 dark:text-white">Standard E-Commerce</p>
              <p className="text-xxs text-secondary-500 dark:text-secondary-400 mt-0.5">Direct checkout & cart purchases</p>
            </div>
          </div>

          {/* Layaway */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${store.can_offer_layaway ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/10' : 'border-secondary-200 dark:border-secondary-800 bg-secondary-50/60 dark:bg-secondary-850/40 opacity-75'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center ${store.can_offer_layaway ? 'bg-blue-600' : 'bg-secondary-400 dark:bg-secondary-700'}`}>
                <Clock className="w-4 h-4" />
              </div>
              {store.can_offer_layaway ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Enabled
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              )}
            </div>
            <div>
              <p className="font-bold text-sm text-secondary-900 dark:text-white">Layaway / Susu Plans</p>
              <p className="text-xxs text-secondary-500 dark:text-secondary-400 mt-0.5">Installment box reservations</p>
            </div>
          </div>

          {/* Hire Purchase */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${store.can_offer_hire_purchase ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/10' : 'border-secondary-200 dark:border-secondary-800 bg-secondary-50/60 dark:bg-secondary-850/40 opacity-75'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center ${store.can_offer_hire_purchase ? 'bg-primary-600' : 'bg-secondary-400 dark:bg-secondary-700'}`}>
                <Percent className="w-4 h-4" />
              </div>
              {store.can_offer_hire_purchase ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Enabled
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              )}
            </div>
            <div>
              <p className="font-bold text-sm text-secondary-900 dark:text-white">Hire Purchase</p>
              <p className="text-xxs text-secondary-500 dark:text-secondary-400 mt-0.5">Credit & financing plans</p>
            </div>
          </div>

          {/* Pre-Orders */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${store.can_offer_preorders ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/10' : 'border-secondary-200 dark:border-secondary-800 bg-secondary-50/60 dark:bg-secondary-850/40 opacity-75'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center ${store.can_offer_preorders ? 'bg-orange-600' : 'bg-secondary-400 dark:bg-secondary-700'}`}>
                <Package className="w-4 h-4" />
              </div>
              {store.can_offer_preorders ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Enabled
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              )}
            </div>
            <div>
              <p className="font-bold text-sm text-secondary-900 dark:text-white">Pre-Orders</p>
              <p className="text-xxs text-secondary-500 dark:text-secondary-400 mt-0.5">Early release bookings</p>
            </div>
          </div>

          {/* Trade-Ins */}
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${store.can_offer_trades ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/10' : 'border-secondary-200 dark:border-secondary-800 bg-secondary-50/60 dark:bg-secondary-850/40 opacity-75'}`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`w-8 h-8 rounded-lg text-white flex items-center justify-center ${store.can_offer_trades ? 'bg-purple-600' : 'bg-secondary-400 dark:bg-secondary-700'}`}>
                <Scale className="w-4 h-4" />
              </div>
              {store.can_offer_trades ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Enabled
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Locked
                </span>
              )}
            </div>
            <div>
              <p className="font-bold text-sm text-secondary-900 dark:text-white">Trade-In / Barter</p>
              <p className="text-xxs text-secondary-500 dark:text-secondary-400 mt-0.5">Accept old device swaps</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Manage Products', desc: 'Add, edit, or remove your product listings.', href: '/vendor/products', icon: Package, color: 'bg-blue-600' },
          { title: 'View Orders', desc: 'See all customer orders containing your products.', href: '/vendor/orders', icon: ShoppingCart, color: 'bg-orange-600' },
          { title: 'Store Settings', desc: 'Update your store profile, logo, and contact info.', href: '/vendor/settings', icon: BarChart2, color: 'bg-primary-600' },
        ].map(({ title, desc, href, icon: Icon, color }) => (
          <Link key={title} to={href} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-secondary-900 dark:text-white">{title}</p>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">{desc}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-secondary-400 group-hover:text-primary-500 transition-colors" />
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-secondary-100 dark:border-secondary-800">
          <h2 className="font-bold text-secondary-900 dark:text-white">Recent Orders</h2>
          <Link to="/vendor/orders" className="text-sm text-primary-600 font-semibold hover:underline flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-secondary-500 dark:text-secondary-400">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-secondary-200 dark:text-secondary-700" />
            <p className="font-semibold">No orders yet</p>
            <p className="text-sm">Start listing products to receive orders!</p>
          </div>
        ) : (
          <div className="divide-y divide-secondary-100 dark:divide-secondary-800">
            {recentOrders.map((order, idx) => (
              <div key={idx} className="flex items-center gap-4 p-4 hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30 transition-colors">
                <div className="flex-1">
                  <p className="font-semibold text-sm text-secondary-900 dark:text-white">{order.product}</p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">Qty: {order.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-primary-600 dark:text-primary-400">GHS {order.total?.toLocaleString()}</p>
                  <span className={`text-xxs font-bold px-2 py-0.5 rounded-full ${order.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/20 dark:text-yellow-400'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;
export { VendorDashboard };
