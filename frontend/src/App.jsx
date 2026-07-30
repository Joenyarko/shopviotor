import React from 'react';
import AppRoutes from './routes/AppRoutes';
import PwaPrompt from './components/PwaPrompt';
import ScrollToTop from './components/ScrollToTop';
import WhatsAppCTA from './components/WhatsAppCTA';
import ChatWidget from './components/ChatWidget';
import SiteNotice from './components/SiteNotice';
import PromoPopupManager from './components/PromoPopupManager';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950 text-secondary-900 dark:text-white transition-colors">
      <ScrollToTop />
      <AppRoutes />
      <PwaPrompt />
      {/* Floating Action Widgets — always visible */}
      <WhatsAppCTA />
      <ChatWidget />
      <SiteNotice />
      <PromoPopupManager />
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
    </div>
  );
}

export default App;
