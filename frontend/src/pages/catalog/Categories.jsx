import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, Package, RefreshCw } from 'lucide-react';
import { 
  Car, Smartphone, Tv, Home as HomeIcon, Shirt, Building, Briefcase, PawPrint,
  ShoppingCart, Heart, Monitor, Laptop, Dumbbell, Baby, Gamepad2, Book, Film, 
  Music, Puzzle, TreePine, Box, Factory, FlaskConical, Watch, Camera, Headphones, Sparkles
} from 'lucide-react';
import productService from '../../services/productService';

const iconMap = {
  Car: Car, Automobile: Car, Smartphone: Smartphone, 'Phones and Tablets': Smartphone,
  Tv: Tv, Electronics: Tv, Home: HomeIcon, 'Home and Office': HomeIcon, Shirt: Shirt,
  Fashion: Shirt, Building: Building, Briefcase: Briefcase, PawPrint: PawPrint,
  'Pet Supplies': PawPrint, Grocery: ShoppingCart, 'Health and Beauty': Heart,
  Computing: Laptop, 'Sporting Goods': Dumbbell, 'Baby Products': Baby,
  Gaming: Gamepad2, Books: Book, 'Movies and Music': Film, 'Musical Instruments': Music,
  'Toys and Games': Puzzle, 'Gardens and Outdoors': TreePine, Miscellaneous: Box,
  Livestock: PawPrint, 'Industrial and Scientific': Factory, Watches: Watch,
  Cameras: Camera, Audio: Headphones,
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingProds, setLoadingProds] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load categories from backend
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await productService.getCategories();
        const data = res.data?.data || res.data || [];
        setCategories(data);
        if (data.length > 0) setActiveCategory(data[0]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCats(false);
      }
    };
    fetchCats();
  }, []);

  // Load products for active category
  const fetchProducts = useCallback(async () => {
    if (!activeCategory) return;
    setLoadingProds(true);
    try {
      const params = { category_id: activeCategory.id };
      if (searchQuery.trim()) params.q = searchQuery.trim();
      const res = await productService.getProducts(params);
      setProducts(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProds(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  if (loadingCats) {
    return (
      <div className="flex items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-200px)] min-h-[500px]">
      {/* ── LEFT SIDEBAR ── */}
      <aside className="w-16 sm:w-20 md:w-52 flex-shrink-0 border-r border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 overflow-y-auto">
        {categories.map((cat) => {
          const isActive = activeCategory?.id === cat.id;
          const IconComponent = iconMap[cat.icon] || iconMap[cat.name] || Sparkles;
          
          return (
            <button
              key={cat.id || cat.uuid}
              onClick={() => { setActiveCategory(cat); setSearchQuery(''); }}
              className={`w-full flex flex-col md:flex-row items-center gap-1 md:gap-2 px-1 md:px-3 py-2 md:py-3 text-center md:text-left transition-all border-l-2 md:border-l-4 ${
                isActive
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-secondary-600 dark:text-secondary-400 hover:bg-secondary-50 dark:hover:bg-secondary-800'
              }`}
            >
              <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 shrink-0">
                {cat.icon && !iconMap[cat.icon] && !iconMap[cat.name] ? (
                  <span className="text-lg md:text-xl leading-none">{cat.icon}</span>
                ) : (
                  <IconComponent className="w-5 h-5 md:w-5 md:h-5" />
                )}
              </div>
              <span className="text-[10px] md:text-xs font-medium line-clamp-2 md:line-clamp-1 leading-tight break-words">
                {cat.name}
              </span>
            </button>
          );
        })}
      </aside>

      {/* ── RIGHT CONTENT ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Search bar */}
        <div className="p-3 md:p-4 border-b border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-secondary-400" />
            <input
              type="text"
              placeholder={`Search in ${activeCategory?.name || 'category'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-secondary-200 dark:border-secondary-700 rounded-full bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </form>
        </div>

        {/* Category header */}
        <div className="px-4 py-3 flex items-center justify-between bg-white dark:bg-secondary-900 border-b border-secondary-100 dark:border-secondary-800">
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeCategory?.icon || '🛒'}</span>
            <h2 className="font-bold text-secondary-900 dark:text-white text-base">{activeCategory?.name}</h2>
          </div>
          <Link
            to={`/products?category=${activeCategory?.slug || activeCategory?.id}`}
            className="text-xs font-bold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline uppercase tracking-wider"
          >
            See All Products <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Dynamic Content (Subcategories or Products) */}
        <div className="flex-1 overflow-y-auto bg-secondary-50 dark:bg-secondary-950 p-2 md:p-4">
          
          {/* If the active category has subcategories, display the Jumia-style groups */}
          {activeCategory?.children && activeCategory.children.length > 0 ? (
            <div className="space-y-4">
              {activeCategory.children.map((subCategory) => (
                <div key={subCategory.id || subCategory.uuid} className="bg-white dark:bg-secondary-900 rounded-xl overflow-hidden shadow-sm border border-secondary-100 dark:border-secondary-800">
                  {/* Section Header */}
                  <div className="px-4 py-3 border-b border-secondary-100 dark:border-secondary-800 flex items-center justify-between">
                    <h3 className="font-bold text-secondary-800 dark:text-secondary-100 text-sm uppercase tracking-wider">
                      {subCategory.name}
                    </h3>
                    <Link
                      to={`/products?category=${subCategory.slug || subCategory.id}`}
                      className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline uppercase"
                    >
                      See All
                    </Link>
                  </div>
                  
                  {/* Sub-subcategory Grid */}
                  <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {subCategory.children && subCategory.children.length > 0 ? (
                      subCategory.children.map((subSub) => {
                        const IconComponent = iconMap[subSub.icon] || iconMap[subSub.name] || Sparkles;
                        return (
                          <Link 
                            key={subSub.id || subSub.uuid} 
                            to={`/products?category=${subSub.slug || subSub.id}`}
                            className="flex flex-col items-center group text-center"
                          >
                            <div className="w-16 h-16 md:w-20 md:h-20 bg-secondary-50 dark:bg-secondary-800 rounded-xl flex items-center justify-center mb-2 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors border border-transparent group-hover:border-primary-200">
                              {subSub.image ? (
                                <img src={subSub.image} alt={subSub.name} className="w-full h-full object-contain p-2" />
                              ) : subSub.icon && !iconMap[subSub.icon] && !iconMap[subSub.name] ? (
                                <span className="text-2xl">{subSub.icon}</span>
                              ) : (
                                <IconComponent className="w-8 h-8 text-secondary-400 dark:text-secondary-500 dark:text-secondary-400 group-hover:text-primary-500 transition-colors" />
                              )}
                            </div>
                            <span className="text-xs font-medium text-secondary-700 dark:text-secondary-300 group-hover:text-primary-600 line-clamp-2 leading-tight">
                              {subSub.name}
                            </span>
                          </Link>
                        );
                      })
                    ) : (
                      <div className="col-span-full py-4 text-center text-xs text-secondary-400">
                        No sub-categories added yet.
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Fallback: If no subcategories exist, display the flat products list directly */
            <div className="space-y-4">
              {loadingProds ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse flex items-center gap-3 bg-white dark:bg-secondary-900 rounded-xl p-3 border border-secondary-100 dark:border-secondary-800">
                      <div className="w-16 h-16 rounded-lg bg-secondary-200 dark:bg-secondary-700 flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-3/4" />
                        <div className="h-3 bg-secondary-200 dark:bg-secondary-700 rounded w-1/2" />
                        <div className="h-4 bg-secondary-200 dark:bg-secondary-700 rounded w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-secondary-400">
                  <Package className="w-12 h-12 mb-3 opacity-50" />
                  <p className="text-sm">No products in this category yet.</p>
                  <p className="text-xs mt-1">Try searching or check another category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-secondary-200 dark:bg-secondary-800 border-t border-secondary-200 dark:border-secondary-800">
                  {products.map((product) => (
                    <ProductCard key={product.id || product.uuid} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
export { Categories };
