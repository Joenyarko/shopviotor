import React, { useEffect, useRef, useState } from 'react';
import productService from '../../services/productService';
import {
  Plus, Edit2, Trash2, RefreshCw, X, AlertCircle,
  Upload, Image as ImageIcon, PlusCircle, MinusCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

const MAX_IMAGES = 5;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'images' | 'variations'

  // Basic form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [stock, setStock] = useState('');
  const [mainCategoryId, setMainCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [subSubCategoryId, setSubSubCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [condition, setCondition] = useState('new');
  const [status, setStatus] = useState('active');
  const [description, setDescription] = useState('');
  const [isNegotiable, setIsNegotiable] = useState(false);
  const [availableForTrade, setAvailableForTrade] = useState(false);
  const [availableForHp, setAvailableForHp] = useState(false);
  const [availableForLayaway, setAvailableForLayaway] = useState(false);
  const [layawayTotalBoxes, setLayawayTotalBoxes] = useState('');
  const [availableForPreorder, setAvailableForPreorder] = useState(false);
  const [preorderDepositAmount, setPreorderDepositAmount] = useState('');
  const [preorderExpectedDate, setPreorderExpectedDate] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);

  // Image states
  const [imageFiles, setImageFiles] = useState([]); // File objects for upload
  const [imagePreviews, setImagePreviews] = useState([]); // { url, file }
  const [existingImages, setExistingImages] = useState([]); // From backend
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const fileInputRef = useRef(null);

  // Variation states  [ { name, options: [{value, price_delta}] } ]
  const [variations, setVariations] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.adminGetProducts();
      setProducts(response.data?.data || response.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    loadProducts();
    productService.getBrands().then(r => setBrands(r.data || [])).catch(console.error);
    productService.getCategories().then(r => setCategories(r.data?.data || r.data || [])).catch(console.error);
  }, []);

  const resetForm = () => {
    setName(''); setPrice(''); setComparePrice(''); setStock('');
    setMainCategoryId(''); setSubCategoryId(''); setSubSubCategoryId(''); setBrandId(''); setCondition('new'); setStatus('active');
    setDescription(''); setIsNegotiable(false); setAvailableForTrade(false);
    setAvailableForHp(false); setAvailableForLayaway(false); setLayawayTotalBoxes(''); 
    setAvailableForPreorder(false); setPreorderDepositAmount(''); setPreorderExpectedDate('');
    setIsFeatured(false); setImageFiles([]); setImagePreviews([]);
    setExistingImages([]); setActiveImageIdx(0); setVariations([]);
    setErrorMsg(''); setActiveTab('basic');
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    resetForm();
    setModalOpen(true);
  };

  const findCategoryChain = (catId, cats) => {
    for (const c of cats) {
      if (c.id === catId || c.uuid === catId) return [c];
      if (c.children?.length) {
        const chain = findCategoryChain(catId, c.children);
        if (chain) return [c, ...chain];
      }
    }
    return null;
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setName(product.name || '');
    setPrice(product.price || '');
    setComparePrice(product.compare_price || '');
    setStock(product.stock_quantity || '');
    const chain = findCategoryChain(product.category_id || product.category?.id, categories) || [];
    setMainCategoryId(chain[0]?.id || chain[0]?.uuid || '');
    setSubCategoryId(chain[1]?.id || chain[1]?.uuid || '');
    setSubSubCategoryId(chain[2]?.id || chain[2]?.uuid || '');
    setBrandId(product.brand_id || product.brand?.id || '');
    setCondition(product.condition || 'new');
    setStatus(product.status?.value || product.status || 'active');
    setDescription(product.description || '');
    setIsNegotiable(!!product.is_negotiable);
    setAvailableForTrade(!!product.available_for_trade);
    setAvailableForHp(!!product.available_for_hire_purchase);
    setAvailableForLayaway(!!product.available_for_layaway);
    setLayawayTotalBoxes(product.layaway_total_boxes || '');
    setAvailableForPreorder(!!product.available_for_preorder);
    setPreorderDepositAmount(product.preorder_deposit_amount || '');
    setPreorderExpectedDate(product.preorder_expected_date || '');
    setIsFeatured(!!product.is_featured);
    setExistingImages(product.images || []);
    setImageFiles([]); setImagePreviews([]); setActiveImageIdx(0);
    setVariations(product.variations || []);
    setErrorMsg(''); setActiveTab('basic');
    setModalOpen(true);
  };

  const handleDelete = async (uuid) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await productService.adminDeleteProduct(uuid);
      setProducts(prev => prev.filter(p => p.id !== uuid && p.uuid !== uuid));
    } catch (e) { alert(e.message || 'Failed to delete.'); }
  };

  // --- IMAGE HANDLING ---
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const totalCount = existingImages.length + imagePreviews.length + files.length;
    if (totalCount > MAX_IMAGES) {
      alert(`Maximum ${MAX_IMAGES} images allowed.`);
      return;
    }
    const newPreviews = files.map(file => ({
      url: URL.createObjectURL(file),
      file,
    }));
    setImagePreviews(prev => [...prev, ...newPreviews]);
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeNewImage = (idx) => {
    URL.revokeObjectURL(imagePreviews[idx].url);
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    if (activeImageIdx >= existingImages.length + imagePreviews.length - 1) {
      setActiveImageIdx(Math.max(0, existingImages.length + imagePreviews.length - 2));
    }
  };

  const removeExistingImage = (imgId) => {
    setExistingImages(prev => prev.filter(img => img.id !== imgId));
  };

  const allImages = [
    ...existingImages.map(img => ({ url: img.url, id: img.id, isExisting: true })),
    ...imagePreviews.map((p, i) => ({ url: p.url, isExisting: false, newIdx: i })),
  ];

  // --- VARIATION HANDLING ---
  const addVariation = () => setVariations(prev => [...prev, { name: '', options: [{ value: '', price_delta: 0 }] }]);
  const removeVariation = (vIdx) => setVariations(prev => prev.filter((_, i) => i !== vIdx));
  const updateVariation = (vIdx, field, val) => setVariations(prev => prev.map((v, i) => i === vIdx ? { ...v, [field]: val } : v));
  const addOption = (vIdx) => setVariations(prev => prev.map((v, i) => i === vIdx ? { ...v, options: [...v.options, { value: '', price_delta: 0 }] } : v));
  const removeOption = (vIdx, oIdx) => setVariations(prev => prev.map((v, i) => i === vIdx ? { ...v, options: v.options.filter((_, oi) => oi !== oIdx) } : v));
  const updateOption = (vIdx, oIdx, field, val) => setVariations(prev => prev.map((v, i) => i === vIdx ? { ...v, options: v.options.map((o, oi) => oi === oIdx ? { ...o, [field]: val } : o) } : v));

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    if (comparePrice) formData.append('compare_price', comparePrice);
    formData.append('stock_quantity', stock);
    formData.append('category_id', subSubCategoryId || subCategoryId || mainCategoryId);
    formData.append('brand_id', brandId || null);
    formData.append('condition', condition);
    formData.append('status', status);
    formData.append('description', description);
    formData.append('is_featured', isFeatured ? '1' : '0');
    formData.append('is_negotiable', isNegotiable ? '1' : '0');
    formData.append('available_for_trade', availableForTrade ? '1' : '0');
    formData.append('available_for_hire_purchase', availableForHp ? '1' : '0');
    formData.append('available_for_layaway', availableForLayaway ? '1' : '0');
    
    if (availableForLayaway && layawayTotalBoxes) {
      formData.append('layaway_total_boxes', layawayTotalBoxes);
    }

    formData.append('available_for_preorder', availableForPreorder ? '1' : '0');
    if (availableForPreorder) {
      if (preorderDepositAmount) formData.append('preorder_deposit_amount', preorderDepositAmount);
      if (preorderExpectedDate) formData.append('preorder_expected_date', preorderExpectedDate);
    }
    formData.append('is_featured', isFeatured ? '1' : '0');
    if (variations.length > 0) formData.append('variations', JSON.stringify(variations));
    imageFiles.forEach((file, i) => formData.append(`images[${i}]`, file));

    try {
      if (editingProduct) {
        await productService.adminUpdateProduct(editingProduct.id || editingProduct.uuid, formData);
      } else {
        await productService.adminCreateProduct(formData);
      }
      setModalOpen(false);
      resetForm();
      loadProducts();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Validation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";
  const labelClass = "block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wide mb-1.5";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Products Catalog</h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Manage storefront catalog items and inventory.</p>
        </div>
        <button onClick={handleOpenCreate} className="premium-button-primary px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : products.length === 0 ? (
        <div className="p-12 border border-secondary-200 dark:border-secondary-800 rounded-xl text-center bg-white dark:bg-secondary-900 text-secondary-500 dark:text-secondary-400">No products found.</div>
      ) : (
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 dark:text-secondary-400 font-bold uppercase tracking-wider text-xs">
                  <th className="p-4">Product</th>
                  <th className="p-4 hidden sm:table-cell">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 hidden md:table-cell">Stock</th>
                  <th className="p-4 hidden lg:table-cell">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                {products.map((p) => (
                  <tr key={p.id || p.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary-100 dark:bg-secondary-800 flex-shrink-0">
                          {p.primary_image
                            ? <img src={p.primary_image} alt={p.name} className="w-full h-full object-cover" />
                            : <ImageIcon className="w-5 h-5 text-secondary-400 m-auto mt-2.5" />}
                        </div>
                        <span className="font-semibold text-secondary-900 dark:text-white line-clamp-1">{p.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-secondary-600 dark:text-secondary-300 hidden sm:table-cell">{p.category?.name || 'N/A'}</td>
                    <td className="p-4 font-bold text-secondary-900 dark:text-white">GHS {parseFloat(p.price || 0).toLocaleString()}</td>
                    <td className="p-4 text-secondary-700 dark:text-secondary-300 hidden md:table-cell">{p.stock_quantity}</td>
                    <td className="p-4 hidden lg:table-cell">
                      <span className={`text-xxs px-2 py-0.5 font-bold uppercase rounded ${p.status === 'active' || p.status?.value === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-secondary-100 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-400'}`}>
                        {p.status?.label || p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(p.id || p.uuid)} className="p-1.5 text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 bg-secondary-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl w-full max-w-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-secondary-200 dark:border-secondary-800 flex justify-between items-center sticky top-0 bg-white dark:bg-secondary-900 z-10 rounded-t-2xl">
              <h3 className="font-bold text-secondary-900 dark:text-white text-lg">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="p-1 rounded-md hover:bg-secondary-200 dark:hover:bg-secondary-800 text-secondary-500 dark:text-secondary-400"><X className="w-5 h-5" /></button>
            </div>

            {/* Tab bar */}
            <div className="flex border-b border-secondary-200 dark:border-secondary-800 px-5">
              {['basic', 'images', 'variations'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`py-3 px-4 text-sm font-semibold capitalize border-b-2 transition-colors -mb-px ${activeTab === tab ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300'}`}>
                  {tab === 'images' ? `Images (${allImages.length}/${MAX_IMAGES})` : tab}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {errorMsg && (
                <div className="mx-5 mt-4 p-3 bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 rounded-lg flex items-start gap-2 text-sm border border-accent-200/50">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /><span>{errorMsg}</span>
                </div>
              )}

              {/* ─── TAB: BASIC ─── */}
              {activeTab === 'basic' && (
                <div className="p-5 space-y-4">
                  <div>
                    <label className={labelClass}>Product Name *</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="e.g. iPhone 15 Pro Max" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Price (GHS) *</label>
                      <input type="number" required min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className={inputClass} placeholder="0.00" />
                    </div>
                    <div>
                      <label className={labelClass}>Compare Price (GHS)</label>
                      <input type="number" min="0" step="0.01" value={comparePrice} onChange={e => setComparePrice(e.target.value)} className={inputClass} placeholder="Original price" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Stock Quantity *</label>
                      <input type="number" required min="0" value={stock} onChange={e => setStock(e.target.value)} className={inputClass} placeholder="0" />
                    </div>
                    <div>
                      <label className={labelClass}>Condition</label>
                      <select value={condition} onChange={e => setCondition(e.target.value)} className={inputClass}>
                        <option value="new">New</option>
                        <option value="used">Used</option>
                        <option value="refurbished">Refurbished</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Main Category *</label>
                      <select required value={mainCategoryId} onChange={e => {
                        setMainCategoryId(e.target.value);
                        setSubCategoryId('');
                        setSubSubCategoryId('');
                      }} className={inputClass}>
                        <option value="">Select Main Category</option>
                        {categories.map(c => <option key={c.id || c.uuid} value={c.id || c.uuid}>{c.icon} {c.name}</option>)}
                      </select>
                    </div>
                    {mainCategoryId && categories.find(c => (c.id === mainCategoryId || c.uuid === mainCategoryId))?.children?.length > 0 && (
                      <div>
                        <label className={labelClass}>Subcategory</label>
                        <select value={subCategoryId} onChange={e => {
                          setSubCategoryId(e.target.value);
                          setSubSubCategoryId('');
                        }} className={inputClass}>
                          <option value="">-- Optional --</option>
                          {categories.find(c => (c.id === mainCategoryId || c.uuid === mainCategoryId))?.children?.map(sc => (
                            <option key={sc.id || sc.uuid} value={sc.id || sc.uuid}>{sc.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    {subCategoryId && categories.find(c => (c.id === mainCategoryId || c.uuid === mainCategoryId))?.children?.find(sc => (sc.id === subCategoryId || sc.uuid === subCategoryId))?.children?.length > 0 && (
                      <div>
                        <label className={labelClass}>Sub-Subcategory</label>
                        <select value={subSubCategoryId} onChange={e => setSubSubCategoryId(e.target.value)} className={inputClass}>
                          <option value="">-- Optional --</option>
                          {categories.find(c => (c.id === mainCategoryId || c.uuid === mainCategoryId))?.children?.find(sc => (sc.id === subCategoryId || sc.uuid === subCategoryId))?.children?.map(ssc => (
                            <option key={ssc.id || ssc.uuid} value={ssc.id || ssc.uuid}>{ssc.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className={labelClass}>Brand (Optional)</label>
                      <select value={brandId} onChange={e => setBrandId(e.target.value)} className={inputClass}>
                        <option value="">No Brand</option>
                        {brands.map(b => <option key={b.id || b.uuid} value={b.id || b.uuid}>{b.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Status</label>
                    <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className={inputClass} placeholder="Describe the product..." />
                  </div>
                  <div className="flex flex-wrap gap-4 pt-2">
                    {[
                      { label: 'Is Featured Deal', val: isFeatured, set: setIsFeatured },
                      { label: 'Price Negotiable', val: isNegotiable, set: setIsNegotiable },
                      { label: 'Available for Barter', val: availableForTrade, set: setAvailableForTrade },
                      { label: 'Available for HP', val: availableForHp, set: setAvailableForHp },
                      { label: 'Available for Layaway', val: availableForLayaway, set: setAvailableForLayaway },
                      { label: 'Available for Pre-Order', val: availableForPreorder, set: setAvailableForPreorder },
                    ].map(({ label, val, set }) => (
                      <label key={label} className="flex items-center gap-2 text-sm text-secondary-700 dark:text-secondary-200 cursor-pointer select-none">
                        <div onClick={() => set(!val)} className={`w-10 h-5 rounded-full transition-colors flex items-center ${val ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-700'}`}>
                          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${val ? 'translate-x-5' : 'translate-x-0.5'}`} />
                        </div>
                        {label}
                      </label>
                    ))}
                  </div>

                  {availableForLayaway && (
                    <div className="grid grid-cols-2 gap-4 p-4 mt-2 bg-secondary-50 dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700">
                      <div className="col-span-2">
                        <p className="text-sm font-bold text-secondary-900 dark:text-white">Layaway / Susu Box Configuration</p>
                        <p className="text-xs text-secondary-500">Set the total number of boxes. The price per box will be automatically calculated.</p>
                      </div>
                      <div>
                        <label className={labelClass}>Total Boxes</label>
                        <input type="number" min="1" step="1" value={layawayTotalBoxes} onChange={e => setLayawayTotalBoxes(e.target.value)} className={inputClass} placeholder="e.g. 50" />
                      </div>
                      <div>
                        <label className={labelClass}>Calculated Price Per Box</label>
                        <div className="p-3 bg-white dark:bg-secondary-900 border border-secondary-300 dark:border-secondary-600 rounded-xl text-sm text-secondary-700 dark:text-secondary-300">
                          {layawayTotalBoxes && price ? `GHS ${(parseFloat(price) / parseInt(layawayTotalBoxes)).toFixed(2)}` : 'GHS 0.00'}
                        </div>
                      </div>
                    </div>
                  )}

                  {availableForPreorder && (
                    <div className="grid grid-cols-2 gap-4 p-4 mt-2 bg-secondary-50 dark:bg-secondary-800 rounded-xl border border-secondary-200 dark:border-secondary-700">
                      <div className="col-span-2">
                        <p className="text-sm font-bold text-secondary-900 dark:text-white">Pre-Order Configuration</p>
                        <p className="text-xs text-secondary-500">Set the required deposit and the expected arrival date.</p>
                      </div>
                      <div>
                        <label className={labelClass}>Required Deposit (GHS)</label>
                        <input type="number" min="0" step="0.01" value={preorderDepositAmount} onChange={e => setPreorderDepositAmount(e.target.value)} className={inputClass} placeholder="e.g. 500" />
                      </div>
                      <div>
                        <label className={labelClass}>Expected Arrival Date</label>
                        <input type="date" value={preorderExpectedDate} onChange={e => setPreorderExpectedDate(e.target.value)} className={inputClass} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB: IMAGES ─── */}
              {activeTab === 'images' && (
                <div className="p-5 space-y-4">
                  {/* Main large preview */}
                  {allImages.length > 0 ? (
                    <div className="relative">
                      <div className="aspect-video bg-secondary-100 dark:bg-secondary-800 rounded-xl overflow-hidden">
                        <img src={allImages[activeImageIdx]?.url} alt="Main preview" className="w-full h-full object-contain" />
                      </div>
                      {/* Navigation arrows */}
                      {allImages.length > 1 && (
                        <>
                          <button type="button" onClick={() => setActiveImageIdx(i => Math.max(0, i - 1))} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 dark:bg-secondary-900/80 rounded-full shadow"><ChevronLeft className="w-5 h-5" /></button>
                          <button type="button" onClick={() => setActiveImageIdx(i => Math.min(allImages.length - 1, i + 1))} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 dark:bg-secondary-900/80 rounded-full shadow"><ChevronRight className="w-5 h-5" /></button>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="aspect-video bg-secondary-100 dark:bg-secondary-800 rounded-xl flex flex-col items-center justify-center text-secondary-400">
                      <ImageIcon className="w-12 h-12 mb-2 opacity-40" />
                      <p className="text-sm font-medium">No images added yet</p>
                    </div>
                  )}

                  {/* Thumbnail strip */}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {allImages.map((img, idx) => (
                      <div key={idx} className="relative flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => setActiveImageIdx(idx)}
                          className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${activeImageIdx === idx ? 'border-primary-500 ring-2 ring-primary-500/30' : 'border-secondary-200 dark:border-secondary-700'}`}
                        >
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </button>
                        <button
                          type="button"
                          onClick={() => img.isExisting ? removeExistingImage(img.id) : removeNewImage(img.newIdx)}
                          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent-500 rounded-full flex items-center justify-center text-white text-xs"
                        >×</button>
                      </div>
                    ))}

                    {/* Add more button */}
                    {allImages.length < MAX_IMAGES && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-16 h-16 rounded-lg border-2 border-dashed border-secondary-300 dark:border-secondary-600 flex flex-col items-center justify-center text-secondary-400 hover:border-primary-500 hover:text-primary-500 flex-shrink-0 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                        <span className="text-xxs mt-0.5">Add</span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleImageSelect}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={allImages.length >= MAX_IMAGES}
                    className="w-full border-2 border-dashed border-secondary-300 dark:border-secondary-700 hover:border-primary-500 dark:hover:border-primary-500 rounded-xl py-5 flex flex-col items-center gap-2 text-secondary-500 dark:text-secondary-400 hover:text-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="w-6 h-6" />
                    <span className="text-sm font-medium">Click to upload images</span>
                    <span className="text-xs">{allImages.length}/{MAX_IMAGES} images • JPG, PNG, WebP</span>
                  </button>
                </div>
              )}

              {/* ─── TAB: VARIATIONS ─── */}
              {activeTab === 'variations' && (
                <div className="p-5 space-y-4">
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">Add product variations like Size, Color, Material, etc.</p>
                  {variations.map((variation, vIdx) => (
                    <div key={vIdx} className="border border-secondary-200 dark:border-secondary-700 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Variation name (e.g. Color, Size)"
                          value={variation.name}
                          onChange={e => updateVariation(vIdx, 'name', e.target.value)}
                          className={`${inputClass} flex-grow`}
                        />
                        <button type="button" onClick={() => removeVariation(vIdx)} className="p-2 text-accent-600 hover:bg-accent-50 rounded-lg flex-shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {variation.options.map((opt, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="Option value (e.g. Red, XL)"
                              value={opt.value}
                              onChange={e => updateOption(vIdx, oIdx, 'value', e.target.value)}
                              className={`${inputClass} flex-grow`}
                            />
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <span className="text-xs text-secondary-400">+/-</span>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={opt.price_delta}
                                onChange={e => updateOption(vIdx, oIdx, 'price_delta', e.target.value)}
                                className="w-20 p-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                            </div>
                            {variation.options.length > 1 && (
                              <button type="button" onClick={() => removeOption(vIdx, oIdx)} className="p-1 text-secondary-400 hover:text-accent-600 flex-shrink-0">
                                <MinusCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={() => addOption(vIdx)} className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                          <PlusCircle className="w-3.5 h-3.5" /> Add option
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addVariation}
                    className="w-full border-2 border-dashed border-secondary-300 dark:border-secondary-700 hover:border-primary-500 rounded-xl py-3 flex items-center justify-center gap-2 text-secondary-500 dark:text-secondary-400 hover:text-primary-500 transition-colors text-sm font-semibold"
                  >
                    <Plus className="w-4 h-4" /> Add Variation Group
                  </button>
                </div>
              )}

              {/* Submit footer */}
              <div className="p-5 border-t border-secondary-200 dark:border-secondary-800 flex gap-3">
                <button type="button" onClick={() => { setModalOpen(false); resetForm(); }} className="flex-1 py-2.5 border border-secondary-300 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-xl font-semibold text-sm hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-[2] premium-button-primary py-2.5 rounded-xl font-bold flex items-center justify-center gap-2">
                  {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : (editingProduct ? '💾 Save Changes' : '✨ Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
export { Products };
