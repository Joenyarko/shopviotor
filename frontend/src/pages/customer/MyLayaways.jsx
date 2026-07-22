import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { Package, RefreshCw, PlusCircle } from 'lucide-react';
import LayawayBoxTracker from '../../components/LayawayBoxTracker';
import { toast } from 'react-toastify';

const MyLayaways = () => {
  const [layaways, setLayaways] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedCardDetails, setSelectedCardDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchLayaways = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/layaways');
      setLayaways(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load layaways');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayaways();
  }, []);

  const handleSelectLayaway = async (uuid) => {
    setSelectedCardId(uuid);
    setLoadingDetails(true);
    try {
      const res = await apiClient.get(`/layaways/${uuid}`);
      setSelectedCardDetails(res.data || res);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load card details');
      setSelectedCardId(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Reload both the list and the selected card
    fetchLayaways();
    if (selectedCardId) {
      handleSelectLayaway(selectedCardId);
    }
  };

  // If a card is selected, show the Tracker
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
          isAdmin={false} 
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
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white flex items-center gap-3">
            <Package className="w-8 h-8 text-primary-500" />
            My Registered Cards
          </h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Track your layaway box progress and make payments.</p>
        </div>
        <Link to="/products" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 transition-colors">
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
          <Link to="/products" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase tracking-wider text-xxs">
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
        </div>
      )}
    </div>
  );
};

export default MyLayaways;
