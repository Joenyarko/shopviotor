import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import productService from '../../services/productService';
import ProductCard from '../../components/ProductCard';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

const ProductList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [brand, setBrand] = useState(searchParams.get('brand') || '');
  const [condition, setCondition] = useState(searchParams.get('condition') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'latest');

  const queryTerm = searchParams.get('q') || '';

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await productService.getBrands();
        setBrands(res.data || []);
      } catch (e) { console.error(e); }
    };
    const fetchCategories = async () => {
      try {
        const res = await productService.getCategories();
        setCategories(res.data?.data || res.data || []);
      } catch (e) { console.error(e); }
    };
    fetchBrands();
    fetchCategories();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const filters = {
          category_id: category,
          brand_id: brand,
          condition,
          min_price: minPrice,
          max_price: maxPrice,
          sort,
        };
        if (searchParams.get('hire_purchase') === 'true') {
          filters.available_for_hire_purchase = 1;
        }
        
        let response;
        if (queryTerm) {
          response = await productService.searchProducts(queryTerm, filters);
        } else {
          response = await productService.getProducts(filters);
        }
        
        setProducts(response.data?.data || response.data || []);
      } catch (error) {
        console.error('Failed to load catalog products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [searchParams, category, brand, condition, minPrice, maxPrice, sort, queryTerm]);

  const handleApplyFilters = (e) => {
    e.preventDefault();
    const params = {};
    if (queryTerm) params.q = queryTerm;
    if (category) params.category = category;
    if (brand) params.brand = brand;
    if (condition) params.condition = condition;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    if (sort) params.sort = sort;
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setCategory('');
    setBrand('');
    setCondition('');
    setMinPrice('');
    setMaxPrice('');
    setSort('latest');
    setSearchParams(queryTerm ? { q: queryTerm } : {});
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* 1. FILTER SIDEBAR */}
      <aside className="w-full lg:w-64 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 h-fit transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-secondary-100 dark:border-secondary-800">
          <h2 className="font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary-500" /> Filters
          </h2>
          <button onClick={handleClearFilters} className="text-xs text-primary-600 hover:underline font-semibold">
            Clear All
          </button>
        </div>

        <form onSubmit={handleApplyFilters} className="space-y-6 mt-6">
          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-2 p-2 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id || cat.uuid} value={cat.slug || cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Brand</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full mt-2 p-2 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
            >
              <option value="">All Brands</option>
              {brands.map(b => (
                <option key={b.id || b.uuid} value={b.id || b.uuid}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Condition</label>
            <div className="mt-2 space-y-2">
              {['new', 'used', 'refurbished'].map(cond => (
                <label key={cond} className="flex items-center gap-2 text-sm text-secondary-700 dark:text-secondary-200 capitalize">
                  <input
                    type="radio"
                    name="condition"
                    value={cond}
                    checked={condition === cond}
                    onChange={(e) => setCondition(e.target.value)}
                    className="text-primary-500 focus:ring-primary-500 border-secondary-300 rounded"
                  />
                  {cond}
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Price Range (GHS)</label>
            <div className="flex gap-2 mt-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-1/2 p-2 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-1/2 p-2 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
              />
            </div>
          </div>

          <button type="submit" className="w-full premium-button-primary py-2.5 rounded-lg text-sm font-semibold">
            Apply Filters
          </button>
        </form>
      </aside>

      {/* 2. CATALOG LIST */}
      <div className="flex-1 space-y-6">
        
        {/* List Header Controls */}
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4 transition-colors">
          <div>
            <h1 className="text-xl font-extrabold text-secondary-900 dark:text-white">
              {queryTerm ? `Search Results for "${queryTerm}"` : 'Browse Catalog'}
            </h1>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">{products.length} products found</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-secondary-500 dark:text-secondary-400 flex items-center gap-1"><ArrowUpDown className="w-4 h-4" /> Sort by</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                const params = Object.fromEntries(searchParams.entries());
                params.sort = e.target.value;
                setSearchParams(params);
              }}
              className="p-1.5 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
            >
              <option value="latest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="popular">Popularity</option>
            </select>
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(idx => (
              <div key={idx} className="animate-pulse bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl h-80" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl">
            <p className="text-secondary-500 dark:text-secondary-400 text-base">No products match your criteria. Try adjusting filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <ProductCard key={product.id || product.uuid} product={product} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default ProductList;
export { ProductList };
