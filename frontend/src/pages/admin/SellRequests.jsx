import React, { useEffect, useState } from 'react';
import sellRequestService from '../../services/sellRequestService';
import { Truck, X, RefreshCw, Eye } from 'lucide-react';

const SellRequests = () => {
  const [sells, setSells] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSell, setSelectedSell] = useState(null);
  const [offeredPrice, setOfferedPrice] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadSells = async () => {
    setLoading(true);
    try {
      const response = await sellRequestService.adminGetSells();
      setSells(response.data?.data || response.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSells();
  }, []);

  const handleOpenApprove = (sell) => {
    setSelectedSell(sell);
    setOfferedPrice(sell.asking_price || '');
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSell) return;

    setProcessing(true);
    try {
      await sellRequestService.adminApproveSell(selectedSell.id || selectedSell.uuid, offeredPrice);
      alert('Sell request approved with buyout offer.');
      setSelectedSell(null);
      loadSells();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to approve request.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (uuid) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await sellRequestService.adminRejectSell(uuid, reason);
      loadSells();
    } catch (e) {
      alert(e.message || 'Failed to reject request.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
          <Truck className="w-6 h-6 text-primary-500" /> Corporate Buyout Requests
        </h2>
        <p className="text-sm text-secondary-500 mt-1">Review items submitted by customers for VTE direct acquisition.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Sell Requests list */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
          ) : sells.length === 0 ? (
            <div className="p-8 border border-secondary-200 dark:border-secondary-800 rounded-xl text-center bg-white dark:bg-secondary-900 text-secondary-500 dark:text-secondary-400 font-semibold">
              No buyout requests found.
            </div>
          ) : (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase tracking-wider text-xxs">
                    <th className="p-4">Customer</th>
                    <th className="p-4">Item Name</th>
                    <th className="p-4">Asking Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                  {sells.map((s) => (
                    <tr key={s.id || s.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                      <td className="p-4 font-semibold text-secondary-900 dark:text-white">{s.user?.name || 'Customer'}</td>
                      <td className="p-4 text-secondary-700 dark:text-secondary-300">{s.item_name}</td>
                      <td className="p-4 font-bold text-secondary-900 dark:text-white">GHS {parseFloat(s.asking_price || 0).toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`text-xxs px-2.5 py-0.5 rounded-full font-bold uppercase ${s.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-450' : 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400'}`}>
                          {s.status?.value || s.status}
                        </span>
                      </td>
                      <td className="p-4 text-right flex justify-end gap-2">
                        <button onClick={() => handleOpenApprove(s)} className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-lg"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleReject(s.id || s.uuid)} className="p-1.5 text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950/20 rounded-lg"><X className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Buyout Offer panel */}
        <div>
          {selectedSell ? (
            <aside className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 transition-colors shadow-sm">
              <h3 className="font-bold text-secondary-900 dark:text-white mb-4">Acquisition Buyout Offer</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="block text-xxs text-secondary-500 uppercase font-bold tracking-wider">Item Details</span>
                  <span className="text-sm font-semibold text-secondary-900 dark:text-white">{selectedSell.item_name} ({selectedSell.condition})</span>
                  <p className="text-xxs text-secondary-500 dark:text-secondary-400 mt-1">{selectedSell.description}</p>
                </div>

                <form onSubmit={handleApproveSubmit} className="space-y-4 pt-4 border-t border-secondary-100 dark:border-secondary-800">
                  <div>
                    <label className="block text-xs font-bold text-secondary-500 uppercase">Offered Buyout Price (GHS)</label>
                    <input
                      type="number"
                      required
                      value={offeredPrice}
                      onChange={(e) => setOfferedPrice(e.target.value)}
                      className="w-full mt-1.5 p-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full premium-button-primary py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Approve & Propose Offer'}
                  </button>
                </form>
              </div>
            </aside>
          ) : (
            <div className="bg-white dark:bg-secondary-900 border border-dashed border-secondary-300 dark:border-secondary-800 p-8 rounded-2xl text-center text-xs text-secondary-500 dark:text-secondary-400">
              Select a buyout request to review submission details and perform approval.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SellRequests;
export { SellRequests };
