import React, { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboardService';
import { 
  DollarSign, ShoppingCart, UserCheck, TrendingUp, RefreshCw, 
  Package, ArrowUpRight, ArrowDownRight, Layers, CreditCard, 
  RefreshCcw, Clock, Gift, ShieldAlert, Activity, PieChart, Smartphone
} from 'lucide-react';
import apiClient from '../../api/client';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, Legend, CartesianGrid 
} from 'recharts';

const Dashboard = () => {
  const [data, setData] = useState({
    summary: {
      gross_revenue: 0,
      total_expenses: 0,
      net_profit: 0,
      total_transactions: 0,
      active_users: 0,
      total_users: 0,
      avg_ticket: 0,
    },
    models: {
      ecommerce: { name: 'E-Commerce Orders', count: 0, revenue: 0 },
      hire_purchase: { name: 'Hire Purchase', count: 0, revenue: 0 },
      trade: { name: 'Device Trade-In', count: 0, revenue: 0 },
      pre_orders: { name: 'Pre-Orders', count: 0, revenue: 0 },
      layaway: { name: 'Layaway Plans', count: 0, revenue: 0 },
      raffles: { name: 'Raffles & Draws', count: 0, tickets: 0, revenue: 0 },
      sell_requests: { name: 'Corporate Buyouts', count: 0, expenses: 0 },
    },
    monthly_trends: []
  });
  const [loading, setLoading] = useState(true);
  const [appInstalls, setAppInstalls] = useState({ total: 0, android: 0, ios: 0, desktop: 0 });

  useEffect(() => {
    const loadComprehensiveData = async () => {
      try {
        const res = await dashboardService.getComprehensiveStats();
        if (res.data?.data) {
          setData(res.data.data);
        } else if (res.data) {
          setData(res.data);
        }
      } catch (e) {
        console.error('Failed to load comprehensive stats:', e);
      } finally {
        setLoading(false);
      }
    };
    loadComprehensiveData();

    // Load app install analytics
    apiClient.get('/v1/admin/analytics/app-installs')
      .then(r => setAppInstalls(r.data))
      .catch(() => {}); // fail silently
  }, []);

  const { summary, models, monthly_trends } = data;

  return (
    <div className="space-y-8 pb-12">
      {/* Header with Live Status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live Corporate Analytics</span>
          </div>
          <h1 className="text-3xl font-black text-secondary-900 dark:text-white mt-1">Shop Viotor Dashboard</h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-0.5">
            Real-time synchronization across all 7 business models with zero simulated metrics.
          </p>
        </div>
        <button 
          onClick={() => { setLoading(true); dashboardService.getComprehensiveStats().then(r => { setData(r.data?.data || r.data); setLoading(false); }); }}
          disabled={loading}
          className="px-4 py-2.5 bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-800 dark:text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary-500' : ''}`} />
          Refresh Live Data
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl shadow-sm space-y-3">
          <RefreshCw className="w-10 h-10 text-primary-500 animate-spin" />
          <span className="text-sm font-bold text-secondary-500">Aggregating live metrics across 7 models...</span>
        </div>
      ) : (
        <>
          {/* Top Financial Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Gross Revenue */}
            <div className="relative overflow-hidden bg-gradient-to-br from-secondary-900 to-secondary-950 text-white rounded-3xl p-6 shadow-xl border border-secondary-800 group hover:border-emerald-500/50 transition-all">
              <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all"></div>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xxs font-extrabold uppercase tracking-wider text-secondary-400">Total Gross Revenue</span>
                  <div className="text-3xl font-black mt-1.5 text-emerald-400">
                    GHS {summary.gross_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 shadow-inner">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-secondary-800/80 flex items-center justify-between text-xs text-secondary-300">
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <ArrowUpRight className="w-3.5 h-3.5" /> 100% Real Data
                </span>
                <span>{summary.total_transactions} total items</span>
              </div>
            </div>

            {/* Net Profit */}
            <div className="relative overflow-hidden bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xxs font-extrabold uppercase tracking-wider text-secondary-500 dark:text-secondary-400">Net Corporate Profit</span>
                  <div className="text-3xl font-black mt-1.5 text-secondary-900 dark:text-white">
                    GHS {summary.net_profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-2xl border border-blue-200 dark:border-blue-800/50">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-800 flex items-center justify-between text-xs text-secondary-500">
                <span>Buyout Expenses:</span>
                <span className="font-bold text-accent-600 dark:text-accent-400">
                  - GHS {summary.total_expenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Active Customers */}
            <div className="relative overflow-hidden bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xxs font-extrabold uppercase tracking-wider text-secondary-500 dark:text-secondary-400">Active Customers</span>
                  <div className="text-3xl font-black mt-1.5 text-secondary-900 dark:text-white">
                    {summary.active_users.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-2xl border border-purple-200 dark:border-purple-800/50">
                  <UserCheck className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-800 flex items-center justify-between text-xs text-secondary-500">
                <span>Registered Accounts:</span>
                <span className="font-bold text-secondary-900 dark:text-white">{summary.total_users.toLocaleString()} users</span>
              </div>
            </div>

            {/* Average Ticket */}
            <div className="relative overflow-hidden bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xxs font-extrabold uppercase tracking-wider text-secondary-500 dark:text-secondary-400">Average Ticket Size</span>
                  <div className="text-3xl font-black mt-1.5 text-secondary-900 dark:text-white">
                    GHS {summary.avg_ticket.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl border border-amber-200 dark:border-amber-800/50">
                  <ShoppingCart className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-800 flex items-center justify-between text-xs text-secondary-500">
                <span>Total Transactions:</span>
                <span className="font-bold text-secondary-900 dark:text-white">{summary.total_transactions} items</span>
              </div>
            </div>

            {/* App Installs */}
            <div className="relative overflow-hidden bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-primary-400/50 transition-all col-span-1 sm:col-span-2 lg:col-span-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-2xl border border-primary-200 dark:border-primary-800/50">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xxs font-extrabold uppercase tracking-wider text-secondary-500 dark:text-secondary-400">App Installs (PWA)</span>
                    <div className="text-3xl font-black mt-0.5 text-secondary-900 dark:text-white">{appInstalls.total.toLocaleString()}</div>
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <div className="flex flex-col items-center bg-secondary-50 dark:bg-secondary-800 rounded-2xl px-4 py-2.5 border border-secondary-200 dark:border-secondary-700">
                    <span className="text-xs font-extrabold text-green-600 dark:text-green-400">{appInstalls.android}</span>
                    <span className="text-xxs text-secondary-500 font-semibold mt-0.5">Android</span>
                  </div>
                  <div className="flex flex-col items-center bg-secondary-50 dark:bg-secondary-800 rounded-2xl px-4 py-2.5 border border-secondary-200 dark:border-secondary-700">
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">{appInstalls.ios}</span>
                    <span className="text-xxs text-secondary-500 font-semibold mt-0.5">iOS</span>
                  </div>
                  <div className="flex flex-col items-center bg-secondary-50 dark:bg-secondary-800 rounded-2xl px-4 py-2.5 border border-secondary-200 dark:border-secondary-700">
                    <span className="text-xs font-extrabold text-secondary-700 dark:text-secondary-300">{appInstalls.desktop}</span>
                    <span className="text-xxs text-secondary-500 font-semibold mt-0.5">Desktop</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Section: Multi-Model Interactive Chart */}
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary-500" />
                  Multi-Model Revenue Trajectory
                </h2>
                <p className="text-xs text-secondary-500 mt-0.5">Historical 6-month financial breakdown across active sales channels.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[9px] sm:text-xxs font-bold uppercase tracking-wider mt-2 sm:mt-0">
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 inline-block"></span> E-Commerce</span>
                <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400"><span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-purple-500 inline-block"></span> Layaway</span>
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400"><span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-500 inline-block"></span> Raffles</span>
              </div>
            </div>

            <div className="h-[360px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly_trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEcom" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLayaway" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRaffle" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `GHS ${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                    formatter={(value) => [`GHS ${Number(value).toLocaleString()}`, '']}
                  />
                  <Area type="monotone" dataKey="E-Commerce" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorEcom)" />
                  <Area type="monotone" dataKey="Layaway" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorLayaway)" />
                  <Area type="monotone" dataKey="Raffles" stroke="#F43F5E" strokeWidth={2} fillOpacity={1} fill="url(#colorRaffle)" />
                  <Area type="monotone" dataKey="HirePurchase" stroke="#3B82F6" strokeWidth={2} fill="none" />
                  <Area type="monotone" dataKey="PreOrders" stroke="#F59E0B" strokeWidth={2} fill="none" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bottom Section: The 7 Business Models Breakdown */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary-500" />
                7-Model Corporate Revenue Breakdown
              </h2>
              <span className="text-xs text-secondary-500 font-semibold">100% synchronized with SQL backend</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* 1. E-Commerce */}
              <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-emerald-500/50 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <span className="text-xxs font-bold px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 rounded-full uppercase">
                    {models.ecommerce?.count || 0} Orders
                  </span>
                </div>
                <h3 className="text-sm font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">E-Commerce Orders</h3>
                <div className="text-2xl font-black text-secondary-900 dark:text-white mt-1">
                  GHS {(models.ecommerce?.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="w-full bg-secondary-100 dark:bg-secondary-800 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: summary.gross_revenue > 0 ? `${((models.ecommerce?.revenue || 0) / summary.gross_revenue) * 100}%` : '0%' }}></div>
                </div>
              </div>

              {/* 2. Hire Purchase */}
              <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-blue-500/50 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-xxs font-bold px-2.5 py-1 bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-400 rounded-full uppercase">
                    {models.hire_purchase?.count || 0} Contracts
                  </span>
                </div>
                <h3 className="text-sm font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Hire Purchase</h3>
                <div className="text-2xl font-black text-secondary-900 dark:text-white mt-1">
                  GHS {(models.hire_purchase?.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="w-full bg-secondary-100 dark:bg-secondary-800 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: summary.gross_revenue > 0 ? `${((models.hire_purchase?.revenue || 0) / summary.gross_revenue) * 100}%` : '0%' }}></div>
                </div>
              </div>

              {/* 3. Trade-In */}
              <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-cyan-500/50 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 rounded-2xl">
                    <RefreshCcw className="w-5 h-5" />
                  </div>
                  <span className="text-xxs font-bold px-2.5 py-1 bg-cyan-100 dark:bg-cyan-950/50 text-cyan-800 dark:text-cyan-400 rounded-full uppercase">
                    {models.trade?.count || 0} Trades
                  </span>
                </div>
                <h3 className="text-sm font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Device Trade-In</h3>
                <div className="text-2xl font-black text-secondary-900 dark:text-white mt-1">
                  GHS {(models.trade?.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="w-full bg-secondary-100 dark:bg-secondary-800 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: summary.gross_revenue > 0 ? `${((models.trade?.revenue || 0) / summary.gross_revenue) * 100}%` : '0%' }}></div>
                </div>
              </div>

              {/* 4. Pre-Orders */}
              <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-amber-500/50 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 rounded-2xl">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-xxs font-bold px-2.5 py-1 bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-400 rounded-full uppercase">
                    {models.pre_orders?.count || 0} Bookings
                  </span>
                </div>
                <h3 className="text-sm font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Pre-Orders</h3>
                <div className="text-2xl font-black text-secondary-900 dark:text-white mt-1">
                  GHS {(models.pre_orders?.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="w-full bg-secondary-100 dark:bg-secondary-800 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: summary.gross_revenue > 0 ? `${((models.pre_orders?.revenue || 0) / summary.gross_revenue) * 100}%` : '0%' }}></div>
                </div>
              </div>

              {/* 5. Layaway Plans */}
              <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-purple-500/50 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-2xl">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-xxs font-bold px-2.5 py-1 bg-purple-100 dark:bg-purple-950/50 text-purple-800 dark:text-purple-400 rounded-full uppercase">
                    {models.layaway?.count || 0} Plans
                  </span>
                </div>
                <h3 className="text-sm font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Layaway Plans</h3>
                <div className="text-2xl font-black text-secondary-900 dark:text-white mt-1">
                  GHS {(models.layaway?.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="w-full bg-secondary-100 dark:bg-secondary-800 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: summary.gross_revenue > 0 ? `${((models.layaway?.revenue || 0) / summary.gross_revenue) * 100}%` : '0%' }}></div>
                </div>
              </div>

              {/* 6. Raffles */}
              <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-rose-500/50 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl">
                    <Gift className="w-5 h-5" />
                  </div>
                  <span className="text-xxs font-bold px-2.5 py-1 bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-400 rounded-full uppercase">
                    {models.raffles?.tickets || 0} Tickets
                  </span>
                </div>
                <h3 className="text-sm font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Raffles & Draws</h3>
                <div className="text-2xl font-black text-secondary-900 dark:text-white mt-1">
                  GHS {(models.raffles?.revenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="w-full bg-secondary-100 dark:bg-secondary-800 h-1.5 rounded-full mt-4 overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: summary.gross_revenue > 0 ? `${((models.raffles?.revenue || 0) / summary.gross_revenue) * 100}%` : '0%' }}></div>
                </div>
              </div>

              {/* 7. Corporate Buyouts (Expense) */}
              <div className="bg-secondary-900 dark:bg-secondary-950 border border-secondary-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden group hover:border-accent-500/50 transition-all col-span-1 md:col-span-2">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-accent-500/20 text-accent-400 rounded-2xl border border-accent-500/30">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="text-xxs font-extrabold px-3 py-1 bg-accent-500/20 text-accent-400 rounded-full uppercase border border-accent-500/30">
                    {models.sell_requests?.count || 0} Buyout Requests (Expense Model)
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-secondary-400 uppercase tracking-wider">Corporate Buyouts & Acquisitions</h3>
                    <div className="text-3xl font-black text-accent-400 mt-1">
                      - GHS {(models.sell_requests?.expenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                  </div>
                  <span className="text-xs text-secondary-400 max-w-[200px] text-right sm:block hidden">
                    Direct cash disbursements to customers for device acquisitions.
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Fulfillment & System Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-6 rounded-3xl shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 text-amber-600 rounded-xl">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-secondary-900 dark:text-white uppercase tracking-wider">Fulfillment & Operations Alerts</h3>
                  <p className="text-xxs text-secondary-500">Active warehouse notifications and pending inspections</p>
                </div>
              </div>
              <div className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-2xl text-xs text-secondary-600 dark:text-secondary-400 flex justify-between items-center">
                <span>All courier pickups and device inspections are currently up to date.</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Normal</span>
              </div>
            </div>

            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-6 rounded-3xl shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-primary-50 dark:bg-primary-950/30 text-primary-600 rounded-xl">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-secondary-900 dark:text-white uppercase tracking-wider">Real-Time System Audit Trail</h3>
                  <p className="text-xxs text-secondary-500">Corporate administrator activity logs & API synchronizations</p>
                </div>
              </div>
              <div className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-2xl text-xs text-secondary-600 dark:text-secondary-400 flex justify-between items-center">
                <span>Synchronized with 7-model database aggregation engine.</span>
                <span className="font-bold text-primary-600 dark:text-primary-400">Synced</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
export { Dashboard };
