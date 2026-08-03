import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import vendorService from '../../services/vendorService';
import { DollarSign, CheckCircle, XCircle, Search, Filter } from 'lucide-react';

const AdminPayouts = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const handleProcess = async (uuid, action) => {
    const { value: note } = await Swal.fire({
      title: action === 'approve' ? 'Mark as Paid' : 'Reject Request',
      text: action === 'approve' 
        ? "Only approve this AFTER you have successfully sent the money to the vendor's account."
        : "Why are you rejecting this request? (The money will be refunded to their wallet)",
      input: 'text',
      inputPlaceholder: 'Add an optional note...',
      icon: action === 'approve' ? 'warning' : 'error',
      showCancelButton: true,
      confirmButtonText: action === 'approve' ? 'Yes, I have paid them' : 'Reject & Refund',
      confirmButtonColor: action === 'approve' ? '#10b981' : '#ef4444'
    });

    if (note !== undefined) {
      try {
        await vendorService.adminProcessPayout(uuid, { action, admin_notes: note });
        Swal.fire('Success', `Payout ${action === 'approve' ? 'approved' : 'rejected'} successfully.`, 'success');
        loadPayouts(currentPage);
      } catch (err) {
        console.error(err);
        Swal.fire('Error', err.response?.data?.message || 'Failed to process payout', 'error');
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Vendor Payouts</h1>
          <p className="text-secondary-500">Manage vendor withdrawal requests</p>
        </div>
        
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid / Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full min-w-[650px] text-left border-collapse">
            <thead>
              <tr className="bg-secondary-50 dark:bg-secondary-800/50 border-b border-secondary-200 dark:border-secondary-800 text-sm">
                <th className="p-4 font-semibold text-secondary-600 dark:text-secondary-400">Date</th>
                <th className="p-4 font-semibold text-secondary-600 dark:text-secondary-400">Vendor / Store</th>
                <th className="p-4 font-semibold text-secondary-600 dark:text-secondary-400">Amount</th>
                <th className="p-4 font-semibold text-secondary-600 dark:text-secondary-400">Payment Details</th>
                <th className="p-4 font-semibold text-secondary-600 dark:text-secondary-400">Status</th>
                <th className="p-4 font-semibold text-secondary-600 dark:text-secondary-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200 dark:divide-secondary-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-secondary-500">Loading...</td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-secondary-500">No payout requests found.</td>
                </tr>
              ) : (
                payouts.map((req) => (
                  <tr key={req.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50 transition-colors">
                    <td className="p-4 text-secondary-900 dark:text-secondary-300">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-secondary-900 dark:text-secondary-300 font-medium">
                      {req.store?.name || 'Unknown Store'}
                    </td>
                    <td className="p-4 font-bold text-primary-600">
                      GHS {req.amount}
                    </td>
                    <td className="p-4 text-secondary-600 dark:text-secondary-400">
                      <span className="font-semibold block">{req.payment_method === 'mobile_money' ? 'Momo' : 'Bank'}:</span>
                      {req.payment_details}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        req.status === 'paid' ? 'bg-green-100 text-green-700' :
                        req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleProcess(req.uuid, 'approve')}
                            className="px-3 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs font-semibold flex items-center gap-1"
                          >
                            <CheckCircle className="w-3 h-3" /> Mark Paid
                          </button>
                          <button 
                            onClick={() => handleProcess(req.uuid, 'reject')}
                            className="px-3 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-semibold flex items-center gap-1"
                          >
                            <XCircle className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-secondary-500 italic">
                          {req.admin_notes ? `Note: ${req.admin_notes}` : 'Processed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination placeholder if needed */}
      </div>
  );
};

export default AdminPayouts;
