import Swal from 'sweetalert2';
import React, { useEffect, useState } from 'react';
import orderService from '../../services/orderService';
import { 
  ShoppingBag, 
  Package, 
  RefreshCw, 
  Edit, 
  Search, 
  Trash, 
  Eye, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard, 
  Printer, 
  X, 
  Clock, 
  Truck, 
  CheckCircle, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  FileText
} from 'lucide-react';
import DotPagination from '../../components/DotPagination';
import { toast } from 'react-toastify';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
    icon: Clock
  },
  confirmed: {
    label: 'Confirmed',
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
    icon: CheckCircle
  },
  processing: {
    label: 'Processing',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800',
    icon: Package
  },
  shipped: {
    label: 'Shipped',
    badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800',
    icon: Truck
  },
  delivered: {
    label: 'Delivered',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle
  },
  cancelled: {
    label: 'Cancelled',
    badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800',
    icon: AlertCircle
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalOrder, setDetailModalOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [copiedText, setCopiedText] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;

  // Helper to extract customer details
  const getCustomerInfo = (order) => {
    const addr = order?.address || order?.user?.addresses?.[0];
    const name = addr?.full_name || order?.user?.name || [order?.user?.first_name, order?.user?.last_name].filter(Boolean).join(' ') || 'Customer';
    const phone = addr?.phone || order?.user?.phone || '';
    const email = order?.user?.email || '';
    return { name, phone, email, addr };
  };

  // Helper to format full delivery address
  const getFormattedAddress = (order) => {
    const addr = order?.address || order?.user?.addresses?.[0];
    if (!addr) return null;
    if (addr.full_address) return addr.full_address;
    const parts = [
      addr.address_line_1,
      addr.address_line_2,
      addr.city,
      addr.region,
      addr.country
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : null;
  };

  // Helper to get image for item
  const getItemImage = (item) => {
    if (item?.image) return item.image;
    if (item?.product?.primary_image) return item.product.primary_image;
    if (item?.product?.images && item.product.images.length > 0) {
      const img = item.product.images[0];
      return img.url || (img.path ? (img.path.startsWith('http') ? img.path : `/storage/${img.path}`) : null);
    }
    return null;
  };

  const handleCopy = (text, label) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.adminGetOrders({ per_page: 100 });
      const rawData = res.data?.data;
      const list = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : (Array.isArray(res.data) ? res.data : []));
      setOrders(list);
      // If an order is currently selected, refresh its data in selection
      if (selectedOrder) {
        const refreshed = list.find(o => (o.id || o.uuid) === (selectedOrder.id || selectedOrder.uuid));
        if (refreshed) setSelectedOrder(refreshed);
      }
      if (detailModalOrder) {
        const refreshedModal = list.find(o => (o.id || o.uuid) === (detailModalOrder.id || detailModalOrder.uuid));
        if (refreshedModal) setDetailModalOrder(refreshedModal);
      }
    } catch (e) {
      console.error('Failed to load admin orders:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filtered orders based on status tab and search
  const filteredOrders = orders.filter((o) => {
    const rawStatus = (o.status?.value || o.status || '').toLowerCase();
    if (statusFilter !== 'all' && rawStatus !== statusFilter) {
      return false;
    }

    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();

    const orderNum = (o.order_number || '').toLowerCase();
    const cust = getCustomerInfo(o);
    const addrText = (getFormattedAddress(o) || '').toLowerCase();
    const itemNames = (o.items || []).map(i => (i.product_name || '').toLowerCase()).join(' ');

    return (
      orderNum.includes(term) ||
      cust.name.toLowerCase().includes(term) ||
      cust.phone.toLowerCase().includes(term) ||
      cust.email.toLowerCase().includes(term) ||
      addrText.includes(term) ||
      itemNames.includes(term)
    );
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setStatus(order.status?.value || order.status || 'pending');
    setNote(order.admin_notes || order.cancellation_reason || '');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      await orderService.adminUpdateStatus(selectedOrder.id || selectedOrder.uuid, status, note);
      Swal.fire({
        title: 'Status Updated',
        text: `Order #${selectedOrder.order_number} is now marked as ${status.toUpperCase()}.`,
        icon: 'success',
        timer: 1800,
        showConfirmButton: false
      });
      loadOrders();
    } catch (e) {
      console.error(e);
      Swal.fire({ text: 'Error updating order status.', icon: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = async (order) => {
    const result = await Swal.fire({
      title: 'Delete this order?',
      text: "You can undo this within 10 seconds.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it'
    });

    if (!result.isConfirmed) return;

    // Optimistically remove
    setOrders((prev) => prev.filter((o) => (o.id || o.uuid) !== (order.id || order.uuid)));
    if (selectedOrder && (selectedOrder.id || selectedOrder.uuid) === (order.id || order.uuid)) {
      setSelectedOrder(null);
    }

    const toastId = toast.info(
      <div className="flex items-center justify-between">
        <span>Order #{order.order_number} deleted.</span>
        <button
          onClick={async () => {
            toast.dismiss(toastId);
            setOrders((prev) => [order, ...prev]);
            try {
              await orderService.adminRestoreOrder(order.id || order.uuid);
              toast.success('Order restored.');
            } catch (err) {
              console.error(err);
            }
          }}
          className="ml-4 px-2.5 py-1 bg-white text-secondary-900 text-xs rounded font-bold hover:bg-secondary-100"
        >
          UNDO
        </button>
      </div>,
      { autoClose: 10000, closeOnClick: false, icon: false }
    );

    try {
      await orderService.adminDeleteOrder(order.id || order.uuid);
    } catch (err) {
      console.error(err);
      toast.dismiss(toastId);
      toast.error('Failed to delete order.');
      setOrders((prev) => [order, ...prev]);
    }
  };

  // Status counts for tabs
  const statusCounts = orders.reduce((acc, o) => {
    const s = (o.status?.value || o.status || 'pending').toLowerCase();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary-500" /> Orders & Fulfillment
          </h2>
          <p className="text-sm text-secondary-500 mt-0.5">
            View customer details, shipping destinations, ordered items, and manage fulfillment.
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={loadOrders}
            disabled={loading}
            className="p-2 border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 rounded-lg text-secondary-600 dark:text-secondary-300 hover:text-primary-500 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh orders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary-500' : ''}`} />
          </button>
          
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-secondary-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white placeholder-secondary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
              placeholder="Search #, name, phone, item..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        {[
          { key: 'all', label: 'All Orders', count: orders.length },
          { key: 'pending', label: 'Pending', count: statusCounts.pending || 0 },
          { key: 'confirmed', label: 'Confirmed', count: statusCounts.confirmed || 0 },
          { key: 'processing', label: 'Processing', count: statusCounts.processing || 0 },
          { key: 'shipped', label: 'Shipped', count: statusCounts.shipped || 0 },
          { key: 'delivered', label: 'Delivered', count: statusCounts.delivered || 0 },
          { key: 'cancelled', label: 'Cancelled', count: statusCounts.cancelled || 0 },
        ].map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shadow-sm ${
                isActive
                  ? 'bg-primary-500 text-secondary-900 ring-2 ring-primary-500/20'
                  : 'bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 text-secondary-600 dark:text-secondary-400 hover:text-secondary-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                isActive ? 'bg-secondary-900/10 text-secondary-950' : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Orders List (Col 2) + Selected Order Details (Col 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Orders Table */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex justify-center py-20 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl">
              <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 border border-secondary-200 dark:border-secondary-800 rounded-xl text-center bg-white dark:bg-secondary-900">
              <ShoppingBag className="w-12 h-12 text-secondary-300 dark:text-secondary-700 mx-auto mb-3" />
              <p className="text-secondary-700 dark:text-secondary-300 font-bold">No orders found</p>
              <p className="text-xs text-secondary-500 mt-1">
                {searchTerm || statusFilter !== 'all' ? 'Try adjusting your filters or search terms.' : 'New orders placed on the store will show up here.'}
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="p-3.5">Order Ref</th>
                      <th className="p-3.5">Customer & Phone</th>
                      <th className="p-3.5">Destination</th>
                      <th className="p-3.5">Items</th>
                      <th className="p-3.5">Total & Payment</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                    {paginatedOrders.map((o) => {
                      const isSelected = selectedOrder && (selectedOrder.id || selectedOrder.uuid) === (o.id || o.uuid);
                      const customer = getCustomerInfo(o);
                      const addrText = getFormattedAddress(o);
                      const rawStatus = (o.status?.value || o.status || 'pending').toLowerCase();
                      const statusConf = STATUS_CONFIG[rawStatus] || STATUS_CONFIG.pending;
                      const StatusIcon = statusConf.icon;
                      const itemsList = o.items || [];
                      const isPaid = !!o.paid_at || o.payment?.status === 'successful' || o.payment?.status === 'paid';

                      return (
                        <tr 
                          key={o.id || o.uuid} 
                          onClick={() => handleSelectOrder(o)}
                          className={`cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-primary-50/60 dark:bg-primary-950/20 border-l-4 border-l-primary-500' 
                              : 'hover:bg-secondary-50/50 dark:hover:bg-secondary-800/40'
                          }`}
                        >
                          {/* Order Ref & Date */}
                          <td className="p-3.5">
                            <span className="font-bold text-secondary-900 dark:text-white block">
                              #{o.order_number}
                            </span>
                            <span className="text-[10px] text-secondary-500 block mt-0.5">
                              {o.created_at ? new Date(o.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                            </span>
                          </td>

                          {/* Customer & Phone */}
                          <td className="p-3.5">
                            <span className="font-semibold text-secondary-900 dark:text-white block line-clamp-1">
                              {customer.name}
                            </span>
                            {customer.phone ? (
                              <span className="text-secondary-600 dark:text-secondary-400 font-medium flex items-center gap-1 mt-0.5 text-[11px]">
                                <Phone className="w-3 h-3 text-secondary-400" />
                                {customer.phone}
                              </span>
                            ) : (
                              <span className="text-secondary-400 italic text-[10px]">No phone</span>
                            )}
                          </td>

                          {/* Destination */}
                          <td className="p-3.5 max-w-[150px]">
                            {customer.addr?.city || customer.addr?.region ? (
                              <div>
                                <span className="font-semibold text-secondary-800 dark:text-secondary-200 block truncate">
                                  {[customer.addr.city, customer.addr.region].filter(Boolean).join(', ')}
                                </span>
                                <span className="text-[10px] text-secondary-500 block truncate" title={addrText}>
                                  {customer.addr.address_line_1 || customer.addr.country || 'Ghana'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-secondary-400 italic text-[10px]">No address</span>
                            )}
                          </td>

                          {/* Items Preview */}
                          <td className="p-3.5">
                            <div className="flex items-center gap-1.5">
                              {/* Thumbnail preview */}
                              {itemsList.slice(0, 2).map((item, i) => {
                                const img = getItemImage(item);
                                return img ? (
                                  <img
                                    key={i}
                                    src={img}
                                    alt={item.product_name || 'Item'}
                                    className="w-7 h-7 rounded border border-secondary-200 dark:border-secondary-700 object-cover bg-white"
                                  />
                                ) : (
                                  <div key={i} className="w-7 h-7 rounded border border-secondary-200 dark:border-secondary-700 bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center text-secondary-400">
                                    <Package className="w-3.5 h-3.5" />
                                  </div>
                                );
                              })}
                              
                              <div className="text-[11px] font-semibold text-secondary-800 dark:text-secondary-200">
                                <span>{itemsList.length} {itemsList.length === 1 ? 'item' : 'items'}</span>
                                {itemsList.length > 2 && (
                                  <span className="text-[10px] text-secondary-500 ml-1">+{itemsList.length - 2} more</span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Total & Payment */}
                          <td className="p-3.5">
                            <span className="font-extrabold text-secondary-900 dark:text-white block">
                              GHS {parseFloat(o.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold uppercase ${
                                isPaid 
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' 
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                              }`}>
                                {isPaid ? 'Paid' : 'Unpaid'}
                              </span>
                              <span className="text-[10px] text-secondary-500 uppercase">
                                {o.payment?.method || 'MoMo/Card'}
                              </span>
                            </div>
                          </td>

                          {/* Fulfillment Status */}
                          <td className="p-3.5">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusConf.badge}`}>
                              <StatusIcon className="w-3 h-3" />
                              {statusConf.label}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => setDetailModalOrder(o)}
                                title="View Full Order Invoice & Delivery Slip"
                                className="p-1.5 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleSelectOrder(o)}
                                title="Update Fulfillment"
                                className="p-1.5 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(o)}
                                title="Delete Order"
                                className="p-1.5 text-secondary-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="p-3 border-t border-secondary-200 dark:border-secondary-800">
                  <DotPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Selected Order Quick Card & Fulfillment Updater */}
        <div className="space-y-4">
          {selectedOrder ? (
            <aside className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl p-5 shadow-sm space-y-5 animate-in slide-in-from-right duration-200">
              
              {/* Header */}
              <div className="flex items-start justify-between border-b border-secondary-100 dark:border-secondary-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-400">Selected Order</span>
                  <h3 className="font-extrabold text-base text-secondary-900 dark:text-white flex items-center gap-1.5">
                    #{selectedOrder.order_number}
                  </h3>
                  <p className="text-[10px] text-secondary-500 mt-0.5">
                    {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : ''}
                  </p>
                </div>
                
                <button
                  onClick={() => setDetailModalOrder(selectedOrder)}
                  className="px-2.5 py-1 text-xs font-bold text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 rounded-lg border border-primary-200 dark:border-primary-800/40 flex items-center gap-1 transition-colors"
                  title="Open full printable packing slip and invoice"
                >
                  <FileText className="w-3.5 h-3.5" /> Full Invoice
                </button>
              </div>

              {/* Customer Contact & Address Card */}
              {(() => {
                const cust = getCustomerInfo(selectedOrder);
                const fullAddr = getFormattedAddress(selectedOrder);
                return (
                  <div className="bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-200/70 dark:border-secondary-700/60 rounded-lg p-3.5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-secondary-500 uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary-500" /> Customer & Delivery Destination
                      </span>
                      {cust.phone && (
                        <button
                          onClick={() => handleCopy(cust.phone, 'phone')}
                          className="text-[10px] text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5 font-bold"
                        >
                          {copiedText === 'phone' ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                          {copiedText === 'phone' ? 'Copied' : 'Copy Phone'}
                        </button>
                      )}
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-secondary-900 dark:text-white text-sm">
                        {cust.name}
                      </p>
                      
                      {cust.phone ? (
                        <p className="flex items-center gap-1.5 text-secondary-700 dark:text-secondary-300">
                          <Phone className="w-3.5 h-3.5 text-secondary-400" />
                          <a href={`tel:${cust.phone}`} className="hover:text-primary-500 font-semibold underline underline-offset-2">
                            {cust.phone}
                          </a>
                        </p>
                      ) : (
                        <p className="text-[11px] text-secondary-400 italic">No phone number on record</p>
                      )}

                      {cust.email && (
                        <p className="flex items-center gap-1.5 text-secondary-600 dark:text-secondary-400">
                          <Mail className="w-3.5 h-3.5 text-secondary-400" />
                          <a href={`mailto:${cust.email}`} className="hover:text-primary-500 truncate">
                            {cust.email}
                          </a>
                        </p>
                      )}
                    </div>

                    {/* Street Address */}
                    <div className="pt-2 border-t border-secondary-200 dark:border-secondary-700 text-xs">
                      <span className="text-[10px] text-secondary-400 font-bold uppercase block mb-0.5">Shipping Address:</span>
                      {fullAddr ? (
                        <p className="text-secondary-800 dark:text-secondary-200 leading-relaxed font-medium">
                          {fullAddr}
                        </p>
                      ) : (
                        <p className="text-secondary-400 italic text-[11px]">
                          No delivery address attached (Customer pickup or store dispatch).
                        </p>
                      )}
                    </div>

                    {/* Customer special order notes if any */}
                    {selectedOrder.notes && (
                      <div className="pt-2 border-t border-secondary-200 dark:border-secondary-700 text-xs">
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase block mb-0.5">Customer Delivery Note:</span>
                        <p className="text-secondary-700 dark:text-secondary-300 italic bg-amber-50 dark:bg-amber-950/20 p-2 rounded border border-amber-200 dark:border-amber-900/40">
                          "{selectedOrder.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Items Ordered List */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-secondary-500 uppercase tracking-wider block">
                  Items Ordered ({(selectedOrder.items || []).length})
                </span>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {(selectedOrder.items && selectedOrder.items.length > 0) ? (
                    selectedOrder.items.map((item, idx) => {
                      const img = getItemImage(item);
                      return (
                        <div 
                          key={item.id || idx}
                          className="flex items-center gap-3 p-2 bg-secondary-50 dark:bg-secondary-800/40 border border-secondary-200 dark:border-secondary-800 rounded-lg text-xs"
                        >
                          {img ? (
                            <img
                              src={img}
                              alt={item.product_name}
                              className="w-12 h-12 rounded object-cover border border-secondary-200 dark:border-secondary-700 bg-white shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded border border-secondary-200 dark:border-secondary-700 bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center text-secondary-400 shrink-0">
                              <Package className="w-5 h-5" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-secondary-900 dark:text-white truncate" title={item.product_name}>
                              {item.product_name}
                            </p>
                            <p className="text-[11px] text-secondary-500 mt-0.5">
                              {item.quantity} × GHS {parseFloat(item.price || 0).toFixed(2)}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-extrabold text-secondary-900 dark:text-white">
                              GHS {(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-xs text-secondary-400 italic py-2 text-center">
                      No item records attached to this order.
                    </p>
                  )}
                </div>
              </div>

              {/* Financial Breakdown */}
              <div className="pt-3 border-t border-secondary-100 dark:border-secondary-800 text-xs space-y-1.5">
                <div className="flex justify-between text-secondary-600 dark:text-secondary-400">
                  <span>Subtotal</span>
                  <span>GHS {parseFloat(selectedOrder.subtotal || 0).toFixed(2)}</span>
                </div>
                {parseFloat(selectedOrder.shipping_amount || 0) > 0 && (
                  <div className="flex justify-between text-secondary-600 dark:text-secondary-400">
                    <span>Shipping Fee</span>
                    <span>GHS {parseFloat(selectedOrder.shipping_amount || 0).toFixed(2)}</span>
                  </div>
                )}
                {parseFloat(selectedOrder.discount_amount || 0) > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>- GHS {parseFloat(selectedOrder.discount_amount || 0).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-sm text-secondary-900 dark:text-white pt-1.5 border-t border-secondary-200 dark:border-secondary-700">
                  <span>Grand Total</span>
                  <span className="text-primary-600 dark:text-primary-400">
                    GHS {parseFloat(selectedOrder.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Fulfillment Status Update Form */}
              <form onSubmit={handleUpdateStatus} className="pt-3 border-t border-secondary-100 dark:border-secondary-800 space-y-3">
                <span className="text-[10px] font-bold text-secondary-500 uppercase tracking-wider block">
                  Update Fulfillment
                </span>

                <div>
                  <label className="block text-[11px] font-semibold text-secondary-700 dark:text-secondary-300 mb-1">
                    Fulfillment Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full p-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  <label className="block text-[11px] font-semibold text-secondary-700 dark:text-secondary-300 mb-1">
                    Fulfillment / Tracking Note
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Dispatch rider name, phone, tracking code..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full p-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full py-2.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-secondary-900 font-extrabold rounded-lg text-xs shadow transition-all flex items-center justify-center gap-1.5"
                >
                  {updating ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Update Status'}
                </button>
              </form>

            </aside>
          ) : (
            <div className="bg-white dark:bg-secondary-900 border border-dashed border-secondary-300 dark:border-secondary-800 p-8 rounded-xl text-center text-xs text-secondary-500 dark:text-secondary-400">
              <ShoppingBag className="w-8 h-8 text-secondary-300 dark:text-secondary-700 mx-auto mb-2" />
              Click any order on the left to view customer contact info, delivery address, ordered items, and update fulfillment.
            </div>
          )}
        </div>

      </div>

      {/* FULL ORDER INVOICE & DELIVERY MODAL */}
      {detailModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-950/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 print:border-none print:shadow-none print:w-full print:max-w-none">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-secondary-200 dark:border-secondary-800 flex justify-between items-center bg-secondary-50 dark:bg-secondary-850 print:bg-white">
              <div>
                <span className="text-[10px] font-extrabold text-primary-600 dark:text-primary-400 uppercase tracking-widest block">
                  SHOP VIOTOR INVOICE
                </span>
                <h3 className="font-extrabold text-xl text-secondary-900 dark:text-white flex items-center gap-2">
                  Order #{detailModalOrder.order_number}
                </h3>
                <p className="text-xs text-secondary-500 mt-0.5">
                  Placed on: {detailModalOrder.created_at ? new Date(detailModalOrder.created_at).toLocaleString() : ''}
                </p>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-lg border border-secondary-300 dark:border-secondary-700 text-secondary-700 dark:text-secondary-200 text-xs font-bold hover:bg-secondary-100 dark:hover:bg-secondary-800 flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" /> Print Packing Slip
                </button>
                <button
                  onClick={() => setDetailModalOrder(null)}
                  className="p-1.5 text-secondary-400 hover:text-secondary-900 dark:hover:text-white rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Customer & Shipping 2-col layout */}
              {(() => {
                const cust = getCustomerInfo(detailModalOrder);
                const fullAddr = getFormattedAddress(detailModalOrder);
                const rawStatus = (detailModalOrder.status?.value || detailModalOrder.status || 'pending').toLowerCase();
                const statusConf = STATUS_CONFIG[rawStatus] || STATUS_CONFIG.pending;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer Account Box */}
                    <div className="p-4 bg-secondary-50 dark:bg-secondary-800/40 rounded-xl border border-secondary-200/80 dark:border-secondary-700/60 space-y-2 text-xs">
                      <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider block">Customer Details</span>
                      <p className="font-bold text-sm text-secondary-900 dark:text-white">{cust.name}</p>
                      
                      {cust.phone ? (
                        <p className="flex items-center gap-2 text-secondary-700 dark:text-secondary-300">
                          <Phone className="w-4 h-4 text-primary-500 shrink-0" />
                          <a href={`tel:${cust.phone}`} className="font-semibold text-secondary-900 dark:text-white hover:underline">
                            {cust.phone}
                          </a>
                        </p>
                      ) : (
                        <p className="text-secondary-400 italic">No phone attached</p>
                      )}

                      {cust.email && (
                        <p className="flex items-center gap-2 text-secondary-600 dark:text-secondary-400">
                          <Mail className="w-4 h-4 text-secondary-400 shrink-0" />
                          <a href={`mailto:${cust.email}`} className="hover:underline">
                            {cust.email}
                          </a>
                        </p>
                      )}

                      <div className="pt-2 mt-2 border-t border-secondary-200 dark:border-secondary-700 flex items-center justify-between">
                        <span className="text-secondary-500">Status:</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusConf.badge}`}>
                          {statusConf.label}
                        </span>
                      </div>
                    </div>

                    {/* Shipping Address Box */}
                    <div className="p-4 bg-secondary-50 dark:bg-secondary-800/40 rounded-xl border border-secondary-200/80 dark:border-secondary-700/60 space-y-2 text-xs">
                      <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary-500" /> Delivery Address
                      </span>

                      {fullAddr ? (
                        <div className="space-y-1">
                          <p className="font-semibold text-secondary-900 dark:text-white leading-relaxed">
                            {fullAddr}
                          </p>
                          {cust.addr?.postal_code && (
                            <p className="text-[11px] text-secondary-500">Postal Code: {cust.addr.postal_code}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-secondary-400 italic py-2">
                          No physical address attached to this order.
                        </p>
                      )}

                      {detailModalOrder.notes && (
                        <div className="pt-2 mt-2 border-t border-secondary-200 dark:border-secondary-700">
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase block">Special Instructions:</span>
                          <p className="text-secondary-700 dark:text-secondary-300 italic mt-0.5">
                            "{detailModalOrder.notes}"
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Items Table */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-secondary-500">
                  Products in Order
                </h4>
                
                <div className="border border-secondary-200 dark:border-secondary-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-secondary-50 dark:bg-secondary-800/60 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase text-[10px]">
                        <th className="p-3">Product</th>
                        <th className="p-3 text-center">SKU</th>
                        <th className="p-3 text-center">Unit Price</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                      {(detailModalOrder.items && detailModalOrder.items.length > 0) ? (
                        detailModalOrder.items.map((item, idx) => {
                          const img = getItemImage(item);
                          return (
                            <tr key={item.id || idx}>
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  {img ? (
                                    <img
                                      src={img}
                                      alt={item.product_name}
                                      className="w-12 h-12 rounded object-cover border border-secondary-200 dark:border-secondary-700 bg-white shrink-0"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded border border-secondary-200 dark:border-secondary-700 bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center text-secondary-400 shrink-0">
                                      <Package className="w-5 h-5" />
                                    </div>
                                  )}
                                  <span className="font-bold text-secondary-900 dark:text-white">
                                    {item.product_name}
                                  </span>
                                </div>
                              </td>
                              <td className="p-3 text-center text-secondary-500 font-mono text-[11px]">
                                {item.product_sku || '-'}
                              </td>
                              <td className="p-3 text-center text-secondary-700 dark:text-secondary-300">
                                GHS {parseFloat(item.price || 0).toFixed(2)}
                              </td>
                              <td className="p-3 text-center font-bold text-secondary-900 dark:text-white">
                                {item.quantity}
                              </td>
                              <td className="p-3 text-right font-bold text-secondary-900 dark:text-white">
                                GHS {(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="p-4 text-center text-secondary-400 italic">
                            No product items recorded for this order.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment & Financials Summary */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-secondary-50 dark:bg-secondary-800/40 rounded-xl border border-secondary-200 dark:border-secondary-800 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-secondary-400 block">Payment Details</span>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-primary-500" />
                    <span className="font-bold text-secondary-900 dark:text-white uppercase">
                      {detailModalOrder.payment?.method || 'Mobile Money / Card'}
                    </span>
                    <span className={`px-2 py-0.2 rounded font-bold text-[10px] uppercase ${
                      (detailModalOrder.paid_at || detailModalOrder.payment?.status === 'successful') 
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                    }`}>
                      {(detailModalOrder.paid_at || detailModalOrder.payment?.status === 'successful') ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>
                  {detailModalOrder.payment?.reference && (
                    <p className="text-[10px] text-secondary-500 font-mono">
                      Ref: {detailModalOrder.payment.reference}
                    </p>
                  )}
                </div>

                <div className="w-full sm:w-64 space-y-1 text-right">
                  <div className="flex justify-between text-secondary-500">
                    <span>Subtotal:</span>
                    <span>GHS {parseFloat(detailModalOrder.subtotal || 0).toFixed(2)}</span>
                  </div>
                  {parseFloat(detailModalOrder.shipping_amount || 0) > 0 && (
                    <div className="flex justify-between text-secondary-500">
                      <span>Shipping Fee:</span>
                      <span>GHS {parseFloat(detailModalOrder.shipping_amount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  {parseFloat(detailModalOrder.discount_amount || 0) > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span>- GHS {parseFloat(detailModalOrder.discount_amount || 0).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-extrabold text-secondary-900 dark:text-white pt-2 border-t border-secondary-200 dark:border-secondary-700">
                    <span>Total:</span>
                    <span className="text-primary-600 dark:text-primary-400">
                      GHS {parseFloat(detailModalOrder.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fulfillment Dispatch Notes */}
              {(detailModalOrder.admin_notes || detailModalOrder.cancellation_reason) && (
                <div className="p-3.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 rounded-xl text-xs space-y-1">
                  <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
                    Fulfillment / Dispatch Log
                  </span>
                  <p className="text-secondary-800 dark:text-secondary-200">
                    {detailModalOrder.admin_notes || detailModalOrder.cancellation_reason}
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-secondary-200 dark:border-secondary-800 flex justify-end gap-2 bg-secondary-50 dark:bg-secondary-850 print:hidden">
              <button
                type="button"
                onClick={() => setDetailModalOrder(null)}
                className="px-4 py-2 border border-secondary-300 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 text-xs font-bold rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;
export { Orders };
