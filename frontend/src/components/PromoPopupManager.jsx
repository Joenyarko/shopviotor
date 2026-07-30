import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import promoPopupService from '../services/promoPopupService';

const PromoPopupManager = () => {
  const [popups, setPopups] = useState([]);
  const [activePopup, setActivePopup] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all active popups on mount
    const fetchPopups = async () => {
      try {
        const res = await promoPopupService.getActivePopups();
        setPopups(res.data?.data || []);
      } catch (e) {
        console.error('Failed to fetch promo popups', e);
      }
    };
    fetchPopups();
  }, []);

  useEffect(() => {
    if (popups.length === 0) return;

    // Determine the current "page type" based on URL
    const path = location.pathname;
    let currentPage = 'all';

    if (path === '/') currentPage = 'home';
    else if (path.includes('/raffles')) currentPage = 'raffle';
    else if (path.includes('/hire-purchase')) currentPage = 'hire_purchase';
    else if (path.includes('/layaway')) currentPage = 'layaway';
    else if (path.includes('/pre-orders')) currentPage = 'preorder';
    else if (path.includes('/products') || path.includes('/categories')) currentPage = 'marketplace';

    // Find a popup that matches the current page (or 'all')
    const matchingPopup = popups.find(p => p.target_page === currentPage || p.target_page === 'all');

    if (matchingPopup) {
      // Check if we've already shown it in this session (Option B logic)
      const sessionKey = `has_seen_popup_${matchingPopup.uuid}`;
      const hasSeen = sessionStorage.getItem(sessionKey);

      if (!hasSeen) {
        // We haven't seen it, show it!
        // Slight delay for better UX
        const timer = setTimeout(() => {
          setActivePopup(matchingPopup);
          sessionStorage.setItem(sessionKey, 'true');
        }, 800);
        return () => clearTimeout(timer);
      }
    } else {
      // Hide if navigation moves away
      setActivePopup(null);
    }
  }, [location.pathname, popups]);

  if (!activePopup) return null;

  const handleImageClick = () => {
    if (activePopup.link_url) {
      // if it's an external link
      if (activePopup.link_url.startsWith('http')) {
        window.open(activePopup.link_url, '_blank');
      } else {
        // internal routing
        navigate(activePopup.link_url);
      }
      setActivePopup(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8">
      {/* Dark overlay backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setActivePopup(null)}
      />
      
      {/* Popup Container (No border radius, no text) */}
      <div className="relative z-10 max-w-sm sm:max-w-md md:max-w-lg w-full flex justify-center animate-in zoom-in-95 duration-300">
        
        {/* Close Button placed slightly outside or floating on top-right */}
        <button 
          onClick={() => setActivePopup(null)}
          className="absolute -top-3 -right-3 md:-top-5 md:-right-5 z-20 bg-black/80 hover:bg-black text-white rounded-full p-2 shadow-lg transition-transform hover:scale-110"
        >
          <X className="w-5 h-5 md:w-6 md:h-6" />
        </button>

        {/* The Sleek Image */}
        <div 
          className={`relative w-full ${activePopup.link_url ? 'cursor-pointer' : ''}`}
          onClick={handleImageClick}
        >
          <img 
            src={activePopup.image_url} 
            alt="Promo" 
            className="w-full h-auto object-contain max-h-[85vh] shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
};

export default PromoPopupManager;
