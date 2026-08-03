import Swal from 'sweetalert2';
import React, { useEffect, useState, useRef } from 'react';
import tradeService from '../../services/tradeService';
import productService from '../../services/productService';
import { Scale, X, RefreshCw, Eye, Plus, Image as ImageIcon, Upload, Trash2, Edit } from 'lucide-react';
import DotPagination from '../../components/DotPagination';
import CategorySelector from '../../components/CategorySelector';

const TradeRequests = () => {
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'products'
  
  // Trades State
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [valuations, setValuations] = useState({});
  const [productValue, setProductValue] = useState('');
  const [processing, setProcessing] = useState(false);

  // Products State
  const [tradeProducts, setTradeProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [page, setPage] = useState(1);
  const [prodPage, setProdPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(trades.length / itemsPerPage);
  const paginatedTrades = trades.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalProdPages = Math.ceil(tradeProducts.length / itemsPerPage);
  const paginatedTradeProducts = tradeProducts.slice((prodPage - 1) * itemsPerPage, prodPage * itemsPerPage);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  
  // Product Form State
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const loadTrades = async () => {
    setLoading(true);
    try {
      const response = await tradeService.adminGetTrades();
      setTrades(response.data?.data || response.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadTradeProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await productService.adminGetProducts({ available_for_trade: true });
      setTradeProducts(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadTrades();
    loadTradeProducts();
    productService.getCategories().then(r => setCategories(r.data?.data || r.data || [])).catch(console.error);
  }, []);

  const handleOpenEvaluate = (trade) => {
    setSelectedTrade(trade);
    const initialVals = {};
    trade.items?.forEach(item => {
      initialVals[item.id] = item.admin_valued_at || '';
    });
    setValuations(initialVals);
    setProductValue(trade.product_value || '');
  };

  const handleValuationChange = (itemId, value) => {
    setValuations(prev => ({
      ...prev,
      [itemId]: value,
    }));
  };

  const handleValuateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTrade) return;
    setProcessing(true);
    try {
      await tradeService.adminValuateTrade(selectedTrade.id || selectedTrade.uuid, {
        item_values: valuations,
        product_value: productValue,
      });
      Swal.fire({ text: String('Valuation submitted successfully.') });
      setSelectedTrade(null);
      loadTrades();
    } catch (err) {
      Swal.fire({ text: String(err.message || 'Failed to submit trade valuation.') });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (uuid) => {
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await tradeService.adminRejectTrade(uuid, reason);
      loadTrades();
    } catch (e) {
      Swal.fire({ text: String(e.message || 'Failed to reject trade.') });
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
    setEditingProductId(null);
  };

  const handleEditProduct = (p) => {
    setEditingProductId(p.id || p.uuid);
    setName(p.name || '');
    setPrice(p.price || '');
    setCategoryId(p.category_id || (p.category ? (p.category.id || p.category.uuid) : '') || '');
    setDescription(p.description || '');
    setImagePreview(p.primary_image || null);
    setImageFile(null);
    setShowAddProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('stock_quantity', '1'); // Default to 1 for trade items
    formData.append('category_id', categoryId);
    formData.append('condition', 'new');
    formData.append('status', 'active');
    formData.append('description', description);
    formData.append('available_for_trade', '1');
    if (imageFile) formData.append('images[0]', imageFile);

    try {
      if (editingProductId) {
        await productService.adminUpdateProduct(editingProductId, formData);
        Swal.fire({ text: 'Trade product updated successfully.' });
      } else {
        await productService.adminCreateProduct(formData);
        Swal.fire({ text: 'Trade product created successfully.' });
      }
      setShowAddProductModal(false);
      resetForm();
      loadTradeProducts();
    } catch (err) {
      Swal.fire({ text: String(err.response?.data?.message || 'Failed to save product.') });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteProduct = async (uuid) => {
    const __confirmResult = await Swal.fire({ title: 'Are you sure?', text: 'Delete this trade product?', icon: 'warning', showCancelButton: true });
    if (!__confirmResult.isConfirmed) return;
    try {
      await productService.adminDeleteProduct(uuid);
      loadTradeProducts();
    } catch (e) { Swal.fire({ text: String(e.message || 'Failed to delete.') }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            <Scale className="w-6 h-6 text-primary-500" /> Barter Trade Hub
          </h2>
          <p className="text-sm text-secondary-500 mt-1">Manage swap requests and post products for barter.</p>
        </div>
        
        {activeTab === 'products' && (
          <button onClick={() => setShowAddProductModal(true)} className="premium-button-primary px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow">
            <Plus className="w-4 h-4" /> Post Trade Product
          </button>
        )}
      </div>

      <div className="flex border-b border-secondary-200 dark:border-secondary-800">
        <button
          onClick={() => setActiveTab('requests')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'requests' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200'}`}
        >
          Customer Trade Requests
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-6 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === 'products' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200'}`}
        >
          Tradeable Products
        </button>
      </div>

      {activeTab === 'requests' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
            ) : trades.length === 0 ? (
              <div className="p-8 border border-secondary-200 dark:border-secondary-800 rounded-xl text-center bg-white dark:bg-secondary-900 text-secondary-500 dark:text-secondary-400 font-semibold">
                No pending trade requests found.
              </div>
            ) : (
              <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-x-auto shadow-sm [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <table className="w-full min-w-[650px] text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase tracking-wider text-xxs">
                      <th className="p-4">Customer</th>
                      <th className="p-4">Target Item</th>
                      <th className="p-4">Swapping</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                    {paginatedTrades.map((t) => (
                      <tr key={t.id || t.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                        <td className="p-4 font-semibold text-secondary-900 dark:text-white">{t.user?.name || 'Customer'}</td>
                        <td className="p-4 text-secondary-700 dark:text-secondary-300">{t.product?.name}</td>
                        <td className="p-4 font-semibold text-secondary-900 dark:text-white">{t.items?.[0]?.item_name}</td>
                        <td className="p-4">
                          <span className={`text-xxs px-2.5 py-0.5 rounded-full font-bold uppercase ${t.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-450' : 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400'}`}>
                            {t.status?.value || t.status}
                          </span>
                        </td>
                        <td className="p-4 text-right flex justify-end gap-2">
                          <button onClick={() => handleOpenEvaluate(t)} className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-lg"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => handleReject(t.id || t.uuid)} className="p-1.5 text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950/20 rounded-lg"><X className="w-4 h-4" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <DotPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>

          <div>
            {selectedTrade ? (
              <aside className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 transition-colors shadow-sm">
                <h3 className="font-bold text-secondary-900 dark:text-white mb-4">Evaluate Swap Offer</h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xxs text-secondary-500 uppercase font-bold tracking-wider">Target Item Cash Value</span>
                    <span className="text-sm font-semibold text-secondary-900 dark:text-white">GHS {parseFloat(selectedTrade.product?.price || 0).toLocaleString()}</span>
                  </div>
                  <form onSubmit={handleValuateSubmit} className="space-y-4 pt-4 border-t border-secondary-100 dark:border-secondary-800">
                    <div>
                      <label className="block text-xs font-bold text-secondary-500 uppercase">Assessed Swap Value of Offered Items</label>
                      {selectedTrade.items?.map(item => (
                        <div key={item.id} className="mt-3 bg-secondary-50 dark:bg-secondary-850 p-3 rounded-lg border border-secondary-200 dark:border-secondary-800">
                          <span className="block font-bold text-xs text-secondary-900 dark:text-white">{item.item_name}</span>
                          <p className="text-xxs text-secondary-500 dark:text-secondary-400 mt-1">{item.description}</p>
                          <input
                            type="number"
                            placeholder="Assign GHS Value"
                            required
                            value={valuations[item.id] || ''}
                            onChange={(e) => handleValuationChange(item.id, e.target.value)}
                            className="w-full mt-3 p-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-secondary-500 uppercase">Total Agreed Offered Value (GHS)</label>
                      <input
                        type="number"
                        required
                        value={productValue}
                        onChange={(e) => setProductValue(e.target.value)}
                        className="w-full mt-1.5 p-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <button type="submit" disabled={processing} className="w-full premium-button-primary py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5">
                      {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Submit Valuation'}
                    </button>
                  </form>
                </div>
              </aside>
            ) : (
              <div className="bg-white dark:bg-secondary-900 border border-dashed border-secondary-200 dark:border-secondary-800 p-8 rounded-2xl text-center text-xs text-secondary-500 dark:text-secondary-400">
                Select a trade request to review details and perform valuation.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-4">
          {loadingProducts ? (
            <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
          ) : tradeProducts.length === 0 ? (
            <div className="p-12 border border-secondary-200 dark:border-secondary-800 rounded-xl text-center bg-white dark:bg-secondary-900 text-secondary-500 dark:text-secondary-400 font-semibold flex flex-col items-center">
              <Scale className="w-12 h-12 mb-3 text-secondary-300" />
              <p>No products are currently available for trade.</p>
              <button onClick={() => setShowAddProductModal(true)} className="mt-4 text-primary-600 font-bold hover:underline">Post the first one</button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {paginatedTradeProducts.map(p => (
                <div key={p.id || p.uuid} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl overflow-hidden shadow-sm flex flex-col">
                  <div className="h-48 bg-secondary-100 dark:bg-secondary-800 relative">
                    {p.primary_image ? (
                      <img src={p.primary_image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-secondary-300 absolute inset-0 m-auto" />
                    )}
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xxs font-bold px-2 py-1 rounded shadow-sm">BARTER</div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-secondary-900 dark:text-white line-clamp-1">{p.name}</h3>
                    <p className="text-primary-600 dark:text-primary-400 font-bold mt-1">GHS {parseFloat(p.price || 0).toLocaleString()}</p>
                    <div className="mt-auto pt-4 flex justify-end gap-1">
                      <button onClick={() => handleEditProduct(p)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg" title="Edit Trade Product">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id || p.uuid)} className="p-2 text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950/30 rounded-lg" title="Delete Trade Product">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                ))}
              </div>
              <DotPagination currentPage={prodPage} totalPages={totalProdPages} onPageChange={setProdPage} />
            </div>
          )}
        </div>
      )}

      {/* Post Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl w-full max-w-lg shadow-2xl relative">
            <button onClick={() => { setShowAddProductModal(false); resetForm(); }} className="absolute top-4 right-4 p-1 rounded-md hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-500"><X className="w-5 h-5" /></button>
            <div className="p-6">
              <h3 className="font-bold text-xl text-secondary-900 dark:text-white mb-1">{editingProductId ? 'Edit Tradeable Product' : 'Post Tradeable Product'}</h3>
              <p className="text-xs text-secondary-500 mb-6">{editingProductId ? 'Update product details and estimated value.' : 'Create a product listing that customers can propose a barter swap for.'}</p>
              
              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Product Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm focus:ring-2 focus:ring-primary-500" placeholder="e.g. Samsung Galaxy S23" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Estimated Value (GHS)</label>
                    <input type="number" required min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm focus:ring-2 focus:ring-primary-500" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Category</label>
                    <CategorySelector 
                      categories={categories}
                      value={categoryId}
                      onChange={setCategoryId}
                      required={true}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Product Description</label>
                  <textarea rows={3} required value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm focus:ring-2 focus:ring-primary-500" placeholder="Describe the item condition and what you're willing to trade for..." />
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
                    <p className="text-xs text-secondary-500 max-w-[200px]">Upload a clear photo of the product to attract trade offers.</p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
                </div>

                <button type="submit" disabled={processing} className="w-full premium-button-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4">
                  {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : (editingProductId ? 'Save Changes' : 'Publish Tradeable Product')}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default TradeRequests;
export { TradeRequests };
