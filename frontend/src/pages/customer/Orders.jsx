import React, { useEffect, useState } from 'react';
import orderService from '../../services/orderService';
import { ShoppingBag, RefreshCw } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getOrders();
        setOrders(response.data?.data || response.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white flex items-center gap-2">
          <ShoppingBag className="w-8 h-8 text-primary-500" /> My Purchase Orders
        </h1>
        <p className="text-sm text-secondary-500 mt-1">Review shipping progress and purchase history.</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2].map(i => <div key={i} className="h-28 bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl transition-colors">
          <p className="text-secondary-500 text-sm">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id || order.uuid} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 transition-colors shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
              
              <div className="space-y-1">
                <span className="text-xxs font-bold text-secondary-450 uppercase">Order Ref</span>
                <h4 className="font-bold text-secondary-900 dark:text-white text-sm md:text-base">#{order.order_number}</h4>
                <p className="text-xxs text-secondary-500">Date: {new Date(order.created_at).toLocaleDateString()}</p>
              </div>

              <div>
                <span className="block text-xxs text-secondary-500 font-bold uppercase">Total Bill</span>
                <span className="font-extrabold text-sm md:text-base text-secondary-900 dark:text-white">GHS {parseFloat(order.total).toFixed(2)}</span>
              </div>

              <div>
                <span className="block text-xxs text-secondary-500 font-bold uppercase mb-1">Status</span>
                <span className={`inline-block px-3 py-1 rounded-full text-xxs font-bold uppercase ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : order.status === 'cancelled' ? 'bg-accent-100 text-accent-850' : 'bg-primary-100 text-primary-850'}`}>
                  {order.status}
                </span>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
export { Orders };
