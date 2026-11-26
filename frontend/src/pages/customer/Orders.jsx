import React, { useEffect, useState, useMemo } from 'react';
import orderService from '../../services/orderService';
import {
  ShoppingBag, RefreshCw, Clock, Package, Truck, CheckCircle,
  CreditCard, Phone, AlertCircle, Copy, Check, X, ChevronLeft, ChevronRight,
  ExternalLink, ChevronDown, ChevronUp, ArrowRight, Eye, Lock
} from 'lucide-react';
import { openPaystack } from '../../utils/paystack';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';

const STATUS_TABS = [
  { id: 'all', label: 'All Orders' },
  { id: 'pending', label: 'Pending Payment' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'cancelled', label: 'Cancelled' },
];

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrders, setExpandedOrders] = useState({});
  const [selectedMomoOrder, setSelectedMomoOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const [copiedOrderNum, setCopiedOrderNum] = useState(null);
  const itemsPerPage = 5;

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

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCopyNumber = () => {
    navigator.clipboard.writeText('715041');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyOrderNumber = (orderNum) => {
    navigator.clipboard.writeText(orderNum);
    setCopiedOrderNum(orderNum);
    setTimeout(() => setCopiedOrderNum(null), 2000);
  };

  const toggleExpand = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const handlePayOnline = (order) => {
    openPaystack({
      email: user?.email,
      amountGHS: parseFloat(order.total),
      reference: `${order.order_number}_${Date.now()}`,
      onSuccess: async (response) => {
        try {
          await orderService.verifyPayment(response.reference);
        } catch (e) {
          console.error(e);
        }
        Swal.fire({
          icon: 'success',
          title: 'Payment Successful!',
          text: `Your payment for order #${order.order_number} has been recorded.`,
        });
        fetchOrders();
      },
      onClose: () => {
        Swal.fire({
          icon: 'info',
          title: 'Payment Incomplete',
          text: 'Payment window was closed. You can try Paystack again or transfer directly via Mobile Money to Merchant ID 715041 (Shop Viotor Ventures).',
        });
      }
    });
  };

  const handleCancelOrder = async (order) => {
    const result = await Swal.fire({
      title: 'Cancel this order?',
      text: `Are you sure you want to cancel order #${order.order_number}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel Order',
      confirmButtonColor: '#ef4444',
    });

    if (result.isConfirmed) {
      try {
        await orderService.cancelOrder(order.uuid || order.id, 'Cancelled by customer');
        Swal.fire({ icon: 'success', title: 'Cancelled', text: 'Order has been cancelled.' });
        fetchOrders();
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Failed', text: err.response?.data?.message || err.message || 'Could not cancel order.' });
      }
    }
  };

  // Filter orders by active status tab
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'pending') return order.status === 'pending' || (!order.paid_at && order.status !== 'cancelled');
      return order.status === statusFilter;
    });
  }, [orders, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const currentOrders = useMemo(() => {
    return filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const getStatusBadge = (order) => {
    const isUnpaid = !order.paid_at && order.status !== 'cancelled' && order.status !== 'delivered';
    if (order.status === 'delivered') {
      return <span className="px-2.5 py-0.5 rounded-full text-xxs font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400">Delivered</span>;
    }
    if (order.status === 'cancelled') {
      return <span className="px-2.5 py-0.5 rounded-full text-xxs font-extrabold uppercase bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400">Cancelled</span>;
    }
    if (order.status === 'shipped') {
      return <span className="px-2.5 py-0.5 rounded-full text-xxs font-extrabold uppercase bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400">Shipped</span>;
    }
    if (order.status === 'processing') {
      return <span className="px-2.5 py-0.5 rounded-full text-xxs font-extrabold uppercase bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400">Processing</span>;
    }
    if (isUnpaid) {
      return <span className="px-2.5 py-0.5 rounded-full text-xxs font-extrabold uppercase bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 animate-pulse">Payment Pending</span>;
    }
    return <span className="px-2.5 py-0.5 rounded-full text-xxs font-extrabold uppercase bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400">{order.status}</span>;
  };

  const getProgressWidth = (status) => {
    switch (status) {
      case 'processing': return '35%';
      case 'shipped': return '70%';
      case 'delivered': return '100%';
      default: return '10%';
    }
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-secondary-200 dark:border-secondary-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-secondary-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 text-primary-500" /> My Orders
          </h1>
          <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">Track shipment progress and manage payment for your purchases.</p>
        </div>
        <div className="text-xs text-secondary-500 font-semibold bg-secondary-100 dark:bg-secondary-800 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          Total: <span className="text-secondary-900 dark:text-white font-extrabold">{orders.length}</span> orders
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => { setStatusFilter(tab.id); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              statusFilter === tab.id
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 animate-pulse" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl">
          <ShoppingBag className="w-12 h-12 text-secondary-300 mx-auto mb-3" />
          <p className="text-secondary-600 dark:text-secondary-300 font-bold text-sm">No orders found</p>
          <p className="text-secondary-400 text-xs mt-1">There are no orders matching this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {currentOrders.map((order) => {
            const isUnpaid = order.status !== 'cancelled' && order.status !== 'delivered' && !order.paid_at;
            const isExpanded = expandedOrders[order.id || order.uuid];

            return (
              <div
                key={order.id || order.uuid}
                className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-4 sm:p-5 transition-all shadow-sm hover:border-secondary-300 dark:hover:border-secondary-700"
              >
                {/* Compact Order Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-secondary-100 dark:border-secondary-800/80">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-secondary-900 dark:text-white">
                      #{order.order_number}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyOrderNumber(order.order_number)}
                      title="Copy Order Number"
                      className="p-1 rounded text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-200 transition-colors"
                    >
                      {copiedOrderNum === order.order_number ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <span className="text-xxs text-secondary-400 hidden sm:inline">• {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xxs uppercase font-bold text-secondary-400 block sm:hidden">Total</span>
                      <span className="text-sm font-black text-secondary-900 dark:text-white">
                        GHS {parseFloat(order.total).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {getStatusBadge(order)}
                  </div>
                </div>

                {/* Compact Status Progress Strip (For Active Orders) */}
                {order.status !== 'cancelled' && (
                  <div className="py-2.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-secondary-400 mb-1">
                      <span className={order.status === 'pending' ? 'text-primary-600 font-extrabold' : ''}>Order Placed</span>
                      <span className={order.status === 'processing' ? 'text-primary-600 font-extrabold' : ''}>Processing</span>
                      <span className={order.status === 'shipped' ? 'text-primary-600 font-extrabold' : ''}>Shipped</span>
                      <span className={order.status === 'delivered' ? 'text-emerald-600 font-extrabold' : ''}>Delivered</span>
                    </div>
                    <div className="w-full bg-secondary-100 dark:bg-secondary-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: getProgressWidth(order.status) }}
                      />
                    </div>
                  </div>
                )}

                {/* Items Preview Strip */}
                <div className="pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden flex-1 text-xs text-secondary-700 dark:text-secondary-300">
                      <Package className="w-3.5 h-3.5 text-secondary-400 flex-shrink-0" />
                      <span className="truncate">
                        {order.items && order.items.length > 0 
                          ? order.items.map(it => `${it.product_name} (×${it.quantity})`).join(', ')
                          : 'Order items'}
                      </span>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(order.id || order.uuid)}
                        className="text-xxs font-bold text-secondary-500 hover:text-primary-600 dark:hover:text-primary-400 flex items-center gap-1 pl-2 transition-colors"
                      >
                        {isExpanded ? <>Less <ChevronUp className="w-3 h-3" /></> : <>Details <ChevronDown className="w-3 h-3" /></>}
                      </button>
                    )}
                  </div>

                  {/* Expandable Order Line Items */}
                  {isExpanded && order.items && (
                    <div className="mt-3 pt-3 border-t border-secondary-100 dark:border-secondary-800 space-y-2 animate-fade-in">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs p-2 rounded-lg bg-secondary-50 dark:bg-secondary-800/40">
                          <span className="font-medium text-secondary-800 dark:text-secondary-200">
                            {item.product_name} <span className="text-secondary-400 font-bold">× {item.quantity}</span>
                          </span>
                          <span className="font-bold text-secondary-900 dark:text-white">
                            GHS {(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Compact Payment Action Toolbar (If Unpaid) */}
                {isUnpaid && (
                  <div className="mt-3 pt-3 border-t border-amber-100 dark:border-amber-950/40 flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Action required: Complete payment to process shipment</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMomoOrder(order)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5 shadow-sm transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" /> Pay via MoMo
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePayOnline(order)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary-500 hover:bg-primary-600 text-secondary-950 flex items-center gap-1.5 shadow-sm transition-colors"
                        title="Pay securely with Card or Mobile Money via Paystack"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Pay via Paystack
                      </button>
                      {order.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => handleCancelOrder(order)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950/20 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })}

          {/* Numbered Pagination Toolbar */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-secondary-200 dark:border-secondary-800">
              <span className="text-xs text-secondary-500">
                Showing <strong className="text-secondary-800 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong className="text-secondary-800 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</strong> of <strong className="text-secondary-800 dark:text-white">{filteredOrders.length}</strong> orders
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-1.5 rounded-lg border border-secondary-200 dark:border-secondary-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-700 dark:text-secondary-300 text-xs font-bold flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setCurrentPage(pNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-extrabold transition-colors ${
                        currentPage === pNum
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-1.5 rounded-lg border border-secondary-200 dark:border-secondary-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-700 dark:text-secondary-300 text-xs font-bold flex items-center gap-1"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MoMo Payment Modal */}
      {selectedMomoOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-secondary-100 dark:border-secondary-800 relative">
            <button
              onClick={() => setSelectedMomoOrder(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Mobile Money Payment</h3>
                <p className="text-xs text-secondary-500">Order #{selectedMomoOrder.order_number}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 mb-5">
              <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
                Send the exact amount below directly to our own Mobile Money number. Once sent, our team will verify your reference and dispatch your order.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                <span className="text-xs font-medium text-secondary-600 dark:text-secondary-400">Amount Due:</span>
                <span className="text-base font-extrabold text-primary-600 dark:text-primary-400">
                  GHS {parseFloat(selectedMomoOrder.total).toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                <span className="text-xs font-medium text-secondary-600 dark:text-secondary-400">Merchant Name:</span>
                <span className="text-xs font-bold text-secondary-900 dark:text-white">Shop Viotor Ventures</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                <div>
                  <div className="text-xs font-medium text-secondary-600 dark:text-secondary-400">Merchant ID:</div>
                  <div className="text-sm font-bold text-secondary-900 dark:text-white font-mono">715041</div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyNumber}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-secondary-700 text-secondary-800 dark:text-white border border-secondary-200 dark:border-secondary-600 flex items-center gap-1.5 hover:bg-secondary-100 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="flex justify-between items-center p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                <span className="text-xs font-medium text-secondary-600 dark:text-secondary-400">Payment Reference:</span>
                <span className="text-xs font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                  {selectedMomoOrder.order_number}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedMomoOrder(null)}
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-800 dark:hover:bg-secondary-700 text-secondary-800 dark:text-white transition-colors"
              >
                Close Window
              </button>
              <a
                href={`https://wa.me/233508208803?text=${encodeURIComponent(`Hello ShopViotor, I have made a MoMo payment of GHS ${selectedMomoOrder.total} for Order #${selectedMomoOrder.order_number}. Please confirm and process.`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-1.5 transition-colors"
              >
                Notify on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
export { Orders };
