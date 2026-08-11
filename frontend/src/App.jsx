import React, { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import PwaPrompt from './components/PwaPrompt';
import ScrollToTop from './components/ScrollToTop';
import WhatsAppCTA from './components/WhatsAppCTA';
// import ChatWidget from './components/ChatWidget';
import SiteNotice from './components/SiteNotice';
import PromoPopupManager from './components/PromoPopupManager';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Analytics } from '@vercel/analytics/react';
import apiClient from './api/client';

function App() {
  useEffect(() => {
    // Clear chunk reload count on successful mount
    sessionStorage.removeItem('chunk_reload_count');

    // Track iOS Standalone installs
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    
    if (isIosDevice && isStandalone) {
      const hasTracked = localStorage.getItem('ios_app_installed_tracked');
      if (!hasTracked) {
        apiClient.post('/analytics/app-installs')
          .then(() => {
            localStorage.setItem('ios_app_installed_tracked', 'true');
            console.log('iOS Standalone Install Tracked Successfully');
          })
          .catch(e => console.warn('Failed to track iOS install:', e));
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 text-secondary-900 dark:text-white transition-colors">
      <ScrollToTop />
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
      <PwaPrompt />
      {/* Floating Action Widgets — always visible */}
      <WhatsAppCTA />
      {/* <ChatWidget /> */}
      <SiteNotice />
      <PromoPopupManager />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
      <Analytics />
    </div>
  );
}

export default App;
