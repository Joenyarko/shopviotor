import React, { useEffect, useState } from 'react';
import orderService from '../../services/orderService';
import { ShoppingBag, RefreshCw, Clock, Package, Truck, CheckCircle } from 'lucide-react';

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
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Review shipping progress and purchase history.</p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2].map(i => <div key={i} className="h-28 bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl transition-colors">
          <p className="text-secondary-500 dark:text-secondary-400 text-sm">You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id || order.uuid} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 transition-colors shadow-sm">
              
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4 border-b border-secondary-100 dark:border-secondary-800 pb-4">
                <div className="space-y-1">
                  <span className="text-xxs font-bold text-secondary-450 uppercase">Order Ref</span>
                  <h4 className="font-bold text-secondary-900 dark:text-white text-sm md:text-base">#{order.order_number}</h4>
                  <p className="text-xxs text-secondary-500 dark:text-secondary-400">Date: {new Date(order.created_at).toLocaleDateString()}</p>
                </div>

                <div>
                  <span className="block text-xxs text-secondary-500 dark:text-secondary-400 font-bold uppercase">Total Bill</span>
                  <span className="font-extrabold text-sm md:text-base text-secondary-900 dark:text-white">GHS {parseFloat(order.total).toFixed(2)}</span>
                </div>

                <div>
                  <span className="block text-xxs text-secondary-500 dark:text-secondary-400 font-bold uppercase mb-1">Status</span>
                  <span className={`inline-block px-3 py-1 rounded-full text-xxs font-bold uppercase ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' : order.status === 'cancelled' ? 'bg-accent-100 text-accent-850' : 'bg-primary-100 text-primary-850'}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Status Timeline */}
              {order.status !== 'cancelled' && (
                <div className="mb-6 pt-2 pb-4">
                  <div className="relative flex items-center justify-between w-full max-w-xl mx-auto">
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-secondary-200 dark:bg-secondary-800 -z-10 rounded-full"></div>
                    
                    {/* Pending */}
                    <div className="flex flex-col items-center gap-1 bg-white dark:bg-secondary-900 px-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['pending', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-primary-500 text-white' : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-500'}`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-secondary-600 dark:text-secondary-400">Pending</span>
                    </div>

                    {/* Processing */}
                    <div className="flex flex-col items-center gap-1 bg-white dark:bg-secondary-900 px-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-primary-500 text-white' : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-500'}`}>
                        <Package className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-secondary-600 dark:text-secondary-400">Processing</span>
                    </div>

                    {/* Shipped */}
                    <div className="flex flex-col items-center gap-1 bg-white dark:bg-secondary-900 px-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['shipped', 'delivered'].includes(order.status) ? 'bg-primary-500 text-white' : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-500'}`}>
                        <Truck className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-secondary-600 dark:text-secondary-400">Shipped</span>
                    </div>

                    {/* Delivered */}
                    <div className="flex flex-col items-center gap-1 bg-white dark:bg-secondary-900 px-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${['delivered'].includes(order.status) ? 'bg-emerald-500 text-white' : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-500'}`}>
                        <CheckCircle className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-secondary-600 dark:text-secondary-400">Delivered</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-secondary-900 dark:text-white uppercase tracking-wider mb-2">Order Details</h5>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-secondary-50 dark:bg-secondary-800/50 p-3 rounded-lg border border-secondary-100 dark:border-secondary-800">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-secondary-900 dark:text-white">{item.product_name}</p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">Qty: {item.quantity} | GHS {parseFloat(item.price).toFixed(2)} each</p>
                      </div>
                      <div className="font-bold text-sm text-secondary-900 dark:text-white">
                        GHS {(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-secondary-500">No item details available.</p>
                )}
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
