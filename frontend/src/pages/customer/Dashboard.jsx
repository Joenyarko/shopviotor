import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import orderService from '../../services/orderService';
import tradeService from '../../services/tradeService';
import sellRequestService from '../../services/sellRequestService';
import { ShoppingBag, Scale, Truck, User, Key, CheckCircle, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [trades, setTrades] = useState([]);
  const [sells, setSells] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        const [ordersRes, tradesRes, sellsRes] = await Promise.all([
          orderService.getOrders({ per_page: 5 }),
          tradeService.getTrades({ per_page: 5 }),
          sellRequestService.getSells({ per_page: 5 }),
        ]);

        setOrders(ordersRes.data?.data || ordersRes.data || []);
        setTrades(tradesRes.data?.data || tradesRes.data || []);
        setSells(sellsRes.data?.data || sellsRes.data || []);
      } catch (e) {
        console.error('Failed to load user portal overview:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPortalData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white">Customer Dashboard</h1>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Hello, {user?.first_name}! View and manage your deals and swaps here.</p>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">My Orders</span>
            <span className="block text-3xl font-extrabold text-secondary-900 dark:text-white mt-1">
              {loading ? '...' : orders.length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-950/20 text-primary-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Swaps / Trades</span>
            <span className="block text-3xl font-extrabold text-secondary-900 dark:text-white mt-1">
              {loading ? '...' : trades.length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Sell Requests</span>
            <span className="block text-3xl font-extrabold text-secondary-900 dark:text-white mt-1">
              {loading ? '...' : sells.length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600">
            <Truck className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Profile Card details */}
        <section className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 transition-colors">
          <h2 className="text-lg font-bold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-500" /> Account Profile
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="block text-xs text-secondary-450">Full Name</span>
                <span className="font-semibold text-secondary-900 dark:text-white">{user?.name}</span>
              </div>
              <div>
                <span className="block text-xs text-secondary-450">Email Address</span>
                <span className="font-semibold text-secondary-900 dark:text-white">{user?.email}</span>
              </div>
              <div>
                <span className="block text-xs text-secondary-450">Phone Helpline</span>
                <span className="font-semibold text-secondary-900 dark:text-white">{user?.phone || 'Not provided'}</span>
              </div>
              <div>
                <span className="block text-xs text-secondary-450">User Role</span>
                <span className="font-semibold text-secondary-900 dark:text-white capitalize">{user?.role}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Latest Activity logs / list */}
        <section className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 transition-colors">
          <h2 className="text-lg font-bold text-secondary-900 dark:text-white mb-4">Latest Transactions</h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-10 bg-secondary-100 dark:bg-secondary-800 rounded-lg" />
              <div className="h-10 bg-secondary-100 dark:bg-secondary-800 rounded-lg" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-xs text-secondary-500 dark:text-secondary-400">No recent transactions recorded.</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map(order => (
                <div key={order.id || order.uuid} className="flex justify-between items-center text-sm p-3 border border-secondary-100 dark:border-secondary-800 rounded-lg">
                  <div>
                    <span className="font-bold text-secondary-900 dark:text-white">Order {order.order_number}</span>
                    <span className="block text-xxs text-secondary-500 dark:text-secondary-400">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="font-semibold capitalize text-primary-600">{order.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
export { Dashboard };
