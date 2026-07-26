import Swal from 'sweetalert2';
import React, { useState, useEffect, useRef } from 'react';
import vendorService from '../../services/vendorService';
import productService from '../../services/productService';
import { Package, Plus, Trash2, RefreshCw, X, Upload, Image as ImageIcon, Edit } from 'lucide-react';
import DotPagination from '../../components/DotPagination';

const VendorProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [store, setStore] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [description, setDescription] = useState('');
  const [stockQty, setStockQty] = useState('');
  const [condition, setCondition] = useState('new');
  const [categoryId, setCategoryId] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [availableForLayaway, setAvailableForLayaway] = useState(false);
  const [layawayBoxes, setLayawayBoxes] = useState('');
  const [availableForHP, setAvailableForHP] = useState(false);
  const [availableForPreorder, setAvailableForPreorder] = useState(false);
  const [availableForTrade, setAvailableForTrade] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProducts();
    productService.getCategories().then(r => setCategories(r.data?.data || r.data || [])).catch(console.error);
    vendorService.getMyStore().then(r => setStore(r?.data?.data || r?.data || (r && r.uuid ? r : null))).catch(console.error);
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await vendorService.getProducts();
      setProducts(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName(''); setPrice(''); setComparePrice(''); setDescription('');
    setStockQty(''); setCondition('new'); setCategoryId('');
    setImageFiles([]); setImagePreviews([]); setEditingProduct(null);
    setAvailableForLayaway(false); setLayawayBoxes('');
    setAvailableForHP(false); setAvailableForPreorder(false); setAvailableForTrade(false);
    setActiveTab('basic');
  };

  const openAddModal = () => { resetForm(); setShowModal(true); };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setName(p.name || '');
    setPrice(p.price || '');
    setComparePrice(p.compare_price || '');
    setDescription(p.description || '');
    setStockQty(p.stock_quantity || '');
    setCondition(p.condition || 'new');
    setCategoryId(p.category?.id || p.category?.uuid || p.category_id || '');
    setAvailableForLayaway(!!p.available_for_layaway);
    setLayawayBoxes(p.layaway_total_boxes || p.layaway_boxes || '');
    setAvailableForHP(!!p.available_for_hire_purchase);
    setAvailableForPreorder(!!p.available_for_preorder);
    setAvailableForTrade(!!p.available_for_trade);
    setImageFiles([]);
    setImagePreviews(p.images?.map(i => i.url || i.path) || (p.primary_image ? [p.primary_image] : []));
    setActiveTab('basic');
    setShowModal(true);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const combined = [...imageFiles, ...files].slice(0, 5);
    setImageFiles(combined);
    setImagePreviews(combined.map(f => URL.createObjectURL(f)));
  };

  const removeImage = (idx) => {
    const newFiles = imageFiles.filter((_, i) => i !== idx);
    const newPreviews = imagePreviews.filter((_, i) => i !== idx);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Client-side validation with friendly messages ──
    if (!name.trim()) {
      setActiveTab('basic');
      return Swal.fire({ icon: 'warning', title: 'Missing Field', text: 'Please enter a product name.' });
    }
    if (!price || isNaN(price) || Number(price) < 0) {
      setActiveTab('basic');
      return Swal.fire({ icon: 'warning', title: 'Missing Field', text: 'Please enter a valid product price.' });
    }
    if (!stockQty && stockQty !== 0) {
      setActiveTab('basic');
      return Swal.fire({ icon: 'warning', title: 'Missing Field', text: 'Please enter the stock quantity.' });
    }
    if (!categoryId) {
      setActiveTab('basic');
      return Swal.fire({ icon: 'warning', title: 'Missing Field', text: 'Please select a category for your product.' });
    }

    setProcessing(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    if (comparePrice) formData.append('compare_price', comparePrice);
    formData.append('description', description);
    formData.append('stock_quantity', stockQty);
    formData.append('condition', condition);
    formData.append('category_id', categoryId);
    formData.append('available_for_layaway', availableForLayaway ? 1 : 0);
    if (availableForLayaway && layawayBoxes) {
      formData.append('layaway_boxes', layawayBoxes);
      formData.append('layaway_total_boxes', layawayBoxes);
    }
    formData.append('available_for_hire_purchase', availableForHP ? 1 : 0);
    formData.append('available_for_preorder', availableForPreorder ? 1 : 0);
    formData.append('available_for_trade', availableForTrade ? 1 : 0);
    imageFiles.forEach((f, i) => formData.append(`images[${i}]`, f));

    try {
      if (editingProduct) {
        await vendorService.updateProduct(editingProduct.id || editingProduct.uuid, formData);
      } else {
        await vendorService.createProduct(formData);
      }
      setShowModal(false);
      resetForm();
      loadProducts();
    } catch (err) {
      // Parse Laravel validation errors (422) or other messages
      const errData = err.response?.data;
      if (err.response?.status === 422 && errData?.errors) {
        const firstField = Object.keys(errData.errors)[0];
        const firstMsg = errData.errors[firstField]?.[0] || 'Validation failed.';
        // Navigate to the relevant step
        if (['name','price','compare_price','stock_quantity','condition','category_id','description'].includes(firstField)) {
          setActiveTab('basic');
        } else if (['available_for_layaway','layaway_boxes','available_for_hire_purchase','available_for_preorder','available_for_trade'].includes(firstField)) {
          setActiveTab('capabilities');
        } else if (firstField.startsWith('images')) {
          setActiveTab('images');
        }
        Swal.fire({ icon: 'warning', title: 'Please fix the following', text: firstMsg });
      } else {
        Swal.fire({ icon: 'error', title: 'Error', text: errData?.message || 'Failed to save product. Please try again.' });
      }
    } finally {
      setProcessing(false);
    }
  };


  const handleDelete = async (uuid) => {
    const __confirmResult = await Swal.fire({ title: 'Are you sure?', text: 'Delete this product?', icon: 'warning', showCancelButton: true });
    if (!__confirmResult.isConfirmed) return;
    try {
      await vendorService.deleteProduct(uuid);
      loadProducts();
    } catch (e) { Swal.fire({ text: String('Failed to delete.') }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-primary-500" /> My Products
          </h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Manage your store's product listings.</p>
        </div>
        <button onClick={openAddModal} className="flex items-center gap-2 premium-button-primary px-4 py-2.5 rounded-xl text-sm font-bold shadow">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="w-10 h-10 text-primary-500 animate-spin" /></div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 flex flex-col items-center gap-4">
          <Package className="w-16 h-16 text-secondary-200 dark:text-secondary-700" />
          <p className="font-bold text-secondary-900 dark:text-white">No products yet.</p>
          <button onClick={openAddModal} className="text-primary-600 font-bold hover:underline">Add your first product</button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {paginatedProducts.map(p => (
            <div key={p.id || p.uuid} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="h-44 bg-secondary-100 dark:bg-secondary-800 relative">
                {p.primary_image ? (
                  <img src={p.primary_image} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-secondary-300 absolute inset-0 m-auto" />
                )}
                <div className={`absolute top-2 right-2 text-xxs font-bold px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-yellow-400 text-black'}`}>
                  {p.status?.toUpperCase?.() || p.status}
                </div>
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-sm text-secondary-900 dark:text-white line-clamp-2 flex-1">{p.name}</h3>
                <p className="text-primary-600 dark:text-primary-400 font-bold mt-2">GHS {parseFloat(p.price).toLocaleString()}</p>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">Stock: {p.stock_quantity}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEditModal(p)} className="flex-1 py-2 text-xs font-bold text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-lg border border-primary-200 dark:border-primary-800 flex items-center justify-center gap-1">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={handleDelete.bind(null, p.id || p.uuid)} className="flex-1 py-2 text-xs font-bold text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950/20 rounded-lg border border-accent-200 dark:border-accent-800 flex items-center justify-center gap-1">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
          <DotPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl w-full max-w-xl shadow-2xl relative my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-secondary-200 dark:border-secondary-800 flex justify-between items-center bg-white dark:bg-secondary-900 z-10">
              <h3 className="font-bold text-lg text-secondary-900 dark:text-white">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={() => { setShowModal(false); resetForm(); }} className="p-1 rounded-md hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-500 dark:text-secondary-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Navigation Bar */}
            <div className="flex border-b border-secondary-200 dark:border-secondary-800 px-5 bg-secondary-50/50 dark:bg-secondary-800/40">
              {['basic', 'capabilities', 'images'].map((tab, idx) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-4 text-xs font-extrabold uppercase tracking-wider border-b-2 transition-all -mb-px flex items-center gap-1.5 ${
                    activeTab === tab
                      ? 'border-primary-500 text-primary-600 dark:text-primary-400 bg-white dark:bg-secondary-900 rounded-t-lg shadow-sm'
                      : 'border-transparent text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-secondary-200 dark:bg-secondary-700 text-secondary-700 dark:text-secondary-300 flex items-center justify-center text-xxs font-black">
                    {idx + 1}
                  </span>
                  {tab === 'basic' && 'Basic Info'}
                  {tab === 'capabilities' && 'Capabilities'}
                  {tab === 'images' && `Images (${imagePreviews.length}/5)`}
                </button>
              ))}
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* STEP 1: BASIC INFO */}
                {activeTab === 'basic' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Product Name *</label>
                      <input required value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm" placeholder="e.g. iPhone 15 Pro Max" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Price (GHS) *</label>
                        <input type="number" required min={0} step={0.01} value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm" placeholder="0.00" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Compare Price</label>
                        <input type="number" min={0} step={0.01} value={comparePrice} onChange={e => setComparePrice(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm" placeholder="Original price" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Stock Qty *</label>
                        <input type="number" required min={0} value={stockQty} onChange={e => setStockQty(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Condition *</label>
                        <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm">
                          <option value="new">New</option>
                          <option value="used">Used</option>
                          <option value="refurbished">Refurbished</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Category *</label>
                      <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm">
                        <option value="">Select Category</option>
                        {categories.map(c => <option key={c.id || c.uuid} value={c.id || c.uuid}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Description</label>
                      <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm" placeholder="Describe your product..." />
                    </div>
                    <div className="flex justify-end pt-4 border-t border-secondary-200 dark:border-secondary-800">
                      <button type="button" onClick={() => setActiveTab('capabilities')} className="premium-button-primary px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow">
                        Next: Capabilities &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: SPECIALIZED CAPABILITIES */}
                {activeTab === 'capabilities' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="mb-2">
                      <h4 className="text-sm font-black text-secondary-900 dark:text-white uppercase tracking-wider">Specialized Selling Models</h4>
                      <p className="text-xs text-secondary-500">Enable installment plans, reservations, or trade-ins for this item based on your store permissions.</p>
                    </div>
                    
                    {/* Layaway Toggle */}
                    <div className={`p-3.5 rounded-xl border ${store?.can_offer_layaway ? 'border-secondary-200 dark:border-secondary-700 bg-secondary-50/50 dark:bg-secondary-800/30' : 'border-secondary-100 dark:border-secondary-800 bg-secondary-100/50 dark:bg-secondary-900/50 opacity-60'}`}>
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <span className="font-bold text-sm text-secondary-900 dark:text-white flex items-center gap-1.5">
                            Available for Layaway {!store?.can_offer_layaway && <span className="text-xxs font-normal px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400">🔒 Locked</span>}
                          </span>
                          <span className="text-xxs text-secondary-500 block">Allow buyers to pay in installments by buying boxes</span>
                        </div>
                        <input
                          type="checkbox"
                          disabled={!store?.can_offer_layaway}
                          checked={availableForLayaway}
                          onChange={e => setAvailableForLayaway(e.target.checked)}
                          className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed"
                        />
                      </label>
                      {availableForLayaway && store?.can_offer_layaway && (
                        <div className="mt-3 pt-3 border-t border-secondary-200 dark:border-secondary-700">
                          <label className="block text-xxs font-bold text-secondary-500 uppercase mb-1">Total Layaway Boxes *</label>
                          <input
                            type="number" required min={1}
                            value={layawayBoxes} onChange={e => setLayawayBoxes(e.target.value)}
                            className="w-full p-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-900 text-xs"
                            placeholder="e.g. 5 boxes"
                          />
                        </div>
                      )}
                    </div>

                    {/* Hire Purchase Toggle */}
                    <div className={`p-3.5 rounded-xl border flex items-center justify-between ${store?.can_offer_hire_purchase ? 'border-secondary-200 dark:border-secondary-700 bg-secondary-50/50 dark:bg-secondary-800/30' : 'border-secondary-100 dark:border-secondary-800 bg-secondary-100/50 dark:bg-secondary-900/50 opacity-60'}`}>
                      <div>
                        <span className="font-bold text-sm text-secondary-900 dark:text-white flex items-center gap-1.5">
                          Available for Hire Purchase {!store?.can_offer_hire_purchase && <span className="text-xxs font-normal px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400">🔒 Locked</span>}
                        </span>
                        <span className="text-xxs text-secondary-500 block">Allow credit/installment purchases</span>
                      </div>
                      <input
                        type="checkbox"
                        disabled={!store?.can_offer_hire_purchase}
                        checked={availableForHP}
                        onChange={e => setAvailableForHP(e.target.checked)}
                        className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Preorder Toggle */}
                    <div className={`p-3.5 rounded-xl border flex items-center justify-between ${store?.can_offer_preorders ? 'border-secondary-200 dark:border-secondary-700 bg-secondary-50/50 dark:bg-secondary-800/30' : 'border-secondary-100 dark:border-secondary-800 bg-secondary-100/50 dark:bg-secondary-900/50 opacity-60'}`}>
                      <div>
                        <span className="font-bold text-sm text-secondary-900 dark:text-white flex items-center gap-1.5">
                          Available for Pre-Order {!store?.can_offer_preorders && <span className="text-xxs font-normal px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400">🔒 Locked</span>}
                        </span>
                        <span className="text-xxs text-secondary-500 block">Accept reservations before official release</span>
                      </div>
                      <input
                        type="checkbox"
                        disabled={!store?.can_offer_preorders}
                        checked={availableForPreorder}
                        onChange={e => setAvailableForPreorder(e.target.checked)}
                        className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed"
                      />
                    </div>

                    {/* Trade Toggle */}
                    <div className={`p-3.5 rounded-xl border flex items-center justify-between ${store?.can_offer_trades ? 'border-secondary-200 dark:border-secondary-700 bg-secondary-50/50 dark:bg-secondary-800/30' : 'border-secondary-100 dark:border-secondary-800 bg-secondary-100/50 dark:bg-secondary-900/50 opacity-60'}`}>
                      <div>
                        <span className="font-bold text-sm text-secondary-900 dark:text-white flex items-center gap-1.5">
                          Eligible for Trade-In {!store?.can_offer_trades && <span className="text-xxs font-normal px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400">🔒 Locked</span>}
                        </span>
                        <span className="text-xxs text-secondary-500 block">Allow buyers to trade in their used items</span>
                      </div>
                      <input
                        type="checkbox"
                        disabled={!store?.can_offer_trades}
                        checked={availableForTrade}
                        onChange={e => setAvailableForTrade(e.target.checked)}
                        className="w-4 h-4 rounded text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-secondary-200 dark:border-secondary-800">
                      <button type="button" onClick={() => setActiveTab('basic')} className="px-5 py-2.5 rounded-xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 text-secondary-700 dark:text-secondary-300 font-bold text-sm">
                        &larr; Back
                      </button>
                      <button type="button" onClick={() => setActiveTab('images')} className="premium-button-primary px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow">
                        Next: Images &rarr;
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: IMAGES */}
                {activeTab === 'images' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-bold text-secondary-500 uppercase mb-2">Product Images (Max 5)</label>
                      <div className="flex flex-wrap gap-3">
                        {imagePreviews.map((src, idx) => (
                          <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-secondary-200 dark:border-secondary-700 shadow-sm">
                            <img src={src} alt="" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-accent-600 transition-colors">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {imagePreviews.length < 5 && (
                          <button type="button" onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-xl border-2 border-dashed border-secondary-300 dark:border-secondary-700 flex flex-col items-center justify-center text-secondary-400 hover:border-primary-500 hover:text-primary-500 transition-colors bg-secondary-50/50 dark:bg-secondary-800/20">
                            <Upload className="w-5 h-5 mb-1" />
                            <span className="text-xxs font-bold">Upload</span>
                          </button>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                      </div>
                      <p className="text-xs text-secondary-400 mt-2">Upload up to 5 high-quality images. First image will be used as the primary display thumbnail.</p>
                    </div>

                    <div className="flex justify-between items-center pt-6 border-t border-secondary-200 dark:border-secondary-800">
                      <button type="button" onClick={() => setActiveTab('capabilities')} className="px-5 py-2.5 rounded-xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 text-secondary-700 dark:text-secondary-300 font-bold text-sm">
                        &larr; Back
                      </button>
                      <button type="submit" disabled={processing} className="premium-button-primary px-8 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg">
                        {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : (editingProduct ? 'Save Changes' : 'Publish Product')}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorProducts;
export { VendorProducts };
