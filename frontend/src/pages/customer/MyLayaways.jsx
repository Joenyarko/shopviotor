import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import layawayService from '../../services/layawayService';
import { Package, RefreshCw, CreditCard, CheckCircle2, Clock, AlertTriangle, ArrowRight, PlusCircle, X } from 'lucide-react';

const statusConfig = {
  active:    { label: 'Active',    color: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400' },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400' },
  cancelled: { label: 'Cancelled', color: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-400' },
  defaulted: { label: 'Defaulted', color: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400' },
};

const MyLayaways = () => {
  const [layaways, setLayaways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLayaway, setSelectedLayaway] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payNotes, setPayNotes] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);

  useEffect(() => {
    fetchLayaways();
  }, []);

  const fetchLayaways = async () => {
    try {
      setLoading(true);
      const res = await layawayService.getLayaways();
      setLayaways(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openPayModal = (layaway) => {
    setSelectedLayaway(layaway);
    setPayAmount('');
    setPayNotes('');
    setPayError('');
    setShowPayModal(true);
  };

  const handleMakePayment = async (e) => {
    e.preventDefault();
    if (!payAmount || parseFloat(payAmount) <= 0) {
      setPayError('Please enter a valid payment amount.');
      return;
    }
    setPaying(true);
    setPayError('');
    try {
      await layawayService.makePayment(selectedLayaway.uuid, {
        amount: parseFloat(payAmount),
        notes: payNotes || undefined,
      });
      setShowPayModal(false);
      fetchLayaways();
    } catch (err) {
      setPayError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-primary-500" />
            My Layaway Plans
          </h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Track your savings progress and make contributions.</p>
        </div>
        <Link to="/layaway" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 transition-colors">
          <PlusCircle className="w-4 h-4" /> Start New Plan
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="w-10 h-10 text-primary-500 animate-spin" /></div>
      ) : layaways.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-5 bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 shadow-sm">
          <Package className="w-20 h-20 text-secondary-200 dark:text-secondary-700" />
          <div className="text-center">
            <p className="font-bold text-secondary-900 dark:text-white text-lg">No Layaway Plans Yet</p>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1 max-w-sm">Browse our products and start saving toward something you love!</p>
          </div>
          <Link to="/layaway" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold">
            Browse Layaway Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {layaways.map(layaway => {
            const config = statusConfig[layaway.status] || statusConfig.active;
            const isActive = layaway.status === 'active';

            return (
              <div key={layaway.uuid} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Product Image */}
                  <div className="w-full md:w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-secondary-100 dark:bg-secondary-800">
                    <img
                      src={layaway.product?.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200'}
                      alt={layaway.product?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-secondary-900 dark:text-white">{layaway.product?.name || 'Product'}</h3>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-0.5">
                          {layaway.payment_count} payment{layaway.payment_count !== 1 ? 's' : ''} made
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${config.color}`}>{config.label}</span>
                    </div>

                    {/* Progress Bar / Box Grid */}
                    {layaway.product?.layaway_total_boxes ? (
                      <div className="space-y-3 pt-2">
                        <div className="flex justify-between text-xs font-semibold text-secondary-600 dark:text-secondary-400">
                          <span>Susu Box Progress ({layaway.ticked_boxes || 0} / {layaway.product.layaway_total_boxes} boxes)</span>
                          <span className="text-primary-600 dark:text-primary-400">GHS {layaway.product.layaway_box_price} / box</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.from({ length: layaway.product.layaway_total_boxes }).map((_, i) => (
                            <div key={i} className={`w-6 h-6 rounded flex items-center justify-center border text-[10px] font-bold ${i < (layaway.ticked_boxes || 0) ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm' : 'bg-secondary-100 dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700 text-secondary-400'}`}>
                              {i < (layaway.ticked_boxes || 0) ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 pt-2">
                        <div className="flex justify-between text-xs font-semibold text-secondary-600 dark:text-secondary-400">
                          <span>Payment Progress</span>
                          <span className="text-primary-600 dark:text-primary-400">{layaway.progress_percentage}%</span>
                        </div>
                        <div className="h-3 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${layaway.status === 'completed' ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary-500 to-accent-500'}`}
                            style={{ width: `${Math.min(100, layaway.progress_percentage)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Payment amounts */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xxs text-secondary-500 font-bold uppercase tracking-wider">Total Price</p>
                        <p className="text-sm font-bold text-secondary-900 dark:text-white">GHS {layaway.product_price?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xxs text-secondary-500 font-bold uppercase tracking-wider">Paid So Far</p>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">GHS {layaway.total_paid?.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xxs text-secondary-500 font-bold uppercase tracking-wider">Remaining</p>
                        <p className="text-sm font-bold text-primary-600 dark:text-primary-400">GHS {layaway.balance_remaining?.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    {isActive && (
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => openPayModal(layaway)}
                          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                        >
                          <CreditCard className="w-4 h-4" /> Make a Contribution
                        </button>
                        {layaway.status === 'completed' && (
                          <span className="flex items-center gap-1 text-sm text-emerald-600 font-semibold">
                            <CheckCircle2 className="w-4 h-4" /> Awaiting Delivery
                          </span>
                        )}
                      </div>
                    )}

                    {layaway.status === 'completed' && (
                      <p className="text-sm font-semibold text-emerald-600 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Fully Paid — Awaiting Delivery
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pay Modal */}
      {showPayModal && selectedLayaway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl w-full max-w-md shadow-2xl border border-secondary-200 dark:border-secondary-800">
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-bold text-xl text-secondary-900 dark:text-white">Make a Contribution</h3>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-0.5">{selectedLayaway.product?.name}</p>
                </div>
                <button onClick={() => setShowPayModal(false)} className="p-1.5 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg text-secondary-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-primary-50 dark:bg-primary-950/20 rounded-xl p-4 mb-5">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-secondary-500 dark:text-secondary-400">Balance Remaining</span>
                  <span className="font-bold text-primary-600">GHS {selectedLayaway.balance_remaining?.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-primary-100 dark:bg-primary-900/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${selectedLayaway.progress_percentage}%` }}
                  />
                </div>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1.5">{selectedLayaway.progress_percentage}% paid</p>
              </div>

              {payError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-200/50 flex gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {payError}
                </div>
              )}

              <form onSubmit={handleMakePayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-1.5">Amount to Contribute (GHS)</label>
                  <input
                    type="number"
                    min={1}
                    max={selectedLayaway.balance_remaining}
                    step={0.01}
                    required
                    value={payAmount}
                    onChange={e => setPayAmount(e.target.value)}
                    placeholder={`Max: GHS ${selectedLayaway.balance_remaining?.toLocaleString()}`}
                    className="w-full p-3 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-xl text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-1.5">Notes (optional)</label>
                  <input
                    type="text"
                    value={payNotes}
                    onChange={e => setPayNotes(e.target.value)}
                    placeholder="e.g. Week 3 contribution"
                    className="w-full p-3 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-xl text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={paying}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  {paying ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Confirm Contribution'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyLayaways;
export { MyLayaways };
