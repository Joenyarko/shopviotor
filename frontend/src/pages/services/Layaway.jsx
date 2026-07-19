import React from 'react';
import { Link } from 'react-router-dom';
import { Package, HelpCircle } from 'lucide-react';

const Layaway = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8 text-center">
      <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-950/20 text-primary-600 flex items-center justify-center mx-auto">
        <Package className="w-8 h-8" />
      </div>
      
      <div className="space-y-3">
        <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white">Layaway Module</h1>
        <p className="text-sm text-secondary-500 max-w-sm mx-auto">
          We hold the items for you while you make payments over time. This module placeholder is undergoing system integration.
        </p>
      </div>

      <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 text-left space-y-4 max-w-md mx-auto">
        <h3 className="font-bold text-secondary-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-primary-500" /> How does Layaway work?
        </h3>
        <p className="text-xs text-secondary-500 leading-relaxed">
          Unlike Hire Purchase, layaway doesn't allow you to take immediate delivery of products. We hold the product in our catalog reserve until all balance installments are verified, then we release shipments.
        </p>
      </div>

      <Link to="/products" className="inline-block premium-button-primary px-6 rounded-lg text-sm">
        Return to Storefront
      </Link>
    </div>
  );
};

export default Layaway;
export { Layaway };
