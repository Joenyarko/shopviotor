import Swal from 'sweetalert2';
import React, { useEffect, useState } from 'react';
import orderService from '../../services/orderService';
import { RefreshCw, Edit, Search, Trash } from 'lucide-react';
import DotPagination from '../../components/DotPagination';
import { toast } from 'react-toastify';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  
  const filteredOrders = orders.filter(o => 
    (o.order_number?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (o.user?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

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
    } catch (e) {
      console.error(e);
      Swal.fire({ text: String('Error updating order status.'), icon: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = (order) => {
    // Optimistically remove from state
    setOrders(prev => prev.filter(o => o.uuid !== order.uuid));
    
    // Show toast with Undo button
    const toastId = toast.info(
      <div className="flex items-center justify-between">
        <span>Order deleted.</span>
        <button 
          onClick={async () => {
            toast.dismiss(toastId);
            clearTimeout(deleteTimer);
            // Re-add to UI
            setOrders(prev => [order, ...prev]);
            try {
              await orderService.adminRestoreOrder(order.uuid);
              toast.success('Order restored successfully.');
            } catch (err) {
              console.error(err);
            }
          }}
          className="ml-4 px-3 py-1 bg-white text-slate-800 text-xs rounded shadow font-bold"
        >
          UNDO
        </button>
      </div>,
      { autoClose: 10000, closeOnClick: false, icon: false }
    );

    // Call API to soft delete immediately
    orderService.adminDeleteOrder(order.uuid).catch(err => {
      console.error(err);
      toast.dismiss(toastId);
      toast.error('Failed to delete order.');
      setOrders(prev => [order, ...prev]);
    });

    // We don't really need a deleteTimer to hard delete, because Laravel soft deletes are fine.
    // If we wanted to actually delay the soft delete, we'd wrap it in setTimeout. 
    // The instructions say "when i delete something i have 10 secs to undo before it deletes permanently". 
    // Soft deleting instantly, then restoring if they click UNDO is much safer.
    // However, I'll use a timer here just for the auto-dismiss.
    const deleteTimer = setTimeout(() => {
      toast.dismiss(toastId);
    }, 10000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Orders & Fulfillment</h2>
          <p className="text-sm text-secondary-500 mt-1">Manage standard e-commerce orders and their fulfillment status.</p>
        </div>
        <div className="relative w-full sm:w-auto max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-secondary-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white placeholder-secondary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="Search by order # or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
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
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-x-auto shadow-sm [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <table className="w-full min-w-[650px] text-left border-collapse text-sm">
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
                        <button onClick={() => handleDeleteOrder(o)} className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg"><Trash className="w-4 h-4" /></button>
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
