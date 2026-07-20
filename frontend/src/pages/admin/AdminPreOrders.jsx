import React, { useState, useEffect } from 'react';
import preorderService from '../../services/preorderService';
import { Package, RefreshCw, Check, X, Eye } from 'lucide-react';
import { format } from 'date-fns';

const AdminPreOrders = () => {
  const [preOrders, setPreOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [processing, setProcessing] = useState(false);

  const loadPreOrders = async () => {
    setLoading(true);
    try {
      const res = await preorderService.adminGetPreOrders(activeTab !== 'all' ? { status: activeTab } : {});
      setPreOrders(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreOrders();
  }, [activeTab]);

  const handleStatusUpdate = async (uuid, status) => {
    if (!window.confirm(`Mark this pre-order as ${status}?`)) return;
    setProcessing(true);
    try {
      await preorderService.adminUpdateStatus(uuid, status);
      loadPreOrders();
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Failed to update status.');
    } finally {
      setProcessing(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400',
      arrived: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
      completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    };
    return map[status] || 'bg-secondary-100 text-secondary-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-primary-500" /> Pre-Orders
          </h2>
          <p className="text-sm text-secondary-500 mt-1">Manage all customer pre-orders and inventory expected dates.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-secondary-200 dark:border-secondary-800 overflow-x-auto">
        {['all', 'pending', 'arrived', 'completed', 'cancelled'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : preOrders.length === 0 ? (
        <div className="p-12 border border-secondary-200 dark:border-secondary-800 rounded-xl text-center bg-white dark:bg-secondary-900 text-secondary-500">
          No pre-orders found.
        </div>
      ) : (
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase tracking-wider text-xs">
                  <th className="p-4">Customer</th>
                  <th className="p-4">Product</th>
                  <th className="p-4">Deposit / Total</th>
                  <th className="p-4">Expected Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                {preOrders.map((order) => (
                  <tr key={order.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/50 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-secondary-900 dark:text-white">{order.customer_details?.name || order.user?.name}</div>
                      <div className="text-xs text-secondary-500">{order.customer_details?.phone || order.user?.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-secondary-900 dark:text-white max-w-[200px] truncate" title={order.product?.name}>
                        {order.product?.name}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-primary-600">GHS {parseFloat(order.deposit_paid).toFixed(2)}</div>
                      <div className="text-xs text-secondary-500">Total: GHS {parseFloat(order.total_price).toFixed(2)}</div>
                    </td>
                    <td className="p-4">
                      {order.expected_date ? format(new Date(order.expected_date), 'MMM dd, yyyy') : 'TBD'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${statusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {order.status === 'pending' && (
                        <button disabled={processing} onClick={() => handleStatusUpdate(order.uuid, 'arrived')} className="p-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors" title="Mark Arrived">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {order.status === 'arrived' && (
                        <button disabled={processing} onClick={() => handleStatusUpdate(order.uuid, 'completed')} className="p-1.5 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-lg transition-colors" title="Mark Completed">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {(order.status === 'pending' || order.status === 'arrived') && (
                        <button disabled={processing} onClick={() => handleStatusUpdate(order.uuid, 'cancelled')} className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors" title="Cancel Order">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPreOrders;
