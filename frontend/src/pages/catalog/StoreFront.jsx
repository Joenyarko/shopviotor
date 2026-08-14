import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import vendorService from '../../services/vendorService';
import {
  Store, MapPin, Phone, MessageCircle, Package,
  RefreshCw, ArrowLeft, ShieldCheck, Star, Users,
  ChevronRight, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StoreFront = ({ overrideSlug }) => {
  const params = useParams();
  const slug = overrideSlug || params.slug;
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const carouselRef = React.useRef(null);

  useEffect(() => {
    vendorService.getStore(slug)
      .then(res => {
        const storeData = res?.store || res?.data?.store;
        const productsData = res?.products || res?.data?.products || [];
        if (!storeData) {
          setError('Store not found or is no longer active.');
        } else {
          setStore(storeData);
          setProducts(productsData);
        }
      })
      .catch(() => setError('Store not found or is no longer active.'))
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    if (!store || !store.banners_urls || store.banners_urls.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => {
        const next = (prev + 1) % store.banners_urls.length;
        if (carouselRef.current) {
          const itemWidth = carouselRef.current.scrollWidth / store.banners_urls.length;
          carouselRef.current.scrollTo({ left: next * itemWidth, behavior: 'smooth' });
        }
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [store]);

  const handleScroll = (e) => {
    if (!store || !store.banners_urls) return;
    const itemWidth = e.target.scrollWidth / store.banners_urls.length;
    const index = Math.round(e.target.scrollLeft / itemWidth);
    if (index !== currentBannerIndex && index >= 0 && index < store.banners_urls.length) {
      setCurrentBannerIndex(index);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <RefreshCw className="w-10 h-10 text-primary-500 animate-spin" />
        <p className="text-secondary-500 dark:text-secondary-400 text-sm font-medium">Loading store...</p>
      </div>
    </div>
  );

  if (error || !store) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
      <div className="w-24 h-24 rounded-3xl bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center">
        <Store className="w-12 h-12 text-secondary-400 dark:text-secondary-500" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-black text-secondary-900 dark:text-white">Store Not Found</h2>
        <p className="text-secondary-500 dark:text-secondary-400 max-w-sm">{error || 'This store does not exist or has been deactivated.'}</p>
      </div>
      <Link
        to="/shops"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white shadow-lg transition-all hover:scale-105"
        style={{ background: 'linear-gradient(135deg, #111 0%, #222 100%)', border: '1.5px solid #f5c000' }}
      >
        <ArrowLeft className="w-4 h-4" /> Browse All Stores
      </Link>
    </div>
  );

  return (
    <div className="bg-secondary-50 dark:bg-secondary-950 min-h-screen">

      {/* ── HERO BANNER ─────────────────────────────────────────────────── */}
      <div className="w-full bg-secondary-50 dark:bg-secondary-950 pt-4 pb-2">
        {store.banners_urls && store.banners_urls.length > 0 ? (
          <div className="flex flex-col">
            <div className="relative w-full h-36 sm:h-48 md:h-[480px] overflow-hidden">
              <div 
                ref={carouselRef}
                onScroll={handleScroll}
                className="flex w-full h-full overflow-x-auto snap-x snap-mandatory space-x-1.5 px-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
              >
                {store.banners_urls.map((url, idx) => (
                  <div 
                    key={idx} 
                    className="w-[90%] sm:w-[88%] md:w-[85%] flex-shrink-0 snap-center h-full rounded-xl overflow-hidden shadow-sm"
                  >
                    <img
                      src={url}
                      alt={`${store.name} banner ${idx + 1}`}
                      className="w-full h-full object-fill sm:object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Navigation Dots Below Images */}
            {store.banners_urls.length > 1 && (
              <div className="flex items-center justify-center gap-1.5 mt-4 pb-2">
                {store.banners_urls.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentBannerIndex(idx);
                      if (carouselRef.current) {
                        const itemWidth = carouselRef.current.scrollWidth / store.banners_urls.length;
                        carouselRef.current.scrollTo({ left: idx * itemWidth, behavior: 'smooth' });
                      }
                    }}
                    className={`transition-all duration-300 rounded-full ${
                      idx === currentBannerIndex
                        ? 'w-6 h-2 bg-primary-500'
                        : 'w-2 h-2 bg-secondary-300 dark:bg-secondary-700 hover:bg-secondary-400'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : store.banner_url ? (
          <div className="relative w-full h-40 sm:h-56 md:h-[480px] px-4">
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-sm">
              <img
                src={store.banner_url}
                alt={`${store.name} banner`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ) : (
          /* Default branded banner when no banner image */
          <div className="relative w-full h-40 sm:h-56 md:h-[480px] px-4">
            <div className="w-full h-full rounded-2xl overflow-hidden shadow-sm flex items-center justify-center relative"
              style={{ background: 'linear-gradient(135deg, #0f0f0f 0%, #1c1c1c 50%, #0f0a00 100%)' }}>
              <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full opacity-30"
                style={{ background: 'radial-gradient(circle, #f5c000 0%, transparent 70%)' }} />
              <div className="absolute -bottom-20 -left-10 w-60 h-60 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #f5c000 0%, transparent 70%)' }} />
              <Store className="w-20 h-20 opacity-10 text-white" />
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="px-4 mt-2">
          <Link
            to="/shops"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-secondary-600 bg-secondary-200/50 hover:bg-secondary-200 dark:text-secondary-300 dark:bg-secondary-800/50 dark:hover:bg-secondary-800 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All Stores
          </Link>
        </div>
      </div>

      {/* ── STORE PROFILE CARD ──────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="relative -mt-14 md:-mt-16 z-10">
          <div className="bg-white dark:bg-secondary-900 rounded-3xl shadow-xl border border-secondary-100 dark:border-secondary-800 p-5 md:p-8">
            <div className="flex flex-col sm:flex-row gap-5 items-start">

              {/* Logo */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl overflow-hidden border-4 border-white dark:border-secondary-800 shadow-xl bg-white dark:bg-secondary-700">
                  {store.logo_url ? (
                    <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white"
                      style={{ background: 'linear-gradient(135deg, #1a1a1a, #333)' }}>
                      {store.name?.charAt(0)}
                    </div>
                  )}
                </div>
                {/* Verified badge */}
                {store.is_verified && (
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center shadow-md bg-blue-500">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {/* Store details */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    {store.is_verified && (
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white bg-blue-500">
                          Verified Vendor
                        </span>
                      </div>
                    )}
                    <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-secondary-900 dark:text-white leading-tight">
                      {store.name}
                    </h1>
                    {store.description && (
                      <p className="text-secondary-500 dark:text-secondary-400 text-sm mt-1.5 max-w-xl line-clamp-2">
                        {store.description}
                      </p>
                    )}
                  </div>

                  {/* Contact buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    {store.phone && (
                      <a
                        href={`tel:${store.phone}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-semibold text-secondary-700 dark:text-secondary-300 border-secondary-200 dark:border-secondary-700 hover:border-primary-400 hover:text-primary-600 transition-all"
                      >
                        <Phone className="w-4 h-4" />
                        <span className="hidden md:inline">{store.phone}</span>
                      </a>
                    )}
                    {store.whatsapp && (
                      <a
                        href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 transition-all shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-4 mt-3">
                  {store.location && (
                    <span className="flex items-center gap-1.5 text-sm text-secondary-500 dark:text-secondary-400">
                      <MapPin className="w-4 h-4 text-primary-500" />
                      {store.location}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ── Stats bar ─────────────────────────────────────────────── */}
            <div className="mt-6 pt-6 border-t border-secondary-100 dark:border-secondary-800 grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-black text-secondary-900 dark:text-white">
                  {store.products_count ?? products.length}
                </p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 font-medium mt-0.5">Products</p>
              </div>
              <div className="text-center border-x border-secondary-100 dark:border-secondary-800">
                <p className="text-2xl font-black text-secondary-900 dark:text-white flex items-center justify-center gap-1">
                  <Star className="w-5 h-5" style={{ color: '#f5c000' }} />
                  <span>{store.average_rating ? parseFloat(store.average_rating).toFixed(1) : 'N/A'}</span>
                </p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 font-medium mt-0.5">Seller Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-secondary-900 dark:text-white flex items-center justify-center gap-1">
                  <MessageCircle className="w-4 h-4 text-primary-500" />
                  <span>{store.total_reviews || 0}</span>
                </p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 font-medium mt-0.5">Reviews</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── PRODUCTS SECTION ────────────────────────────────────────── */}
        <div className="mt-8 pb-16">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-black text-secondary-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-500" />
              All Products
              <span className="ml-1 text-sm font-semibold text-secondary-400 dark:text-secondary-500">
                ({products.length})
              </span>
            </h2>
          </div>

          {products.length === 0 ? (
            <div className="py-20 text-center bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-100 dark:border-secondary-800 space-y-3">
              <Package className="w-14 h-14 mx-auto text-secondary-200 dark:text-secondary-700" />
              <p className="font-bold text-secondary-900 dark:text-white">No products listed yet</p>
              <p className="text-sm text-secondary-500 dark:text-secondary-400">Check back soon for new listings.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {products.map(p => (
                <Link
                  key={p.id}
                  to={`/products/${p.id}`}
                  className="group bg-white dark:bg-secondary-900 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  {/* Product image */}
                  <div className="relative h-40 sm:h-48 bg-secondary-50 dark:bg-secondary-800 overflow-hidden">
                    <img
                      src={p.primary_image || `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=f5c000&color=000&size=200`}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=eee&color=888&size=200`; }}
                    />
                    {/* View overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white dark:bg-secondary-900 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg">
                        View <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Product info */}
                  <div className="p-3 flex flex-col flex-1">
                    <h3 className="text-sm font-semibold text-secondary-900 dark:text-white line-clamp-2 leading-snug flex-1">
                      {p.name}
                    </h3>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="font-black text-base text-secondary-900 dark:text-white">
                        GHS {parseFloat(p.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      {p.compare_price && parseFloat(p.compare_price) > parseFloat(p.price) && (
                        <span className="text-xxs font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                          {Math.round((1 - p.price / p.compare_price) * 100)}% off
                        </span>
                      )}
                    </div>
                    {p.compare_price && parseFloat(p.compare_price) > parseFloat(p.price) && (
                      <p className="text-xs text-secondary-400 line-through">
                        GHS {parseFloat(p.compare_price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                    )}
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
