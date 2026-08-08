import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import productService from '../../services/productService';
import { Plus, Edit2, Trash2, RefreshCw, X, Search, CheckCircle } from 'lucide-react';
import DotPagination from '../../components/DotPagination';

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [collectionSearchTerm, setCollectionSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  
  const filteredCollections = collections.filter(c => 
    (c.title?.toLowerCase() || '').includes(collectionSearchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredCollections.length / itemsPerPage);
  const paginatedCollections = filteredCollections.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [collectionSearchTerm]);

  const [title, setTitle] = useState('');
  const [headerColor, setHeaderColor] = useState('yellow');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]); // [{id, name, original_price}]

  const [submitting, setSubmitting] = useState(false);

  // Product Search State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/marketing/collections');
      setCollections(res.data?.data || res.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const loadCategories = async () => {
    try {
      const catRes = await productService.getCategories();
      setCategories(catRes.data?.data?.data || catRes.data?.data || catRes.data || []);
    } catch (e) { console.error('Failed to load categories', e); }
  };

  useEffect(() => { fetchCollections(); loadCategories(); }, []);

  const handleSearchProduct = async () => {
    if (!searchTerm.trim() && !selectedCategory) return;
    setSearching(true);
    try {
      const res = await productService.searchProducts(searchTerm || '', { category_id: selectedCategory, per_page: 20 });
      setSearchResults(res.data?.data || res.data || []);
    } catch (e) { console.error(e); } finally { setSearching(false); }
  };

  const handleAddProduct = (product) => {
    const pId = product.uuid || product.id;
    if (!selectedProducts.find(p => p.id === pId)) {
      setSelectedProducts(prev => [...prev, {
        id: pId,
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
      setHeaderColor(col.header_color || 'yellow');
      setDescription(col.description || '');
      setSortOrder(col.sort_order);
      setIsActive(col.is_active);
      setSelectedProducts(col.products.map((p, i) => ({
        id: p.uuid || p.id,
        name: p.name,
        original_price: p.price,
        sort_order: p.pivot.sort_order || i,
      })).sort((a, b) => a.sort_order - b.sort_order));
    } else {
      setEditing(null);
      setTitle(''); setHeaderColor('yellow'); setDescription(''); setSortOrder(0); setIsActive(true); setSelectedProducts([]);
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
      title, header_color: headerColor, description, is_active: isActive, sort_order: parseInt(sortOrder),
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
      Swal.fire({ text: String(err.response?.data?.message || err.message) });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (uuid) => {
    const __confirmResult = await Swal.fire({ title: 'Are you sure?', text: 'Delete this collection?', icon: 'warning', showCancelButton: true });
    if (!__confirmResult.isConfirmed) return;
    try {
      await apiClient.delete(`/admin/marketing/collections/${uuid}`);
      fetchCollections();
    } catch (err) { Swal.fire({ text: String('Failed to delete') }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Curated Collections</h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">Manage homepage product groups (e.g. "Top Tech Deals").</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-secondary-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white placeholder-secondary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Search collections..."
              value={collectionSearchTerm}
              onChange={(e) => setCollectionSearchTerm(e.target.value)}
            />
          </div>
          <button onClick={() => handleOpenEdit()} className="premium-button-primary px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow whitespace-nowrap">
            <Plus className="w-4 h-4" /> Create Collection
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : (
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-x-auto shadow-sm [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <table className="w-full min-w-[650px] text-left text-sm">
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
              {paginatedCollections.map(col => (
                <tr key={col.uuid} className="border-b border-secondary-100 last:border-0 hover:bg-secondary-50">
                  <td className="p-4 text-secondary-500 dark:text-secondary-400">{col.sort_order}</td>
                  <td className="p-4">
                    <div className="font-bold">{col.title}</div>
                    <div className="text-xs text-secondary-500 dark:text-secondary-400 truncate max-w-xs">{col.description}</div>
                  </td>
                  <td className="p-4"><span className="bg-secondary-100 px-2 py-1 rounded text-xs font-bold">{col.products?.length || 0} items</span></td>
                  <td className="p-4">
                    <span className={`text-xxs px-2 py-0.5 font-bold uppercase rounded ${col.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-secondary-100 text-secondary-600 dark:text-secondary-300'}`}>
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
          <DotPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 bg-secondary-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-secondary-200 flex justify-between items-center bg-white z-10 sticky top-0">
              <h3 className="font-bold text-lg">{editing ? 'Edit Collection' : 'Create Collection'}</h3>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-secondary-500 dark:text-secondary-400" /></button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
              {/* Left Column: Details */}
              <div className="w-full lg:w-1/3 space-y-4">
                <h4 className="font-bold text-sm text-secondary-900 border-b pb-2">Collection Details</h4>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 mb-1">Title *</label>
                  <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2.5 border border-secondary-300 rounded-lg bg-secondary-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 mb-1">Header Color *</label>
                  <select value={headerColor} onChange={e => setHeaderColor(e.target.value)} className="w-full p-2.5 border border-secondary-300 rounded-lg bg-secondary-50">
                    <option value="yellow">Yellow</option>
                    <option value="black">Black</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 mb-1">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows="3" className="w-full p-2.5 border border-secondary-300 rounded-lg bg-secondary-50" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 mb-1">Sort Order (Display order on homepage)</label>
                  <input type="number" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="w-full p-2.5 border border-secondary-300 rounded-lg bg-secondary-50" />
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold pt-2 cursor-pointer">
                  <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 text-primary-600 rounded border-secondary-300" />
                  Is Active
                </label>
              </div>

              {/* Right Column: Products */}
              <div className="w-full lg:w-2/3 space-y-4 border-t lg:border-t-0 lg:border-l border-secondary-200 lg:pl-8 pt-4 lg:pt-0">
                <h4 className="font-bold text-sm text-secondary-900 border-b pb-2">Select Products (Drag order is maintained)</h4>

                {/* Search */}
                <div className="flex gap-2">
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-1/3 p-2 border border-secondary-300 rounded-lg text-sm"
                  >
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id || c.uuid} value={c.id}>{c.name}</option>)}
                  </select>
                  <input
                    type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearchProduct()}
                    placeholder="Search by name..."
                    className="flex-grow w-2/3 p-2 border border-secondary-300 rounded-lg text-sm"
                  />
                  <button type="button" onClick={handleSearchProduct} className="bg-secondary-100 p-2 rounded-lg text-secondary-700 dark:text-secondary-200 hover:bg-secondary-200">
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
                      <button type="button" onClick={() => handleRemoveProduct(p.id)} className="p-1 text-accent-600 hover:bg-accent-50 rounded"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {selectedProducts.length === 0 && <p className="text-secondary-400 text-sm italic">No products added yet.</p>}
                </div>

              </div>
            </div>

            <div className="p-5 border-t border-secondary-200 bg-secondary-50 flex justify-end gap-3 sticky bottom-0">
              <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 bg-white border border-secondary-300 text-secondary-700 dark:text-secondary-200 rounded-xl font-semibold text-sm hover:bg-secondary-100">Cancel</button>
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
