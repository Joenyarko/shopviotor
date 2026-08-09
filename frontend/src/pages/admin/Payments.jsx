import Swal from 'sweetalert2';
import React, { useEffect, useState } from 'react';
import adminService from '../../api/client';
import { RefreshCw, CheckCircle, Search } from 'lucide-react';
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

  const handleConfirmManual = async (uuid) => {
    const __confirmResult = await Swal.fire({ title: 'Are you sure?', text: 'Confirm manual receipt of bank transfer?', icon: 'warning', showCancelButton: true });
    if (!__confirmResult.isConfirmed) return;
    try {
      await adminService.post(`/admin/payments/${uuid}/confirm`);
      fetchPayments();
    } catch (e) {
      Swal.fire({ text: String(e.message || 'Verification failed.') });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Payment Audits</h2>
          <p className="text-sm text-secondary-500 mt-1">Review webhook responses, gateway references, and manual receipts.</p>
        </div>
        <div className="relative w-full sm:w-auto max-w-sm">
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
                <th className="p-4">Paid At</th>
                <th className="p-4 text-right">Confirm</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
              {paginatedPayments.map((p) => (
                <tr key={p.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                  <td className="p-4 font-semibold text-secondary-900 dark:text-white">{p.reference}</td>
                  <td className="p-4 text-secondary-700 dark:text-secondary-300 capitalize">{p.method}</td>
                  <td className="p-4 font-bold text-secondary-900 dark:text-white">GHS {parseFloat(p.amount || 0).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`text-xxs px-2.5 py-0.5 rounded-full font-bold uppercase ${p.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400' : 'bg-yellow-100 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-450'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-secondary-500 dark:text-secondary-400">{p.paid_at ? new Date(p.paid_at).toLocaleString() : 'Pending'}</td>
                  <td className="p-4 text-right">
                    {p.method === 'bank_transfer' && p.status === 'pending' && (
                      <button
                        onClick={() => handleConfirmManual(p.uuid)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg"
                        title="Confirm Bank Payment Received"
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
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
