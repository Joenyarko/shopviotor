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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-px bg-secondary-200 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-800 mt-8">
          {products.map(product => {
            const primaryImage = product.primary_image || (product.images && product.images[0]?.url) || 'https://via.placeholder.com/300?text=No+Image';
            const deposit = product.preorder_deposit_amount;
            
            return (
              <div key={product.id} className="bg-white dark:bg-secondary-900 hover:shadow-lg transition-all group flex flex-col relative z-0 hover:z-10">
                <div className="relative aspect-square overflow-hidden bg-secondary-100 dark:bg-secondary-850 p-4">
                  <img src={primaryImage} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal" />
                  <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                    Pre-Order
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow border-t border-secondary-100 dark:border-secondary-800/80">
                  <h3 className="font-semibold text-secondary-900 dark:text-white line-clamp-2 text-sm md:text-base leading-snug mb-1">{product.name}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-secondary-500 dark:text-secondary-400 mb-3 uppercase tracking-wider font-bold">
                    <Calendar className="w-3 h-3" />
                    Expected: {product.preorder_expected_date ? new Date(product.preorder_expected_date).toLocaleDateString() : 'TBD'}
                  </div>
                  <div className="mt-auto space-y-1">
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] uppercase font-bold text-secondary-500 dark:text-secondary-400">Total Price</span>
                      <span className="font-bold text-sm text-secondary-900 dark:text-white">GHS {parseFloat(product.price).toLocaleString('en-US')}</span>
                    </div>
                    <div className="flex justify-between items-end">
                      <span className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400">Deposit Req.</span>
                      <span className="font-bold text-lg text-orange-600 dark:text-orange-400 leading-none">GHS {parseFloat(deposit).toLocaleString('en-US')}</span>
                    </div>
                    <Link to={`/pre-orders/${product.id}`} className="premium-button-primary w-full py-2 rounded-lg text-xs font-bold flex justify-center items-center gap-1.5 mt-3 shadow-sm">
                      Reserve Now <ArrowRight className="w-3.5 h-3.5" />
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
