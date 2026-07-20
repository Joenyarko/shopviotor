import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import tradeService from '../../services/tradeService';
import productService from '../../services/productService';
import { Upload, X, AlertCircle, RefreshCw, CheckCircle2, Scale, Search, ArrowRight } from 'lucide-react';

const BarterRequest = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const initialTargetProduct = state?.targetProduct;

  const [targetProduct, setTargetProduct] = useState(initialTargetProduct || null);
  const [tradeableProducts, setTradeableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  const [images, setImages] = useState([]);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      notes: '',
      item_name: '',
      condition: '',
      description: ''
    }
  });

  useEffect(() => {
    fetchTradeableProducts();
  }, []);

  const fetchTradeableProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await productService.getProducts({ available_for_trade: 1, per_page: 20 });
      setTradeableProducts(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files].slice(0, 5));
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const onSubmit = async (data) => {
    if (images.length === 0) {
      setErrorMsg('Please upload pictures of your item.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      if (targetProduct) {
        formData.append('product_id', targetProduct.id || targetProduct.uuid);
      }
      formData.append('notes', data.notes || '');
      
      formData.append('items[0][item_name]', data.item_name);
      formData.append('items[0][condition]', data.condition);
      formData.append('items[0][description]', data.description);
      
      images.forEach((file) => {
        formData.append('items[0][images][]', file);
      });

      await tradeService.submitTrade(formData);
      setSuccess(true);
    } catch (e) {
      console.error(e);
      setErrorMsg(e.response?.data?.message || e.message || 'Failed to submit barter swap proposal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-primary-900 rounded-3xl p-8 md:p-12 text-white overflow-hidden relative shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
            <Scale className="w-4 h-4 text-primary-300" />
            <span className="text-xs font-semibold tracking-wider uppercase text-primary-200">Trade Hub</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black leading-tight">
            Exchange What You Have <br className="hidden md:block"/> For What You Need
          </h1>
          <p className="text-primary-100 text-lg leading-relaxed max-w-xl">
            Propose a direct swap for any of our eligible products, or submit an open trade request and let us make you an offer!
          </p>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-primary-500 rounded-full blur-[100px] opacity-50" />
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-6">
          {success ? (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Proposal Dispatched!</h2>
              <p className="text-sm text-secondary-500 dark:text-secondary-400 max-w-sm mx-auto">
                {targetProduct 
                  ? "The administrator will evaluate your item and propose a difference quote."
                  : "We've received your open trade request! We'll review your item and get back to you with an offer."} Keep an eye on your dashboard.
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Link to="/dashboard" className="premium-button-primary px-6 rounded-lg text-sm">View Dashboard</Link>
                <button onClick={() => { setSuccess(false); setImages([]); setTargetProduct(null); }} className="premium-button-secondary px-6 rounded-lg text-sm">Submit Another</button>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 md:p-8 shadow-xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Submit Trade Proposal</h2>
                <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
                  Fill out the details of the item you want to trade.
                </p>
              </div>

              {/* Target product summary */}
              {targetProduct && (
                <div className="bg-primary-50 dark:bg-primary-900/20 p-4 border border-primary-100 dark:border-primary-800 rounded-2xl flex gap-4 items-center mb-6 relative group">
                  <img 
                    src={targetProduct.primary_image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=60'} 
                    alt="" 
                    className="w-16 h-16 object-cover rounded-lg bg-white"
                  />
                  <div className="flex-1">
                    <span className="text-xxs font-bold text-primary-600 uppercase bg-primary-100 dark:bg-primary-950/40 px-2 py-0.5 rounded">Target Item</span>
                    <h3 className="font-semibold text-sm text-secondary-900 dark:text-white mt-1">{targetProduct.name}</h3>
                    <span className="font-bold text-xs text-secondary-700 dark:text-secondary-300">Valued: GHS {parseFloat(targetProduct.price).toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => setTargetProduct(null)}
                    className="p-2 text-secondary-400 hover:text-accent-500 bg-white dark:bg-secondary-800 rounded-full shadow-sm"
                    title="Remove Target Product"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {!targetProduct && (
                 <div className="bg-secondary-50 dark:bg-secondary-800/50 p-4 border border-secondary-200 dark:border-secondary-700/50 rounded-2xl flex gap-4 items-center mb-6">
                    <div className="w-12 h-12 bg-white dark:bg-secondary-800 rounded-xl flex items-center justify-center shadow-sm border border-secondary-100 dark:border-secondary-700">
                      <Scale className="w-6 h-6 text-primary-500" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-secondary-900 dark:text-white">Open Trade Request</h3>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">You haven't selected a specific target product. Submit an open offer and we'll evaluate it!</p>
                    </div>
                 </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {errorMsg && (
                  <div className="p-3 bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 rounded-lg flex items-start gap-2.5 text-sm border border-accent-200/50">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Item Name */}
                  <div>
                    <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Your Item's Name</label>
                    <input
                      type="text"
                      {...register('item_name', { required: 'Item name is required' })}
                      placeholder="e.g. Samsung Galaxy S23 Ultra"
                      className="w-full mt-1.5 p-3 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-xl text-sm transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.item_name && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.item_name.message}</span>}
                  </div>

                  {/* Condition */}
                  <div>
                    <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Condition</label>
                    <select
                      {...register('condition', { required: 'Condition is required' })}
                      className="w-full mt-1.5 p-3 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-xl text-sm transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    >
                      <option value="">Select Condition</option>
                      <option value="new">Brand New / Sealed</option>
                      <option value="used">Used / Fair Condition</option>
                      <option value="refurbished">Refurbished</option>
                    </select>
                    {errors.condition && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.condition.message}</span>}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Detailed Description</label>
                    <textarea
                      rows={4}
                      {...register('description', { 
                        required: 'Description is required',
                        minLength: { value: 10, message: 'Description must be at least 10 characters' }
                      })}
                      placeholder="Mention exact condition, capacity, damages, model numbers, and included accessories..."
                      className="w-full mt-1.5 p-3 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-xl text-sm transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                    />
                    {errors.description && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.description.message}</span>}
                  </div>
                </div>

                {/* Pictures */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Pictures of Your Item (Max 5)</label>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square border border-secondary-200 dark:border-secondary-700 rounded-xl overflow-hidden bg-secondary-50">
                        <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-accent-600 transition-colors rounded-full text-white backdrop-blur-sm"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {images.length < 5 && (
                      <label className="aspect-square border-2 border-dashed border-secondary-300 dark:border-secondary-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-primary-50 dark:hover:bg-secondary-800 hover:border-primary-300 transition-colors group">
                        <Upload className="w-6 h-6 text-secondary-400 group-hover:text-primary-500 transition-colors" />
                        <span className="text-xs font-medium text-secondary-500 dark:text-secondary-400 mt-2 group-hover:text-primary-600">Upload Pic</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* User Notes */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Additional Notes (optional)</label>
                  <textarea
                    rows={2}
                    {...register('notes')}
                    placeholder="e.g. Willing to add cash if valuation is fair. I am located in East Legon."
                    className="w-full mt-1.5 p-3 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-xl text-sm transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full premium-button-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Propose Swap Offer'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Column: Available Products */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-secondary-200 dark:border-secondary-800">
            <h3 className="font-bold text-lg text-secondary-900 dark:text-white flex items-center gap-2">
              Available for Trade
              <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-400 text-xs px-2 py-0.5 rounded-full font-bold">
                {tradeableProducts.length}
              </span>
            </h3>
            <Link to="/products?filter=tradeable" className="text-sm font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-secondary-800 border dark:border-secondary-700 rounded-2xl h-48"></div>
              ))}
            </div>
          ) : tradeableProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {tradeableProducts.map(product => (
                <div 
                  key={product.id || product.uuid} 
                  className={`bg-white dark:bg-secondary-900 border rounded-2xl p-3 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg ${targetProduct?.uuid === product.uuid ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-secondary-200 dark:border-secondary-800 hover:border-primary-300'}`}
                  onClick={() => {
                    setTargetProduct(product);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-secondary-100 mb-3 relative">
                    <img 
                      src={product.primary_image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=60'} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    {targetProduct?.uuid === product.uuid && (
                      <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="bg-white text-primary-600 p-2 rounded-full shadow-lg">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-secondary-900 dark:text-white line-clamp-1">{product.name}</h4>
                  <p className="text-primary-600 dark:text-primary-400 font-bold text-sm mt-1">GHS {parseFloat(product.price).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-200 dark:border-secondary-700 rounded-2xl p-8 text-center text-secondary-500">
              <Search className="w-10 h-10 mx-auto mb-3 text-secondary-300" />
              <p className="text-sm font-medium">No products specifically listed for trade right now.</p>
              <p className="text-xs mt-1">You can still submit an open trade request!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BarterRequest;
export { BarterRequest };
