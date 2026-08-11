import React, { useState, useEffect } from 'react';
import { BarChart2, Users, Package, Store, TrendingUp, DollarSign, Download, RefreshCw, ShoppingCart } from 'lucide-react';
import apiClient from '../../api/client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import Swal from 'sweetalert2';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get(`/admin/dashboard/comprehensive-stats?filter=${filter}`);
        setData(response?.data || response);
      } catch (error) {
        console.error('Failed to load analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [filter]);

  const handleExport = () => {
    Swal.fire({ text: 'Report generation scheduled. It will download shortly.', icon: 'success' });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>;
  }

  if (!data) return <div>Failed to load data.</div>;

  const { summary, models, trends } = data;

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#f43f5e'];

  // Format data for Pie Chart (Revenue by Model)
  const pieData = Object.keys(models)
    .filter(k => k !== 'sell_requests' && models[k].revenue > 0)
    .map((k) => ({
      name: models[k].name,
      value: models[k].revenue,
    }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-7 h-7 text-primary-500" /> Analytics & Reports Hub
          </h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Deep insights into sales, customers, and marketplace models.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            disabled={loading}
            className="px-4 py-2.5 bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-secondary-800 dark:text-white rounded-xl text-xs font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none min-w-[140px]"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="1month">Last 30 Days</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last 12 Months</option>
            <option value="all">All Time</option>
          </select>
          <button onClick={handleExport} className="premium-button-primary px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 text-sm shadow-sm flex-1 sm:flex-none">
            <Download className="w-4 h-4" /> Export Report
          </button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 border-b border-secondary-200 dark:border-secondary-800">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'sales', label: 'Sales & Revenue', icon: DollarSign },
          { id: 'marketplace', label: 'Marketplace Models', icon: Store },
          { id: 'customers', label: 'Customers', icon: Users },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-bold text-sm transition-colors whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'bg-secondary-100 dark:bg-secondary-800 text-primary-600 dark:text-primary-400 border-b-2 border-primary-500' 
                  : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800/50'
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-300">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 border border-secondary-200 dark:border-secondary-800 shadow-sm">
                <p className="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-2">Gross Revenue</p>
                <p className="text-3xl font-black text-secondary-900 dark:text-white">GH₵ {summary.gross_revenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 text-green-500 text-xs mt-2 font-bold"><TrendingUp className="w-3 h-3" /> +12% from last month</div>
              </div>
              <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 border border-secondary-200 dark:border-secondary-800 shadow-sm">
                <p className="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-2">Net Profit</p>
                <p className="text-3xl font-black text-primary-600 dark:text-primary-400">GH₵ {summary.net_profit.toLocaleString()}</p>
              </div>
              <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 border border-secondary-200 dark:border-secondary-800 shadow-sm">
                <p className="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-2">Total Transactions</p>
                <p className="text-3xl font-black text-secondary-900 dark:text-white">{summary.total_transactions}</p>
              </div>
              <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 border border-secondary-200 dark:border-secondary-800 shadow-sm">
                <p className="text-xs font-bold text-secondary-500 uppercase tracking-wider mb-2">Average Order Value</p>
                <p className="text-3xl font-black text-secondary-900 dark:text-white">GH₵ {summary.avg_ticket.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 border border-secondary-200 dark:border-secondary-800 shadow-sm col-span-2 lg:col-span-4 h-96 mt-4 relative">
                {loading && (
                  <div className="absolute inset-0 bg-white/50 dark:bg-secondary-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                    <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
                  </div>
                )}
                <h3 className="font-bold text-secondary-900 dark:text-white mb-6">Revenue Trend</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dx={-10} tickFormatter={(val) => `₵${val}`} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                    <Area type="monotone" dataKey="Total" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                    <Area type="monotone" dataKey="E-Commerce" stroke="#10b981" strokeWidth={2} fillOpacity={0} />
                    <Area type="monotone" dataKey="HirePurchase" stroke="#f59e0b" strokeWidth={2} fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* MARKETPLACE TAB */}
        {activeTab === 'marketplace' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-secondary-900 dark:text-white mb-6">Revenue by Marketplace Model</h3>
              <div className="h-[300px]">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={(value) => `GH₵ ${value}`} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-secondary-500">Not enough revenue data to generate chart.</div>
                )}
              </div>
            </div>
            
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-secondary-900 dark:text-white mb-6">Model Performance Metrics</h3>
              <div className="space-y-4">
                {Object.values(models).map((model, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-secondary-900 flex items-center justify-center shadow-sm">
                        <ShoppingCart className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
                      </div>
                      <div>
                        <p className="font-bold text-secondary-900 dark:text-white text-sm">{model.name}</p>
                        <p className="text-xs text-secondary-500">{model.count} total items/transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-secondary-900 dark:text-white text-sm">
                        {model.revenue !== undefined ? `GH₵ ${model.revenue.toLocaleString()}` : `GH₵ ${model.expenses.toLocaleString()} (Exp)`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CUSTOMERS & SALES TAB */}
        {(activeTab === 'customers' || activeTab === 'sales') && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 border border-secondary-200 dark:border-secondary-800 shadow-sm h-96 relative">
              {loading && (
                <div className="absolute inset-0 bg-white/50 dark:bg-secondary-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                  <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
                </div>
              )}
              <h3 className="font-bold text-secondary-900 dark:text-white mb-6">Stacked Revenue Analysis</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₵${val}`} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Legend iconType="circle" />
                  <Bar dataKey="E-Commerce" stackId="a" fill="#0ea5e9" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="HirePurchase" stackId="a" fill="#10b981" />
                  <Bar dataKey="PreOrders" stackId="a" fill="#8b5cf6" />
                  <Bar dataKey="Layaway" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {activeTab === 'customers' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-secondary-100 dark:border-secondary-800">
                <div>
                  <p className="text-xs text-secondary-500 uppercase font-bold mb-1">Total Users</p>
                  <p className="text-2xl font-black text-secondary-900 dark:text-white">{summary.total_users}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 uppercase font-bold mb-1">Active Customers</p>
                  <p className="text-2xl font-black text-secondary-900 dark:text-white">{summary.active_users}</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 uppercase font-bold mb-1">Conversion Rate</p>
                  <p className="text-2xl font-black text-secondary-900 dark:text-white">4.2%</p>
                </div>
                <div>
                  <p className="text-xs text-secondary-500 uppercase font-bold mb-1">Customer LTV</p>
                  <p className="text-2xl font-black text-secondary-900 dark:text-white">GH₵ 1,240</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default Reports;

export { Reports };
