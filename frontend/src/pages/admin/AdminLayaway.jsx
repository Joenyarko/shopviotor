import React, { useState, useEffect } from 'react';
import layawayService from '../../services/layawayService';
import apiClient from '../../api/client';
import { Package, RefreshCw, PlusCircle } from 'lucide-react';
import LayawayProductModal from '../../components/admin/LayawayProductModal';
import LayawayBoxTracker from '../../components/LayawayBoxTracker';
import { toast } from 'react-toastify';

const AdminLayaway = () => {
  const [layaways, setLayaways] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedCardDetails, setSelectedCardDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [activeTab, setActiveTab] = useState('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Settings Tab State
  const [termsText, setTermsText] = useState('');
  const [savingTerms, setSavingTerms] = useState(false);
  const [loadingTerms, setLoadingTerms] = useState(false);

  const loadLayaways = async () => {
    setLoading(true);
    try {
      const res = await layawayService.adminGetLayaways();
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
      toast.success('Terms updated successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to update terms');
    } finally { setSavingTerms(false); }
  };

  const handleSelectLayaway = async (uuid) => {
    setSelectedCardId(uuid);
    setLoadingDetails(true);
    try {
      const res = await apiClient.get(`/admin/layaways/${uuid}`);
      setSelectedCardDetails(res.data.data);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load card details');
      setSelectedCardId(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handlePaymentSuccess = () => {
    loadLayaways();
    if (selectedCardId) {
      handleSelectLayaway(selectedCardId);
    }
  };

  if (selectedCardId) {
    if (loadingDetails) {
      return (
        <div className="flex justify-center py-32">
          <RefreshCw className="w-12 h-12 text-primary-500 animate-spin" />
        </div>
      );
    }
    
    if (selectedCardDetails) {
      return (
        <LayawayBoxTracker 
          card={selectedCardDetails} 
          isAdmin={true} 
          onPaymentSuccess={handlePaymentSuccess}
          onBack={() => {
            setSelectedCardId(null);
            setSelectedCardDetails(null);
          }}
        />
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-primary-500" /> Layaway / Susu Plans
          </h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Manage customer box payments</p>
        </div>
        <button 
          onClick={() => setIsProductModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 text-sm shadow-lg shadow-primary-500/30 transition-all"
        >
          <PlusCircle className="w-4 h-4" /> Quick Add Product
        </button>
      </div>

      <div className="flex gap-4 border-b border-secondary-200 dark:border-secondary-800">
        {['all', 'settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-bold text-sm capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-secondary-500 hover:text-secondary-900 dark:hover:text-white'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'settings' ? (
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-8">
          <h2 className="text-lg font-bold text-secondary-900 dark:text-white mb-4">Layaway Terms & Conditions</h2>
          {loadingTerms ? (
            <div className="flex justify-center py-12"><RefreshCw className="w-6 h-6 text-primary-500 animate-spin" /></div>
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
                className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl text-sm disabled:opacity-50"
              >
                {savingTerms ? 'Saving...' : 'Save Terms'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex justify-center py-16"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
          ) : layaways.length === 0 ? (
            <div className="py-12 text-center text-secondary-500">
              No layaway plans found.
            </div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase tracking-wider text-xxs">
                  <th className="p-4 text-left">Customer</th>
                  <th className="p-4 text-left">Product</th>
                  <th className="p-4 text-left">Boxes</th>
                  <th className="p-4 text-left">Amount Paid</th>
                  <th className="p-4 text-left">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                {layaways.map(l => (
                  <tr key={l.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                    <td className="p-4 font-semibold text-secondary-900 dark:text-white">
                      {l.customer_name}
                    </td>
                    <td className="p-4 text-secondary-900 dark:text-white">
                      {l.product_name}
                    </td>
                    <td className="p-4 text-secondary-900 dark:text-white">
                      <span className="font-bold text-green-500">{l.boxes_checked}</span> / {l.total_boxes}
                    </td>
                    <td className="p-4 text-secondary-900 dark:text-white font-bold">
                      GHS {l.amount_paid?.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`text-xxs font-bold px-2.5 py-0.5 rounded-full ${l.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'}`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleSelectLayaway(l.uuid)} 
                        className="px-3 py-1.5 bg-primary-50 dark:bg-primary-950/20 text-primary-600 hover:bg-primary-100 dark:hover:bg-primary-900/40 rounded-lg text-xs font-bold"
                      >
                        View Tracker
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <LayawayProductModal 
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default AdminLayaway;
