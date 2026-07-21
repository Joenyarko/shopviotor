import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Car, 
  Smartphone, 
  Tv, 
  Home as HomeIcon, 
  Shirt, 
  Building, 
  Briefcase, 
  PawPrint,
  TrendingUp, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Truck,
  ShoppingCart,
  Heart,
  Monitor,
  Laptop,
  Dumbbell,
  Baby,
  Gamepad2,
  Book,
  Film,
  Music,
  Puzzle,
  TreePine,
  Box,
  Factory,
  FlaskConical,
  Watch,
  Camera,
  Headphones
} from 'lucide-react';
import { motion } from 'framer-motion';
import productService from '../services/productService';
import apiClient from '../api/client';
import ProductCard from '../components/ProductCard';
import HeroCarousel from '../components/HeroCarousel';
import PromoPopup from '../components/marketing/PromoPopup';
import FlashSaleBanner from '../components/marketing/FlashSaleBanner';
import HeroBanner from '../components/marketing/HeroBanner';
import { CATEGORIES } from '../constants/categories';

const iconMap = {
  Car: Car,
  Automobile: Car,
  Smartphone: Smartphone,
  'Phones and Tablets': Smartphone,
  Tv: Tv,
  Electronics: Tv,
  Home: HomeIcon,
  'Home and Office': HomeIcon,
  Shirt: Shirt,
  Fashion: Shirt,
  Building: Building,
  Briefcase: Briefcase,
  PawPrint: PawPrint,
  'Pet Supplies': PawPrint,
  Grocery: ShoppingCart,
  'Health and Beauty': Heart,
  Computing: Laptop,
  'Sporting Goods': Dumbbell,
  'Baby Products': Baby,
  Gaming: Gamepad2,
  Books: Book,
  'Movies and Music': Film,
  'Musical Instruments': Music,
  'Toys and Games': Puzzle,
  'Gardens and Outdoors': TreePine,
  Miscellaneous: Box,
  Livestock: PawPrint,
  'Industrial and Scientific': Factory,
  Watches: Watch,
  Cameras: Camera,
  Audio: Headphones,
};

