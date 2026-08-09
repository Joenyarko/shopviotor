import Swal from 'sweetalert2';
import React, { useState, useEffect, useRef } from 'react';
import preorderService from '../../services/preorderService';
import productService from '../../services/productService';
import { Package, RefreshCw, Check, X, Eye, Plus, Upload, Box, ListOrdered, Search } from 'lucide-react';
import DotPagination from '../../components/DotPagination';
import CategorySelector from '../../components/CategorySelector';

const AdminPreOrders = () => {
  const [mainTab, setMainTab] = useState('orders'); // 'orders' | 'products'
  const [preOrders, setPreOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [activeOrderTab, setActiveOrderTab] = useState('all');
  const [processing, setProcessing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [prodPage, setProdPage] = useState(1);
  const itemsPerPage = 8;
  
  const filteredPreOrders = preOrders.filter(o => 
    (o.customer_details?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (o.user?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (o.customer_details?.phone?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (o.user?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (o.product?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredPreOrders.length / itemsPerPage);
  const paginatedPreOrders = filteredPreOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalProdPages = Math.ceil(products.length / itemsPerPage);
  
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);
  const paginatedProducts = products.slice((prodPage - 1) * itemsPerPage, prodPage * itemsPerPage);
  
  // Product Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [preorderDepositPercent, setPreorderDepositPercent] = useState('');
  const [preorderExpectedDate, setPreorderExpectedDate] = useState('');
  const [preorderReleaseDate, setPreorderReleaseDate] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  
  const loadPreOrders = async () => {
    setLoading(true);
    try {
      const res = await preorderService.adminGetPreOrders(activeOrderTab !== 'all' ? { status: activeOrderTab } : {});
      setPreOrders(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadPreOrderProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await productService.adminGetProducts({ is_preorder: 1 });
      setProducts(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadPreOrders();
    loadPreOrderProducts();
    productService.getCategories().then(r => setCategories(r.data?.data || r.data || [])).catch(console.error);
  }, [activeOrderTab]);

  const handleStatusUpdate = async (uuid, status) => {
    const __confirmResult = await Swal.fire({ title: 'Are you sure?', text: `Mark this pre-order as ${status}?`, icon: 'warning', showCancelButton: true });
    if (!__confirmResult.isConfirmed) return;
    setProcessing(true);
    try {
      await preorderService.adminUpdateStatus(uuid, status);
      loadPreOrders();
    } catch (e) {
      Swal.fire({ text: String(e.response?.data?.message || e.message || 'Failed to update status.') });
    } finally {
      setProcessing(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('category_id', categoryId);
      if (description) formData.append('description', description);
      
      formData.append('is_preorder', '1');
      formData.append('preorder_deposit_percent', preorderDepositPercent);
      if (preorderExpectedDate) formData.append('preorder_expected_date', preorderExpectedDate);
      if (preorderReleaseDate) formData.append('preorder_release_date', preorderReleaseDate);
      
      if (imageFile) formData.append('image', imageFile);

      await productService.adminCreateProduct(formData);
      
      Swal.fire({ icon: 'success', title: 'Created', text: 'Pre-Order Product posted successfully!', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      setModalOpen(false);
      
      // reset form
      setName(''); setPrice(''); setCategoryId(''); setDescription('');
      setPreorderDepositPercent(''); setPreorderExpectedDate(''); setPreorderReleaseDate('');
      setImageFile(null); setImagePreview(null);
      
      loadPreOrderProducts();
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.message || 'Failed to create product.' });
    } finally {
      setProcessing(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400',
      arrived: 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400',
      completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
      cancelled: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    };
    return map[status] || 'bg-secondary-100 text-secondary-600';
  };

  const inputClass = "w-full p-2.5 bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm";
  const labelClass = "block text-xs font-bold text-secondary-500 mb-1";

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-primary-500" /> Pre-Orders Management
          </h2>
          <p className="text-sm text-secondary-500 mt-1">Manage customer pre-orders and pre-order products.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {mainTab === 'orders' && (
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-secondary-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white placeholder-secondary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Search pre-orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          <button onClick={() => setModalOpen(true)} className="premium-button-primary px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-sm whitespace-nowrap">
            <Plus className="w-4 h-4" /> Post Pre-Order Product
          </button>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex gap-1 border-b border-secondary-200 dark:border-secondary-800">
        {[
          { key: 'orders', label: 'Customer Orders', icon: ListOrdered },
          { key: 'products', label: 'Pre-Order Products', icon: Box },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key} onClick={() => setMainTab(key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${mainTab === key ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300'}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {mainTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex gap-2 border-b border-secondary-200 dark:border-secondary-800 overflow-x-auto">
            {['all', 'pending', 'arrived', 'completed', 'cancelled'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveOrderTab(tab)}
                className={`px-4 py-2 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeOrderTab === tab ? 'border-primary-500 text-primary-600' : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300'}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
          ) : preOrders.length === 0 ? (
            <div className="p-12 border border-secondary-200 dark:border-secondary-800 rounded-xl text-center bg-white dark:bg-secondary-900 text-secondary-500">
              No pre-orders found.
            </div>
          ) : (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-x-auto shadow-sm">
                <table className="w-full min-w-[650px] text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase tracking-wider text-xs">
                      <th className="p-4">Customer</th>
                      <th className="p-4">Product</th>
                      <th className="p-4">Deposit / Total</th>
                      <th className="p-4">Expected Date</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                    {paginatedPreOrders.map((order) => (
                      <tr key={order.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/50 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-secondary-900 dark:text-white">{order.customer_details?.name || order.user?.name}</div>
                          <div className="text-xs text-secondary-500">{order.customer_details?.phone || order.user?.email}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-secondary-900 dark:text-white max-w-[200px] truncate" title={order.product?.name}>
                            {order.product?.name}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-primary-600">GHS {parseFloat(order.deposit_paid).toFixed(2)}</div>
                          <div className="text-xs text-secondary-500">Total: GHS {parseFloat(order.total_price).toFixed(2)}</div>
                        </td>
                        <td className="p-4">
                          {order.expected_date ? new Date(order.expected_date).toLocaleDateString() : 'TBD'}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${statusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          {order.status === 'pending' && (
                            <button disabled={processing} onClick={() => handleStatusUpdate(order.uuid, 'arrived')} className="p-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors" title="Mark Arrived">
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {order.status === 'arrived' && (
                            <button disabled={processing} onClick={() => handleStatusUpdate(order.uuid, 'completed')} className="p-1.5 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-lg transition-colors" title="Mark Completed">
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {(order.status === 'pending' || order.status === 'arrived') && (
                            <button disabled={processing} onClick={() => handleStatusUpdate(order.uuid, 'cancelled')} className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors" title="Cancel Order">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <DotPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
          )}
        </div>
      )}

      {mainTab === 'products' && (
        loadingProducts ? (
          <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
        ) : products.length === 0 ? (
          <div className="p-12 border border-secondary-200 dark:border-secondary-800 rounded-xl text-center bg-white dark:bg-secondary-900 text-secondary-500">
            No pre-order products posted yet.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedProducts.map(p => (
              <div key={p.id} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="aspect-square bg-secondary-100 dark:bg-secondary-800 p-4 flex items-center justify-center">
                  {p.images?.length > 0 ? (
                    <img src={p.images[0].image_url} alt={p.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                  ) : <Package className="w-12 h-12 text-secondary-300" />}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold text-secondary-900 dark:text-white line-clamp-1">{p.name}</h3>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-primary-600 dark:text-primary-400">GHS {parseFloat(p.price).toFixed(2)}</span>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">{p.preorder_deposit_percent}% Deposit</span>
                  </div>
                  <div className="mt-4 pt-3 border-t border-secondary-100 dark:border-secondary-800 flex justify-between text-xs text-secondary-500">
                    <span>Exp: {p.preorder_expected_date ? new Date(p.preorder_expected_date).toLocaleDateString() : 'TBD'}</span>
                    <span>Rel: {p.preorder_release_date ? new Date(p.preorder_release_date).toLocaleDateString() : 'TBD'}</span>
                  </div>
                  </div>
                </div>
              ))}
            </div>
            <DotPagination currentPage={prodPage} totalPages={totalProdPages} onPageChange={setProdPage} />
          </div>
        )
      )}

      {/* CREATE PRE-ORDER PRODUCT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 bg-secondary-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="p-5 border-b border-secondary-200 dark:border-secondary-800 flex justify-between items-center sticky top-0 bg-white dark:bg-secondary-900 z-10 rounded-t-2xl">
              <h3 className="font-bold text-secondary-900 dark:text-white text-lg">Post Pre-Order Product</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-md hover:bg-secondary-200 dark:hover:bg-secondary-800 text-secondary-500 dark:text-secondary-400"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Product Name *</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className={inputClass} placeholder="e.g. PlayStation 6 Pro" />
                </div>
                <div>
                  <label className={labelClass}>Category *</label>
                  <CategorySelector 
                    categories={categories}
                    value={categoryId}
                    onChange={setCategoryId}
                    required={true}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Product Description</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className={inputClass} placeholder="Short description..." />
              </div>

              <div>
                <label className={labelClass}>Product Image</label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-secondary-200">
                      <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-1 right-1 bg-accent-500 text-white rounded-full p-1 shadow hover:bg-accent-600"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-lg border-2 border-dashed border-secondary-300 dark:border-secondary-700 flex flex-col items-center justify-center text-secondary-400 hover:border-primary-500 hover:text-primary-500 transition-colors">
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">Upload</span>
                    </button>
                  )}
                  <p className="text-xs text-secondary-500 max-w-[200px]">Upload a clear photo of the pre-order item.</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-secondary-100 dark:border-secondary-800">
                <div>
                  <label className={labelClass}>Total Price (GHS) *</label>
                  <input type="number" step="0.01" min="1" required value={price} onChange={e => setPrice(e.target.value)} className={inputClass} placeholder="e.g. 5000" />
                </div>
                <div>
                  <label className={labelClass}>Deposit Percentage (%) *</label>
                  <input type="number" min="1" max="100" required value={preorderDepositPercent} onChange={e => setPreorderDepositPercent(e.target.value)} className={inputClass} placeholder="e.g. 50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Expected Arrival Date</label>
                  <input type="date" value={preorderExpectedDate} onChange={e => setPreorderExpectedDate(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Official Release Date</label>
                  <input type="date" value={preorderReleaseDate} onChange={e => setPreorderReleaseDate(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 border border-secondary-300 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-xl font-semibold text-sm hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={processing} className="flex-[2] premium-button-primary py-2.5 rounded-xl font-bold flex items-center justify-center gap-2">
                  {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Post Pre-Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPreOrders;
