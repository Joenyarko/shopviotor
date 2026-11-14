import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import vendorService from '../../services/vendorService';
import { 
  Wallet, 
  ArrowRightLeft, 
  Clock, 
  DollarSign, 
  PlusCircle, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Building2, 
  Smartphone,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const VendorWallet = () => {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    payment_method: 'mobile_money', // 'mobile_money' | 'bank_transfer'
    bank_code: 'MTN',
    bank_name: 'MTN Mobile Money',
    account_number: '',
    account_name: '',
    payment_details: ''
  });

  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
    loadBanks();
  }, []);

  const loadBanks = async () => {
    try {
      const res = await vendorService.getBanks();
      const list = res.data?.data || res.data || [];
      if (list.length > 0) {
        setBanks(list);
      }
    } catch (err) {
      console.warn('Could not load dynamic banks, using standard Ghanaian providers:', err);
    }
  };

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

  const handleVerifyAccount = async () => {
    if (!payoutForm.account_number || payoutForm.account_number.length < 9) {
      setVerificationError('Please enter a valid phone or account number.');
      return;
    }

    setVerifyingAccount(true);
    setVerificationError('');
    setAccountVerified(false);

    try {
      const res = await vendorService.resolveAccount({
        account_number: payoutForm.account_number,
        bank_code: payoutForm.bank_code
      });

      const data = res.data?.data || res.data;
      if (data?.account_name) {
        setPayoutForm(prev => ({ ...prev, account_name: data.account_name }));
        setAccountVerified(true);
      } else {
        setVerificationError('Could not verify account holder name.');
      }
    } catch (err) {
      setVerificationError(err.response?.data?.message || 'Verification failed. Please check the number and provider.');
    } finally {
      setVerifyingAccount(false);
    }
  };

  const handleBankChange = (e) => {
    const code = e.target.value;
    const selected = banks.find(b => b.code === code);
    setPayoutForm(prev => ({
      ...prev,
      bank_code: code,
      bank_name: selected?.name || code,
      account_name: ''
    }));
    setAccountVerified(false);
    setVerificationError('');
  };

  const handleRequestPayout = async (e) => {
    e.preventDefault();
    if (parseFloat(payoutForm.amount) > parseFloat(wallet?.available_balance || 0)) {
      return Swal.fire('Error', 'Amount exceeds available balance', 'error');
    }
    
    setSubmitting(true);
    try {
      await vendorService.requestPayout(payoutForm);
      Swal.fire({
        title: 'Payout Requested',
        text: 'Your withdrawal request has been submitted for instant Paystack settlement or admin review.',
        icon: 'success'
      });
      setShowPayoutModal(false);
      setPayoutForm({
        amount: '',
        payment_method: 'mobile_money',
        bank_code: 'MTN',
        bank_name: 'MTN Mobile Money',
        account_number: '',
        account_name: '',
        payment_details: ''
      });
      setAccountVerified(false);
      loadData();
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.response?.data?.message || 'Failed to request payout', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBanks = banks.filter(b => 
    payoutForm.payment_method === 'mobile_money' 
      ? (b.type === 'mobile_money' || ['MTN', 'VOD', 'ATL'].includes(b.code))
      : b.type !== 'mobile_money'
  );

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Wallet & Payouts</h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">Manage store revenues and automated Paystack withdrawals</p>
        </div>
        <button 
          onClick={() => setShowPayoutModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-extrabold rounded-xl shadow transition-all"
        >
          <DollarSign className="w-4 h-4" />
          Request Withdrawal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Available Balance</p>
              <h3 className="text-2xl font-black text-secondary-900 dark:text-white mt-1">
                GHS {parseFloat(wallet?.available_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-950/40 text-amber-600 rounded-xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Pending (Escrow)</p>
              <h3 className="text-2xl font-black text-secondary-900 dark:text-white mt-1">
                GHS {parseFloat(wallet?.pending_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-900 rounded-2xl p-6 shadow-sm border border-secondary-200 dark:border-secondary-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-950/40 text-blue-600 rounded-xl">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Total Earned</p>
              <h3 className="text-2xl font-black text-secondary-900 dark:text-white mt-1">
                GHS {parseFloat(wallet?.total_earned || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Transactions + Payouts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-hidden">
          <div className="p-5 border-b border-secondary-200 dark:border-secondary-800 flex justify-between items-center">
            <h3 className="text-base font-bold text-secondary-900 dark:text-white">Recent Store Transactions</h3>
            <span className="text-xs text-secondary-500">{transactions.length} records</span>
          </div>
          <div className="p-0">
            {transactions.length === 0 ? (
              <p className="p-8 text-secondary-400 text-center text-xs">No store transactions recorded yet.</p>
            ) : (
              <div className="divide-y divide-secondary-100 dark:divide-secondary-800">
                {transactions.map(txn => (
                  <div key={txn.id} className="p-4 flex justify-between items-center hover:bg-secondary-50/50 dark:hover:bg-secondary-800/40 text-xs">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${txn.type === 'credit' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        <ArrowRightLeft className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-secondary-900 dark:text-white">{txn.description || (txn.type === 'credit' ? 'Order Earnings' : 'Withdrawal')}</p>
                        <p className="text-[10px] text-secondary-400">{new Date(txn.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${txn.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {txn.type === 'credit' ? '+' : '-'} GHS {parseFloat(txn.amount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Withdrawal Payout History */}
        <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-hidden">
          <div className="p-5 border-b border-secondary-200 dark:border-secondary-800 flex justify-between items-center">
            <h3 className="text-base font-bold text-secondary-900 dark:text-white">Withdrawal History</h3>
            <span className="text-xs text-secondary-500">{payouts.length} requests</span>
          </div>
          <div className="p-0">
            {payouts.length === 0 ? (
              <p className="p-8 text-secondary-400 text-center text-xs">No withdrawal requests found.</p>
            ) : (
              <div className="divide-y divide-secondary-100 dark:divide-secondary-800">
                {payouts.map(p => (
                  <div key={p.id} className="p-4 flex justify-between items-center hover:bg-secondary-50/50 dark:hover:bg-secondary-800/40 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-secondary-900 dark:text-white">GHS {parseFloat(p.amount).toFixed(2)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          p.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                          p.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-rose-100 text-rose-800'
                        }`}>
                          {p.status}
                        </span>
                        {p.disbursed_via === 'paystack' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-primary-100 text-primary-900">
                            Paystack Direct
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-secondary-500">{p.payment_details}</p>
                      <p className="text-[10px] text-secondary-400">{new Date(p.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* REQUEST PAYOUT MODAL WITH REAL-TIME ACCOUNT VERIFICATION */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden border border-secondary-200 dark:border-secondary-800">
            <div className="p-5 border-b border-secondary-200 dark:border-secondary-800 flex justify-between items-center bg-secondary-50 dark:bg-secondary-850">
              <div>
                <h3 className="font-extrabold text-lg text-secondary-900 dark:text-white">Request Payout</h3>
                <p className="text-xs text-secondary-500">Fast, verified payout via Paystack Transfers</p>
              </div>
              <button 
                onClick={() => setShowPayoutModal(false)} 
                className="text-secondary-400 hover:text-secondary-900 dark:hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRequestPayout} className="p-6 space-y-4 text-xs">
              
              {/* Amount */}
              <div>
                <label className="block font-bold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider text-[11px] mb-1">
                  Withdrawal Amount (GHS) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-bold text-secondary-400">GHS</span>
                  <input 
                    type="number" 
                    min="10" 
                    step="0.01" 
                    required
                    value={payoutForm.amount}
                    onChange={e => setPayoutForm({...payoutForm, amount: e.target.value})}
                    className="w-full pl-12 pr-3 py-2.5 border border-secondary-300 dark:border-secondary-700 rounded-xl bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-[11px] text-secondary-500 mt-1">
                  Available for withdrawal: <strong className="text-primary-600">GHS {parseFloat(wallet?.available_balance || 0).toFixed(2)}</strong>
                </p>
              </div>

              {/* Method Switcher */}
              <div>
                <label className="block font-bold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider text-[11px] mb-1.5">
                  Payout Channel *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setPayoutForm(prev => ({ 
                        ...prev, 
                        payment_method: 'mobile_money', 
                        bank_code: 'MTN', 
                        bank_name: 'MTN Mobile Money',
                        account_name: '' 
                      }));
                      setAccountVerified(false);
                      setVerificationError('');
                    }}
                    className={`p-3 rounded-xl border flex items-center gap-2 font-bold transition-all ${
                      payoutForm.payment_method === 'mobile_money'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-secondary-900 dark:text-white ring-2 ring-primary-500/20'
                        : 'border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-primary-500" /> Mobile Money
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const firstBank = banks.find(b => b.type !== 'mobile_money') || { code: '040100', name: 'GCB Bank' };
                      setPayoutForm(prev => ({ 
                        ...prev, 
                        payment_method: 'bank_transfer', 
                        bank_code: firstBank.code, 
                        bank_name: firstBank.name,
                        account_name: '' 
                      }));
                      setAccountVerified(false);
                      setVerificationError('');
                    }}
                    className={`p-3 rounded-xl border flex items-center gap-2 font-bold transition-all ${
                      payoutForm.payment_method === 'bank_transfer'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 text-secondary-900 dark:text-white ring-2 ring-primary-500/20'
                        : 'border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400'
                    }`}
                  >
                    <Building2 className="w-4 h-4 text-primary-500" /> Bank Transfer
                  </button>
                </div>
              </div>

              {/* Bank / Provider Selector */}
              <div>
                <label className="block font-bold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider text-[11px] mb-1">
                  {payoutForm.payment_method === 'mobile_money' ? 'Mobile Money Network *' : 'Bank *'}
                </label>
                <select 
                  value={payoutForm.bank_code}
                  onChange={handleBankChange}
                  className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-xl bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  {filteredBanks.map(b => (
                    <option key={b.code} value={b.code}>{b.name}</option>
                  ))}
                  {filteredBanks.length === 0 && (
                    <>
                      <option value="MTN">MTN Mobile Money</option>
                      <option value="VOD">Telecel Cash (Vodafone)</option>
                      <option value="ATL">AT Money (AirtelTigo)</option>
                    </>
                  )}
                </select>
              </div>

              {/* Account Number / Phone with Verify button */}
              <div>
                <label className="block font-bold text-secondary-700 dark:text-secondary-300 uppercase tracking-wider text-[11px] mb-1">
                  {payoutForm.payment_method === 'mobile_money' ? 'MoMo Phone Number *' : 'Account Number *'}
                </label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    required
                    value={payoutForm.account_number}
                    onChange={e => {
                      setPayoutForm({...payoutForm, account_number: e.target.value, account_name: ''});
                      setAccountVerified(false);
                      setVerificationError('');
                    }}
                    placeholder={payoutForm.payment_method === 'mobile_money' ? 'e.g. 0241234567' : 'e.g. 104101234567'}
                    className="flex-1 p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-xl bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white font-medium focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyAccount}
                    disabled={verifyingAccount || !payoutForm.account_number}
                    className="px-3.5 py-2.5 bg-secondary-200 dark:bg-secondary-700 text-secondary-800 dark:text-white font-bold rounded-xl hover:bg-secondary-300 disabled:opacity-50 flex items-center gap-1 transition-colors shrink-0"
                  >
                    {verifyingAccount ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Verify'}
                  </button>
                </div>

                {/* Account verification feedback */}
                {accountVerified && payoutForm.account_name && (
                  <div className="mt-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Verified Name: {payoutForm.account_name}</span>
                  </div>
                )}

                {verificationError && (
                  <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {verificationError}
                  </p>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 py-2.5 border border-secondary-300 dark:border-secondary-700 rounded-xl text-secondary-700 dark:text-secondary-300 font-bold hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-[2] py-2.5 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-black rounded-xl shadow transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Submit Payout Request'}
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
