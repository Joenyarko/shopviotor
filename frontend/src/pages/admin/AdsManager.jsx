import React, { useState, useEffect } from 'react';
import { adService } from '../../services/adService';
import { Trash2, Plus, Image as ImageIcon } from 'lucide-react';

const AdsManager = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newAdUrl, setNewAdUrl] = useState('');
  const [newAdTitle, setNewAdTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      setLoading(true);
      const data = await adService.getAds();
      setAds(data);
    } catch (error) {
      console.error('Failed to load ads', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAd = async (e) => {
    e.preventDefault();
    if (!newAdUrl.trim()) return;

    try {
      setIsSubmitting(true);
      await adService.saveAd({ imageUrl: newAdUrl, title: newAdTitle || 'New Ad' });
      setNewAdUrl('');
      setNewAdTitle('');
      await loadAds();
    } catch (error) {
      console.error('Failed to save ad', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this ad?')) return;
    try {
      await adService.deleteAd(id);
      await loadAds();
    } catch (error) {
      console.error('Failed to delete ad', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Manage Marketing Ads</h1>
      </div>

      {/* Add New Ad Form */}
      <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">Add New Ad Banner</h2>
        <form onSubmit={handleAddAd} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-grow w-full">
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Image URL</label>
            <input 
              type="url" 
              required
              placeholder="https://example.com/image.jpg"
              value={newAdUrl}
              onChange={(e) => setNewAdUrl(e.target.value)}
              className="w-full border border-secondary-300 dark:border-secondary-700 rounded-lg px-4 py-2 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white"
            />
          </div>
          <div className="w-full sm:w-1/3">
            <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">Title (Optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Black Friday Sale"
              value={newAdTitle}
              onChange={(e) => setNewAdTitle(e.target.value)}
              className="w-full border border-secondary-300 dark:border-secondary-700 rounded-lg px-4 py-2 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white"
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting || !newAdUrl}
            className="w-full sm:w-auto bg-primary-500 hover:bg-primary-600 text-secondary-900 font-semibold px-6 py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Adding...' : <><Plus className="w-4 h-4" /> Add Ad</>}
          </button>
        </form>
      </div>

      {/* Ads List */}
      <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : ads.length === 0 ? (
          <div className="p-8 text-center text-secondary-500 flex flex-col items-center">
            <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
            <p>No ads configured. Add one above to display it on the homepage.</p>
          </div>
        ) : (
          <div className="divide-y divide-secondary-200 dark:divide-secondary-800">
            {ads.map(ad => (
              <div key={ad.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="w-full sm:w-64 h-32 bg-secondary-100 dark:bg-secondary-800 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow text-center sm:text-left">
                  <h3 className="font-semibold text-secondary-900 dark:text-white">{ad.title || 'Untitled Ad'}</h3>
                  <p className="text-xs text-secondary-500 truncate max-w-xs sm:max-w-md mt-1" title={ad.imageUrl}>{ad.imageUrl}</p>
                </div>
                <div>
                  <button 
                    onClick={() => handleDelete(ad.id)}
                    className="p-2 text-accent-500 hover:bg-accent-50 dark:hover:bg-accent-900/30 rounded-lg transition-colors"
                    title="Delete Ad"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdsManager;
