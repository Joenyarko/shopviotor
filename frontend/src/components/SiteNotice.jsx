import React, { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const SiteNotice = () => {
  const [isVisible, setIsVisible] = useState(false);
  const location = useLocation();

  // Hide on legal and policy pages so compliance reviewers have an entirely clean, unobstructed view
  const isLegalPage = ['/privacy', '/terms', '/refunds', '/delivery', '/acceptable-use'].includes(location.pathname);

  useEffect(() => {
    // Check if the user has already consented
    const consent = localStorage.getItem('cookieConsent');
    if (!consent && !isLegalPage) {
      // Delay showing it slightly for a smoother entry
      const timer = setTimeout(() => setIsVisible(true), 2500);
      return () => clearTimeout(timer);
    }
  }, [isLegalPage]);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setIsVisible(false);
  };

  if (!isVisible || isLegalPage) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto z-[90] pointer-events-none flex justify-start">
      <div className="bg-secondary-950 dark:bg-secondary-900 border border-secondary-800 rounded-2xl shadow-2xl p-4 md:p-5 max-w-lg w-full flex flex-col gap-3 pointer-events-auto transform translate-y-0 animate-in slide-in-from-bottom-10 fade-in duration-500">
        
        {/* Icon & Text */}
        <div className="flex items-start gap-3">
          <div className="bg-primary-500/20 p-2.5 rounded-xl text-primary-500 shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="flex-1 pr-6">
            <h3 className="text-white font-bold text-sm">We value your privacy</h3>
            <p className="text-secondary-400 text-xs mt-0.5 leading-relaxed">
              We use cookies to analyze traffic and provide secure shopping. Read our{' '}
              <Link to="/privacy" className="text-primary-400 hover:text-primary-300 underline underline-offset-2 font-semibold">Privacy Policy</Link>{' '}
              and{' '}
              <Link to="/terms" className="text-primary-400 hover:text-primary-300 underline underline-offset-2 font-semibold">Terms of Service</Link>.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1 border-t border-secondary-800/80">
          <button 
            onClick={handleDecline}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-secondary-400 hover:text-white border border-secondary-800 hover:bg-secondary-800 transition-colors"
          >
            Decline
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 premium-button-primary px-4 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-primary-500/20"
          >
            Accept All
          </button>
        </div>

        {/* Close Button */}
        <button 
          onClick={handleDecline}
          className="absolute top-3 right-3 p-1.5 text-secondary-500 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </div>
  );
};

export default SiteNotice;
