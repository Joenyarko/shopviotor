import React, { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

const SiteNotice = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the user has already consented
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Delay showing it slightly for a smoother entry
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 pointer-events-none flex justify-center">
      <div className="bg-secondary-950 dark:bg-secondary-900 border border-secondary-800 rounded-2xl shadow-2xl p-5 md:p-6 max-w-4xl w-full flex flex-col md:flex-row items-center gap-6 pointer-events-auto transform translate-y-0 animate-in slide-in-from-bottom-10 fade-in duration-500">
        
        {/* Icon & Text */}
        <div className="flex items-start gap-4 flex-1">
          <div className="bg-primary-500/20 p-3 rounded-full text-primary-500 shrink-0">
            <Cookie className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">We value your privacy</h3>
            <p className="text-secondary-400 text-sm mt-1">
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. Read our <Link to="/privacy" className="text-primary-400 hover:text-primary-300 underline underline-offset-2">Privacy Policy</Link> and <Link to="/terms" className="text-primary-400 hover:text-primary-300 underline underline-offset-2">Terms of Service</Link>.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 shrink-0 w-full md:w-auto">
          <button 
            onClick={handleDecline}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold text-secondary-300 border border-secondary-800 hover:bg-secondary-800 transition-colors"
          >
            Decline
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 md:flex-none premium-button-primary px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40"
          >
            Accept All
          </button>
        </div>

        {/* Close Button (Optional, acts as decline) */}
        <button 
          onClick={handleDecline}
          className="absolute top-2 right-2 p-2 text-secondary-500 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};

export default SiteNotice;
