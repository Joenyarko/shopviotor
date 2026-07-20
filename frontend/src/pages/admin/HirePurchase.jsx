import React, { useEffect, useState, useRef } from 'react';
import hpService from '../../services/hpService';
import productService from '../../services/productService';
import { Briefcase, X, RefreshCw, Eye, Plus, Image as ImageIcon, Upload, Trash2, CheckCircle } from 'lucide-react';

const AdminHirePurchase = () => {
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'products'
  
  // Applications State
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Products State
  const [hpProducts, setHpProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  
  // Product Form State
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const response = await hpService.adminGetAgreements();
      setApplications(response.data?.data || response.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadHpProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await productService.adminGetProducts({ available_for_hire_purchase: true });
      setHpProducts(res.data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadApplications();
    loadHpProducts();
    productService.getCategories().then(r => setCategories(r.data?.data || r.data || [])).catch(console.error);
  }, []);

  const handleUpdateStatus = async (uuid, status) => {
    if (!window.confirm(`Are you sure you want to mark this application as ${status}?`)) return;
    setProcessing(true);
    try {
      await hpService.adminUpdateStatus(uuid, status);
      alert('Status updated successfully.');
      setSelectedApp(null);
      loadApplications();
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setProcessing(false);
    }
  };

  // --- Product Form Handlers ---
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setName(''); setPrice(''); setCategoryId(''); setDescription('');
    setImageFile(null); setImagePreview(null);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('stock_quantity', '5'); // Default to 5 for HP items
    formData.append('category_id', categoryId);
    formData.append('condition', 'new');
    formData.append('status', 'active');
    formData.append('description', description);
    formData.append('available_for_hire_purchase', '1');
    if (imageFile) formData.append('images[0]', imageFile);

    try {
      await productService.adminCreateProduct(formData);
      setShowAddProductModal(false);
      resetForm();
      loadHpProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create product.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteProduct = async (uuid) => {
    if (!window.confirm('Delete this HP product?')) return;
    try {
      await productService.adminDeleteProduct(uuid);
      loadHpProducts();
    } catch (e) { alert(e.message || 'Failed to delete.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary-500" /> Hire Purchase Management
          </h2>
          <p className="text-sm text-secondary-500 mt-1">Review applications and manage products available for hire purchase.</p>
        </div>
        
        {activeTab === 'products' && (
          <button onClick={() => setShowAddProductModal(true)} className="premium-button-primary px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow">
            <Plus className="w-4 h-4" /> Post HP Product
          </button>
        )}
      </div>

      <div className="flex border-b border-secondary-200 dark:border-secondary-800">
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'applications' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200'}`}
        >
          Customer Applications
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'products' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200'}`}
        >
          HP Products
        </button>
      </div>

      {activeTab === 'applications' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
            ) : applications.length === 0 ? (
              <div className="p-8 border border-secondary-200 dark:border-secondary-800 rounded-xl text-center bg-white dark:bg-secondary-900 text-secondary-500 dark:text-secondary-400 font-semibold">
                No hire purchase applications found.
              </div>
            ) : (
              <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase tracking-wider text-xxs">
                      <th className="p-4">Customer</th>
                      <th className="p-4">Product</th>
                      <th className="p-4">Total Value</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                    {applications.map((app) => (
                      <tr key={app.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                        <td className="p-4 font-semibold text-secondary-900 dark:text-white">{app.user?.name || 'Customer'}</td>
                        <td className="p-4 text-secondary-700 dark:text-secondary-300">{app.product?.name}</td>
                        <td className="p-4 font-semibold text-secondary-900 dark:text-white">GHS {parseFloat(app.total_amount || 0).toLocaleString()}</td>
                        <td className="p-4">
                          <span className={`text-xxs px-2.5 py-0.5 rounded-full font-bold uppercase ${app.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400' : 'bg-yellow-100 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-450'}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button onClick={() => setSelectedApp(app)} className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-lg"><Eye className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div>
            {selectedApp ? (
              <aside className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 transition-colors shadow-sm">
                <h3 className="font-bold text-secondary-900 dark:text-white mb-4">Application Details</h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xxs text-secondary-500 uppercase font-bold tracking-wider">Product Name</span>
                    <span className="text-sm font-semibold text-secondary-900 dark:text-white">{selectedApp.product?.name}</span>
                  </div>
                  <div>
                    <span className="block text-xxs text-secondary-500 uppercase font-bold tracking-wider">Total Amount</span>
                    <span className="text-sm font-semibold text-secondary-900 dark:text-white">GHS {parseFloat(selectedApp.total_amount || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-xxs text-secondary-500 uppercase font-bold tracking-wider">Deposit Paid</span>
                    <span className="text-sm font-semibold text-secondary-900 dark:text-white">GHS {parseFloat(selectedApp.deposit_amount || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-xxs text-secondary-500 uppercase font-bold tracking-wider">Monthly Installment ({selectedApp.duration_months} Months)</span>
                    <span className="text-sm font-semibold text-secondary-900 dark:text-white">GHS {parseFloat(selectedApp.monthly_installment || 0).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="block text-xxs text-secondary-500 uppercase font-bold tracking-wider">Customer Notes</span>
                    <p className="text-sm text-secondary-700 dark:text-secondary-300">{selectedApp.notes || 'None'}</p>
                  </div>
                  
                  <div className="pt-4 border-t border-secondary-100 dark:border-secondary-800 space-y-2">
                    <button 
                      onClick={() => handleUpdateStatus(selectedApp.uuid, 'active')}
                      disabled={processing} 
                      className="w-full premium-button-primary py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle className="w-4 h-4" /> Approve & Activate
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(selectedApp.uuid, 'rejected')}
                      disabled={processing} 
                      className="w-full bg-accent-50 dark:bg-accent-950/20 text-accent-600 hover:bg-accent-100 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                    >
                      <X className="w-4 h-4" /> Reject Application
                    </button>
                  </div>
                </div>
              </aside>
            ) : (
              <div className="bg-white dark:bg-secondary-900 border border-dashed border-secondary-200 dark:border-secondary-800 p-8 rounded-2xl text-center text-xs text-secondary-500 dark:text-secondary-400">
                Select an application to review details and take action.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-4">
          {loadingProducts ? (
            <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
          ) : hpProducts.length === 0 ? (
            <div className="p-12 border border-secondary-200 dark:border-secondary-800 rounded-xl text-center bg-white dark:bg-secondary-900 text-secondary-500 dark:text-secondary-400 font-semibold flex flex-col items-center">
              <Briefcase className="w-12 h-12 mb-3 text-secondary-300" />
              <p>No products are currently available for Hire Purchase.</p>
              <button onClick={() => setShowAddProductModal(true)} className="mt-4 text-primary-600 font-bold hover:underline">Post the first one</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {hpProducts.map(p => (
                <div key={p.id || p.uuid} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
                  <div className="h-48 bg-secondary-100 dark:bg-secondary-800 relative">
                    {p.primary_image ? (
                      <img src={p.primary_image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-secondary-300 absolute inset-0 m-auto" />
                    )}
                    <div className="absolute top-2 right-2 bg-blue-500 text-white text-xxs font-bold px-2 py-1 rounded shadow-sm">HP AVAILABLE</div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-secondary-900 dark:text-white line-clamp-1">{p.name}</h3>
                    <p className="text-primary-600 dark:text-primary-400 font-bold mt-1">GHS {parseFloat(p.price || 0).toLocaleString()}</p>
                    <div className="mt-auto pt-4 flex justify-end">
                      <button onClick={() => handleDeleteProduct(p.id || p.uuid)} className="p-2 text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950/30 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Post Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl w-full max-w-lg shadow-2xl relative mt-20">
            <button onClick={() => { setShowAddProductModal(false); resetForm(); }} className="absolute top-4 right-4 p-1 rounded-md hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-500"><X className="w-5 h-5" /></button>
            <div className="p-6">
              <h3 className="font-bold text-xl text-secondary-900 dark:text-white mb-1">Post Hire Purchase Product</h3>
              <p className="text-xs text-secondary-500 mb-6">Create a product listing that customers can apply to pay for in installments.</p>
              
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Product Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm focus:ring-2 focus:ring-primary-500" placeholder="e.g. Samsung Galaxy S23" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Full Price (GHS)</label>
                    <input type="number" required min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm focus:ring-2 focus:ring-primary-500" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Category</label>
                    <select required value={categoryId} onChange={e => setCategoryId(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm focus:ring-2 focus:ring-primary-500">
                      <option value="">Select</option>
                      {categories.map(c => <option key={c.id || c.uuid} value={c.id || c.uuid}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Product Description</label>
                  <textarea rows={3} required value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm focus:ring-2 focus:ring-primary-500" placeholder="Describe the item features..." />
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Product Image</label>
                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-secondary-200">
                        <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-1 right-1 bg-accent-500 text-white rounded-full p-0.5"><X className="w-3 h-3" /></button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="w-20 h-20 rounded-lg border-2 border-dashed border-secondary-300 dark:border-secondary-700 flex flex-col items-center justify-center text-secondary-400 hover:border-primary-500 hover:text-primary-500">
                        <Upload className="w-5 h-5" />
                        <span className="text-xxs mt-1">Upload</span>
                      </button>
                    )}
                    <p className="text-xs text-secondary-500 max-w-[200px]">Upload a clear photo of the product.</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                </div>

                <button type="submit" disabled={processing} className="w-full premium-button-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4">
                  {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Publish HP Product'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminHirePurchase;
