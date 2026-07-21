import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import vendorService from '../../services/vendorService';
import { Store, MapPin, Phone, MessageCircle, Package, RefreshCw, ArrowLeft } from 'lucide-react';

const StoreFront = () => {
  const { slug } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    vendorService.getStore(slug)
      .then(res => {
        setStore(res.data?.store);
        setProducts(res.data?.products || []);
      })
      .catch(() => setError('Store not found or is no longer active.'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="flex justify-center py-32">
      <RefreshCw className="w-10 h-10 text-primary-500 animate-spin" />
    </div>
  );

  if (error || !store) return (
    <div className="max-w-md mx-auto text-center py-20 space-y-4">
      <Store className="w-16 h-16 text-secondary-300 mx-auto" />
      <h2 className="text-xl font-bold text-secondary-900 dark:text-white">Store Not Found</h2>
      <p className="text-secondary-500 dark:text-secondary-400">{error}</p>
      <Link to="/shops" className="inline-flex items-center gap-2 premium-button-primary px-5 py-2.5 rounded-xl text-sm font-bold">
        <ArrowLeft className="w-4 h-4" /> Browse All Stores
      </Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-0 space-y-0">
      {/* Banner */}
      <div className="relative h-52 md:h-72 overflow-hidden rounded-b-3xl bg-gradient-to-br from-primary-900 to-secondary-900">
        {store.banner_url ? (
          <img src={store.banner_url} alt="banner" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Store Info */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="relative -mt-16 flex flex-col md:flex-row items-start md:items-end gap-5 pb-6 border-b border-secondary-200 dark:border-secondary-800">
          {/* Logo */}
          <div className="w-28 h-28 rounded-2xl border-4 border-white dark:border-secondary-900 overflow-hidden shadow-xl bg-white dark:bg-secondary-800 flex-shrink-0">
            {store.logo_url ? (
              <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Store className="w-10 h-10 text-white" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-black text-secondary-900 dark:text-white">{store.name}</h1>
            <p className="text-secondary-500 dark:text-secondary-400 mt-1 text-sm max-w-xl">{store.description}</p>
            <div className="flex flex-wrap gap-4 mt-3">
              {store.location && (
                <span className="flex items-center gap-1.5 text-sm text-secondary-600 dark:text-secondary-400">
                  <MapPin className="w-4 h-4 text-primary-500" /> {store.location}
                </span>
              )}
              {store.phone && (
                <a href={`tel:${store.phone}`} className="flex items-center gap-1.5 text-sm text-secondary-600 dark:text-secondary-400 hover:text-primary-600">
                  <Phone className="w-4 h-4 text-primary-500" /> {store.phone}
                </a>
              )}
              {store.whatsapp && (
                <a href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              )}
            </div>
          </div>

          <div className="flex gap-2 mt-2 md:mt-0">
            <div className="bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-xl text-sm font-bold">
              {store.products_count} Products
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="py-8">
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary-500" /> Products from {store.name}
          </h2>

          {products.length === 0 ? (
            <div className="py-16 text-center text-secondary-500 dark:text-secondary-400">
              <Package className="w-12 h-12 mx-auto mb-3 text-secondary-200 dark:text-secondary-700" />
              <p className="font-semibold">No products listed yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {products.map(p => (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="h-44 bg-secondary-100 dark:bg-secondary-800 overflow-hidden">
                    <img
                      src={p.primary_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format'}
                      alt={p.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-sm text-secondary-900 dark:text-white line-clamp-2 flex-1">{p.name}</h3>
                    <p className="text-primary-600 dark:text-primary-400 font-black mt-2">GHS {parseFloat(p.price).toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoreFront;
export { StoreFront };
