import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import vendorService from '../../services/vendorService';
import { Store, MapPin, Package, RefreshCw, Search, ArrowRight, BadgeCheck } from 'lucide-react';
import DotPagination from '../../components/DotPagination';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 9;
  const filtered = stores.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.location?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedStores = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    vendorService.getStores()
      .then(res => setStores(res.data?.data || res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl text-white p-10 md:p-14 shadow-2xl" style={{background: 'linear-gradient(135deg, #111111 0%, #1e1e1e 50%, #141400 100%)'}}>
        {/* Yellow glow accents */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full pointer-events-none" style={{background: 'radial-gradient(circle, rgba(245,192,0,0.35) 0%, transparent 70%)'}} />
        <div className="absolute bottom-0 left-1/4 w-56 h-56 rounded-full pointer-events-none" style={{background: 'radial-gradient(circle, rgba(245,192,0,0.15) 0%, transparent 70%)'}} />
        <div className="relative z-10 max-w-2xl space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit" style={{background: 'rgba(245,192,0,0.15)', border: '1px solid rgba(245,192,0,0.4)'}}>
            <Store className="w-4 h-4" style={{color: '#f5c000'}} />
            <span className="text-xs font-semibold tracking-wider uppercase" style={{color: '#f5c000'}}>Marketplace</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black">Browse All Stores</h1>
          <p className="text-gray-400 text-lg max-w-xl">
            Discover independent vendors selling authentic products. Buy directly from trusted local and national sellers.
          </p>
          <div className="relative max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              placeholder="Search by store name or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-xl text-white placeholder-white/40 focus:outline-none transition-all"
              style={{background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(245,192,0,0.3)'}}
              onFocus={e => e.target.style.border = '1.5px solid rgba(245,192,0,0.7)'}
              onBlur={e => e.target.style.border = '1.5px solid rgba(245,192,0,0.3)'}
            />
          </div>
        </div>
      </div>

      {/* Vendor CTA */}
      <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <h3 className="font-bold text-lg text-secondary-900 dark:text-white">Want to sell on Viotor?</h3>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Apply to open your own store and reach thousands of customers.</p>
        </div>
        <Link
          to="/become-a-vendor"
          className="flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 hover:scale-105 shadow-md"
          style={{background: '#f5c000', color: '#111'}}
        >
          Open Your Store <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stores Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse bg-secondary-100 dark:bg-secondary-800 rounded-2xl h-52" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl">
          <Store className="w-14 h-14 text-secondary-300 mx-auto" />
          <p className="font-semibold text-secondary-900 dark:text-white">{search ? 'No stores match your search.' : 'No stores are active yet.'}</p>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">Be the first to open a store on Viotor!</p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-4">{filtered.length} store{filtered.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedStores.map(store => (
              <Link
                key={store.uuid}
                to={`/shops/${store.slug}`}
                className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                {/* Banner */}
                <div className="h-28 bg-gradient-to-br from-primary-800 to-secondary-900 overflow-hidden relative">
                  {store.banner_url ? (
                    <img src={store.banner_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 to-teal-900" />
                  )}
                </div>

                <div className="p-5 -mt-8 relative">
                  {/* Logo */}
                  <div className="w-16 h-16 rounded-xl border-4 border-white dark:border-secondary-900 overflow-hidden shadow-lg bg-white dark:bg-secondary-800 mb-3">
                    {store.logo_url ? (
                      <img src={store.logo_url} alt={store.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-emerald-600 flex items-center justify-center">
                        <Store className="w-7 h-7 text-white" />
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-secondary-900 dark:text-white group-hover:text-primary-600 transition-colors flex items-center gap-1">
                    {store.name}
                    {store.is_verified && <BadgeCheck className="w-4 h-4 text-blue-500" title="Verified Store" />}
                  </h3>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1 line-clamp-2">{store.description || 'No description available.'}</p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex gap-3">
                      {store.location && (
                        <span className="flex items-center gap-1 text-xs text-secondary-500 dark:text-secondary-400">
                          <MapPin className="w-3.5 h-3.5 text-primary-500" /> {store.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs text-secondary-500 dark:text-secondary-400">
                        <Package className="w-3.5 h-3.5 text-primary-500" /> {store.products_count} items
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-secondary-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <DotPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
};

export default StoreList;
export { StoreList };
