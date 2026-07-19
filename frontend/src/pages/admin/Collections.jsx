import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import productService from '../../services/productService';
import { Plus, Edit2, Trash2, RefreshCw, X, Search, CheckCircle } from 'lucide-react';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]); // [{id, name, original_price}]
  
  const [submitting, setSubmitting] = useState(false);

  // Product Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/marketing/collections');
      setCollections(res.data?.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchCollections(); }, []);

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
        sort_order: prev.length
      }]);
    }
  };

  const handleRemoveProduct = (id) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleOpenEdit = (col = null) => {
    if (col) {
      setEditing(col);
      setTitle(col.title);
      setDescription(col.description || '');
      setSortOrder(col.sort_order);
      setIsActive(col.is_active);
      setSelectedProducts(col.products.map((p, i) => ({
        id: p.id,
        name: p.name,
        original_price: p.price,
        sort_order: p.pivot.sort_order || i,
      })).sort((a,b) => a.sort_order - b.sort_order));
    } else {
      setEditing(null);
      setTitle(''); setDescription(''); setSortOrder(0); setIsActive(true); setSelectedProducts([]);
    }
    setSearchTerm(''); setSearchResults([]);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Auto-assign sort_order based on array index if user didn't specify properly
    const productsPayload = selectedProducts.map((p, idx) => ({
      id: p.id, sort_order: idx
    }));

    const payload = {
      title, description, is_active: isActive, sort_order: parseInt(sortOrder),
      products: productsPayload
    };

    try {
      if (editing) {
        await apiClient.put(`/admin/marketing/collections/${editing.uuid}`, payload);
      } else {
        await apiClient.post('/admin/marketing/collections', payload);
      }
      setModalOpen(false);
      fetchCollections();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (uuid) => {
    if (!window.confirm('Delete this collection?')) return;
    try {
      await apiClient.delete(`/admin/marketing/collections/${uuid}`);
      fetchCollections();
    } catch (err) { alert('Failed to delete'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Curated Collections</h2>
          <p className="text-sm text-secondary-500">Manage homepage product groups (e.g. "Top Tech Deals").</p>
        </div>
        <button onClick={() => handleOpenEdit()} className="premium-button-primary px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow">
          <Plus className="w-4 h-4" /> Create Collection
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : (
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="p-4">Sort Order</th>
                <th className="p-4">Title</th>
                <th className="p-4">Products</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {collections.map(col => (
                <tr key={col.uuid} className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50">
                  <td className="p-4 text-secondary-500">{col.sort_order}</td>
                  <td className="p-4">
                    <div className="font-bold">{col.title}</div>
                    <div className="text-xs text-secondary-500 truncate max-w-xs">{col.description}</div>
                  </td>
                  <td className="p-4"><span className="bg-secondary-100 px-2 py-1 rounded text-xs font-bold">{col.products?.length || 0} items</span></td>
                  <td className="p-4">
                    <span className={`text-xxs px-2 py-0.5 font-bold uppercase rounded ${col.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-secondary-100 text-secondary-600'}`}>
                      {col.is_active ? 'Active' : 'Draft'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleOpenEdit(col)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(col.uuid)} className="p-1.5 text-accent-600 hover:bg-accent-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
              <h3 className="font-bold text-lg">{editing ? 'Edit Collection' : 'Create Collection'}</h3>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-secondary-500" /></button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
              {/* Left Column: Details */}
              <div className="w-full lg:w-1/3 space-y-4">
                <h4 className="font-bold text-sm text-secondary-900 border-b pb-2">Collection Details</h4>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 mb-1">Title *</label>
                  <input required type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2.5 border border-secondary-300 rounded-lg bg-secondary-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 mb-1">Description</label>
                  <textarea value={description} onChange={e=>setDescription(e.target.value)} rows="3" className="w-full p-2.5 border border-secondary-300 rounded-lg bg-secondary-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 mb-1">Sort Order (Display order on homepage)</label>
                  <input type="number" value={sortOrder} onChange={e=>setSortOrder(e.target.value)} className="w-full p-2.5 border border-secondary-300 rounded-lg bg-secondary-50" />
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold pt-2 cursor-pointer">
                  <input type="checkbox" checked={isActive} onChange={e=>setIsActive(e.target.checked)} className="w-4 h-4 text-primary-600 rounded border-secondary-300" />
                  Is Active
                </label>
              </div>

              {/* Right Column: Products */}
              <div className="w-full lg:w-2/3 space-y-4 border-t lg:border-t-0 lg:border-l border-secondary-200 lg:pl-8 pt-4 lg:pt-0">
                <h4 className="font-bold text-sm text-secondary-900 border-b pb-2">Select Products (Drag order is maintained)</h4>
                
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
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {selectedProducts.map((p, idx) => (
                    <div key={p.id} className="bg-white border border-secondary-200 rounded-lg p-2 text-sm flex justify-between items-center">
                      <div className="flex items-center gap-3 truncate">
                        <span className="text-secondary-400 font-mono text-xs">{idx + 1}.</span>
                        <span className="font-semibold truncate">{p.name}</span>
                      </div>
                      <button type="button" onClick={() => handleRemoveProduct(p.id)} className="p-1 text-accent-600 hover:bg-accent-50 rounded"><X className="w-4 h-4"/></button>
                    </div>
                  ))}
                  {selectedProducts.length === 0 && <p className="text-secondary-400 text-sm italic">No products added yet.</p>}
                </div>

              </div>
            </div>
            
            <div className="p-5 border-t border-secondary-200 bg-secondary-50 flex justify-end gap-3 sticky bottom-0">
              <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 bg-white border border-secondary-300 text-secondary-700 rounded-xl font-semibold text-sm hover:bg-secondary-100">Cancel</button>
              <button type="button" onClick={handleSubmit} disabled={submitting} className="premium-button-primary px-8 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2">
                {submitting ? 'Saving...' : 'Save Collection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Collections;
