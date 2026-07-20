import React, { useState, useEffect, useRef } from 'react';
import productService from '../../services/productService';
import { X, Upload, Image as ImageIcon, RefreshCw, AlertCircle } from 'lucide-react';

const LayawayProductModal = ({ isOpen, onClose, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  
  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [categoryId, setCategoryId] = useState('');
  const [layawayTotalBoxes, setLayawayTotalBoxes] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      productService.getCategories().then(r => setCategories(r.data?.data || r.data || [])).catch(console.error);
    }
  }, [isOpen]);

  const resetForm = () => {
    setName(''); setPrice(''); setStock('1'); setCategoryId('');
    setLayawayTotalBoxes(''); setDescription('');
    setImageFile(null); setImagePreview(null); setErrorMsg('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryId) {
      setErrorMsg('Please select a category.');
      return;
    }
    setSubmitting(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('stock_quantity', stock);
    formData.append('category_id', categoryId);
    formData.append('condition', 'new');
    formData.append('status', 'active');
    formData.append('description', description);
    formData.append('available_for_layaway', '1');
    formData.append('layaway_total_boxes', layawayTotalBoxes);
    
    if (imageFile) formData.append('images[0]', imageFile);

    try {
      await productService.adminCreateProduct(formData);
      handleClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create layaway product.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Flatten categories for simple select
  const flatCats = [];
  const processCats = (cats, prefix = '') => {
    cats.forEach(c => {
      flatCats.push({ id: c.id, name: `${prefix}${c.name}` });
      if (c.children?.length) processCats(c.children, `${prefix}${c.name} > `);
    });
  };
  processCats(categories);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-secondary-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-secondary-200 dark:border-secondary-800 my-8">
        <div className="p-6 border-b border-secondary-200 dark:border-secondary-800 flex justify-between items-center sticky top-0 bg-white dark:bg-secondary-900 z-10 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white">Quick Add Layaway Product</h2>
            <p className="text-xs text-secondary-500 mt-0.5">Creates a product exclusively ready for layaway</p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-xl text-secondary-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200/50 rounded-xl flex gap-3 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{errorMsg}</p>
            </div>
          )}

          <form id="layawayProductForm" onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">Product Image</label>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
              
              {imagePreview ? (
                <div className="relative w-40 h-40 rounded-2xl overflow-hidden border-2 border-primary-500 shadow-lg group">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 bg-white rounded-full hover:scale-110 transition-transform">
                      <RefreshCw className="w-5 h-5 text-secondary-900" />
                    </button>
                  </div>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full md:w-64 h-40 border-2 border-dashed border-secondary-300 dark:border-secondary-700 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-secondary-50 dark:hover:bg-secondary-800/50 hover:border-primary-500 transition-all text-secondary-500">
                  <div className="w-12 h-12 bg-primary-50 dark:bg-primary-950/30 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-primary-500" />
                  </div>
                  <div className="text-sm font-semibold">Click to upload image</div>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">Product Name *</label>
                <input required value={name} onChange={e => setName(e.target.value)} className="w-full p-3 bg-secondary-50 dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500" placeholder="e.g. iPhone 15 Pro Max" />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">Category *</label>
                <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full p-3 bg-secondary-50 dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 text-secondary-900 dark:text-white">
                  <option value="">Select Category</option>
                  {flatCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">Total Product Price (GHS) *</label>
                <input required type="number" step="0.01" min="0" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-3 bg-secondary-50 dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500" placeholder="e.g. 15000" />
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">Total Layaway Boxes *</label>
                <input required type="number" min="1" value={layawayTotalBoxes} onChange={e => setLayawayTotalBoxes(e.target.value)} className="w-full p-3 bg-secondary-50 dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500" placeholder="e.g. 50" />
                {price && layawayTotalBoxes && (
                  <p className="text-xs text-primary-600 font-bold mt-1">Calculated Price Per Box: GHS {(price / layawayTotalBoxes).toFixed(2)}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">Stock Quantity *</label>
                <input required type="number" min="1" value={stock} onChange={e => setStock(e.target.value)} className="w-full p-3 bg-secondary-50 dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500" placeholder="e.g. 10" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">Description *</label>
              <textarea required rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full p-3 bg-secondary-50 dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500" placeholder="Product details..." />
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-secondary-200 dark:border-secondary-800 flex justify-end gap-3 bg-secondary-50 dark:bg-secondary-900/50 rounded-b-2xl">
          <button type="button" onClick={handleClose} disabled={submitting} className="px-6 py-2.5 rounded-xl text-sm font-bold text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-800 transition-colors">
            Cancel
          </button>
          <button type="submit" form="layawayProductForm" disabled={submitting} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30 transition-all flex items-center gap-2">
            {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Create Layaway Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default LayawayProductModal;
