import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import vendorService from '../../services/vendorService';
import { Wallet, ArrowRightLeft, Clock, DollarSign, PlusCircle, CheckCircle, XCircle } from 'lucide-react';

const VendorWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    payment_method: 'mobile_money',
    payment_details: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [walletRes, payoutsRes] = await Promise.all([
        vendorService.getWallet(),
        vendorService.getPayouts()
      ]);
      setWallet(walletRes?.data?.wallet);
      setTransactions(walletRes?.data?.transactions || []);
      setPayouts(payoutsRes?.data?.data || payoutsRes?.data || []);
    } catch (err) {
      console.error('Failed to load wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    if (parseFloat(payoutForm.amount) > parseFloat(wallet?.available_balance || 0)) {
      return Swal.fire('Error', 'Amount exceeds available balance', 'error');
    }
    
    setSubmitting(true);
    try {
      await vendorService.requestPayout(payoutForm);
      Swal.fire('Success', 'Payout requested successfully. Pending admin approval.', 'success');
      setShowPayoutModal(false);
      setPayoutForm({ amount: '', payment_method: 'mobile_money', payment_details: '' });
      loadData();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to request payout', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Wallet & Payouts</h1>
          <p className="text-secondary-500 dark:text-secondary-400">Manage your earnings and withdraw funds</p>
        </div>
        <button 
          onClick={() => setShowPayoutModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <DollarSign className="w-4 h-4" />
          Request Withdrawal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-secondary-900 rounded-xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">Available Balance</p>
              <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">
                GHS {wallet?.available_balance || '0.00'}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-secondary-900 rounded-xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">Pending Balance</p>
              <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">
                GHS {wallet?.pending_balance || '0.00'}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-900 rounded-xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">Total Earned</p>
              <h3 className="text-2xl font-bold text-secondary-900 dark:text-white">
                GHS {wallet?.total_earned || '0.00'}
              </h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-800">
          <div className="p-6 border-b border-secondary-200 dark:border-secondary-800">
            <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Recent Transactions</h3>
          </div>
          <div className="p-0">
            {transactions.length === 0 ? (
              <p className="p-6 text-secondary-500 text-center">No transactions yet.</p>
            ) : (
              <div className="divide-y divide-secondary-200 dark:divide-secondary-800">
                {transactions.map(txn => (
                  <div key={txn.id} className="p-4 flex justify-between items-center hover:bg-secondary-50 dark:hover:bg-secondary-800/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${txn.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        <ArrowRightLeft className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-secondary-900 dark:text-white">{txn.description}</p>
                        <p className="text-xs text-secondary-500">{new Date(txn.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                        {txn.type === 'credit' ? '+' : '-'}GHS {txn.amount}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        txn.status === 'completed' ? 'bg-green-100 text-green-700' :
                        txn.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {txn.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Payout Requests */}
        <div className="bg-white dark:bg-secondary-900 rounded-xl shadow-sm border border-secondary-200 dark:border-secondary-800">
          <div className="p-6 border-b border-secondary-200 dark:border-secondary-800">
            <h3 className="text-lg font-bold text-secondary-900 dark:text-white">Payout Requests</h3>
          </div>
          <div className="p-0">
            {payouts.length === 0 ? (
              <p className="p-6 text-secondary-500 text-center">No payout requests yet.</p>
            ) : (
              <div className="divide-y divide-secondary-200 dark:divide-secondary-800">
                {payouts.map(req => (
                  <div key={req.id} className="p-4 flex justify-between items-center hover:bg-secondary-50 dark:hover:bg-secondary-800/50">
                    <div>
                      <p className="text-sm font-medium text-secondary-900 dark:text-white">
                        {req.payment_method === 'mobile_money' ? 'Mobile Money' : 'Bank Transfer'}
                      </p>
                      <p className="text-xs text-secondary-500">{new Date(req.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-secondary-900 dark:text-white">GHS {req.amount}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        req.status === 'paid' ? 'bg-green-100 text-green-700' :
                        req.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                        req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {req.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Request Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-secondary-900 rounded-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-secondary-200 dark:border-secondary-800 flex justify-between items-center">
              <h3 className="font-bold text-lg dark:text-white">Request Withdrawal</h3>
              <button onClick={() => setShowPayoutModal(false)} className="text-secondary-500 hover:bg-secondary-100 p-1 rounded">✕</button>
            </div>
            <form onSubmit={handleRequestPayout} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Amount (GHS)</label>
                <input 
                  type="number" 
                  min="10" 
                  step="0.01" 
                  required
                  value={payoutForm.amount}
                  onChange={e => setPayoutForm({...payoutForm, amount: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-secondary-800 dark:border-secondary-700 dark:text-white"
                  placeholder="0.00"
                />
                <p className="text-xs text-secondary-500 mt-1">Available: GHS {wallet?.available_balance || '0.00'}</p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Method</label>
                <select 
                  value={payoutForm.payment_method}
                  onChange={e => setPayoutForm({...payoutForm, payment_method: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-secondary-800 dark:border-secondary-700 dark:text-white"
                >
                  <option value="mobile_money">Mobile Money (Momo)</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Payment Details</label>
                <textarea 
                  required
                  rows="2"
                  value={payoutForm.payment_details}
                  onChange={e => setPayoutForm({...payoutForm, payment_details: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-secondary-800 dark:border-secondary-700 dark:text-white"
                  placeholder="e.g. 024XXXXXXX - John Doe (MTN)"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg text-secondary-600 hover:bg-secondary-50 dark:border-secondary-700 dark:text-secondary-300"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorWallet;
