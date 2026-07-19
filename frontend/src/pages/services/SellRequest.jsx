import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import sellRequestService from '../../services/sellRequestService';
import productService from '../../services/productService';
import { CATEGORIES } from '../../constants/categories';
import { Upload, X, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';

const SellRequest = () => {
  const [brands, setBrands] = useState([]);
  const [images, setImages] = useState([]);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      item_name: '',
      category_id: '',
      brand_id: '',
      condition: '',
      asking_price: '',
      description: ''
    }
  });

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await productService.getBrands();
        setBrands(res.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchBrands();
  }, []);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files].slice(0, 5));
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const onSubmit = async (data) => {
    if (images.length === 0) {
      setErrorMsg('Please upload at least one image of your item.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (val) formData.append(key, val);
      });
      images.forEach((file) => formData.append('images[]', file));

      await sellRequestService.submitSell(formData);
      setSuccess(true);
      reset();
      setImages([]);
    } catch (e) {
      console.error(e);
      setErrorMsg(e.message || 'Failed to submit sell request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white">Sell Your Item to Viotor</h1>
        <p className="text-sm text-secondary-500 mt-1">Submit item photos and details for corporate buyout quotes.</p>
      </div>

      {success ? (
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-8 text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Request Submitted!</h2>
          <p className="text-sm text-secondary-500 max-w-sm mx-auto">
            Our team will inspect your submission and offer a quote shortly. Check your dashboard for counter-offers.
          </p>
          <button onClick={() => setSuccess(false)} className="premium-button-primary px-6 rounded-lg text-sm">
            Submit Another Item
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 md:p-8 space-y-6 transition-colors">
          
          {errorMsg && (
            <div className="p-3 bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 rounded-lg flex items-start gap-2.5 text-sm border border-accent-200/50">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Item Name */}
          <div>
            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Item Name</label>
            <input
              type="text"
              {...register('item_name', { required: 'Item name is required' })}
              placeholder="e.g. iPhone 15 Pro Max"
              className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
            />
            {errors.item_name && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.item_name.message}</span>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Category</label>
              <select
                {...register('category_id', { required: 'Category is required' })}
                className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.category_id.message}</span>}
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Brand (optional)</label>
              <select
                {...register('brand_id')}
                className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
              >
                <option value="">Select Brand</option>
                {brands.map(b => (
                  <option key={b.id || b.uuid} value={b.id || b.uuid}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Condition */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Condition</label>
              <select
                {...register('condition', { required: 'Condition is required' })}
                className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
              >
                <option value="">Select Condition</option>
                <option value="new">New / Boxed</option>
                <option value="used">Used / Minimal Scratches</option>
                <option value="refurbished">Refurbished</option>
              </select>
              {errors.condition && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.condition.message}</span>}
            </div>

            {/* Asking Price */}
            <div>
              <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Your Asking Price (GHS)</label>
              <input
                type="number"
                {...register('asking_price', { required: 'Asking price is required' })}
                placeholder="2500"
                className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
              />
              {errors.asking_price && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.asking_price.message}</span>}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Item Description & Condition Notes</label>
            <textarea
              rows={4}
              {...register('description', { 
                required: 'Description is required',
                minLength: {
                  value: 10,
                  message: 'Description must be at least 10 characters'
                }
              })}
              placeholder="Detail your item's defects, accessories included, and history..."
              className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
            />
            {errors.description && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.description.message}</span>}
          </div>

          {/* Images Upload Box */}
          <div>
            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Item Pictures (Max 5)</label>
            <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-5 gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square border rounded-xl overflow-hidden bg-secondary-50">
                  <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="aspect-square border border-dashed border-secondary-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-secondary-50/50">
                  <Upload className="w-6 h-6 text-secondary-400" />
                  <span className="text-xxs text-secondary-500 mt-1.5">Upload Pic</span>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full premium-button-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Submit Item Request'}
          </button>

        </form>
      )}
    </div>
  );
};

export default SellRequest;
export { SellRequest };
