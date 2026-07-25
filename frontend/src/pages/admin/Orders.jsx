import Swal from 'sweetalert2';
import React, { useEffect, useState } from 'react';
import orderService from '../../services/orderService';
import { RefreshCw, Edit } from 'lucide-react';
import DotPagination from '../../components/DotPagination';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const paginatedOrders = orders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.adminGetOrders();
      setOrders(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenStatus = (order) => {
    setSelectedOrder(order);
    setStatus(order.status?.value || order.status || 'pending');
    setNote(order.cancellation_reason || '');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      await orderService.adminUpdateStatus(selectedOrder.id || selectedOrder.uuid, status, note);
      Swal.fire({ text: String('Order status updated successfully.') });
      setSelectedOrder(null);
      loadOrders();
    } catch (err) {
      console.error(err);
      Swal.fire({ text: String(err.message || 'Failed to update order status.') });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Fulfillment Orders</h2>
        <p className="text-sm text-secondary-500 mt-1">Monitor shipments, capture invoice totals, and trigger confirmations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Table list */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
          ) : orders.length === 0 ? (
            <div className="p-8 border border-secondary-200 dark:border-secondary-800 rounded-xl text-center bg-white dark:bg-secondary-900 text-secondary-500 dark:text-secondary-400 font-semibold">
              No orders found.
            </div>
          ) : (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase tracking-wider text-xxs">
                    <th className="p-4">Order Ref</th>
                    <th className="p-4">Customer</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                  {paginatedOrders.map((o) => (
                    <tr key={o.id || o.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                      <td className="p-4 font-semibold text-secondary-900 dark:text-white">#{o.order_number}</td>
                      <td className="p-4 text-secondary-700 dark:text-secondary-300">{o.user?.name || 'Customer'}</td>
                      <td className="p-4 font-bold text-secondary-900 dark:text-white">GHS {parseFloat(o.total || 0).toLocaleString()}</td>
                      <td className="p-4"><span className="text-xxs px-2.5 py-0.5 rounded-full font-bold uppercase bg-blue-100 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400">{o.status?.value || o.status}</span></td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleOpenStatus(o)} className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-lg"><Edit className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <DotPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>

        {/* Right Status Updater */}
        <div>
          {selectedOrder ? (
            <aside className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 transition-colors shadow-sm animate-in slide-in-from-right duration-250">
              <h3 className="font-bold text-secondary-900 dark:text-white mb-4">Fulfill Order #{selectedOrder.order_number}</h3>
              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-secondary-500 uppercase">Fulfillment Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full mt-1.5 p-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary-500 uppercase">Fulfillment / Cancel Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Enter dispatch tracking or cancellation reason..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full mt-1.5 p-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full premium-button-primary py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Update Status'}
                </button>
              </form>
            </aside>
          ) : (
            <div className="bg-white dark:bg-secondary-900 border border-dashed border-secondary-300 dark:border-secondary-800 p-8 rounded-2xl text-center text-xs text-secondary-500 dark:text-secondary-400">
              Select an order to adjust shipping and validation tracking.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Orders;
export { Orders };
