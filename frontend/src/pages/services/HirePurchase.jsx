import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom';
import hpService from '../../services/hpService';
import productService from '../../services/productService';
import {
  Percent, ArrowRight, ShieldCheck, Clock, HelpCircle,
  FileText, AlertCircle, ArrowLeft, RefreshCw, CheckCircle2,
  Search, SlidersHorizontal, Tag, ExternalLink, X, ChevronRight, Layers
} from 'lucide-react';
import { openPaystack } from '../../utils/paystack';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../api/client';
import HeroBanner from '../../components/marketing/HeroBanner';

const HirePurchase = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // Active product being configured
  const [selectedProduct, setSelectedProduct] = useState(location.state?.targetProduct || null);
  const [activeImage, setActiveImage] = useState(null);
  const [loadingTargetProduct, setLoadingTargetProduct] = useState(false);

  // HP products catalog list & categories
  const [hpProducts, setHpProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Catalog Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // Plan configuration state
  const [deposit, setDeposit] = useState(0);
  const [duration, setDuration] = useState(6); // 6 months default
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Student verification form state
  const [studentName, setStudentName] = useState('');
  const [studentCourse, setStudentCourse] = useState('');
  const [studentLevel, setStudentLevel] = useState('');
  const [studentId, setStudentId] = useState('');
  const [studentImage, setStudentImage] = useState(null);
  const [submittingStudent, setSubmittingStudent] = useState(false);

  // Load HP products and categories on mount
  useEffect(() => {
    const fetchCatalog = async () => {
      setLoadingProducts(true);
      try {
        const [prodRes, catRes] = await Promise.all([
          productService.getProducts({ available_for_hire_purchase: true, per_page: 100 }),
          productService.getCategories().catch(() => ({ data: [] }))
        ]);
        const list = prodRes.data?.data || prodRes.data || [];
        setHpProducts(Array.isArray(list) ? list : []);
        const catList = catRes.data?.data || catRes.data || [];
        setCategories(Array.isArray(catList) ? catList : []);
      } catch (e) {
        console.error('Failed to load HP catalog', e);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchCatalog();
  }, []);

  // Sync selectedProduct if searchParams has ?product=
  useEffect(() => {
    const paramId = searchParams.get('product') || searchParams.get('productId');
    if (paramId) {
      if (selectedProduct && (String(selectedProduct.id) === String(paramId) || selectedProduct.uuid === paramId)) {
        return;
      }
      const foundInList = hpProducts.find(p => String(p.id) === String(paramId) || p.uuid === paramId);
      if (foundInList) {
        setSelectedProduct(foundInList);
        setActiveImage(foundInList.primary_image || (foundInList.images && foundInList.images[0]?.url) || null);
      } else {
        setLoadingTargetProduct(true);
        productService.getProduct(paramId)
          .then(res => {
            const prod = res.data?.data || res.data;
            if (prod) {
              setSelectedProduct(prod);
              setActiveImage(prod.primary_image || (prod.images && prod.images[0]?.url) || null);
            }
          })
          .catch(err => {
            console.error('Failed to load target HP product details', err);
          })
          .finally(() => {
            setLoadingTargetProduct(false);
          });
      }
    }
  }, [searchParams, hpProducts, selectedProduct]);

  // Sync if navigation state passed targetProduct
  useEffect(() => {
    if (location.state?.targetProduct) {
      setSelectedProduct(location.state.targetProduct);
      setActiveImage(location.state.targetProduct.primary_image || (location.state.targetProduct.images && location.state.targetProduct.images[0]?.url) || null);
      if (!searchParams.get('product')) {
        setSearchParams({ product: location.state.targetProduct.id });
      }
    }
  }, [location.state?.targetProduct]);

  // Handle switching product
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setActiveImage(product.primary_image || (product.images && product.images[0]?.url) || null);
    setSearchParams({ product: product.id });
    setSuccess(false);
    setErrorMsg('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearSelectedProduct = () => {
    setSelectedProduct(null);
    setActiveImage(null);
    setSearchParams({});
    setSuccess(false);
    setErrorMsg('');
  };

  // Compute category counts and active category list from loaded HP products
  const categoryCounts = useMemo(() => {
    const counts = { all: hpProducts.length };
    hpProducts.forEach(prod => {
      const catId = prod.category?.id || prod.category_id;
      if (catId) {
        counts[String(catId)] = (counts[String(catId)] || 0) + 1;
      }
    });
    return counts;
  }, [hpProducts]);

  const activeCategoryList = useMemo(() => {
    const map = new Map();
    hpProducts.forEach(prod => {
      const catId = prod.category?.id || prod.category_id;
      const catName = prod.category?.name || (categories.find(c => String(c.id) === String(catId))?.name);
      if (catId && catName && !map.has(String(catId))) {
        map.set(String(catId), {
          id: String(catId),
          name: catName,
          count: categoryCounts[String(catId)] || 0
        });
      }
    });
    return Array.from(map.values());
  }, [hpProducts, categories, categoryCounts]);

  // Filter and sort products for the catalog view
  const filteredProducts = useMemo(() => {
    return hpProducts
      .filter(product => {
        // Category filter
        if (selectedCategory !== 'all') {
          const prodCatId = String(product.category?.id || product.category_id || '');
          if (prodCatId !== String(selectedCategory)) return false;
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const name = (product.name || '').toLowerCase();
          const brand = (product.brand?.name || '').toLowerCase();
          const desc = (product.short_description || '').toLowerCase();
          if (!name.includes(q) && !brand.includes(q) && !desc.includes(q)) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return parseFloat(a.price) - parseFloat(b.price);
        if (sortBy === 'price_desc') return parseFloat(b.price) - parseFloat(a.price);
        if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
        return 0;
      });
  }, [hpProducts, selectedCategory, searchQuery, sortBy]);

  // Active target product dynamic calculations
  const targetProduct = selectedProduct;
  const hpInterestRate = targetProduct?.hp_interest_rate ? parseFloat(targetProduct.hp_interest_rate) : 0;
  const hpMinDepositPercent = targetProduct?.hp_min_deposit_percent ? parseFloat(targetProduct.hp_min_deposit_percent) : 20;
  const hpMaxDuration = targetProduct?.hp_max_duration_months ? parseInt(targetProduct.hp_max_duration_months) : 12;

  const productPrice = targetProduct ? parseFloat(targetProduct.price) : 0;
  const interestAmount = productPrice * (hpInterestRate / 100);
  const totalFinanced = productPrice + interestAmount;
  
  const minDeposit = productPrice * (hpMinDepositPercent / 100);
  const balanceRemaining = Math.max(0, totalFinanced - deposit);
  const monthlyInstallment = duration > 0 ? balanceRemaining / duration : 0;

  useEffect(() => {
    if (targetProduct) {
      setDeposit(Math.round(minDeposit));
      if (duration > hpMaxDuration) {
        setDuration(hpMaxDuration);
      }
    }
  }, [targetProduct, minDeposit, hpMaxDuration]);

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setSubmittingStudent(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('student_name', studentName);
      formData.append('student_course', studentCourse);
      formData.append('student_level', studentLevel);
      formData.append('student_id', studentId);
      if (studentImage) formData.append('student_id_picture', studentImage);

      const { default: authService } = await import('../../services/authService');
      await authService.submitStudentVerification(formData);
      window.location.reload();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit student verification.');
    } finally {
      setSubmittingStudent(false);
    }
  };

  const handleSubmitAgreement = async (e) => {
    e.preventDefault();
    if (!targetProduct) return;
    if (deposit < minDeposit) {
      setErrorMsg(`Minimum deposit is GHS ${minDeposit.toFixed(2)} (${hpMinDepositPercent}% of product value).`);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        product_id: targetProduct.id || targetProduct.uuid,
        deposit_amount: deposit,
        duration_months: duration,
        interest_rate: hpInterestRate,
      };

      const res = await hpService.createAgreement(payload);
      
      const handleSuccess = () => {
        setSuccess(true);
      };

      if (res?.payment?.reference) {
        openPaystack({
          email: user?.email,
          amountGHS: deposit,
          reference: res.payment.reference,
          onSuccess: async () => {
            try {
              await apiClient.get(`/payments/verify/${res.payment.reference}`);
            } catch (err) {
              console.error('Payment verification failed', err);
            }
            handleSuccess();
          },
          onClose: () => {
            setErrorMsg('Payment window closed. Your agreement was created but awaits deposit payment.');
          }
        });
      } else {
        handleSuccess();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to initialize hire purchase agreement.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VIEW 1: CATALOG LISTING WITH CATEGORY FILTERS
  // ==========================================
  if (!targetProduct) {
    const fallbackHero = (
      <div className="-mx-4 md:-mx-8 -mt-6 mb-8 relative bg-gradient-to-br from-secondary-950 via-[#2d1b0a] to-secondary-900 px-6 py-16 md:py-24 overflow-hidden rounded-b-3xl">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-500/30 text-primary-400 text-xs font-bold uppercase px-4 py-1.5 rounded-full tracking-wider">
            <Percent className="w-3.5 h-3.5" /> Flexible Financing
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            Hire <span className="text-primary-400">Purchase</span>
          </h1>
          <p className="text-secondary-400 text-base md:text-lg max-w-xl mx-auto">
            Get the items you need today. Pay a flexible down payment and spread the balance over convenient monthly installments.
          </p>
        </div>
      </div>
    );

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
        
        {/* Hero Banner */}
        <HeroBanner position="hire_purchase_hero" fallbackContent={fallbackHero} />

        {/* ============================================================ */}
        {/* CATEGORY & SEARCH FILTER TOOLBAR */}
        {/* ============================================================ */}
        <div className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-4 md:p-5 shadow-sm space-y-4">
          
          {/* Top row: Search input & Sorting */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-grow max-w-md">
              <Search className="w-4 h-4 text-secondary-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search hire purchase items by name, model, brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-secondary-50 dark:bg-secondary-800/80 border border-secondary-200 dark:border-secondary-700 rounded-xl text-sm text-secondary-900 dark:text-white placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort & Quick Stats */}
            <div className="flex items-center gap-3 justify-between sm:justify-end">
              <span className="text-xs text-secondary-500 dark:text-secondary-400 hidden lg:inline">
                <strong>{filteredProducts.length}</strong> items available
              </span>

              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-secondary-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-xs font-semibold text-secondary-700 dark:text-secondary-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                >
                  <option value="default">Sort: Recommended</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="name_asc">Product Name (A-Z)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bottom row: Category Filter Pills */}
          <div className="pt-2 border-t border-secondary-100 dark:border-secondary-800/70">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {/* All Categories Tab */}
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                    : 'bg-secondary-100/70 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>All Products</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedCategory === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300'
                }`}>
                  {hpProducts.length}
                </span>
              </button>

              {/* Dynamic Category Tabs */}
              {activeCategoryList.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(isSelected ? 'all' : cat.id)}
                    className={`whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 flex-shrink-0 ${
                      isSelected
                        ? 'bg-primary-500 text-white font-bold shadow-md shadow-primary-500/25'
                        : 'bg-secondary-100/70 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-secondary-200 dark:bg-secondary-700 text-secondary-600 dark:text-secondary-400'
                    }`}>
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PRODUCT GRID SECTION */}
        {/* ============================================================ */}
        {loadingProducts ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-3">
            <RefreshCw className="w-10 h-10 text-primary-500 animate-spin" />
            <span className="text-sm font-semibold text-secondary-500">Loading Hire Purchase items...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl p-6 space-y-4">
            <Percent className="w-14 h-14 text-secondary-300 dark:text-secondary-700 mx-auto" />
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white">No items found matching your filters</h2>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 max-w-md mx-auto">
              Try adjusting your category selection or search keywords to find available hire purchase items.
            </p>
            <button
              type="button"
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="premium-button-primary px-6 py-2.5 rounded-xl text-xs font-bold inline-flex items-center gap-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {filteredProducts.map(product => {
              const primaryImage = product.primary_image || (product.images && product.images[0]?.url) || 'https://via.placeholder.com/300?text=No+Image';
              const price = parseFloat(product.price) || 0;
              const minDepPct = product.hp_min_deposit_percent ? parseFloat(product.hp_min_deposit_percent) : 20;
              const minDepAmount = price * (minDepPct / 100);
              const maxDur = product.hp_max_duration_months ? parseInt(product.hp_max_duration_months) : 12;
              const interest = product.hp_interest_rate ? parseFloat(product.hp_interest_rate) : 0;
              const estTotal = price + (price * (interest / 100));
              const estMonthly = maxDur > 0 ? (estTotal - minDepAmount) / maxDur : 0;

              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-secondary-900 border border-secondary-200/80 dark:border-secondary-800 rounded-2xl overflow-hidden hover:shadow-xl hover:border-primary-500/40 transition-all duration-300 group flex flex-col relative"
                >
                  {/* Image container */}
                  <div className="relative aspect-square overflow-hidden bg-secondary-50 dark:bg-secondary-800/50 p-4">
                    <img
                      src={primaryImage}
                      alt={product.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply dark:mix-blend-normal"
                    />
                    <div className="absolute top-2 right-2 bg-primary-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded shadow-sm uppercase tracking-wider">
                      HP
                    </div>
                    {product.brand?.name && (
                      <div className="absolute bottom-2 left-2 bg-secondary-900/70 text-white text-[9px] font-semibold px-1.5 py-0.5 rounded backdrop-blur-xs">
                        {product.brand.name}
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 sm:p-4 flex flex-col flex-grow border-t border-secondary-100 dark:border-secondary-800/80">
                    <h3 className="font-bold text-secondary-900 dark:text-white line-clamp-2 text-xs sm:text-sm leading-snug group-hover:text-primary-600 transition-colors">
                      {product.name}
                    </h3>

                    {/* Pricing summary */}
                    <div className="mt-auto pt-3 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] uppercase font-bold text-secondary-400">Cash Price</span>
                        <span className="font-extrabold text-sm sm:text-base text-secondary-900 dark:text-white">
                          GHS {price.toLocaleString('en-US')}
                        </span>
                      </div>

                      {/* HP monthly highlight */}
                      <div className="bg-primary-50/70 dark:bg-primary-950/30 rounded-lg p-1.5 border border-primary-100 dark:border-primary-900/40 text-center">
                        <span className="text-[10px] text-secondary-500 dark:text-secondary-400 block font-medium">From approx.</span>
                        <span className="text-xs sm:text-sm font-extrabold text-primary-600 dark:text-primary-400">
                          GHS {Math.round(estMonthly).toLocaleString()}<span className="text-[10px] font-normal text-secondary-500">/mo</span>
                        </span>
                      </div>

                      {/* Direct Configure Plan Action */}
                      <button
                        type="button"
                        onClick={() => handleSelectProduct(product)}
                        className="premium-button-primary w-full py-2.5 rounded-xl text-xs font-bold flex justify-center items-center gap-1.5 mt-2.5 shadow-sm transition-transform active:scale-95"
                      >
                        Configure Plan <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // VIEW 2: HIRE PURCHASE INSTALLMENT PORTAL
  // WITH RICH PRODUCT PREVIEW & CONFIGURATOR
  // ==========================================
  const productImages = targetProduct.images && targetProduct.images.length > 0 
    ? targetProduct.images 
    : [{ id: 'primary', url: targetProduct.primary_image || 'https://via.placeholder.com/300?text=No+Image' }];

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-6 px-4 sm:px-6 animate-in fade-in duration-300">
      
      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-secondary-200 dark:border-secondary-800">
        <button
          type="button"
          onClick={handleClearSelectedProduct}
          className="inline-flex items-center gap-2 text-sm font-bold text-secondary-600 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to All Hire Purchase Items</span>
        </button>

        <div className="text-xs text-secondary-500 flex items-center gap-1.5">
          <span>Catalog</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span>Hire Purchase</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-semibold text-secondary-900 dark:text-white truncate max-w-[200px]">{targetProduct.name}</span>
        </div>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-secondary-900 dark:text-white tracking-tight">
          Hire Purchase Installment Portal
        </h1>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
          Review item details and configure your customized financing schedule.
        </p>
      </div>

      {/* Main Grid: Left Column (Preview & Forms) | Right Column (Calculator) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* Left Column: Rich Product Preview + Financing Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ============================================================ */}
          {/* RICH PRODUCT PREVIEW CARD */}
          {/* ============================================================ */}
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              
              {/* Product Image & Thumbnail Gallery */}
              <div className="w-full sm:w-44 flex-shrink-0 space-y-2">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary-50 dark:bg-secondary-800 border border-secondary-200/80 dark:border-secondary-700/80 p-3 flex items-center justify-center">
                  <img 
                    src={activeImage || targetProduct.primary_image || (targetProduct.images && targetProduct.images[0]?.url) || 'https://via.placeholder.com/300?text=No+Image'} 
                    alt={targetProduct.name} 
                    className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                  />
                  <div className="absolute top-2 left-2 bg-primary-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow">
                    HP ITEM
                  </div>
                </div>

                {/* Thumbnails if multiple images exist */}
                {productImages.length > 1 && (
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {productImages.slice(0, 4).map((img, idx) => (
                      <button
                        key={img.id || idx}
                        type="button"
                        onClick={() => setActiveImage(img.url)}
                        className={`w-10 h-10 rounded-lg border overflow-hidden p-0.5 flex-shrink-0 ${
                          (activeImage === img.url || (!activeImage && idx === 0))
                            ? 'border-primary-500 ring-1 ring-primary-500'
                            : 'border-secondary-200 dark:border-secondary-700 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img.url} alt="" className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info & Specifications */}
              <div className="flex-grow space-y-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 px-2 py-0.5 rounded border border-primary-200/50 dark:border-primary-800/50 uppercase tracking-wider">
                    Financing Item
                  </span>
                  {targetProduct.category?.name && (
                    <span className="text-[10px] font-semibold text-secondary-600 dark:text-secondary-300 bg-secondary-100 dark:bg-secondary-800 px-2 py-0.5 rounded">
                      {targetProduct.category.name}
                    </span>
                  )}
                  {targetProduct.brand?.name && (
                    <span className="text-[10px] font-semibold text-secondary-600 dark:text-secondary-300 bg-secondary-100 dark:bg-secondary-800 px-2 py-0.5 rounded">
                      {targetProduct.brand.name}
                    </span>
                  )}
                  {targetProduct.condition && (
                    <span className="text-[10px] font-semibold text-secondary-600 dark:text-secondary-300 bg-secondary-100 dark:bg-secondary-800 px-2 py-0.5 rounded capitalize">
                      {targetProduct.condition.replace('_', ' ')}
                    </span>
                  )}
                </div>

                <h2 className="text-lg sm:text-xl font-black text-secondary-900 dark:text-white leading-snug">
                  {targetProduct.name}
                </h2>

                {targetProduct.short_description && (
                  <p className="text-xs sm:text-sm text-secondary-600 dark:text-secondary-400 line-clamp-2 leading-relaxed">
                    {targetProduct.short_description}
                  </p>
                )}

                {/* Key feature bullets if available */}
                {Array.isArray(targetProduct.key_features) && targetProduct.key_features.length > 0 && (
                  <div className="pt-1">
                    <ul className="text-xs text-secondary-600 dark:text-secondary-400 space-y-1 list-disc pl-4">
                      {targetProduct.key_features.slice(0, 3).map((feat, idx) => (
                        <li key={idx} className="line-clamp-1">{feat}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Price display */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-xs uppercase font-bold text-secondary-500 dark:text-secondary-400">Total Cash Price:</span>
                  <span className="text-xl sm:text-2xl font-black text-secondary-900 dark:text-white">
                    GHS {productPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Terms Summary Ribbon */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-secondary-100 dark:border-secondary-800 text-center">
                  <div className="p-2 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-200/60 dark:border-secondary-700/60">
                    <span className="text-[10px] uppercase font-bold text-secondary-400 block">Min Deposit</span>
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      {hpMinDepositPercent}% (GHS {minDeposit.toFixed(0)})
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-200/60 dark:border-secondary-700/60">
                    <span className="text-[10px] uppercase font-bold text-secondary-400 block">Max Duration</span>
                    <span className="text-xs sm:text-sm font-extrabold text-primary-600 dark:text-primary-400">
                      {hpMaxDuration} Months
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-200/60 dark:border-secondary-700/60">
                    <span className="text-[10px] uppercase font-bold text-secondary-400 block">Interest Rate</span>
                    <span className="text-xs sm:text-sm font-extrabold text-secondary-900 dark:text-white">
                      {hpInterestRate}%
                    </span>
                  </div>
                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={handleClearSelectedProduct}
                    className="text-xs font-semibold text-secondary-500 hover:text-primary-600 dark:hover:text-primary-400 underline"
                  >
                    Change Selected Item
                  </button>

                  <a
                    href={`/products/${targetProduct.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>View Full Store Specs</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* APPLICATION / VERIFICATION & FINANCING CONFIGURATOR */}
          {/* ============================================================ */}
          {success ? (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-8 text-center space-y-4 shadow-sm">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Agreement Initialized!</h2>
              <p className="text-sm text-secondary-500 dark:text-secondary-400 max-w-sm mx-auto">
                Your Hire Purchase plan is set up. You can pay your deposit and start taking deliveries under the dashboard.
              </p>
              <div className="flex gap-4 justify-center pt-2">
                <Link to="/dashboard" className="premium-button-primary px-6 rounded-xl text-sm py-2.5">Go to Dashboard</Link>
                <button onClick={handleClearSelectedProduct} className="premium-button-secondary px-6 rounded-xl text-sm py-2.5">Choose Another Item</button>
              </div>
            </div>
          ) : user?.student_verification_status === 'pending' ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl p-8 text-center space-y-4">
              <RefreshCw className="w-16 h-16 text-yellow-500 mx-auto animate-spin" />
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Verification Pending</h2>
              <p className="text-sm text-secondary-600 dark:text-secondary-300 max-w-sm mx-auto">
                Your student ID is currently being reviewed by our team. You can proceed with Hire Purchase once approved.
              </p>
            </div>
          ) : user?.student_verification_status !== 'approved' ? (
            <form onSubmit={handleStudentSubmit} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
              <div className="border-b border-secondary-100 dark:border-secondary-800 pb-3">
                <h2 className="text-lg font-bold text-secondary-900 dark:text-white">Student Verification Required</h2>
                <p className="text-xs text-secondary-500">Please provide your student identification details to qualify for Hire Purchase financing.</p>
              </div>
              
              {errorMsg && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{errorMsg}</div>}
              
              <div>
                <label className="block text-xs font-semibold uppercase text-secondary-600 dark:text-secondary-400 mb-1">Full Legal Name</label>
                <input required type="text" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="e.g. Francis Joe Nyarko" className="w-full px-4 py-2.5 border rounded-xl dark:bg-secondary-800 dark:border-secondary-700 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-secondary-600 dark:text-secondary-400 mb-1">Course of Study</label>
                  <input required type="text" value={studentCourse} onChange={e => setStudentCourse(e.target.value)} placeholder="e.g. Computer Science" className="w-full px-4 py-2.5 border rounded-xl dark:bg-secondary-800 dark:border-secondary-700 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-secondary-600 dark:text-secondary-400 mb-1">Level / Year</label>
                  <input required type="text" value={studentLevel} onChange={e => setStudentLevel(e.target.value)} placeholder="e.g. Level 300" className="w-full px-4 py-2.5 border rounded-xl dark:bg-secondary-800 dark:border-secondary-700 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-secondary-600 dark:text-secondary-400 mb-1">Student ID Number</label>
                <input required type="text" value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="e.g. 012024883" className="w-full px-4 py-2.5 border rounded-xl dark:bg-secondary-800 dark:border-secondary-700 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-secondary-600 dark:text-secondary-400 mb-1">Upload Student ID Card Picture</label>
                <input required type="file" accept="image/*" onChange={e => setStudentImage(e.target.files[0])} className="w-full px-4 py-2 border rounded-xl dark:bg-secondary-800 dark:border-secondary-700 text-sm" />
              </div>

              <button type="submit" disabled={submittingStudent} className="w-full premium-button-primary py-3 rounded-xl font-bold text-sm shadow-md">
                {submittingStudent ? 'Submitting...' : 'Submit for Verification'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitAgreement} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm transition-colors">
              
              <div className="border-b border-secondary-100 dark:border-secondary-800 pb-3">
                <h3 className="font-bold text-base text-secondary-900 dark:text-white">Configure Down Payment & Installment Term</h3>
                <p className="text-xs text-secondary-500">Adjust the slider or enter your preferred deposit to customize your monthly payments.</p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 rounded-xl flex items-start gap-2.5 text-sm border border-accent-200/50">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Deposit slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-bold text-secondary-900 dark:text-white">
                    Down Payment Deposit (GHS)
                  </label>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Min Required: GHS {minDeposit.toFixed(2)} ({hpMinDepositPercent}%)
                  </span>
                </div>
                <div className="mt-2.5 flex items-center gap-4">
                  <input
                    type="range"
                    min={minDeposit}
                    max={productPrice}
                    value={deposit}
                    onChange={(e) => setDeposit(parseInt(e.target.value) || 0)}
                    className="flex-grow h-2.5 bg-secondary-200 dark:bg-secondary-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                  />
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-secondary-400">GHS</span>
                    <input
                      type="number"
                      value={deposit}
                      onChange={(e) => setDeposit(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-32 pl-11 pr-2 py-2 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-xl text-sm font-extrabold text-right focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Installment Term selection */}
              <div>
                <label className="block text-sm font-bold text-secondary-900 dark:text-white mb-2">
                  Repayment Tenure (Months)
                </label>
                <div className="grid grid-cols-4 gap-2.5">
                  {[3, 6, 12, 18, 24].filter(m => m <= hpMaxDuration).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setDuration(m)}
                      className={`py-3 border rounded-xl font-bold text-xs sm:text-sm transition-all flex flex-col items-center justify-center ${
                        duration === m 
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 shadow-sm' 
                          : 'border-secondary-200 dark:border-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-800 text-secondary-700 dark:text-secondary-300'
                      }`}
                    >
                      <span>{m} Months</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full premium-button-primary py-3.5 rounded-xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-500/25 active:scale-98 transition-transform"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Create HP Agreement & Pay Deposit'}
              </button>

            </form>
          )}

        </div>

        {/* Right Column: Dynamic Price breakdown & Trust Card */}
        <div className="space-y-4">
          <aside className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 transition-colors sticky top-24 shadow-sm space-y-5">
            <div className="border-b border-secondary-100 dark:border-secondary-800 pb-3">
              <h2 className="text-base font-bold text-secondary-900 dark:text-white">Installment Calculator</h2>
              <span className="text-xs text-secondary-400">Live payment plan estimate</span>
            </div>

            <div className="space-y-3.5 text-sm pb-4 border-b border-secondary-100 dark:border-secondary-800">
              <div className="flex justify-between">
                <span className="text-secondary-500 dark:text-secondary-400">Principal Price</span>
                <span className="font-semibold text-secondary-900 dark:text-white">GHS {productPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500 dark:text-secondary-400">Interest Cost ({hpInterestRate}%)</span>
                <span className="font-semibold text-secondary-900 dark:text-white">GHS {interestAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500 dark:text-secondary-400">Total Obligation</span>
                <span className="font-semibold text-secondary-900 dark:text-white">GHS {totalFinanced.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500 dark:text-secondary-400">Initial Down Payment</span>
                <span className="font-bold text-emerald-600">- GHS {deposit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500 dark:text-secondary-400">Remaining Financed</span>
                <span className="font-semibold text-secondary-900 dark:text-white">GHS {balanceRemaining.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary-500 dark:text-secondary-400">Duration</span>
                <span className="font-semibold text-secondary-900 dark:text-white">{duration} Months</span>
              </div>
            </div>

            <div className="pt-1 text-center bg-primary-50/50 dark:bg-primary-950/20 p-4 rounded-xl border border-primary-100 dark:border-primary-900/30">
              <span className="block text-xxs text-secondary-500 dark:text-secondary-400 uppercase font-bold tracking-wider mb-1">
                Estimated Monthly Payment
              </span>
              <span className="text-3xl font-black text-primary-600 dark:text-primary-400">
                GHS {monthlyInstallment.toFixed(2)}
              </span>
              <span className="text-xs font-medium text-secondary-500 dark:text-secondary-400 block mt-0.5">
                per month for {duration} months
              </span>
            </div>

            {/* Safety Badges */}
            <div className="space-y-2 pt-2 text-xs text-secondary-500 dark:text-secondary-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span>100% Guaranteed Official Merchandise</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>Prompt doorstep delivery upon deposit</span>
              </div>
            </div>
          </aside>
        </div>

      </div>
    </div>
  );
};

export default HirePurchase;
export { HirePurchase };
