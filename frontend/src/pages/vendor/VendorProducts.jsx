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
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadProducts();
    productService.getCategories().then(r => setCategories(r.data?.data || [])).catch(console.error);
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await vendorService.getProducts();
      setProducts(res.data?.data || []);
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
  };

  const openAddModal = () => { resetForm(); setShowModal(true); };

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
    setProcessing(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    if (comparePrice) formData.append('compare_price', comparePrice);
    formData.append('description', description);
    formData.append('stock_quantity', stockQty);
    formData.append('condition', condition);
    formData.append('category_id', categoryId);
    imageFiles.forEach((f, i) => formData.append(`images[${i}]`, f));

    try {
      if (editingProduct) {
        await vendorService.updateProduct(editingProduct.uuid, formData);
      } else {
        await vendorService.createProduct(formData);
      }
      setShowModal(false);
      resetForm();
      loadProducts();
    } catch (err) {
      Swal.fire({ text: String(err.response?.data?.message || 'Failed to save product.') });
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
            <div key={p.uuid} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
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
                  <button onClick={handleDelete.bind(null, p.uuid)} className="flex-1 py-2 text-xs font-bold text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950/20 rounded-lg border border-accent-200 dark:border-accent-800 flex items-center justify-center gap-1">
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
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl w-full max-w-xl shadow-2xl relative my-8">
            <button onClick={() => { setShowModal(false); resetForm(); }} className="absolute top-4 right-4 p-1.5 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg text-secondary-500">
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <h3 className="font-bold text-xl text-secondary-900 dark:text-white mb-4">{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    {categories.map(c => <option key={c.id || c.uuid} value={c.uuid}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Description</label>
                  <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm" placeholder="Describe your product..." />
                </div>
                {/* Images */}
                <div>
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-2">Product Images (Max 5)</label>
                  <div className="flex flex-wrap gap-3">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-secondary-200 dark:border-secondary-700">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                    {imagePreviews.length < 5 && (
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="w-16 h-16 rounded-lg border-2 border-dashed border-secondary-300 dark:border-secondary-700 flex flex-col items-center justify-center text-secondary-400 hover:border-primary-500 hover:text-primary-500">
                        <Upload className="w-4 h-4" />
                        <span className="text-xxs mt-0.5">Add</span>
                      </button>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageSelect} />
                  </div>
                </div>
                <button type="submit" disabled={processing} className="w-full premium-button-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                  {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : (editingProduct ? 'Save Changes' : 'Publish Product')}
                </button>
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
