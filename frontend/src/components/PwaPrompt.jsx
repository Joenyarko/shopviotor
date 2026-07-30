import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

const PwaPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

    if (isIosDevice && !isStandalone) {
      setIsIos(true);
      // Show prompt after a small delay on iOS
      setTimeout(() => setShowPrompt(true), 3000);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-80 bg-white dark:bg-secondary-900 shadow-2xl rounded-2xl border border-secondary-200 dark:border-secondary-800 p-4 z-[60] flex items-start gap-4 animate-bounce-short">
      <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0 text-primary-600 dark:text-primary-400">
        <Download className="w-6 h-6" />
      </div>
      <div className="flex-grow">
        <h3 className="font-bold text-secondary-900 dark:text-white text-sm">Install App</h3>
        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
          {isIos 
            ? "Tap the Share button below and select 'Add to Home Screen' to install." 
            : "Tap to install on your home screen for a better experience."}
        </p>
        <div className="mt-3 flex gap-2">
          {!isIos && (
            <button 
              onClick={handleInstall}
              className="flex-1 bg-primary-500 hover:bg-primary-600 text-secondary-900 text-xs font-bold py-2 rounded-lg transition-colors"
            >
              Install
            </button>
          )}
          <button 
            onClick={handleDismiss}
            className={`${isIos ? 'w-full' : 'flex-1'} bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-700 dark:text-secondary-300 text-xs font-bold py-2 rounded-lg transition-colors`}
          >
            {isIos ? 'Got it' : 'Not Now'}
          </button>
        </div>
      </div>
      <button onClick={handleDismiss} className="text-secondary-400 hover:text-secondary-600 dark:text-secondary-300 absolute top-2 right-2">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PwaPrompt;
