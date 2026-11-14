import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import vendorService from '../../services/vendorService';
import { 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Search, 
  Filter, 
  Zap, 
  RefreshCw,
  Building2,
  Smartphone,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const AdminPayouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadPayouts = async (page = 1) => {
    setLoading(true);
    try {
      const res = await vendorService.adminGetPayouts({ page, status: statusFilter });
      const data = res?.data?.data || res?.data || [];
      setPayouts(data);
      if (res?.data?.meta) {
        setCurrentPage(res.data.meta.current_page);
        setLastPage(res.data.meta.last_page);
        setTotal(res.data.meta.total);
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to load payouts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayouts();
  }, [statusFilter]);

  // Handle Paystack Transfer (Instant Disbursal)
  const handlePaystackTransfer = async (req) => {
    const confirm = await Swal.fire({
      title: 'Disburse via Paystack Transfer?',
      html: `
        <div class="text-left text-sm space-y-2">
          <p>You are about to transfer <strong>GHS ${parseFloat(req.amount).toFixed(2)}</strong> directly from your Paystack balance to:</p>
          <div class="p-3 bg-secondary-100 rounded-lg text-xs space-y-1">
            <p><strong>Store:</strong> ${req.store?.name || 'Vendor'}</p>
            <p><strong>Account:</strong> ${req.payment_details}</p>
          </div>
          <p class="text-xs text-secondary-500">Ensure your Paystack dashboard balance has sufficient funds.</p>
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Yes, Send Money Now',
      confirmButtonColor: '#f59e0b',
      cancelButtonText: 'Cancel'
    });

    if (!confirm.isConfirmed) return;

    setProcessingId(req.uuid);
    try {
      const res = await vendorService.adminProcessPayout(req.uuid, {
        action: 'approve',
        disburse_via: 'paystack',
      });
      Swal.fire('Transfer Initiated', res.data?.message || 'Payout disbursed successfully via Paystack!', 'success');
      loadPayouts(currentPage);
    } catch (err) {
      console.error(err);
      Swal.fire('Transfer Error', err.response?.data?.message || 'Failed to disburse via Paystack.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Handle Manual Approval or Rejection
  const handleProcessManual = async (uuid, action) => {
    const { value: note } = await Swal.fire({
      title: action === 'approve' ? 'Mark as Paid Manually' : 'Reject Request',
      text: action === 'approve' 
        ? "Only approve this if you have ALREADY sent the money to the vendor via external bank or mobile money app."
        : "Why are you rejecting this request? (The money will be refunded to the vendor's wallet balance)",
      input: 'text',
      inputPlaceholder: 'Add an optional note...',
      icon: action === 'approve' ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonText: action === 'approve' ? 'Yes, I paid manually' : 'Reject & Refund',
      confirmButtonColor: action === 'approve' ? '#10b981' : '#ef4444'
    });

    if (note !== undefined) {
      setProcessingId(uuid);
      try {
        await vendorService.adminProcessPayout(uuid, { 
          action, 
          disburse_via: 'manual', 
          admin_notes: note 
        });
        Swal.fire('Success', `Payout ${action === 'approve' ? 'approved' : 'rejected'} successfully.`, 'success');
        loadPayouts(currentPage);
      } catch (err) {
        console.error(err);
        Swal.fire('Error', err.response?.data?.message || 'Failed to process payout', 'error');
      } finally {
        setProcessingId(null);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Vendor Payouts & Transfers</h1>
          <p className="text-sm text-secondary-500">Manage vendor withdrawal requests and automated Paystack disbursements</p>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-xs font-semibold dark:text-white shadow-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending Requests</option>
            <option value="paid">Paid / Disbursed</option>
            <option value="rejected">Rejected / Cancelled</option>
          </select>

          <button
            onClick={() => loadPayouts(currentPage)}
            disabled={loading}
            className="p-2 border border-secondary-200 dark:border-secondary-700 bg-white dark:bg-secondary-900 rounded-xl text-secondary-600 dark:text-secondary-300 hover:text-primary-500 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary-500' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left border-collapse text-xs">
            <thead>
              <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 font-bold text-secondary-500 uppercase tracking-wider text-[11px]">
                <th className="p-4">Date</th>
                <th className="p-4">Vendor / Store</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Destination Account</th>
                <th className="p-4">Disbursal Method</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-secondary-500">
                    <RefreshCw className="w-6 h-6 animate-spin text-primary-500 mx-auto mb-2" />
                    Loading payout requests...
                  </td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-secondary-500">
                    No payout requests found.
                  </td>
                </tr>
              ) : (
                payouts.map((req) => {
                  const isProcessing = processingId === req.uuid;

                  return (
                    <tr key={req.id} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/40 transition-colors">
                      <td className="p-4 text-secondary-700 dark:text-secondary-300 whitespace-nowrap">
                        {new Date(req.created_at).toLocaleDateString()}
                      </td>

                      <td className="p-4 font-bold text-secondary-900 dark:text-white">
                        {req.store?.name || 'Vendor'}
                      </td>

                      <td className="p-4 font-black text-sm text-secondary-900 dark:text-white">
                        GHS {parseFloat(req.amount).toFixed(2)}
                      </td>

                      <td className="p-4 text-secondary-700 dark:text-secondary-300">
                        <span className="font-semibold block text-[11px] text-secondary-500">
                          {req.payment_method === 'mobile_money' ? 'MoMo' : 'Bank'}:
                        </span>
                        <span className="font-medium">{req.payment_details}</span>
                      </td>

                      {/* Disbursal Method */}
                      <td className="p-4">
                        {req.disbursed_via === 'paystack' ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-primary-100 text-primary-900">
                              <Zap className="w-3 h-3 text-primary-600" /> Paystack Transfer
                            </span>
                            {req.transfer_reference && (
                              <span className="block text-[10px] font-mono text-secondary-400">
                                {req.transfer_reference}
                              </span>
                            )}
                          </div>
                        ) : req.status === 'paid' ? (
                          <span className="text-[10px] text-secondary-500 font-semibold">
                            Manual Transfer
                          </span>
                        ) : (
                          <span className="text-[10px] text-secondary-400 italic">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        <span className={`inline-flex px-2.5 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                          req.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                          req.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {req.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        {req.status === 'pending' ? (
                          <div className="flex justify-end gap-1.5">
                            {/* Paystack Instant Transfer Button */}
                            <button 
                              onClick={() => handlePaystackTransfer(req)}
                              disabled={isProcessing}
                              title="Disburse automatically via Paystack Transfer API"
                              className="px-2.5 py-1.5 bg-primary-500 hover:bg-primary-600 text-secondary-900 rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-sm transition-all disabled:opacity-50"
                            >
                              <Zap className="w-3.5 h-3.5 fill-current" /> Paystack Pay
                            </button>

                            {/* Manual Mark Paid */}
                            <button 
                              onClick={() => handleProcessManual(req.uuid, 'approve')}
                              disabled={isProcessing}
                              title="Mark as paid if money was already transferred externally"
                              className="px-2.5 py-1.5 bg-secondary-100 hover:bg-secondary-200 dark:bg-secondary-800 dark:hover:bg-secondary-700 text-secondary-800 dark:text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                            >
                              Manual
                            </button>

                            {/* Reject Button */}
                            <button 
                              onClick={() => handleProcessManual(req.uuid, 'reject')}
                              disabled={isProcessing}
                              title="Reject and refund money to vendor wallet"
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-700 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-secondary-500 italic">
                            {req.admin_notes ? `Note: ${req.admin_notes}` : 'Settled'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPayouts;
