import React, { useState, useEffect } from 'react';
import preorderService from '../../services/preorderService';
import { Package, RefreshCw, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyPreOrders = () => {
  const [preOrders, setPreOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyPreOrders = async () => {
      try {
        const res = await preorderService.getMyPreOrders();
        setPreOrders(res.data?.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPreOrders();
  }, []);

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-primary-500" /> My Pre-Orders
          </h2>
          <p className="text-sm text-secondary-500 mt-1">Track the status of your reserved items.</p>
        </div>
        <Link to="/pre-orders" className="premium-button-secondary px-4 py-2 rounded-lg text-sm font-semibold">
          Browse Pre-Orders
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : preOrders.length === 0 ? (
        <div className="p-12 border border-secondary-200 dark:border-secondary-800 rounded-xl text-center bg-white dark:bg-secondary-900">
          <Package className="w-12 h-12 text-secondary-300 dark:text-secondary-700 mx-auto mb-3" />
          <p className="text-secondary-500 dark:text-secondary-400 font-medium">You have no active pre-orders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {preOrders.map((order) => {
            const product = order.product;
            const primaryImage = product?.primary_image || (product?.images && product.images[0]?.url) || 'https://via.placeholder.com/150?text=No+Image';

            return (
              <div key={order.uuid} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-5 flex flex-col sm:flex-row gap-5 hover:shadow-md transition-shadow">
                <div className="w-full sm:w-1/3 aspect-square bg-secondary-50 dark:bg-secondary-800 rounded-xl overflow-hidden p-2">
                  <img src={primaryImage} alt={product?.name} className="w-full h-full object-contain" />
                </div>
                <div className="w-full sm:w-2/3 flex flex-col">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <h3 className="font-bold text-secondary-900 dark:text-white line-clamp-2">{product?.name}</h3>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${statusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 mt-auto">
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-500">Total Price</span>
                      <span className="font-medium text-secondary-900 dark:text-white">GHS {parseFloat(order.total_price).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-500">Deposit Paid</span>
                      <span className="font-bold text-primary-600 dark:text-primary-400">GHS {parseFloat(order.deposit_paid).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm border-t border-secondary-100 dark:border-secondary-800 pt-1 mt-1">
                      <span className="text-secondary-500">Balance Remaining</span>
                      <span className="font-bold text-red-600 dark:text-red-400">GHS {parseFloat(order.balance_remaining).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs text-secondary-500 bg-secondary-50 dark:bg-secondary-800/50 p-2.5 rounded-lg">
                    <Calendar className="w-4 h-4 text-secondary-400" />
                    <span>Expected: <strong className="text-secondary-700 dark:text-secondary-300">{order.expected_date ? new Date(order.expected_date).toLocaleDateString() : 'TBD'}</strong></span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyPreOrders;
