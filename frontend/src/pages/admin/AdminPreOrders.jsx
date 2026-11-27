import Swal from 'sweetalert2';
import React, { useState, useEffect, useRef } from 'react';
import preorderService from '../../services/preorderService';
import productService from '../../services/productService';
import { Package, RefreshCw, Check, X, Eye, Plus, Upload, Box, ListOrdered, Search } from 'lucide-react';
import DotPagination from '../../components/DotPagination';
import CategorySelector from '../../components/CategorySelector';

const flattenCategories = (cats, level = 0) => {
  let result = [];
  (cats || []).forEach(c => {
    result.push({ ...c, level });
    if (c.children && c.children.length > 0) {
      result = result.concat(flattenCategories(c.children, level + 1));
    }
  });
  return result;
};

const findCategoryInTree = (catId, cats) => {
  for (const c of (cats || [])) {
    if (String(c.id) === String(catId) || String(c.uuid) === String(catId)) return c;
    if (c.children?.length) {
      const found = findCategoryInTree(catId, c.children);
      if (found) return found;
    }
  }
  return null;
};

const getAllCategoryIds = (cat) => {
  if (!cat) return [];
  let ids = [String(cat.id), String(cat.uuid)].filter(Boolean);
  if (cat.children && cat.children.length > 0) {
    cat.children.forEach(child => {
      ids = ids.concat(getAllCategoryIds(child));
    });
  }
  return ids;
};

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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [prodSearch, setProdSearch] = useState('');
  const [selectedProdCategory, setSelectedProdCategory] = useState('all');
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
  
  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.name?.toLowerCase() || '').includes(prodSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (!selectedProdCategory || selectedProdCategory === 'all') return true;

    const catNode = findCategoryInTree(selectedProdCategory, categories);
    const validIds = catNode ? getAllCategoryIds(catNode) : [String(selectedProdCategory)];
    const pCatId = String(p.category_id || p.category?.id || p.category?.uuid || '');
    return validIds.includes(pCatId);
  });

  const totalPages = Math.ceil(filteredPreOrders.length / itemsPerPage);
  const paginatedPreOrders = filteredPreOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalProdPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((prodPage - 1) * itemsPerPage, prodPage * itemsPerPage);
  
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    setProdPage(1);
  }, [prodSearch, selectedProdCategory]);
  
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

  const handleConfirmDeposit = async (order) => {
    const { value: txId } = await Swal.fire({
      title: 'Confirm Pre-Order MoMo Deposit',
      html: `
        <div style="text-align: left; font-size: 13px; margin-bottom: 12px; line-height: 1.6;">
          <p><strong>Customer:</strong> ${order.customer_details?.name || order.user?.name || 'Customer'}</p>
          <p><strong>Product:</strong> ${order.product?.name}</p>
          <p><strong>Total Price:</strong> GHS ${parseFloat(order.total_price || 0).toFixed(2)}</p>
        </div>
      `,
      input: 'text',
      inputLabel: 'MoMo Transaction ID / Reference (from SMS to Merchant ID 715041)',
      inputPlaceholder: 'e.g. 1928374650 or MoMo SMS ref',
      showCancelButton: true,
      confirmButtonText: 'Confirm Deposit & Mark Processing',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
    });

    if (txId === undefined) return;

    setProcessing(true);
    try {
      await preorderService.adminConfirmDeposit(order.uuid, { transaction_id: txId.trim() || undefined });
      Swal.fire({
        title: 'Deposit Confirmed!',
        text: 'Pre-order deposit marked as paid and added to revenue.',
        icon: 'success',
      });
      loadPreOrders();
    } catch (e) {
      Swal.fire({ text: e.response?.data?.message || 'Failed to confirm deposit.', icon: 'error' });
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
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
          {mainTab === 'orders' ? (
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-secondary-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white placeholder-secondary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                placeholder="Search pre-orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          ) : (
            <>
              <select
                value={selectedProdCategory}
                onChange={(e) => setSelectedProdCategory(e.target.value)}
                className="border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
              >
                <option value="all">All Categories</option>
                {flattenCategories(categories).map(c => (
                  <option key={c.id || c.uuid} value={c.id || c.uuid}>
                    {c.level > 0 ? '\u00A0\u00A0'.repeat(c.level) + '↳ ' : ''}{c.name}
                  </option>
                ))}
              </select>
              <div className="relative w-full sm:w-60">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-secondary-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-9 pr-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white placeholder-secondary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                  placeholder="Search pre-order products..."
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                />
              </div>
            </>
          )}
          <button onClick={() => setModalOpen(true)} className="premium-button-primary px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
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
                          <div className="flex items-center gap-3">
                            {(order.product?.primary_image || order.product?.images?.[0]?.url || order.product?.images?.[0]?.path) ? (
                              <img
                                src={order.product?.primary_image || order.product?.images?.[0]?.url || order.product?.images?.[0]?.path}
                                alt={order.product?.name}
                                className="w-10 h-10 rounded-lg object-cover bg-secondary-100 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 shrink-0"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center shrink-0">
                                <Package className="w-4 h-4 text-secondary-400" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="font-medium text-secondary-900 dark:text-white max-w-[200px] truncate" title={order.product?.name}>
                                {order.product?.name}
                              </div>
                              <div className="text-xs text-secondary-500">
                                Qty: {order.quantity || 1} {order.product?.sku ? `• ${order.product.sku}` : ''}
                              </div>
                            </div>
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
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="p-1.5 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 hover:bg-primary-100 rounded-lg transition-colors"
                              title="Inspect Pre-Order Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {order.status === 'pending' && parseFloat(order.deposit_paid || 0) <= 0 && (
                              <button
                                disabled={processing}
                                onClick={() => handleConfirmDeposit(order)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 active:scale-95 transition-all"
                                title="Confirm MoMo Deposit"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Confirm MoMo</span>
                              </button>
                            )}
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
                          </div>
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
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 border border-secondary-200 dark:border-secondary-800 rounded-xl text-center bg-white dark:bg-secondary-900 text-secondary-500">
            No pre-order products match your filter criteria.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedProducts.map(p => {
                const imgSrc = p.primary_image || p.images?.[0]?.url || p.images?.[0]?.image_url || p.images?.[0]?.path || null;
                const depositLabel = p.preorder_deposit_percent
                  ? `${p.preorder_deposit_percent}% Deposit`
                  : p.preorder_deposit_amount
                    ? `GHS ${parseFloat(p.preorder_deposit_amount).toFixed(0)} Deposit`
                    : 'Pre-Order';

                return (
                <div key={p.id} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  <div className="aspect-square bg-secondary-100 dark:bg-secondary-800 p-4 flex items-center justify-center">
                    {imgSrc ? (
                      <img src={imgSrc} alt={p.name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                    ) : <Package className="w-12 h-12 text-secondary-300" />}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-secondary-900 dark:text-white line-clamp-1">{p.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-bold text-primary-600 dark:text-primary-400">GHS {parseFloat(p.price).toFixed(2)}</span>
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">{depositLabel}</span>
                    </div>
                    <div className="mt-4 pt-3 border-t border-secondary-100 dark:border-secondary-800 flex justify-between text-xs text-secondary-500">
                      <span>Exp: {p.preorder_expected_date ? new Date(p.preorder_expected_date).toLocaleDateString() : 'TBD'}</span>
                      <span>Rel: {p.preorder_release_date ? new Date(p.preorder_release_date).toLocaleDateString() : 'TBD'}</span>
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
            <DotPagination currentPage={prodPage} totalPages={totalProdPages} onPageChange={setProdPage} />
          </div>
        )
      )}

      {/* PRE-ORDER DETAILS MODAL */}
      {selectedOrder && (() => {
        const prodImg = selectedOrder.product?.primary_image || selectedOrder.product?.images?.[0]?.url || selectedOrder.product?.images?.[0]?.path || null;
        const custName = selectedOrder.customer_details?.name || selectedOrder.user?.name || `${selectedOrder.user?.first_name || ''} ${selectedOrder.user?.last_name || ''}`.trim() || 'Customer';
        const custPhone = selectedOrder.customer_details?.phone || selectedOrder.user?.phone || 'N/A';
        const custEmail = selectedOrder.customer_details?.email || selectedOrder.user?.email || 'N/A';
        const custAddress = selectedOrder.customer_details?.address || selectedOrder.customer_details?.location || selectedOrder.shipping_address || null;
        const total = parseFloat(selectedOrder.total_price || 0);
        const depositPaid = parseFloat(selectedOrder.deposit_paid || 0);
        const balance = selectedOrder.balance_remaining !== undefined && selectedOrder.balance_remaining !== null
          ? parseFloat(selectedOrder.balance_remaining)
          : Math.max(0, total - depositPaid);

        return (
          <div onClick={() => setSelectedOrder(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm overflow-y-auto">
            <div onClick={e => e.stopPropagation()} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
              <div className="p-5 border-b border-secondary-200 dark:border-secondary-800 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-secondary-900 dark:text-white text-lg">Pre-Order Details</h3>
                  <p className="text-xs text-secondary-500 font-mono">
                    Ref: {selectedOrder.payment_reference || ('PRE-' + (selectedOrder.uuid || '').slice(0, 8).toUpperCase())} &bull; {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : ''}
                  </p>
                </div>
                <button type="button" onClick={() => setSelectedOrder(null)} className="p-1.5 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
                {/* Product Card */}
                <div className="flex gap-4 p-4 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-200/70 dark:border-secondary-700/70">
                  <div className="w-20 h-20 rounded-xl bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-700 flex items-center justify-center overflow-hidden shrink-0">
                    {prodImg ? (
                      <img src={prodImg} alt={selectedOrder.product?.name} className="w-full h-full object-contain p-1" />
                    ) : (
                      <Package className="w-8 h-8 text-secondary-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-extrabold text-sm text-secondary-900 dark:text-white">{selectedOrder.product?.name || 'Product'}</h4>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${statusBadge(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    <p className="text-xs text-secondary-500">
                      Unit Price: <strong className="text-secondary-800 dark:text-secondary-200">GHS {parseFloat(selectedOrder.product?.price || total).toFixed(2)}</strong>
                      {' '}&bull; Qty: <strong className="text-secondary-800 dark:text-secondary-200">{selectedOrder.quantity || 1}</strong>
                    </p>
                    {selectedOrder.product?.category?.name && (
                      <p className="text-[11px] text-secondary-500">Category: {selectedOrder.product.category.name}</p>
                    )}
                    {selectedOrder.product?.short_description && (
                      <p className="text-xs text-secondary-600 dark:text-secondary-400 line-clamp-2 pt-1">{selectedOrder.product.short_description}</p>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/40 border border-secondary-200/60 dark:border-secondary-800">
                    <span className="text-[10px] uppercase font-bold text-secondary-400 block">Total Price</span>
                    <span className="text-sm font-black text-secondary-900 dark:text-white">GHS {total.toFixed(2)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                    <span className="text-[10px] uppercase font-bold text-emerald-600 block">Deposit Paid</span>
                    <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">GHS {depositPaid.toFixed(2)}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                    <span className="text-[10px] uppercase font-bold text-amber-600 block">Balance Left</span>
                    <span className="text-sm font-black text-amber-700 dark:text-amber-400">GHS {balance.toFixed(2)}</span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="p-4 rounded-xl border border-secondary-200 dark:border-secondary-800 space-y-1.5 text-xs">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-secondary-400 block mb-1">Customer & Delivery Details</span>
                  <div><strong className="text-secondary-700 dark:text-secondary-300">Name:</strong> {custName}</div>
                  <div><strong className="text-secondary-700 dark:text-secondary-300">Phone:</strong> {custPhone}</div>
                  <div><strong className="text-secondary-700 dark:text-secondary-300">Email:</strong> {custEmail}</div>
                  {custAddress && <div><strong className="text-secondary-700 dark:text-secondary-300">Address:</strong> {custAddress}</div>}
                  <div><strong className="text-secondary-700 dark:text-secondary-300">Expected Arrival:</strong> {selectedOrder.expected_date ? new Date(selectedOrder.expected_date).toLocaleDateString() : 'TBD'}</div>
                  {selectedOrder.notes && (
                    <div className="pt-1 border-t border-secondary-100 dark:border-secondary-800">
                      <strong className="text-secondary-700 dark:text-secondary-300">Notes:</strong> {selectedOrder.notes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-secondary-100 dark:border-secondary-800">
                  <button type="button" onClick={() => setSelectedOrder(null)} className="px-4 py-2 rounded-xl text-xs font-bold border border-secondary-300 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800">
                    Close
                  </button>
                  {selectedOrder.status === 'pending' && depositPaid <= 0 && (
                    <button
                      type="button"
                      disabled={processing}
                      onClick={() => {
                        const target = selectedOrder;
                        setSelectedOrder(null);
                        handleConfirmDeposit(target);
                      }}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" /> Confirm MoMo Deposit
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
