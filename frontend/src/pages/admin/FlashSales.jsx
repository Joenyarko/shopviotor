import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import productService from '../../services/productService';
import { Plus, Edit2, Trash2, RefreshCw, X, Search, CheckCircle } from 'lucide-react';

const FlashSales = () => {
  const [flashSales, setFlashSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]); // [{id, name, original_price, flash_price, stock_allocated}]
  
  const [submitting, setSubmitting] = useState(false);

  // Product Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const fetchFlashSales = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/marketing/flash-sales');
      setFlashSales(res.data?.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchFlashSales(); }, []);

  const handleSearchProduct = async () => {
    if (!searchTerm.trim()) return;
    setSearching(true);
    try {
      const res = await productService.getProducts({ q: searchTerm, per_page: 10 });
      setSearchResults(res.data?.data || res.data || []);
    } catch (e) { console.error(e); } finally { setSearching(false); }
  };

  const handleAddProduct = (product) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(prev => [...prev, {
        id: product.id,
        name: product.name,
        original_price: product.price,
        flash_price: product.price,
        stock_allocated: 10
      }]);
    }
  };

  const updateProductParam = (id, field, val) => {
    setSelectedProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p));
  };

  const handleRemoveProduct = (id) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleOpenEdit = (fs = null) => {
    if (fs) {
      setEditing(fs);
      setTitle(fs.title);
      setStartTime(new Date(fs.start_time).toISOString().slice(0, 16));
      setEndTime(new Date(fs.end_time).toISOString().slice(0, 16));
      setIsActive(fs.is_active);
      setSelectedProducts(fs.products.map(p => ({
        id: p.id,
        name: p.name,
        original_price: p.price,
        flash_price: p.pivot.flash_price,
        stock_allocated: p.pivot.stock_allocated,
      })));
    } else {
      setEditing(null);
      setTitle(''); setStartTime(''); setEndTime(''); setIsActive(true); setSelectedProducts([]);
    }
    setSearchTerm(''); setSearchResults([]);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const payload = {
      title, start_time: startTime, end_time: endTime, is_active: isActive,
      products: selectedProducts.map(p => ({
        id: p.id, flash_price: parseFloat(p.flash_price), stock_allocated: parseInt(p.stock_allocated)
      }))
    };

    try {
      if (editing) {
        await apiClient.put(`/admin/marketing/flash-sales/${editing.uuid}`, payload);
      } else {
        await apiClient.post('/admin/marketing/flash-sales', payload);
      }
      setModalOpen(false);
      fetchFlashSales();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (uuid) => {
    if (!window.confirm('Delete this flash sale?')) return;
    try {
      await apiClient.delete(`/admin/marketing/flash-sales/${uuid}`);
      fetchFlashSales();
    } catch (err) { alert('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Flash Sales</h2>
          <p className="text-sm text-secondary-500">Manage time-limited sales.</p>
        </div>
        <button onClick={() => handleOpenEdit()} className="premium-button-primary px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow">
          <Plus className="w-4 h-4" /> Create Flash Sale
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : (
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="p-4">Title</th>
                <th className="p-4">Schedule</th>
                <th className="p-4">Products</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {flashSales.map(fs => (
                <tr key={fs.uuid} className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50">
                  <td className="p-4 font-bold">{fs.title}</td>
                  <td className="p-4 text-xs text-secondary-500">
                    {new Date(fs.start_time).toLocaleString()} -<br/>{new Date(fs.end_time).toLocaleString()}
                  </td>
                  <td className="p-4"><span className="bg-secondary-100 px-2 py-1 rounded text-xs font-bold">{fs.products?.length || 0} items</span></td>
                  <td className="p-4">
                    <span className={`text-xxs px-2 py-0.5 font-bold uppercase rounded ${fs.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-secondary-100 text-secondary-600'}`}>
                      {fs.is_active ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenEdit(fs)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(fs.uuid)} className="p-1.5 text-accent-600 hover:bg-accent-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 bg-secondary-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-secondary-200 flex justify-between items-center bg-white z-10 sticky top-0">
              <h3 className="font-bold text-lg">{editing ? 'Edit Flash Sale' : 'Create Flash Sale'}</h3>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-secondary-500" /></button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
              {/* Left Column: Details */}
              <div className="w-full lg:w-1/3 space-y-4">
                <h4 className="font-bold text-sm text-secondary-900 border-b pb-2">Sale Details</h4>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 mb-1">Title *</label>
                  <input required type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2.5 border border-secondary-300 rounded-lg bg-secondary-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 mb-1">Start Time *</label>
                  <input required type="datetime-local" value={startTime} onChange={e=>setStartTime(e.target.value)} className="w-full p-2.5 border border-secondary-300 rounded-lg bg-secondary-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 mb-1">End Time *</label>
                  <input required type="datetime-local" value={endTime} onChange={e=>setEndTime(e.target.value)} className="w-full p-2.5 border border-secondary-300 rounded-lg bg-secondary-50" />
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold pt-2 cursor-pointer">
                  <input type="checkbox" checked={isActive} onChange={e=>setIsActive(e.target.checked)} className="w-4 h-4 text-primary-600 rounded border-secondary-300" />
                  Is Active
                </label>
              </div>

              {/* Right Column: Products */}
              <div className="w-full lg:w-2/3 space-y-4 border-t lg:border-t-0 lg:border-l border-secondary-200 lg:pl-8 pt-4 lg:pt-0">
                <h4 className="font-bold text-sm text-secondary-900 border-b pb-2">Select Products</h4>
                
                {/* Search */}
                <div className="flex gap-2">
                  <input 
                    type="text" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSearchProduct()}
                    placeholder="Search by product name..." 
                    className="flex-grow p-2 border border-secondary-300 rounded-lg text-sm" 
                  />
                  <button type="button" onClick={handleSearchProduct} className="bg-secondary-100 p-2 rounded-lg text-secondary-700 hover:bg-secondary-200">
                    {searching ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                  </button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="max-h-40 overflow-y-auto border border-secondary-200 rounded-lg divide-y divide-secondary-100 bg-secondary-50">
                    {searchResults.map(p => (
                      <div key={p.id} className="p-2 flex justify-between items-center hover:bg-white text-sm">
                        <span className="truncate pr-4">{p.name}</span>
                        <button type="button" onClick={() => handleAddProduct(p)} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded font-bold whitespace-nowrap">Add</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Selected Products */}
                <h4 className="font-bold text-sm text-secondary-900 border-b pb-2 mt-6">Selected Products ({selectedProducts.length})</h4>
                <div className="space-y-3">
                  {selectedProducts.map(p => (
                    <div key={p.id} className="bg-white border border-secondary-200 rounded-lg p-3 text-sm flex flex-col sm:flex-row gap-3 items-center">
                      <div className="flex-grow w-full">
                        <span className="font-semibold block truncate">{p.name}</span>
                        <span className="text-xs text-secondary-500">Original: GHS {p.original_price}</span>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="flex flex-col">
                          <label className="text-xxs font-bold text-secondary-500">Flash Price</label>
                          <input type="number" step="0.01" value={p.flash_price} onChange={e=>updateProductParam(p.id, 'flash_price', e.target.value)} className="w-24 p-1 border rounded" />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xxs font-bold text-secondary-500">Stock</label>
                          <input type="number" value={p.stock_allocated} onChange={e=>updateProductParam(p.id, 'stock_allocated', e.target.value)} className="w-16 p-1 border rounded" />
                        </div>
                        <button type="button" onClick={() => handleRemoveProduct(p.id)} className="mt-4 p-1.5 text-accent-600 bg-accent-50 rounded"><X className="w-4 h-4"/></button>
                      </div>
                    </div>
                  ))}
                  {selectedProducts.length === 0 && <p className="text-secondary-400 text-sm italic">No products added yet.</p>}
                </div>

              </div>
            </div>
            
            <div className="p-5 border-t border-secondary-200 bg-secondary-50 flex justify-end gap-3 sticky bottom-0">
              <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 bg-white border border-secondary-300 text-secondary-700 rounded-xl font-semibold text-sm hover:bg-secondary-100">Cancel</button>
              <button type="button" onClick={handleSubmit} disabled={submitting} className="premium-button-primary px-8 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2">
                {submitting ? 'Saving...' : 'Save Flash Sale'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashSales;
