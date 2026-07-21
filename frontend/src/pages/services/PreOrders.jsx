import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import productService from '../../services/productService';
import { Package, RefreshCw, Calendar, ArrowRight } from 'lucide-react';

import HeroBanner from '../../components/marketing/HeroBanner';

const PreOrders = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreOrders = async () => {
      setLoading(true);
      try {
        const res = await productService.getProducts({ available_for_preorder: true });
        setProducts(res.data?.data || res.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchPreOrders();
  }, []);

  const fallbackHero = (
    <div className="-mx-4 md:-mx-8 -mt-6 mb-8 relative bg-gradient-to-br from-secondary-950 via-[#0a1628] to-secondary-900 px-6 py-16 md:py-24 overflow-hidden">
      {/* decorative orbs */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center space-y-6">
        <span className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-500/30 text-primary-400 text-xs font-bold uppercase px-4 py-1.5 rounded-full tracking-wider">
          <Package className="w-3.5 h-3.5" /> Exclusive Access
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
          Pre-Order <span className="text-primary-400">Hub</span>
        </h1>
        <p className="text-secondary-400 text-base md:text-lg max-w-xl mx-auto">
          Reserve the hottest upcoming items before they drop. Pay a deposit now, and secure your order.
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Hero Banner */}
      <HeroBanner position="preorder_hero" fallbackContent={fallbackHero} />

      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="w-10 h-10 text-primary-500 animate-spin" /></div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl">
          <Package className="w-16 h-16 text-secondary-300 dark:text-secondary-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">No pre-orders available</h2>
          <p className="text-secondary-500 dark:text-secondary-400">Check back later for exciting new products.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => {
            const primaryImage = product.primary_image || (product.images && product.images[0]?.url) || 'https://via.placeholder.com/300?text=No+Image';
            const deposit = product.preorder_deposit_amount;
            
            return (
              <div key={product.id} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all group flex flex-col">
                <div className="relative aspect-square overflow-hidden bg-secondary-100 dark:bg-secondary-800 p-4">
                  <img src={primaryImage} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-2 right-2 bg-primary-500 text-secondary-900 text-xs font-bold px-2 py-1 rounded-md shadow-md">
                    Pre-Order
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-secondary-900 dark:text-white line-clamp-2 mb-1">{product.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-secondary-500 dark:text-secondary-400 mb-3">
                    <Calendar className="w-3.5 h-3.5" />
                    Expected: {product.preorder_expected_date ? new Date(product.preorder_expected_date).toLocaleDateString() : 'TBD'}
                  </div>
                  <div className="mt-auto space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-secondary-500 dark:text-secondary-400">Total Price</span>
                      <span className="font-medium text-secondary-900 dark:text-white">GHS {product.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold pb-3 border-b border-secondary-100 dark:border-secondary-800">
                      <span className="text-primary-600 dark:text-primary-400">Deposit Required</span>
                      <span className="text-primary-600 dark:text-primary-400">GHS {deposit}</span>
                    </div>
                    <Link to={`/products/${product.id}`} className="premium-button-primary w-full py-2.5 rounded-xl text-sm font-bold flex justify-center items-center gap-2 mt-3">
                      View Details <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PreOrders;
