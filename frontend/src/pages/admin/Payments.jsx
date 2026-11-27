import Swal from 'sweetalert2';
import React, { useEffect, useState } from 'react';
import adminService from '../../api/client';
import { RefreshCw, CheckCircle, Search, ShieldCheck } from 'lucide-react';
import DotPagination from '../../components/DotPagination';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  
  const filteredPayments = payments.filter(p => 
    (p.reference?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await adminService.get('/admin/payments');
      setPayments(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
      // Fallback mock payments
      setPayments([
        { uuid: 'pay1', reference: 'VTR-PAYSTK8472', method: 'paystack', amount: 1200.00, status: 'completed', paid_at: '2026-07-08T14:30:00Z' },
        { uuid: 'pay2', reference: 'VTR-BKNK4928', method: 'bank_transfer', amount: 5400.00, status: 'pending', paid_at: null },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleConfirmManual = async (p) => {
    const __confirmResult = await Swal.fire({
      title: 'Confirm Payment Received?',
      text: `Confirm manual receipt of GHS ${parseFloat(p.amount || 0).toFixed(2)} (Ref: ${p.reference})? Any linked order or layaway card boxes will be updated automatically.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Yes, Confirm Paid',
    });
    if (!__confirmResult.isConfirmed) return;
    try {
      await adminService.post(`/admin/payments/${p.uuid}/confirm`);
      Swal.fire({ icon: 'success', title: 'Confirmed!', text: `Payment ${p.reference} marked as completed.`, timer: 2000, showConfirmButton: false });
      fetchPayments();
    } catch (e) {
      Swal.fire('Error', e.response?.data?.message || e.message || 'Verification failed.', 'error');
    }
  };

  const handleReverifyPaystack = async (p) => {
    try {
      const res = await adminService.post(`/admin/payments/${p.uuid}/verify`);
      const updatedStatus = res.data?.data?.status || res.data?.status;
      Swal.fire({
        icon: updatedStatus === 'completed' ? 'success' : 'info',
        title: updatedStatus === 'completed' ? 'Verified & Completed!' : 'Verification Checked',
        text: `Paystack status for ${p.reference}: ${updatedStatus || 'checked'}.`,
        timer: 2500,
        showConfirmButton: false,
      });
      fetchPayments();
    } catch (e) {
      Swal.fire('Verification Failed', e.response?.data?.message || e.message || 'Could not verify with Paystack.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Payment Audits</h2>
          <p className="text-sm text-secondary-500 mt-1">Review webhook responses, gateway references, and manual receipts.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-secondary-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white placeholder-secondary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Search by reference..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : payments.length === 0 ? (
        <div className="p-8 border border-secondary-200 dark:border-secondary-800 rounded-xl text-center bg-white dark:bg-secondary-900 text-secondary-500 dark:text-secondary-400 font-semibold">
          No payments found.
        </div>
      ) : (
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-x-auto shadow-sm">
          <table className="w-full min-w-[650px] text-left border-collapse text-sm">
            <thead>
              <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase tracking-wider text-xxs">
                <th className="p-4">Reference</th>
                <th className="p-4">Method</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date Initiated</th>
                <th className="p-4">Paid At</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
              {paginatedPayments.map((p) => (
                <tr key={p.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                  <td className="p-4 font-semibold text-secondary-900 dark:text-white font-mono text-xs">{p.reference}</td>
                  <td className="p-4 text-secondary-700 dark:text-secondary-300 capitalize">{(p.method || '').replace('_', ' ')}</td>
                  <td className="p-4 font-bold text-secondary-900 dark:text-white">GHS {parseFloat(p.amount || 0).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`text-xxs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                      p.status === 'completed'
                        ? 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400'
                        : p.status === 'refunded'
                        ? 'bg-blue-100 dark:bg-blue-950/20 text-blue-800 dark:text-blue-400'
                        : p.status === 'failed'
                        ? 'bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400'
                        : 'bg-yellow-100 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-450'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-secondary-500 dark:text-secondary-400 text-xs">{p.created_at ? new Date(p.created_at).toLocaleString() : '—'}</td>
                  <td className="p-4 text-secondary-500 dark:text-secondary-400 text-xs">{p.paid_at ? new Date(p.paid_at).toLocaleString() : 'Pending'}</td>
                  <td className="p-4 text-right">
                    {p.status === 'pending' && (
                      <div className="inline-flex items-center gap-2 justify-end">
                        {p.method === 'paystack' ? (
                          <button
                            onClick={() => handleReverifyPaystack(p)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-500 hover:bg-primary-600 text-secondary-950 transition-colors shadow-sm"
                            title="Re-check transaction status directly with Paystack"
                          >
                            <ShieldCheck className="w-4 h-4" /> Verify Paystack
                          </button>
                        ) : (
                          <button
                            onClick={() => handleConfirmManual(p)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-sm"
                            title="Confirm Manual MoMo Payment Received"
                          >
                            <CheckCircle className="w-4 h-4" /> Confirm
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <DotPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default Payments;
export { Payments };
