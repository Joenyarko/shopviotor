import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import vendorService from '../../services/vendorService';
import { ShoppingCart, Search, Filter, RefreshCw, Eye, Edit3, CheckCircle2, Clock, Truck, XCircle, Package, User, MapPin, Calendar, DollarSign, ArrowRight, X } from 'lucide-react';

const VendorOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await vendorService.getOrders();
      setOrders(res?.data?.data || res?.data || []);
    } catch (err) {
      console.error('Failed to load orders:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load your store orders. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleOpenModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status?.value || order.status || 'pending');
    setNote(order.cancellation_reason || order.notes || '');
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setNewStatus('');
    setNote('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      await vendorService.updateOrderStatus(selectedOrder.id || selectedOrder.uuid, newStatus, note);
      Swal.fire({
        icon: 'success',
        title: 'Status Updated',
        text: `Order status changed to ${newStatus}.`,
        timer: 2000,
        showConfirmButton: false,
      });
      handleCloseModal();
      loadOrders();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.response?.data?.message || 'Failed to update order status.',
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (statusVal) => {
    const val = statusVal?.value || statusVal || 'pending';
    switch (val) {
      case 'delivered':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"><CheckCircle2 className="w-3.5 h-3.5" /> Delivered</span>;
      case 'shipped':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800"><Truck className="w-3.5 h-3.5" /> Shipped</span>;
      case 'processing':
      case 'confirmed':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 border border-indigo-300 dark:border-indigo-800"><Package className="w-3.5 h-3.5" /> {val === 'confirmed' ? 'Confirmed' : 'Processing'}</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800"><XCircle className="w-3.5 h-3.5" /> Cancelled</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800"><Clock className="w-3.5 h-3.5" /> Pending</span>;
    }
  };

  const filteredOrders = orders.filter((order) => {
    const statusVal = order.status?.value || order.status || '';
    const matchesStatus = statusFilter === 'all' || statusVal === statusFilter;
    const matchesSearch = !searchTerm || 
      order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-secondary-900 dark:text-white flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-emerald-500" /> Store Orders
          </h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
            Manage customer orders, track fulfillments, and update shipping statuses.
          </p>
        </div>
        <button
          onClick={loadOrders}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-800 dark:text-secondary-200 text-sm font-bold transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Orders
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-secondary-900 rounded-3xl p-6 shadow-xl border border-secondary-200 dark:border-secondary-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
          <input
            type="text"
            placeholder="Search by Order # or Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-2xl bg-secondary-50 dark:bg-secondary-800 border-none text-secondary-900 dark:text-white placeholder-secondary-400 text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-5 h-5 text-secondary-500 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-56 px-4 py-3 rounded-2xl bg-secondary-50 dark:bg-secondary-800 border-none text-secondary-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List / Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-secondary-900 rounded-3xl border border-secondary-200 dark:border-secondary-800 shadow-xl">
          <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
          <p className="text-secondary-500 dark:text-secondary-400 font-bold">Loading orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-secondary-900 rounded-3xl border border-secondary-200 dark:border-secondary-800 shadow-xl space-y-4">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-extrabold text-secondary-900 dark:text-white">No Orders Found</h3>
          <p className="text-secondary-500 dark:text-secondary-400 max-w-sm mx-auto text-sm">
            {searchTerm || statusFilter !== 'all' 
              ? 'No orders match your current filters. Try resetting your search or status selection.'
              : 'When customers purchase products from your store, their orders will appear right here.'}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-secondary-900 rounded-3xl shadow-xl border border-secondary-200 dark:border-secondary-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-secondary-200 dark:border-secondary-800 bg-secondary-50/50 dark:bg-secondary-800/50 text-secondary-600 dark:text-secondary-300 text-xs font-black uppercase tracking-wider">
                  <th className="p-5">Order ID</th>
                  <th className="p-5">Customer</th>
                  <th className="p-5">Items</th>
                  <th className="p-5">Total</th>
                  <th className="p-5">Date</th>
                  <th className="p-5">Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200 dark:divide-secondary-800 text-sm">
                {filteredOrders.map((order) => {
                  const customerName = order.user ? `${order.user.first_name || ''} ${order.user.last_name || ''}`.trim() : 'Guest Customer';
                  const itemsCount = order.items?.length || 0;
                  const orderDate = new Date(order.created_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={order.id || order.uuid} className="hover:bg-secondary-50/60 dark:hover:bg-secondary-800/40 transition-colors group">
                      <td className="p-5 font-black text-secondary-900 dark:text-white">
                        #{order.order_number}
                      </td>
                      <td className="p-5">
                        <div className="font-bold text-secondary-900 dark:text-white">{customerName}</div>
                        <div className="text-xs text-secondary-400">{order.user?.email || 'N/A'}</div>
                      </td>
                      <td className="p-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-secondary-100 dark:bg-secondary-800 font-bold text-secondary-700 dark:text-secondary-300 text-xs">
                          <Package className="w-3.5 h-3.5 text-emerald-500" /> {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                        </span>
                      </td>
                      <td className="p-5 font-black text-secondary-900 dark:text-white">
                        {order.currency || 'GHS'} {Number(order.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-5 text-secondary-500 dark:text-secondary-400 font-medium">
                        {orderDate}
                      </td>
                      <td className="p-5">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="p-5 text-right">
                        <button
                          onClick={() => handleOpenModal(order)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary-100 dark:bg-secondary-800 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 text-secondary-800 dark:text-white font-bold text-xs transition-all shadow-sm"
                        >
                          <Eye className="w-4 h-4" /> Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Management Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-secondary-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-secondary-200 dark:border-secondary-800 p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-secondary-200 dark:border-secondary-800 pb-5">
              <div>
                <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">Order Details</span>
                <h2 className="text-2xl font-black text-secondary-900 dark:text-white mt-1">
                  #{selectedOrder.order_number}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-500 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Customer & Shipping Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-2xl p-5 border border-secondary-200 dark:border-secondary-700/50">
              <div className="space-y-2">
                <div className="text-xs font-black text-secondary-400 uppercase flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-500" /> Customer Information
                </div>
                <div className="font-bold text-secondary-900 dark:text-white">
                  {selectedOrder.user ? `${selectedOrder.user.first_name || ''} ${selectedOrder.user.last_name || ''}`.trim() : 'Guest Customer'}
                </div>
                <div className="text-xs text-secondary-500 dark:text-secondary-400">
                  Email: {selectedOrder.user?.email || 'N/A'}<br />
                  Phone: {selectedOrder.user?.phone || selectedOrder.address?.phone || 'N/A'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-black text-secondary-400 uppercase flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" /> Shipping Address
                </div>
                <div className="text-xs text-secondary-700 dark:text-secondary-300 leading-relaxed font-medium">
                  {selectedOrder.address ? (
                    <>
                      <strong className="text-secondary-900 dark:text-white">{selectedOrder.address.full_name}</strong><br />
                      {selectedOrder.address.address_line_1}<br />
                      {selectedOrder.address.address_line_2 && <>{selectedOrder.address.address_line_2}<br /></>}
                      {selectedOrder.address.city}, {selectedOrder.address.state || ''} {selectedOrder.address.postal_code || ''}<br />
                      {selectedOrder.address.country || 'Ghana'}
                    </>
                  ) : (
                    <span className="text-secondary-400 italic">No address specified / Digital delivery</span>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3">
              <h4 className="text-sm font-black text-secondary-900 dark:text-white uppercase tracking-wider">
                Store Items in Order ({selectedOrder.items?.length || 0})
              </h4>
              <div className="divide-y divide-secondary-200 dark:divide-secondary-800 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="p-4 flex items-center justify-between gap-4 bg-white dark:bg-secondary-900">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-xl bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.product?.images?.[0]?.image_path ? (
                          <img src={`/storage/${item.product.images[0].image_path}`} alt={item.product_name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-secondary-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-secondary-900 dark:text-white">{item.product_name}</div>
                        <div className="text-xs text-secondary-500">SKU: {item.product_sku || 'N/A'} &bull; Qty: <strong className="text-secondary-900 dark:text-white">{item.quantity}</strong></div>
                      </div>
                    </div>
                    <div className="text-right font-black text-sm text-secondary-900 dark:text-white">
                      {selectedOrder.currency || 'GHS'} {Number(item.total || item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Update Form */}
            <form onSubmit={handleUpdateStatus} className="bg-secondary-50 dark:bg-secondary-800/50 rounded-2xl p-5 border border-secondary-200 dark:border-secondary-700/50 space-y-4">
              <h4 className="text-sm font-black text-secondary-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-500" /> Update Fulfillment Status
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-secondary-700 dark:text-secondary-300 mb-1.5">
                    Order Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-secondary-900 border border-secondary-300 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer"
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
                  <label className="block text-xs font-bold text-secondary-700 dark:text-secondary-300 mb-1.5">
                    Optional Note / Tracking Info
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dispatched via Express Courier..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white dark:bg-secondary-900 border border-secondary-300 dark:border-secondary-700 text-secondary-900 dark:text-white placeholder-secondary-400 text-sm font-medium focus:ring-2 focus:ring-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl bg-secondary-200 dark:bg-secondary-700 hover:bg-secondary-300 dark:hover:bg-secondary-600 text-secondary-800 dark:text-white font-bold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 active:scale-95"
                >
                  {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorOrders;
