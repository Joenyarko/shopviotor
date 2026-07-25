import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import apiClient from '../../api/client';
import { Link } from 'react-router-dom';

const PromoPopup = () => {
  const [campaign, setCampaign] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await apiClient.get('/marketing/campaigns/active');
        const activeCampaigns = response?.data?.data || response?.data || (Array.isArray(response) ? response : []);
        
        if (activeCampaigns.length > 0) {
          // Get the first active popup campaign
          const popupCampaign = activeCampaigns.find(c => c.display_location === 'homepage_popup');
          
          if (popupCampaign) {
            // Check localStorage
            const hasSeen = localStorage.getItem(`promo_seen_${popupCampaign.uuid}`);
            if (!hasSeen) {
              setCampaign(popupCampaign);
              // Small delay so it doesn't pop up INSTANTLY on load
              setTimeout(() => setIsOpen(true), 1500);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch promo campaigns:', error);
      }
    };

    fetchCampaigns();
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    if (campaign) {
      localStorage.setItem(`promo_seen_${campaign.uuid}`, 'true');
    }
  };

  if (!isOpen || !campaign) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-secondary-900/60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-sm sm:max-w-[400px] bg-white dark:bg-secondary-900 rounded-3xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in duration-300"
      >
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-black/20 hover:bg-black/40 text-white rounded-full backdrop-blur-md transition-colors"
          aria-label="Close promo"
        >
          <X className="w-5 h-5" />
        </button>

        {campaign.target_url ? (
          <Link to={campaign.target_url} onClick={handleClose} className="block relative aspect-video w-full group overflow-hidden">
            <img 
              src={campaign.image_path} 
              alt={campaign.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
               <span className="text-white font-bold text-lg translate-y-4 group-hover:translate-y-0 transition-transform">Explore Now →</span>
            </div>
          </Link>
        ) : (
          <div className="relative aspect-video w-full">
            <img 
              src={campaign.image_path} 
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-5 text-center">
          <h3 className="text-lg sm:text-xl font-bold text-secondary-900 dark:text-white mb-2">
            {campaign.title}
          </h3>
          <p className="text-secondary-500 dark:text-secondary-400 text-xs sm:text-sm mb-4">
            Don't miss out on our exclusive deals. Limited time only!
          </p>
          
          <button 
            onClick={handleClose}
            className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200 text-xs sm:text-sm font-medium transition-colors"
          >
            No thanks, maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromoPopup;
