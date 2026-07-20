import React, { useState, useEffect } from 'react';
import layawayService from '../../services/layawayService';
import { Package, RefreshCw, Eye, Check, X, PlusCircle } from 'lucide-react';
import LayawayProductModal from '../../components/admin/LayawayProductModal';

const AdminLayaway = () => {
  const [layaways, setLayaways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLayaway, setSelectedLayaway] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [processing, setProcessing] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  // Settings Tab State
  const [termsText, setTermsText] = useState('');
  const [savingTerms, setSavingTerms] = useState(false);
  const [loadingTerms, setLoadingTerms] = useState(false);

  const loadLayaways = async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const res = await layawayService.adminGetLayaways(params);
      setLayaways(res.data?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { 
    if (activeTab === 'settings') {
      loadTerms();
    } else {
      loadLayaways(); 
    }
  }, [activeTab]);

  const loadTerms = async () => {
    setLoadingTerms(true);
    try {
      const res = await layawayService.adminGetTerms();
      setTermsText(res.data?.data?.layaway_terms || '');
    } catch (e) {
        console.error(e);
    } finally { setLoadingTerms(false); }
  };

  const saveTerms = async () => {
    setSavingTerms(true);
    try {
      await layawayService.adminSaveTerms({ layaway_terms: termsText });
      alert('Terms saved successfully!');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to save terms');
    } finally { setSavingTerms(false); }
  };

  const handleRelease = async (uuid) => {
    if (!window.confirm('Mark this layaway as released/delivered?')) return;
    setProcessing(true);
    try {
      await layawayService.adminRelease(uuid);
      setSelectedLayaway(null);
      loadLayaways();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to release.');
    } finally { setProcessing(false); }
  };

  const handleCancel = async (uuid) => {
    if (!window.confirm('Cancel this layaway plan?')) return;
    setProcessing(true);
    try {
      await layawayService.adminCancel(uuid);
      setSelectedLayaway(null);
      loadLayaways();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel.');
    } finally { setProcessing(false); }
  };

  const statusColor = (status) => ({
    active:    'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
    completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
    cancelled: 'bg-secondary-100 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-400',
    defaulted: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
  })[status] || 'bg-secondary-100 text-secondary-600';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-primary-500" /> Layaway Plans
          </h2>
          <p className="text-sm text-secondary-500 mt-1">Manage all customer layaway/susu savings plans.</p>
        </div>
        <button onClick={() => setIsProductModalOpen(true)} className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-secondary-900 px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors">
          <PlusCircle className="w-4 h-4" /> Add Layaway Product
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-secondary-200 dark:border-secondary-800 gap-1 overflow-x-auto">
        {['all', 'active', 'completed', 'cancelled', 'settings'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-semibold capitalize border-b-2 transition-colors whitespace-nowrap ${activeTab === tab ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:text-secondary-400'}`}>
            {tab === 'all' ? 'All Plans' : tab === 'settings' ? 'Global Settings' : tab}
          </button>
        ))}
      </div>

      {activeTab === 'settings' ? (
        <div className="max-w-3xl bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-secondary-900 dark:text-white mb-4">Layaway / Susu Terms & Conditions</h3>
          <p className="text-sm text-secondary-500 mb-6">These terms will be displayed to customers when they register for a new layaway plan.</p>
          
          {loadingTerms ? (
             <div className="flex justify-center py-8"><RefreshCw className="w-6 h-6 text-primary-500 animate-spin" /></div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={termsText}
                onChange={e => setTermsText(e.target.value)}
                className="w-full bg-secondary-50 dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-800 rounded-xl px-4 py-3 text-sm text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[300px]"
                placeholder="Enter your global layaway terms and conditions here..."
              />
              <button 
                onClick={saveTerms} 
                disabled={savingTerms}
                className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold rounded-xl text-sm disabled:opacity-50"
              >
                {savingTerms ? 'Saving...' : 'Save Terms'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Table */}
          <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center py-16"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
          ) : layaways.length === 0 ? (
            <div className="py-12 text-center bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl text-secondary-500">
              No layaway plans found.
            </div>
          ) : (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase tracking-wider text-xxs">
                    <th className="p-4 text-left">Customer</th>
                    <th className="p-4 text-left">Product</th>
                    <th className="p-4 text-left">Progress</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                  {layaways.map(l => (
                    <tr key={l.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                      <td className="p-4">
                        <p className="font-semibold text-secondary-900 dark:text-white">{l.user?.name}</p>
                        <p className="text-xs text-secondary-500">{l.user?.phone || l.user?.email}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-secondary-900 dark:text-white line-clamp-1">{l.product?.name}</p>
                        <p className="text-xs text-secondary-500">GHS {l.product_price?.toLocaleString()}</p>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          <div className="h-1.5 bg-secondary-100 dark:bg-secondary-800 rounded-full w-28 overflow-hidden">
                            <div className={`h-full rounded-full ${l.status === 'completed' ? 'bg-emerald-500' : 'bg-primary-500'}`} style={{ width: `${l.progress_percentage}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-secondary-600 dark:text-secondary-400">{l.progress_percentage}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xxs font-bold px-2.5 py-0.5 rounded-full ${statusColor(l.status)}`}>{l.status}</span>
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => setSelectedLayaway(l)} className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div>
          {selectedLayaway ? (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 shadow-sm space-y-5">
              {selectedLayaway.product?.primary_image && (
                <img src={selectedLayaway.product.primary_image} alt="" className="w-full h-32 object-cover rounded-xl" />
              )}
              <div>
                <h3 className="font-bold text-secondary-900 dark:text-white">{selectedLayaway.product?.name}</h3>
                <p className="text-xs text-secondary-500">by {selectedLayaway.user?.name}</p>
              </div>

              <div className="space-y-3 text-sm">
                {[
                  ['Total Price', `GHS ${selectedLayaway.product_price?.toLocaleString()}`],
                  ['Paid So Far', `GHS ${selectedLayaway.total_paid?.toLocaleString()}`],
                  ['Remaining', `GHS ${selectedLayaway.balance_remaining?.toLocaleString()}`],
                  ['Payments Made', selectedLayaway.payment_count],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-secondary-500 dark:text-secondary-400">{label}</span>
                    <span className="font-bold text-secondary-900 dark:text-white">{value}</span>
                  </div>
                ))}
                
                {selectedLayaway.customer_phone && (
                  <div className="mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-800">
                    <p className="text-xs text-secondary-500 font-bold uppercase tracking-wide">Customer Details</p>
                    <p className="text-sm mt-1"><span className="text-secondary-500">Phone:</span> {selectedLayaway.customer_phone}</p>
                    <p className="text-sm mt-0.5"><span className="text-secondary-500">Address:</span> {selectedLayaway.customer_address}</p>
                  </div>
                )}

                <div className="h-2 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden mt-4">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: `${selectedLayaway.progress_percentage}%` }} />
                </div>
                <p className="text-xs text-center text-secondary-500">{selectedLayaway.progress_percentage}% complete</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-secondary-100 dark:border-secondary-800">
                {selectedLayaway.status === 'active' && selectedLayaway.balance_remaining === 0 && (
                  <button onClick={() => handleRelease(selectedLayaway.uuid)} disabled={processing}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Release / Mark Delivered
                  </button>
                )}
                {selectedLayaway.status === 'completed' && (
                  <div className="text-center py-2 text-emerald-600 font-bold text-sm flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" /> Fully Paid & Released
                  </div>
                )}
                {selectedLayaway.status === 'active' && (
                  <button onClick={() => handleCancel(selectedLayaway.uuid)} disabled={processing}
                    className="w-full py-2 bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                    <X className="w-4 h-4" /> Cancel Plan
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-secondary-900 border border-dashed border-secondary-200 dark:border-secondary-800 rounded-2xl p-8 text-center text-xs text-secondary-500 dark:text-secondary-400">
              Click on a layaway plan to view details.
            </div>
          )}
        </div>
      </div>
      )}

      {/* Quick Add Layaway Product Modal */}
      <LayawayProductModal 
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={() => {
          // If we want to do something on success, e.g. show a toast
        }}
      />
    </div>
  );
};

export default AdminLayaway;
export { AdminLayaway };
