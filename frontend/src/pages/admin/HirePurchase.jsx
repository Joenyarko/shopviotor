import Swal from 'sweetalert2';
import React, { useEffect, useState, useRef } from 'react';
import hpService from '../../services/hpService';
import productService from '../../services/productService';
import { Briefcase, X, RefreshCw, Eye, Plus, Image as ImageIcon, Upload, Trash2, CheckCircle, Edit, Search } from 'lucide-react';
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

const AdminHirePurchase = () => {
  const [activeTab, setActiveTab] = useState('applications'); // 'applications' | 'products'
  
  // Applications State
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [processing, setProcessing] = useState(false);

  // Products State
  const [hpProducts, setHpProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [prodSearch, setProdSearch] = useState('');
  const [selectedProdCategory, setSelectedProdCategory] = useState('all');
  const [page, setPage] = useState(1);
  const [prodPage, setProdPage] = useState(1);
  const itemsPerPage = 8;
  
  const filteredApps = applications.filter(a => 
    (a.user?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (a.product?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );
  
  const filteredHpProducts = hpProducts.filter(p => {
    const matchesSearch = (p.name?.toLowerCase() || '').includes(prodSearch.toLowerCase());
    if (!matchesSearch) return false;
    if (!selectedProdCategory || selectedProdCategory === 'all') return true;

    const catNode = findCategoryInTree(selectedProdCategory, categories);
    const validIds = catNode ? getAllCategoryIds(catNode) : [String(selectedProdCategory)];
    const pCatId = String(p.category_id || p.category?.id || p.category?.uuid || '');
    return validIds.includes(pCatId);
  });

  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalProdPages = Math.ceil(filteredHpProducts.length / itemsPerPage);
  const paginatedHpProducts = filteredHpProducts.slice((prodPage - 1) * itemsPerPage, prodPage * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    setProdPage(1);
  }, [prodSearch, selectedProdCategory]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  
  // Product Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [hpInterestRate, setHpInterestRate] = useState('');
  const [hpMinDepositPercent, setHpMinDepositPercent] = useState('');
  const [hpMaxDurationMonths, setHpMaxDurationMonths] = useState('');
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
      const items = Array.isArray(res) 
        ? res 
        : (Array.isArray(res?.data) 
            ? res.data 
            : (Array.isArray(res?.data?.data) 
                ? res.data.data 
                : (Array.isArray(res?.data?.data?.data) ? res.data.data.data : [])));
      setHpProducts(items);
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
    const __confirmResult = await Swal.fire({ title: 'Are you sure?', text: `Are you sure you want to mark this application as ${status}?`, icon: 'warning', showCancelButton: true });
    if (!__confirmResult.isConfirmed) return;
    setProcessing(true);
    try {
      await hpService.adminUpdateStatus(uuid, status);
      Swal.fire({ text: String('Status updated successfully.') });
      setSelectedApp(null);
      loadApplications();
    } catch (err) {
      Swal.fire({ text: String(err.message || 'Failed to update status.') });
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
    setHpInterestRate(''); setHpMinDepositPercent(''); setHpMaxDurationMonths('');
    setImageFile(null); setImagePreview(null);
    setEditingProductId(null);
  };

  const handleEditProduct = (p) => {
    setEditingProductId(p.id || p.uuid);
    setName(p.name || '');
    setPrice(p.price || '');
    setCategoryId(p.category_id || (p.category ? (p.category.id || p.category.uuid) : '') || '');
    setDescription(p.description || '');
    setHpInterestRate(p.hp_interest_rate || '');
    setHpMinDepositPercent(p.hp_min_deposit_percent || '');
    setHpMaxDurationMonths(p.hp_max_duration_months || '');
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
    formData.append('stock_quantity', '5'); // Default to 5 for HP items
    formData.append('category_id', categoryId);
    formData.append('condition', 'new');
    formData.append('status', 'active');
    formData.append('description', description);
    formData.append('available_for_hire_purchase', '1');
    if (hpInterestRate) formData.append('hp_interest_rate', hpInterestRate);
    if (hpMinDepositPercent) formData.append('hp_min_deposit_percent', hpMinDepositPercent);
    if (hpMaxDurationMonths) formData.append('hp_max_duration_months', hpMaxDurationMonths);
    if (imageFile) formData.append('images[0]', imageFile);

    try {
      if (editingProductId) {
        await productService.adminUpdateProduct(editingProductId, formData);
        Swal.fire({ text: 'HP product updated successfully.' });
      } else {
        await productService.adminCreateProduct(formData);
        Swal.fire({ text: 'HP product created successfully.' });
      }
      setShowAddProductModal(false);
      resetForm();
      loadHpProducts();
    } catch (err) {
      Swal.fire({ text: String(err.response?.data?.message || 'Failed to save product.') });
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteProduct = async (uuid) => {
    const __confirmResult = await Swal.fire({ title: 'Are you sure?', text: 'Delete this HP product?', icon: 'warning', showCancelButton: true });
    if (!__confirmResult.isConfirmed) return;
    try {
      await productService.adminDeleteProduct(uuid);
      loadHpProducts();
    } catch (e) { Swal.fire({ text: String(e.message || 'Failed to delete.') }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-primary-500" /> Hire Purchase Management
          </h2>
          <p className="text-sm text-secondary-500 mt-1">Review applications, track installments, and manage eligible products.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto items-stretch sm:items-center">
          {activeTab === 'applications' ? (
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-secondary-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white placeholder-secondary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors shadow-sm"
                placeholder="Search applications..."
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
                  placeholder="Search HP products..."
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                />
              </div>
            </>
          )}
          <button onClick={() => {
            setEditingProductId(null);
            setName(''); setPrice(''); setCategoryId(''); setDescription('');
            setHpInterestRate(''); setHpMinDepositPercent(''); setHpMaxDurationMonths('');
            setImageFile(null); setImagePreview(null);
            setShowAddProductModal(true);
          }} className="premium-button-primary px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 shadow-sm whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add HP Product
          </button>
        </div>
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
              <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-x-auto shadow-sm">
                <table className="w-full min-w-[650px] text-left border-collapse text-sm">
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
                    {paginatedApps.map((app) => (
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
                <DotPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>

          <div>
            {selectedApp ? (
              <aside className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 transition-colors shadow-sm">
                <h3 className="font-bold text-secondary-900 dark:text-white mb-4">Application Details</h3>
                <div className="space-y-4">
                  <div>
                    <span className="block text-xxs text-secondary-500 uppercase font-bold tracking-wider">Customer</span>
                    <span className="text-sm font-semibold text-secondary-900 dark:text-white">{selectedApp.user?.name}</span>
                    <span className="block text-xs text-secondary-500">{selectedApp.user?.email} • {selectedApp.user?.phone || 'No phone'}</span>
                  </div>

                  {/* Verification & KYC Snapshot */}
                  <div className="p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/60 border border-secondary-200/60 dark:border-secondary-700/60 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xxs font-bold uppercase tracking-wider text-secondary-400">KYC Profile</span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        selectedApp.applicant_type === 'general' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                      }`}>
                        {selectedApp.applicant_type === 'general' ? 'Ghana Card' : 'Student'}
                      </span>
                    </div>

                    {selectedApp.applicant_type === 'general' ? (
                      <div className="space-y-1.5 text-xs text-secondary-700 dark:text-secondary-300">
                        <div><strong>Card PIN:</strong> <span className="font-mono">{selectedApp.ghana_card_number || selectedApp.user?.ghana_card_number || 'N/A'}</span></div>
                        <div><strong>GPS Address:</strong> {selectedApp.digital_address || selectedApp.user?.digital_address || 'N/A'}</div>
                        <div><strong>Occupation:</strong> {selectedApp.user?.occupation || 'N/A'} {selectedApp.user?.employer_name ? `(${selectedApp.user.employer_name})` : ''}</div>
                        {selectedApp.user?.monthly_income && <div><strong>Monthly Income:</strong> GHS {parseFloat(selectedApp.user.monthly_income).toLocaleString()}</div>}
                        <div><strong>Next of Kin:</strong> {selectedApp.user?.next_of_kin_name || 'N/A'} ({selectedApp.user?.next_of_kin_phone || 'N/A'})</div>

                        <div className="flex flex-wrap gap-2 pt-1 border-t border-secondary-200/50 dark:border-secondary-700/50">
                          {selectedApp.user?.ghana_card_front_url && (
                            <a href={selectedApp.user.ghana_card_front_url} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-primary-600 hover:underline">View Ghana Card Front</a>
                          )}
                          {selectedApp.user?.ghana_card_back_url && (
                            <a href={selectedApp.user.ghana_card_back_url} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-primary-600 hover:underline">View Back</a>
                          )}
                          {selectedApp.user?.selfie_url && (
                            <a href={selectedApp.user.selfie_url} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-emerald-600 hover:underline">View Live Selfie</a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-xs text-secondary-700 dark:text-secondary-300">
                        <div><strong>Student ID:</strong> <span className="font-mono">{selectedApp.user?.student_id || 'N/A'}</span></div>
                        <div><strong>Course & Level:</strong> {selectedApp.user?.student_course || 'N/A'} ({selectedApp.user?.student_level || 'N/A'})</div>
                        {selectedApp.user?.student_id_picture_url && (
                          <div className="pt-1">
                            <a href={selectedApp.user.student_id_picture_url} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-primary-600 hover:underline">View Student ID Card</a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

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
          ) : filteredHpProducts.length === 0 ? (
            <div className="p-12 border border-secondary-200 dark:border-secondary-800 rounded-xl text-center bg-white dark:bg-secondary-900 text-secondary-500 dark:text-secondary-400 font-semibold">
              No hire purchase products match your filter criteria.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {paginatedHpProducts.map(p => (
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
                    <div className="mt-auto pt-4 flex justify-end gap-1">
                      <button onClick={() => handleEditProduct(p)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg" title="Edit HP Product">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id || p.uuid)} className="p-2 text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950/30 rounded-lg" title="Delete HP Product">
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
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl w-full max-w-lg shadow-2xl relative mt-20">
            <button onClick={() => { setShowAddProductModal(false); resetForm(); }} className="absolute top-4 right-4 p-1 rounded-md hover:bg-secondary-100 dark:hover:bg-secondary-800 text-secondary-500"><X className="w-5 h-5" /></button>
            <div className="p-6">
              <h3 className="font-bold text-xl text-secondary-900 dark:text-white mb-1">{editingProductId ? 'Edit Hire Purchase Product' : 'Post Hire Purchase Product'}</h3>
              <p className="text-xs text-secondary-500 mb-6">{editingProductId ? 'Update product installment terms and details.' : 'Create a product listing that customers can apply to pay for in installments.'}</p>
              
              <form onSubmit={handleSaveProduct} className="space-y-4">
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
                    <CategorySelector 
                      categories={categories}
                      value={categoryId}
                      onChange={setCategoryId}
                      required={true}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5" title="e.g. 5 for 5%">Interest Rate (%)</label>
                      <input type="number" min="0" step="0.01" value={hpInterestRate} onChange={e => setHpInterestRate(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm focus:ring-2 focus:ring-primary-500" placeholder="e.g. 5.0" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5" title="Minimum deposit percentage">Min Deposit (%)</label>
                      <input type="number" min="0" step="0.01" value={hpMinDepositPercent} onChange={e => setHpMinDepositPercent(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm focus:ring-2 focus:ring-primary-500" placeholder="e.g. 20.0" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5" title="Maximum duration allowed">Max Duration (Mos)</label>
                      <input type="number" min="1" step="1" value={hpMaxDurationMonths} onChange={e => setHpMaxDurationMonths(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm focus:ring-2 focus:ring-primary-500" placeholder="e.g. 12" />
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
                  {processing ? <RefreshCw className="w-5 h-5 animate-spin" /> : (editingProductId ? 'Save Changes' : 'Publish HP Product')}
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
