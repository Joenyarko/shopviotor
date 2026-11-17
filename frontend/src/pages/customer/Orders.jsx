import React, { useEffect, useState } from 'react';
import orderService from '../../services/orderService';
import { ShoppingBag, RefreshCw, Clock, Package, Truck, CheckCircle, CreditCard, Phone, XCircle, AlertCircle, Copy, Check, X } from 'lucide-react';
import DotPagination from '../../components/DotPagination';
import { openPaystack } from '../../utils/paystack';
import { useAuth } from '../../contexts/AuthContext';
import Swal from 'sweetalert2';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMomoOrder, setSelectedMomoOrder] = useState(null);
  const [copied, setCopied] = useState(false);
  const itemsPerPage = 4;

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
    navigator.clipboard.writeText('0508208803');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          text: 'Payment window was closed. You can also transfer directly via Mobile Money to 0508208803.',
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

  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const currentOrders = orders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
          {currentOrders.map((order) => (
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

              {/* Order Action Controls (For Unpaid / Pending Orders) */}
              {order.status !== 'cancelled' && order.status !== 'delivered' && !order.paid_at && (
                <div className="mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>Payment pending. Complete payment to initiate delivery:</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMomoOrder(order)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" /> Pay via MoMo
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePayOnline(order)}
                      className="premium-button-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Pay Online
                    </button>
                    {order.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => handleCancelOrder(order)}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950/20 transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}

            </div>
          ))}
          {totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <DotPagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
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
                Send the exact amount below directly to our verified Mobile Money number. Once sent, our team will verify your reference and dispatch your order.
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
                <span className="text-xs font-medium text-secondary-600 dark:text-secondary-400">Account Name:</span>
                <span className="text-xs font-bold text-secondary-900 dark:text-white">Francis Victor Okine</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                <div>
                  <div className="text-xs font-medium text-secondary-600 dark:text-secondary-400">MoMo Number:</div>
                  <div className="text-sm font-bold text-secondary-900 dark:text-white font-mono">0508208803</div>
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