const Landing = () => {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [latest, setLatest] = useState([]);
  const [categories, setCategories] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchVal, setSearchVal] = useState('');

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [featuredRes, latestRes, categoriesRes, collectionsRes] = await Promise.all([
          productService.getFeaturedProducts(),
          productService.getProducts({ per_page: 8 }),
          productService.getCategories(),
          apiClient.get('/marketing/collections'),
        ]);
        setFeatured(featuredRes.data || []);
        setLatest(latestRes.data?.data || latestRes.data || []);
        setCategories(categoriesRes.data?.data || categoriesRes.data || []);
        setCollections(collectionsRes.data?.data || []);
      } catch (error) {
        console.error('Failed to load landing products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchVal.trim())}`);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. HERO CAROUSEL */}
      <section className="relative w-full">
        <HeroCarousel />
        
        {/* Search bar beneath Hero */}
        <div className="mt-6 md:mt-8 max-w-3xl mx-auto px-4">
          <motion.form 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSearchSubmit} 
            className="flex items-center gap-2 bg-white dark:bg-secondary-900 p-2 rounded-full shadow-lg border border-secondary-200 dark:border-secondary-800"
          >
            <input
              type="text"
              placeholder="Search products, brands, or items..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="flex-grow pl-4 bg-transparent border-none text-secondary-900 dark:text-white placeholder-secondary-400 focus:outline-none text-sm md:text-base"
            />
            <button type="submit" className="bg-primary-500 hover:bg-primary-600 px-6 py-2.5 rounded-full text-secondary-900 font-bold transition-colors flex items-center gap-2 text-sm shadow-md active:scale-95">
              Search
            </button>
          </motion.form>
        </div>
      </section>

      {/* FLASH SALE */}
      <FlashSaleBanner />

      {/* 2. CATEGORY BOXES / GRID */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-secondary-900 dark:text-white">Explore Categories</h2>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">Find exactly what you need by selecting any division below.</p>
          </div>
          <Link to="/categories" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
            All Categories <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {categories.map((cat, idx) => {
            const IconComponent = iconMap[cat.icon] || iconMap[cat.name] || Sparkles;
            return (
              <Link 
                key={cat.id || cat.uuid} 
                to={`/products?category=${cat.slug || cat.id}`}
                className="group bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-4 text-center hover:border-primary-500 hover:shadow-sm transition-all duration-300 flex flex-col items-center justify-center gap-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-secondary-50 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 flex items-center justify-center group-hover:bg-primary-50 dark:group-hover:bg-primary-950/20 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors text-2xl">
                  {cat.icon && !iconMap[cat.icon] ? cat.icon : <IconComponent className="w-6 h-6" />}
                </div>
                <span className="text-xs font-semibold text-secondary-700 dark:text-secondary-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-1">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. VALUE PROPOSITION ROW */}
      <section className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl p-8 transition-colors">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-secondary-900 dark:text-white">Verified Sellers & Security</h3>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">Every listing goes through moderation to ensure clean and legal merchant trades.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/20 text-purple-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-secondary-900 dark:text-white">Swap & Barter Support</h3>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">Short on cash? Propose items to trade/swap with sellers directly.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-secondary-900 dark:text-white">Direct Buy & HP Options</h3>
              <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">Get flexible Hire Purchase installment agreements right at checkouts.</p>
            </div>
          </div>
        </div>
      </section>



      {/* 4. FEATURED PRODUCTS (CAROUSEL / GRID) */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-secondary-900 dark:text-white">Featured Deals</h2>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">Handpicked items and promotions running on the marketplace.</p>
          </div>
          <Link to="/products?featured=true" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
            See All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-px bg-secondary-200 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-800">
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="animate-pulse bg-white dark:bg-secondary-900 h-72" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl">
            <p className="text-secondary-500 dark:text-secondary-400 text-sm">No featured products currently listed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-px bg-secondary-200 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-800">
            {featured.slice(0, 4).map(product => (
              <ProductCard key={product.id || product.uuid} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 5. CURATED COLLECTIONS */}
      {collections.map(collection => (
        <section key={collection.uuid} className="space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-secondary-900 dark:text-white">
                {collection.title}
              </h2>
              {collection.description && (
                <p className="text-sm text-secondary-500 dark:text-secondary-400">{collection.description}</p>
              )}
            </div>
            <Link to="/products" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
              See All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-px bg-secondary-200 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-800">
            {collection.products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ))}

      {/* 3.5 MIDDLE ADVERTISING BOARD */}
      <HeroBanner 
        position="storefront_middle" 
        fallbackContent={
          <div className="relative overflow-hidden shadow-sm h-48 md:h-72 group bg-secondary-900 rounded-3xl mt-12 mb-8">
            <img 
              src="https://images.unsplash.com/photo-1607082349566-187342175e2f?q=80&w=2070&auto=format&fit=crop" 
              alt="Advertisement Placeholder" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex flex-col justify-center p-8 md:p-12">
              <span className="text-primary-500 font-bold tracking-wider uppercase text-xs mb-2">Special Offer</span>
              <h3 className="text-white text-2xl md:text-4xl font-black max-w-md leading-tight">
                Your Advertising <br/> Goes Here
              </h3>
              <p className="text-secondary-200 mt-4 max-w-sm text-sm">
                Upload a banner from the admin panel to replace this placeholder with your own promotions.
              </p>
            </div>
          </div>
        }
      />

      {/* LATEST PRODUCTS */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-secondary-900 dark:text-white">Latest Listings</h2>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">Discover fresh listings submitted just now.</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
            See All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-px bg-secondary-200 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-800">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(idx => (
              <div key={idx} className="animate-pulse bg-white dark:bg-secondary-900 h-72" />
            ))}
          </div>
        ) : latest.length === 0 ? (
          <div className="bg-secondary-50 dark:bg-secondary-900/50 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-12 flex flex-col items-center justify-center text-center h-48">
            <Package className="w-10 h-10 text-secondary-300 dark:text-secondary-600 mb-3" />
            <p className="text-secondary-500 dark:text-secondary-400 text-sm">No new products currently listed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-px bg-secondary-200 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-800">
            {latest.slice(0, 8).map(product => (
              <ProductCard key={product.id || product.uuid} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* POPUP PROMO */}
      <PromoPopup />
    </div>
  );
};

export default Landing;
export { Landing };
