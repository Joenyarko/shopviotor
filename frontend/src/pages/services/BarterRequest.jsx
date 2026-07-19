import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import tradeService from '../../services/tradeService';
import { Upload, X, AlertCircle, RefreshCw, CheckCircle2, Scale } from 'lucide-react';

const BarterRequest = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const targetProduct = state?.targetProduct;

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

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files].slice(0, 5));
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const onSubmit = async (data) => {
    if (!targetProduct) {
      setErrorMsg('Please select a target product first.');
      return;
    }
    if (images.length === 0) {
      setErrorMsg('Please upload pictures of your item.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      formData.append('product_id', targetProduct.id || targetProduct.uuid);
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
      setErrorMsg(e.message || 'Failed to submit barter swap proposal.');
    } finally {
      setLoading(false);
    }
  };

  if (!targetProduct) {
    return (
      <div className="max-w-md mx-auto text-center py-20 dark:text-white space-y-4">
        <Scale className="w-16 h-16 text-primary-500 mx-auto" />
        <h2 className="text-xl font-bold">No Product Selected</h2>
        <p className="text-sm text-secondary-500">Please browse our products and click "Propose Swap / Barter".</p>
        <Link to="/products" className="inline-block premium-button-primary px-6 rounded-lg text-sm">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white">Propose a Barter Trade</h1>
        <p className="text-sm text-secondary-500 mt-1">Offer one or more items to swap for the product listed below.</p>
      </div>

      {/* Target product summary */}
      <div className="bg-secondary-100 dark:bg-secondary-900 p-4 border rounded-2xl flex gap-4 items-center">
        <img 
          src={targetProduct.primary_image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&auto=format&fit=crop&q=60'} 
          alt="" 
          className="w-16 h-16 object-cover rounded-lg bg-white"
        />
        <div>
          <span className="text-xxs font-bold text-primary-600 uppercase bg-primary-100 dark:bg-primary-950/20 px-2 py-0.5 rounded">Target Item</span>
          <h3 className="font-semibold text-sm text-secondary-900 dark:text-white mt-1">{targetProduct.name}</h3>
          <span className="font-bold text-xs">Valued: GHS {parseFloat(targetProduct.price).toLocaleString()}</span>
        </div>
      </div>

      {success ? (
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-8 text-center space-y-4">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Proposal Dispatched!</h2>
          <p className="text-sm text-secondary-500 max-w-sm mx-auto">
            The administrator will evaluate your item and propose a difference quote. Keep an eye on your trade dashboard.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/dashboard" className="premium-button-primary px-6 rounded-lg text-sm">Dashboard</Link>
            <Link to="/products" className="premium-button-secondary px-6 rounded-lg text-sm">Return Catalog</Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 md:p-8 space-y-6 transition-colors">
          
          {errorMsg && (
            <div className="p-3 bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 rounded-lg flex items-start gap-2.5 text-sm border border-accent-200/50">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <h3 className="font-bold text-sm text-secondary-500 uppercase tracking-wider border-b pb-2 mb-4">Item You are Offering</h3>
            
            <div className="space-y-4">
              {/* Item Name */}
              <div>
                <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Item Name</label>
                <input
                  type="text"
                  {...register('item_name', { required: 'Item name is required' })}
                  placeholder="e.g. Samsung Galaxy S23"
                  className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
                />
                {errors.item_name && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.item_name.message}</span>}
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Condition</label>
                <select
                  {...register('condition', { required: 'Condition is required' })}
                  className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
                >
                  <option value="">Select Condition</option>
                  <option value="new">New / Mint</option>
                  <option value="used">Used / Fair</option>
                  <option value="refurbished">Refurbished</option>
                </select>
                {errors.condition && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.condition.message}</span>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Description of Item</label>
                <textarea
                  rows={3}
                  {...register('description', { 
                    required: 'Description is required',
                    minLength: {
                      value: 10,
                      message: 'Description must be at least 10 characters'
                    }
                  })}
                  placeholder="Mention exact condition, capacity, damages, and model numbers..."
                  className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
                />
                {errors.description && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.description.message}</span>}
              </div>
            </div>
          </div>

          {/* Pictures */}
          <div>
            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Pictures of Your Item (Max 5)</label>
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

          {/* User Notes */}
          <div>
            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Add Offer Notes (optional)</label>
            <textarea
              rows={2}
              {...register('notes')}
              placeholder="e.g. Willing to add cash if valuation is fair."
              className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full premium-button-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Propose Swap Offer'}
          </button>

        </form>
      )}
    </div>
  );
};

export default BarterRequest;
export { BarterRequest };
