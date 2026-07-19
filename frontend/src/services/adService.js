// Mock ad service using localStorage
const ADS_STORAGE_KEY = 'shop_viotor_ads';

// Default ads just to show something if none exist
const DEFAULT_ADS = [
  { id: '1', imageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&auto=format&fit=crop&q=80', title: 'Welcome to SHOP VIOTOR' },
  { id: '2', imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&auto=format&fit=crop&q=80', title: 'Flash Sales Every Friday' },
];

export const adService = {
  getAds: async () => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const stored = localStorage.getItem(ADS_STORAGE_KEY);
    if (stored) {
      if (stored.includes('via.placeholder.com')) {
        localStorage.removeItem(ADS_STORAGE_KEY);
        return DEFAULT_ADS;
      }
      return JSON.parse(stored);
    }
    return DEFAULT_ADS;
  },
  
  saveAd: async (adData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const stored = localStorage.getItem(ADS_STORAGE_KEY);
    const ads = stored ? JSON.parse(stored) : DEFAULT_ADS;
    const newAd = { ...adData, id: Date.now().toString() };
    const updatedAds = [...ads, newAd];
    localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(updatedAds));
    return newAd;
  },
  
  deleteAd: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const stored = localStorage.getItem(ADS_STORAGE_KEY);
    const ads = stored ? JSON.parse(stored) : DEFAULT_ADS;
    const updatedAds = ads.filter(ad => ad.id !== id);
    localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(updatedAds));
    return true;
  }
};

export default adService;
