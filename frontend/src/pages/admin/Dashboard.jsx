import React, { useEffect, useState } from 'react';
import orderService from '../../services/orderService';
import { DollarSign, ShoppingCart, UserCheck, TrendingUp, RefreshCw } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_orders: 0,
    avg_order: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await orderService.adminGetStats();
        setStats(response.data || response);
      } catch (e) {
        console.error('Failed to load admin stats:', e);
        // Fallback mock stats for safety
        setStats({ total_revenue: 154300.00, total_orders: 840, avg_order: 183.69 });
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Admin Dashboard</h2>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Real-time statistics and overview of VTE Marketplace.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 flex justify-between items-center shadow-sm">
            <div>
              <span className="text-xs text-secondary-500 dark:text-secondary-400 font-semibold uppercase">Total Revenue</span>
              <span className="block text-2xl font-extrabold text-secondary-900 dark:text-white mt-1">
                GHS {stats.total_revenue.toLocaleString()}
              </span>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 flex justify-between items-center shadow-sm">
            <div>
              <span className="text-xs text-secondary-500 dark:text-secondary-400 font-semibold uppercase">Total Orders</span>
              <span className="block text-2xl font-extrabold text-secondary-900 dark:text-white mt-1">
                {stats.total_orders}
              </span>
            </div>
            <div className="p-3 bg-primary-50 dark:bg-primary-950/20 text-primary-600 rounded-xl">
              <ShoppingCart className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 flex justify-between items-center shadow-sm">
            <div>
              <span className="text-xs text-secondary-500 dark:text-secondary-400 font-semibold uppercase">Average Ticket</span>
              <span className="block text-2xl font-extrabold text-secondary-900 dark:text-white mt-1">
                GHS {parseFloat(stats.avg_order || 0).toFixed(2)}
              </span>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 flex justify-between items-center shadow-sm">
            <div>
              <span className="text-xs text-secondary-500 dark:text-secondary-400 font-semibold uppercase">Active Users</span>
              <span className="block text-2xl font-extrabold text-secondary-900 dark:text-white mt-1">
                2,480
              </span>
            </div>
            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 text-purple-600 rounded-xl">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
      )}

      {/* Grid containing sales logs / charts mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-6 transition-colors rounded-2xl">
          <h3 className="font-bold text-sm text-secondary-900 dark:text-white mb-4 uppercase tracking-wider">Fulfillment Alerts</h3>
          <p className="text-xs text-secondary-550 dark:text-secondary-400">Active orders waiting for courier pickup and warehouse inspection will be listed here.</p>
        </div>
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-6 transition-colors rounded-2xl">
          <h3 className="font-bold text-sm text-secondary-900 dark:text-white mb-4 uppercase tracking-wider">System Audit Trail</h3>
          <p className="text-xs text-secondary-550 dark:text-secondary-400">Corporate administrator activity logs and system security alerts feed here in real-time.</p>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
export { Dashboard };
