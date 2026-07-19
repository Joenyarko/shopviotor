import React, { useEffect, useState } from 'react';
import tradeService from '../../services/tradeService';
import { Scale, X, RefreshCw, Eye } from 'lucide-react';

const TradeRequests = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [valuations, setValuations] = useState({}); // itemId: value
  const [productValue, setProductValue] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadTrades = async () => {
    setLoading(true);
    try {
      const response = await tradeService.adminGetTrades();
      setTrades(response.data?.data || response.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTrades();
  }, []);

  const handleOpenEvaluate = (trade) => {
    setSelectedTrade(trade);
    const initialVals = {};
    trade.items?.forEach(item => {
      initialVals[item.id] = item.admin_valued_at || '';
    });
    setValuations(initialVals);
    setProductValue(trade.product_value || '');
  };

  const handleValuationChange = (itemId, value) => {
    setValuations(prev => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleValuateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTrade) return;

    setProcessing(true);
    try {
      await tradeService.adminValuateTrade(selectedTrade.id || selectedTrade.uuid, {
        item_values: valuations,
        product_value: productValue,
      });
      alert('Valuation submitted successfully.');
      setSelectedTrade(null);
      loadTrades();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to submit trade valuation.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (uuid) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await tradeService.adminRejectTrade(uuid, reason);
      loadTrades();
    } catch (e) {
      alert(e.message || 'Failed to reject trade.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
          <Scale className="w-6 h-6 text-primary-500" /> Barter Swap Requests
        </h2>
        <p className="text-sm text-secondary-500 mt-1">Review swap offers from customers and assign valuations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Trade Requests list */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
          ) : trades.length === 0 ? (
            <div className="p-8 border border-secondary-200 dark:border-secondary-800 rounded-xl text-center bg-white dark:bg-secondary-900 text-secondary-500 dark:text-secondary-400 font-semibold">
              No pending trade requests found.
            </div>
          ) : (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase tracking-wider text-xxs">
                    <th className="p-4">Customer</th>
                    <th className="p-4">Target Item</th>
                    <th className="p-4">Swapping</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                  {trades.map((t) => (
                    <tr key={t.id || t.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                      <td className="p-4 font-semibold text-secondary-900 dark:text-white">{t.user?.name || 'Customer'}</td>
                      <td className="p-4 text-secondary-700 dark:text-secondary-300">{t.product?.name}</td>
                      <td className="p-4 font-semibold text-secondary-900 dark:text-white">{t.items?.[0]?.item_name}</td>
                      <td className="p-4">
                        <span className={`text-xxs px-2.5 py-0.5 rounded-full font-bold uppercase ${t.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-450' : 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400'}`}>
                          {t.status?.value || t.status}
                        </span>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleOpenEvaluate(t)} className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-lg"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleReject(t.id || t.uuid)} className="p-1.5 text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950/20 rounded-lg"><X className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Valuation Calculator panel */}
        <div>
          {selectedTrade ? (
            <aside className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 transition-colors shadow-sm">
              <h3 className="font-bold text-secondary-900 dark:text-white mb-4">Evaluate Swap Offer</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="block text-xxs text-secondary-500 uppercase font-bold tracking-wider">Target Item Cash Value</span>
                  <span className="text-sm font-semibold text-secondary-900 dark:text-white">GHS {parseFloat(selectedTrade.product?.price || 0).toLocaleString()}</span>
                </div>

                <form onSubmit={handleValuateSubmit} className="space-y-4 pt-4 border-t border-secondary-100 dark:border-secondary-800">
                  <div>
                    <label className="block text-xs font-bold text-secondary-500 uppercase">Assessed Swap Value of Offered Items</label>
                    {selectedTrade.items?.map(item => (
                      <div key={item.id} className="mt-3 bg-secondary-50 dark:bg-secondary-850 p-3 rounded-lg border border-secondary-200 dark:border-secondary-800">
                        <span className="block font-bold text-xs text-secondary-900 dark:text-white">{item.item_name}</span>
                        <p className="text-xxs text-secondary-500 dark:text-secondary-400 mt-1">{item.description}</p>
                        <input
                          type="number"
                          placeholder="Assign GHS Value"
                          required
                          value={valuations[item.id] || ''}
                          onChange={(e) => handleValuationChange(item.id, e.target.value)}
                          className="w-full mt-3 p-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-secondary-500 uppercase">Total Agreed Offered Value (GHS)</label>
                    <input
                      type="number"
                      required
                      value={productValue}
                      onChange={(e) => setProductValue(e.target.value)}
                      className="w-full mt-1.5 p-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full premium-button-primary py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Submit Valuation'}
                  </button>
                </form>
              </div>
            </aside>
          ) : (
            <div className="bg-white dark:bg-secondary-900 border border-dashed border-secondary-200 dark:border-secondary-800 p-8 rounded-2xl text-center text-xs text-secondary-500 dark:text-secondary-400">
              Select a trade request to review details and perform valuation.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TradeRequests;
export { TradeRequests };
