import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import layawayService from '../../services/layawayService';
import { Lock, AlertCircle, RefreshCw, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';

const LayawayDetail = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const product = state?.product;

  const [initialPayment, setInitialPayment] = useState(0);
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdLayaway, setCreatedLayaway] = useState(null);

  if (!product) {
    return (
      <div className="max-w-md mx-auto text-center py-20 dark:text-white space-y-4">
        <Lock className="w-16 h-16 text-primary-500 mx-auto" />
        <h2 className="text-xl font-bold">No Product Selected</h2>
        <p className="text-sm text-secondary-500 dark:text-secondary-400">Please browse our layaway products and select one.</p>
        <Link to="/layaway" className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold">
          Browse Layaway Products
        </Link>
      </div>
    );
  }

  const productPrice = parseFloat(product.price);
  const balanceAfterInitial = Math.max(0, productPrice - initialPayment);
  const progressPercent = productPrice > 0 ? Math.min(100, Math.round((initialPayment / productPrice) * 100)) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (initialPayment < 0) {
      setErrorMsg('Payment amount cannot be negative.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await layawayService.createLayaway({
        product_id: product.uuid,
        initial_payment: initialPayment,
        target_completion_date: targetDate || undefined,
        notes: notes || undefined,
        customer_phone: customerPhone,
        customer_address: customerAddress,
      });
      setCreatedLayaway(res.data?.data);
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to start layaway plan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <Link to="/layaway" className="text-sm text-primary-600 hover:text-primary-700 font-semibold mb-4 inline-flex items-center gap-1">
          ← Back to Layaway Hub
        </Link>
        <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white mt-2">Start Layaway Plan</h1>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Reserve this item and pay at your own pace. Delivery happens when fully paid.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: Form */}
        <div className="lg:col-span-3 space-y-6">
          {/* Product Card */}
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-4 flex gap-4 items-center">
            <img
              src={product.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&auto=format'}
              alt={product.name}
              className="w-20 h-20 object-cover rounded-xl bg-secondary-100"
            />
            <div className="flex-1">
              <span className="text-xxs font-bold text-primary-600 bg-primary-50 dark:bg-primary-950/20 px-2 py-0.5 rounded uppercase tracking-wide">Item to Reserve</span>
              <h3 className="font-bold text-secondary-900 dark:text-white mt-1">{product.name}</h3>
              <p className="text-primary-600 dark:text-primary-400 font-black text-lg">GHS {productPrice.toLocaleString()}</p>
            </div>
          </div>

          {(product.layaway_daily_amount || product.layaway_weekly_amount) && (
            <div className="bg-accent-50 dark:bg-accent-950/20 border border-accent-200 dark:border-accent-800 rounded-2xl p-4 flex gap-6">
              {product.layaway_daily_amount && (
                <div>
                  <p className="text-xs font-bold text-accent-700 dark:text-accent-400 uppercase tracking-wider">Daily Payment</p>
                  <p className="font-black text-secondary-900 dark:text-white text-lg">GHS {product.layaway_daily_amount}</p>
                </div>
              )}
              {product.layaway_weekly_amount && (
                <div>
                  <p className="text-xs font-bold text-accent-700 dark:text-accent-400 uppercase tracking-wider">Weekly Payment</p>
                  <p className="font-black text-secondary-900 dark:text-white text-lg">GHS {product.layaway_weekly_amount}</p>
                </div>
              )}
            </div>
          )}

          {success ? (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Layaway Plan Started!</h2>
              <p className="text-sm text-secondary-500 dark:text-secondary-400 max-w-sm mx-auto">
                Your item is now reserved. Keep contributing until fully paid, then we'll deliver it to you!
              </p>
              {createdLayaway && (
                <div className="bg-primary-50 dark:bg-primary-950/20 rounded-xl p-4 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-500">Balance Remaining</span>
                    <span className="font-bold text-primary-600">GHS {createdLayaway.balance_remaining?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-secondary-500">Payments Made</span>
                    <span className="font-bold text-secondary-900 dark:text-white">{createdLayaway.payment_count}</span>
                  </div>
                </div>
              )}
              <div className="flex gap-3 justify-center pt-2">
                <Link to="/my-layaways" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold">My Plans</Link>
                <Link to="/layaway" className="premium-button-secondary px-6 py-2.5 rounded-lg text-sm font-bold">Browse More</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 space-y-6 shadow-xl">
              <h2 className="font-bold text-lg text-secondary-900 dark:text-white">Configure Your Plan</h2>

              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg flex gap-2.5 text-sm border border-red-200/50">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Initial payment */}
              <div>
                <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">
                  First Contribution Amount (GHS)
                </label>
                <input
                  type="number"
                  min={0}
                  max={productPrice}
                  step={0.01}
                  value={initialPayment}
                  onChange={e => setInitialPayment(Math.min(productPrice, Math.max(0, parseFloat(e.target.value) || 0)))}
                  placeholder="e.g. 50"
                  className="w-full p-3 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-xl text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1.5">
                  You can start with GHS 0 (just reserve) or any amount. Every bit counts!
                </p>
              </div>

              {/* Progress preview */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-secondary-600 dark:text-secondary-400">
                  <span>Progress after first payment</span>
                  <span className="text-primary-600">{progressPercent}%</span>
                </div>
                <div className="h-3 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-secondary-500 dark:text-secondary-400">
                  <span>GHS {initialPayment.toLocaleString()} paid</span>
                  <span>GHS {balanceAfterInitial.toLocaleString()} remaining</span>
                </div>
              </div>

              {/* Target date */}
              <div>
                <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Target Completion Date (optional)
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={e => setTargetDate(e.target.value)}
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  className="w-full p-3 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-xl text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    placeholder="e.g. 0541234567"
                    className="w-full p-3 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-xl text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">Delivery Address *</label>
                  <textarea
                    rows={1}
                    required
                    value={customerAddress}
                    onChange={e => setCustomerAddress(e.target.value)}
                    placeholder="Your full delivery address"
                    className="w-full p-3 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-xl text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">Notes (optional)</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Any special instructions or notes for your plan..."
                  className="w-full p-3 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-xl text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 transition-colors"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Register / Purchase Layaway'}
              </button>
            </form>
          )}
        </div>

        {/* Right: Info Card */}
        <div className="lg:col-span-2">
          <div className="bg-gradient-to-br from-primary-600 to-accent-600 rounded-2xl p-6 text-white space-y-6 sticky top-24">
            <h3 className="font-bold text-lg">💡 How Layaway Works</h3>
            <div className="space-y-4">
              {[
                { emoji: '🔒', title: 'Item Reserved', desc: 'The moment you start a plan, this item is reserved exclusively for you.' },
                { emoji: '💰', title: 'Pay Bit by Bit', desc: 'Contribute any amount, any time — like putting money in a susu pot daily or weekly.' },
                { emoji: '📦', title: 'Delivered When Paid', desc: 'Once your balance hits GHS 0, we ship the item directly to you.' },
                { emoji: '🚫', title: 'No Extra Charges', desc: 'No interest. No hidden fees. You only pay the product price.' },
              ].map(({ emoji, title, desc }) => (
                <div key={title} className="flex gap-3">
                  <span className="text-xl">{emoji}</span>
                  <div>
                    <p className="font-bold text-sm">{title}</p>
                    <p className="text-primary-100 text-xs leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayawayDetail;
export { LayawayDetail };
