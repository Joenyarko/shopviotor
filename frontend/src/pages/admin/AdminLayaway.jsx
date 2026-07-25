import React, { useState, useEffect, useRef } from 'react';
import layawayService from '../../services/layawayService';
import productService from '../../services/productService';
import Swal from 'sweetalert2';
import { Package, RefreshCw, LayoutDashboard, Users, CreditCard, Box, Settings, Search, CheckCircle, AlertTriangle, ArrowLeft, History, Eye, X, Filter, Calendar, RotateCcw, Plus, Edit, Trash2, Upload } from 'lucide-react';
import LayawayBoxTracker from '../../components/LayawayBoxTracker';
import { toast } from 'react-toastify';
import DotPagination from '../../components/DotPagination';

const AdminLayaway = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dashboard
  const [dashboard, setDashboard] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // Customers (Plans)
  const [customers, setCustomers] = useState([]);
  const [customersMeta, setCustomersMeta] = useState(null);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerPage, setCustomerPage] = useState(1);

  // Sales
  const [sales, setSales] = useState([]);
  const [salesMeta, setSalesMeta] = useState(null);
  const [loadingSales, setLoadingSales] = useState(false);
  const [salesPage, setSalesPage] = useState(1);
  const [salesSearch, setSalesSearch] = useState('');
  const [salesStartDate, setSalesStartDate] = useState('');
  const [salesEndDate, setSalesEndDate] = useState('');
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedCustomerHistory, setSelectedCustomerHistory] = useState(null);
  const [historyStartDate, setHistoryStartDate] = useState('');
  const [historyEndDate, setHistoryEndDate] = useState('');

  // Inventory
  const [inventory, setInventory] = useState([]);
  const [inventoryMeta, setInventoryMeta] = useState(null);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryPage, setInventoryPage] = useState(1);

  // Settings
  const [termsText, setTermsText] = useState('');
  const [savingTerms, setSavingTerms] = useState(false);
  const [loadingTerms, setLoadingTerms] = useState(false);

  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [selectedCustomerPlans, setSelectedCustomerPlans] = useState([]);

  // Add Customer Modal State
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [layawayProducts, setLayawayProducts] = useState([]);
  const [loadingLayawayProducts, setLoadingLayawayProducts] = useState(false);
  const [newCustFirstName, setNewCustFirstName] = useState('');
  const [newCustLastName, setNewCustLastName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustProductUuid, setNewCustProductUuid] = useState('');
  const [newCustInitialPayment, setNewCustInitialPayment] = useState('');
  const [newCustPaymentMethod, setNewCustPaymentMethod] = useState('cash');
  const [newCustNotes, setNewCustNotes] = useState('');
  const [creatingCustomerPlan, setCreatingCustomerPlan] = useState(false);

  // Layaway Product Form State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategoryId, setProdCategoryId] = useState('');
  const [prodDescription, setProdDescription] = useState('');
  const [prodLayawayBoxes, setProdLayawayBoxes] = useState('10');
  const [prodStock, setProdStock] = useState('10');
  const [prodImageFile, setProdImageFile] = useState(null);
  const [prodImagePreview, setProdImagePreview] = useState(null);
  const prodFileInputRef = useRef(null);
  const [savingProduct, setSavingProduct] = useState(false);

  // Detail View
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [selectedCardDetails, setSelectedCardDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (selectedCardId) return; // Don't load tabs if in detail view
    
    if (activeTab === 'dashboard') loadDashboard();
    if (activeTab === 'customers') loadCustomers();
    if (activeTab === 'sales') loadSales();
    if (activeTab === 'inventory') loadInventory();
    if (activeTab === 'settings') loadTerms();
  }, [activeTab, customerPage, salesPage, inventoryPage, selectedCardId]);

  useEffect(() => {
    productService.getCategories().then(r => setCategories(r.data?.data || r.data || [])).catch(console.error);
  }, []);

  // Loaders
  const loadDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const res = await layawayService.adminGetDashboard();
      setDashboard(res.data || res);
    } catch (e) { console.error(e); }
    finally { setLoadingDashboard(false); }
  };

  const loadCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const res = await layawayService.adminGetLayaways({ page: customerPage, search: customerSearch, per_page: 9 });
      setCustomers(res.data || []);
      setCustomersMeta(res.meta || null);
    } catch (e) { console.error(e); }
    finally { setLoadingCustomers(false); }
  };

  const loadSales = async () => {
    setLoadingSales(true);
    try {
      const params = { page: salesPage, per_page: 15 };
      if (salesSearch) params.search = salesSearch;
      if (salesStartDate) params.start_date = salesStartDate;
      if (salesEndDate) params.end_date = salesEndDate;
      const res = await layawayService.adminGetSales(params);
      setSales(res.data || []);
      setSalesMeta(res.meta || null);
    } catch (e) { console.error(e); }
    finally { setLoadingSales(false); }
  };

  const handleSalesSearch = (e) => {
    e.preventDefault();
    setSalesPage(1);
    loadSales();
  };

  const resetSalesFilters = () => {
    setSalesSearch('');
    setSalesStartDate('');
    setSalesEndDate('');
    setSalesPage(1);
    setLoadingSales(true);
    layawayService.adminGetSales({ page: 1, per_page: 15 })
      .then(res => {
        setSales(res.data || []);
        setSalesMeta(res.meta || null);
      })
      .catch(console.error)
      .finally(() => setLoadingSales(false));
  };

  const loadInventory = async () => {
    setLoadingInventory(true);
    try {
      const res = await layawayService.adminGetInventory({ page: inventoryPage, search: inventorySearch, per_page: 15 });
      setInventory(res.data || []);
      setInventoryMeta(res.meta || null);
    } catch (e) { console.error(e); }
    finally { setLoadingInventory(false); }
  };

  const loadTerms = async () => {
    setLoadingTerms(true);
    try {
      const res = await layawayService.adminGetTerms();
      setTermsText(res.data?.layaway_terms || '');
    } catch (e) { console.error(e); } 
    finally { setLoadingTerms(false); }
  };

  // Actions
  const handleCustomerSearch = (e) => {
    e.preventDefault();
    setCustomerPage(1);
    loadCustomers();
  };

  const handleInventorySearch = (e) => {
    e.preventDefault();
    setInventoryPage(1);
    loadInventory();
  };

  const saveTerms = async () => {
    setSavingTerms(true);
    try {
      await layawayService.adminSaveTerms({ layaway_terms: termsText });
      toast.success('Terms updated successfully');
    } catch (e) {
      toast.error('Failed to update terms');
    } finally { setSavingTerms(false); }
  };

  const openAddCustomerModal = async () => {
    setNewCustFirstName('');
    setNewCustLastName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustProductUuid('');
    setNewCustInitialPayment('');
    setNewCustPaymentMethod('cash');
    setNewCustNotes('');
    setShowAddCustomerModal(true);
    setLoadingLayawayProducts(true);
    try {
      const res = await layawayService.adminGetInventory({ status: 'layaway', per_page: 100 });
      const items = res.data || [];
      setLayawayProducts(items);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingLayawayProducts(false);
    }
  };

  const handleCreateCustomerPlan = async (e) => {
    e.preventDefault();
    if (!newCustProductUuid) {
      toast.error('Please select a product.');
      return;
    }
    setCreatingCustomerPlan(true);
    try {
      await layawayService.adminCreateLayaway({
        product_uuid: newCustProductUuid,
        first_name: newCustFirstName,
        last_name: newCustLastName,
        phone: newCustPhone,
        email: newCustEmail,
        initial_payment: newCustInitialPayment ? parseFloat(newCustInitialPayment) : 0,
        payment_method: newCustPaymentMethod,
        notes: newCustNotes,
      });
      toast.success('Customer layaway plan created successfully!');
      setShowAddCustomerModal(false);
      loadCustomers();
      loadDashboard();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create layaway plan.');
    } finally {
      setCreatingCustomerPlan(false);
    }
  };

  const handleProdImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProdImageFile(file);
    setProdImagePreview(URL.createObjectURL(file));
  };

  const resetProdForm = () => {
    setProdName(''); setProdPrice(''); setProdCategoryId(''); setProdDescription('');
    setProdLayawayBoxes('10'); setProdStock('10');
    setProdImageFile(null); setProdImagePreview(null);
    setEditingProductId(null);
  };

  const handleEditProduct = (p) => {
    setEditingProductId(p.id || p.uuid);
    setProdName(p.name || '');
    setProdPrice(p.price || '');
    setProdCategoryId(p.category_id || (p.category ? (p.category.id || p.category.uuid) : '') || '');
    setProdDescription(p.description || '');
    setProdLayawayBoxes(p.layaway_boxes || '10');
    setProdStock(p.stock_quantity || p.stock || '10');
    setProdImagePreview(p.primary_image || (p.images && p.images.length > 0 ? p.images[0].image_url : null));
    setProdImageFile(null);
    setShowAddProductModal(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!prodCategoryId) {
      toast.error('Please select a category.');
      return;
    }
    setSavingProduct(true);
    
    const formData = new FormData();
    formData.append('name', prodName);
    formData.append('price', prodPrice);
    formData.append('stock_quantity', prodStock || '10');
    formData.append('category_id', prodCategoryId);
    formData.append('condition', 'new');
    formData.append('status', 'active');
    formData.append('description', prodDescription || 'Layaway product');
    formData.append('is_layaway', '1');
    formData.append('available_for_layaway', '1');
    if (prodLayawayBoxes) formData.append('layaway_boxes', prodLayawayBoxes);
    if (prodImageFile) formData.append('images[0]', prodImageFile);

    try {
      if (editingProductId) {
        await productService.adminUpdateProduct(editingProductId, formData);
        toast.success('Layaway product updated successfully.');
      } else {
        await productService.adminCreateProduct(formData);
        toast.success('Layaway product created successfully.');
      }
      setShowAddProductModal(false);
      resetProdForm();
      loadInventory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save layaway product.');
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (uuid) => {
    const __confirmResult = await Swal.fire({ 
      title: 'Are you sure?', 
      text: 'Delete this layaway product?', 
      icon: 'warning', 
      showCancelButton: true,
      confirmButtonColor: '#eab308',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!__confirmResult.isConfirmed) return;
    try {
      await productService.adminDeleteProduct(uuid);
      toast.success('Product deleted successfully.');
      loadInventory();
    } catch (e) { 
      toast.error(e.response?.data?.message || e.message || 'Failed to delete product.'); 
    }
  };

  const toggleProductLayaway = async (uuid) => {
    try {
      await layawayService.adminToggleInventory(uuid);
      toast.success('Product updated');
      loadInventory();
    } catch (e) {
      toast.error('Failed to update product');
    }
  };

  const handleSelectLayaway = async (uuid) => {
    setSelectedCardId(uuid);
    setLoadingDetails(true);
    try {
      const res = await layawayService.adminGetLayaway(uuid);
      setSelectedCardDetails(res.data || res);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load card details');
      setSelectedCardId(null);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Detail View Render
  if (selectedCardId) {
    if (loadingDetails) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#111111]">
          <RefreshCw className="w-12 h-12 text-yellow-500 animate-spin" />
        </div>
      );
    }
    if (selectedCardDetails) {
      return (
        <LayawayBoxTracker 
          card={selectedCardDetails}
          isAdmin={true}
          onBack={() => setSelectedCardId(null)}
          onPaymentSuccess={() => {
            // Reload details to update boxes
            handleSelectLayaway(selectedCardId);
          }}
        />
      );
    }
  }

  // Sidebar Menu Items
  const handleSelectCustomer = (customer) => {
    if (!customer.layaways || customer.layaways.length === 0) return;
    if (customer.layaways.length === 1) {
      handleSelectLayaway(customer.layaways[0].uuid);
    } else {
      setSelectedCustomerPlans(customer.layaways);
      setCustomerModalOpen(true);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'inventory', label: 'Layaway Products', icon: <Box className="w-5 h-5" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-5 h-5" /> },
    { id: 'sales', label: 'Sales', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white text-gray-900">
      
      {/* Horizontal Navbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-900">Layaway Hub</h2>
          </div>
          
          <nav className="flex overflow-x-auto gap-2 pb-2 md:pb-0 hide-scrollbar">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'bg-yellow-500 text-white shadow' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
            {loadingDashboard ? (
              <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 text-yellow-500 animate-spin" /></div>
            ) : dashboard ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 text-sm font-bold tracking-wider">TOTAL REVENUE</h3>
                    <CreditCard className="text-yellow-500 w-6 h-6" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">GHS{dashboard.total_revenue?.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 text-sm font-bold tracking-wider">TOTAL CUSTOMERS</h3>
                    <Users className="text-blue-500 w-6 h-6" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{dashboard.total_customers}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 text-sm font-bold tracking-wider">IN PROGRESS</h3>
                    <RefreshCw className="text-orange-500 w-6 h-6" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{dashboard.active_plans}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-500 text-sm font-bold tracking-wider">COMPLETED</h3>
                    <CheckCircle className="text-green-500 w-6 h-6" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{dashboard.completed_plans}</p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-3xl font-bold text-yellow-600">Customer Management</h1>
              <div className="flex gap-3 w-full md:w-auto items-center">
                <form onSubmit={handleCustomerSearch} className="flex gap-2 flex-1 md:flex-initial">
                  <input 
                    type="text" 
                    value={customerSearch}
                    onChange={e => setCustomerSearch(e.target.value)}
                    placeholder="Search name, phone, or city..."
                    className="bg-white border border-gray-300 text-gray-900 px-4 py-2 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 w-full md:w-64"
                  />
                  <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                    <Search className="w-4 h-4" />
                  </button>
                </form>
                <button 
                  onClick={openAddCustomerModal}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors whitespace-nowrap shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Customer
                </button>
              </div>
            </div>

            {loadingCustomers ? (
              <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 text-yellow-500 animate-spin" /></div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customers.map(c => {
                    const latestLayaway = c.layaways && c.layaways.length > 0 ? c.layaways[0] : null;
                    const progress = latestLayaway && latestLayaway.total_boxes > 0 
                        ? ((latestLayaway.boxes_checked / latestLayaway.total_boxes) * 100).toFixed(2) 
                        : 0;
                        
                    return (
                      <div key={c.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
                        <div className="p-5 flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-gray-900 truncate">{c.customer_name}</h3>
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 border border-gray-200 text-xs font-bold rounded capitalize">
                              {c.total_layaways} Plan(s)
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-600 mb-6">
                            <p className="flex items-center gap-2">
                              <span className="text-yellow-500">📞</span> {c.customer_phone || 'N/A'}
                            </p>
                            <p className="flex items-center gap-2">
                              <span className="text-pink-500">📍</span> {c.customer_city || 'N/A'}
                            </p>
                            <p className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-blue-500" /> {c.total_layaways === 1 ? latestLayaway?.product_name : 'Multiple Products'}
                            </p>
                          </div>

                          {c.total_layaways === 1 && latestLayaway && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                              <div className="flex justify-between text-xs font-medium text-gray-600 mb-2">
                                <span>Progress: {latestLayaway.boxes_checked}/{latestLayaway.total_boxes} boxes</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-4">
                                <div 
                                  className="bg-gradient-to-r from-yellow-500 to-yellow-400 h-3 rounded-full" 
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-yellow-600">Paid: GHS{latestLayaway.amount_paid.toFixed(2)}</span>
                                <span className="text-gray-500">Bal: GHS{latestLayaway.amount_remaining.toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                          {c.total_layaways > 1 && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex justify-center items-center h-28">
                               <p className="text-gray-500 text-sm font-medium">Click to select plan</p>
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-200">
                          <button 
                            onClick={() => handleSelectCustomer(c)}
                            className="w-full py-2 bg-white hover:bg-yellow-500 hover:text-white text-gray-800 font-bold rounded-lg transition-colors border border-gray-300 hover:border-yellow-500 shadow-sm"
                          >
                            {c.total_layaways > 1 ? `View ${c.total_layaways} Plans` : 'View / Edit Plan'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Pagination */}
                <DotPagination
                  currentPage={customerPage}
                  totalPages={customersMeta?.last_page || 1}
                  onPageChange={setCustomerPage}
                />
              </>
            )}
          </div>
        )}

        {/* SALES TAB */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-3xl font-bold text-yellow-600">Sales & Payments</h1>
              <form onSubmit={handleSalesSearch} className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-60">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={salesSearch}
                    onChange={e => setSalesSearch(e.target.value)}
                    placeholder="Search customer, email or product..."
                    className="bg-white border border-gray-300 text-gray-900 pl-9 pr-4 py-2 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 text-sm w-full"
                  />
                </div>
                <div className="flex items-center gap-1 bg-white border border-gray-300 px-2 py-1.5 rounded-lg text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <input 
                    type="date" 
                    value={salesStartDate} 
                    onChange={e => setSalesStartDate(e.target.value)} 
                    className="bg-transparent text-gray-700 text-xs focus:outline-none" 
                    title="Start Date"
                  />
                  <span className="text-gray-400">-</span>
                  <input 
                    type="date" 
                    value={salesEndDate} 
                    onChange={e => setSalesEndDate(e.target.value)} 
                    className="bg-transparent text-gray-700 text-xs focus:outline-none" 
                    title="End Date"
                  />
                </div>
                <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors">
                  <Filter className="w-4 h-4" /> Filter
                </button>
                {(salesSearch || salesStartDate || salesEndDate) && (
                  <button type="button" onClick={resetSalesFilters} className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition-colors" title="Reset Filters">
                    <RotateCcw className="w-4 h-4" /> Reset
                  </button>
                )}
              </form>
            </div>
            
            {loadingSales ? (
              <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 text-yellow-500 animate-spin" /></div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase tracking-wider text-xs">
                      <tr>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Products</th>
                        <th className="p-4">Total Payments</th>
                        <th className="p-4">Total Boxes</th>
                        <th className="p-4">Total Paid</th>
                        <th className="p-4">Latest Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sales.length === 0 ? (
                        <tr><td colSpan="7" className="p-8 text-center text-gray-500">No payments found matching your filters.</td></tr>
                      ) : (
                        sales.map(s => (
                          <tr key={s.customer_uuid || s.uuid} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4">
                              <div className="font-bold text-gray-900">{s.customer_name}</div>
                              <div className="text-xs text-gray-500">{s.customer_email} • {s.customer_phone}</div>
                            </td>
                            <td className="p-4 font-medium text-gray-800 max-w-xs truncate" title={s.products_list}>{s.products_list}</td>
                            <td className="p-4 font-semibold text-gray-700">
                              <span className="bg-yellow-50 text-yellow-800 border border-yellow-200 px-2.5 py-1 rounded-full text-xs font-bold">
                                {s.payments_count} {s.payments_count === 1 ? 'payment' : 'payments'}
                              </span>
                            </td>
                            <td className="p-4 font-bold text-gray-700">{s.total_boxes} boxes</td>
                            <td className="p-4 font-extrabold text-yellow-600">GHS {s.total_amount.toFixed(2)}</td>
                            <td className="p-4 whitespace-nowrap text-gray-600">{s.latest_payment_date ? new Date(s.latest_payment_date).toLocaleDateString() : '—'}</td>
                            <td className="p-4 text-right">
                              <button 
                                onClick={() => {
                                  setSelectedCustomerHistory(s);
                                  setHistoryStartDate('');
                                  setHistoryEndDate('');
                                  setHistoryModalOpen(true);
                                }}
                                className="inline-flex items-center gap-1.5 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-sm"
                              >
                                <History className="w-3.5 h-3.5" /> View History
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <DotPagination
                  currentPage={salesPage}
                  totalPages={salesMeta?.last_page || 1}
                  onPageChange={setSalesPage}
                />
              </div>
            )}
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-3xl font-bold text-yellow-600">Layaway Products</h1>
              <div className="flex gap-3 w-full md:w-auto items-center">
                <form onSubmit={handleInventorySearch} className="flex gap-2 flex-1 md:flex-initial">
                  <input 
                    type="text" 
                    value={inventorySearch}
                    onChange={e => setInventorySearch(e.target.value)}
                    placeholder="Search products..."
                    className="bg-white border border-gray-300 text-gray-900 px-4 py-2 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 w-full md:w-64"
                  />
                  <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors">
                    <Search className="w-4 h-4" />
                  </button>
                </form>
                <button 
                  onClick={() => { resetProdForm(); setShowAddProductModal(true); }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors whitespace-nowrap shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
            </div>

            {loadingInventory ? (
              <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 text-yellow-500 animate-spin" /></div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase tracking-wider text-xs">
                      <tr>
                        <th className="p-4">Product Name</th>
                        <th className="p-4">Price (GHS)</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4 text-center">Layaway Eligible</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {inventory.length === 0 ? (
                        <tr><td colSpan="4" className="p-8 text-center text-gray-500">No products found.</td></tr>
                      ) : (
                        inventory.map(prod => (
                          <tr key={prod.uuid} className="hover:bg-gray-50">
                            <td className="p-4 font-bold text-gray-900">{prod.name}</td>
                            <td className="p-4 text-yellow-600">GHS{prod.price.toFixed(2)}</td>
                            <td className="p-4">{prod.stock}</td>
                            <td className="p-4 text-center">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer"
                                  checked={prod.is_layaway}
                                  onChange={() => toggleProductLayaway(prod.uuid)}
                                />
                                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                              </label>
                            </td>
                            <td className="p-4 text-right whitespace-nowrap">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditProduct(prod)}
                                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                  title="Edit Product"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(prod.uuid)}
                                  className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <DotPagination
                  currentPage={inventoryPage}
                  totalPages={inventoryMeta?.last_page || 1}
                  onPageChange={setInventoryPage}
                />
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-yellow-600 mb-8">Settings</h1>
            <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm max-w-4xl">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Layaway Terms & Conditions</h2>
              <p className="text-gray-600 text-sm mb-6">These terms will be displayed to customers when registering for a layaway plan.</p>
              
              {loadingTerms ? (
                <div className="flex justify-center py-12"><RefreshCw className="w-6 h-6 text-yellow-500 animate-spin" /></div>
              ) : (
                <div className="space-y-6">
                  <textarea 
                    value={termsText}
                    onChange={e => setTermsText(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 min-h-[300px]"
                    placeholder="Enter your global layaway terms and conditions here..."
                  />
                  <button 
                    onClick={saveTerms} 
                    disabled={savingTerms}
                    className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {savingTerms ? 'Saving...' : 'Save Terms'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* MULTIPLE PLANS MODAL */}
      {customerModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 relative">
            <button 
              onClick={() => setCustomerModalOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Layaway Plan</h2>
            <div className="space-y-4">
              {selectedCustomerPlans.map(plan => {
                 const progress = plan.total_boxes > 0 ? ((plan.boxes_checked / plan.total_boxes) * 100).toFixed(2) : 0;
                 return (
                  <div key={plan.uuid} className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-yellow-500 transition-colors bg-gray-50">
                    <div>
                      <h4 className="font-bold text-gray-900">{plan.product_name}</h4>
                      <p className="text-sm text-gray-500 capitalize">Status: {plan.status}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Paid: GHS{plan.amount_paid.toFixed(2)}</span>
                        <span className="text-xs font-bold text-gray-600 bg-gray-200 px-2 py-1 rounded">Bal: GHS{plan.amount_remaining.toFixed(2)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setCustomerModalOpen(false);
                        handleSelectLayaway(plan.uuid);
                      }}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors whitespace-nowrap w-full sm:w-auto"
                    >
                      View Tracker
                    </button>
                  </div>
                 );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT HISTORY MODAL */}
      {historyModalOpen && selectedCustomerHistory && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 relative max-h-[85vh] flex flex-col">
            <button 
              onClick={() => setHistoryModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="mb-4 border-b border-gray-100 pb-4 pr-10">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <History className="w-6 h-6 text-yellow-500" />
                Payment History — {selectedCustomerHistory.customer_name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {selectedCustomerHistory.customer_email} • {selectedCustomerHistory.customer_phone} | Total Paid: <span className="font-bold text-yellow-600">GHS {selectedCustomerHistory.total_amount.toFixed(2)}</span> ({selectedCustomerHistory.payments_count} payments)
              </p>
            </div>

            {/* Modal Date Filter */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Calendar className="w-4 h-4 text-yellow-600" />
                <span>Filter Payments by Date:</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 bg-white border border-gray-300 px-2.5 py-1 rounded-md text-xs">
                  <span className="text-gray-400">From:</span>
                  <input 
                    type="date" 
                    value={historyStartDate} 
                    onChange={e => setHistoryStartDate(e.target.value)} 
                    className="bg-transparent text-gray-700 focus:outline-none cursor-pointer" 
                  />
                </div>
                <div className="flex items-center gap-1 bg-white border border-gray-300 px-2.5 py-1 rounded-md text-xs">
                  <span className="text-gray-400">To:</span>
                  <input 
                    type="date" 
                    value={historyEndDate} 
                    onChange={e => setHistoryEndDate(e.target.value)} 
                    className="bg-transparent text-gray-700 focus:outline-none cursor-pointer" 
                  />
                </div>
                {(historyStartDate || historyEndDate) && (
                  <button 
                    onClick={() => { setHistoryStartDate(''); setHistoryEndDate(''); }} 
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-y-auto max-h-[420px] border border-gray-200 rounded-lg pr-1 bg-white shadow-inner">
              <table className="w-full text-left text-sm text-gray-700 border-collapse">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase tracking-wider text-xs sticky top-0 z-10">
                  <tr>
                    <th className="p-3">Date & Time</th>
                    <th className="p-3">Product</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Boxes</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Reference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(() => {
                    const filtered = selectedCustomerHistory.payments.filter(p => {
                      const pDate = new Date(p.created_at).toISOString().split('T')[0];
                      if (historyStartDate && pDate < historyStartDate) return false;
                      if (historyEndDate && pDate > historyEndDate) return false;
                      return true;
                    });
                    if (filtered.length === 0) {
                      return <tr><td colSpan="6" className="p-8 text-center text-gray-500 font-medium">No payments found in selected date range.</td></tr>;
                    }
                    return filtered.map((p, idx) => (
                      <tr key={p.uuid || idx} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 whitespace-nowrap text-gray-700 font-medium">{new Date(p.created_at).toLocaleString()}</td>
                        <td className="p-3 font-semibold text-gray-900">{p.product_name}</td>
                        <td className="p-3 font-bold text-yellow-600">GHS {p.amount.toFixed(2)}</td>
                        <td className="p-3"><span className="bg-gray-100 border border-gray-200 text-gray-700 px-2 py-0.5 rounded text-xs font-bold">{p.boxes_covered} boxes</span></td>
                        <td className="p-3 text-gray-700">{p.payment_method}</td>
                        <td className="p-3 text-xs text-gray-500 font-mono select-all">{p.reference}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD CUSTOMER MODAL */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => setShowAddCustomerModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Box className="w-5 h-5 text-yellow-500" /> Add Layaway Customer
            </h3>
            <p className="text-xs text-gray-500 mb-6">Personally register a customer and start their layaway plan. Ideal for physical cash deposits.</p>

            <form onSubmit={handleCreateCustomerPlan} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustFirstName}
                    onChange={e => setNewCustFirstName(e.target.value)}
                    placeholder="e.g. John"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={newCustLastName}
                    onChange={e => setNewCustLastName(e.target.value)}
                    placeholder="e.g. Doe"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newCustPhone}
                    onChange={e => setNewCustPhone(e.target.value)}
                    placeholder="e.g. 0241234567"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                  <input
                    type="email"
                    value={newCustEmail}
                    onChange={e => setNewCustEmail(e.target.value)}
                    placeholder="optional@example.com"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Select Layaway Product *</label>
                {loadingLayawayProducts ? (
                  <div className="p-3 border rounded-lg text-center text-gray-500 flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-yellow-500" /> Loading layaway products...
                  </div>
                ) : (
                  <select
                    required
                    value={newCustProductUuid}
                    onChange={e => setNewCustProductUuid(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-yellow-500 focus:outline-none bg-white"
                  >
                    <option value="">-- Select Product --</option>
                    {layawayProducts.map(p => (
                      <option key={p.uuid || p.id} value={p.uuid}>
                        {p.name} - GHS {parseFloat(p.price || 0).toFixed(2)}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="bg-yellow-50/80 border border-yellow-200 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-xs text-yellow-800 uppercase tracking-wider flex items-center gap-1.5">
                  Initial Cash / Deposit Payment (Optional)
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xxs font-bold text-gray-600 mb-1">Amount Given (GHS)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newCustInitialPayment}
                      onChange={e => setNewCustInitialPayment(e.target.value)}
                      placeholder="0.00"
                      className="w-full border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xxs font-bold text-gray-600 mb-1">Payment Method</label>
                    <select
                      value={newCustPaymentMethod}
                      onChange={e => setNewCustPaymentMethod(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                    >
                      <option value="cash">Physical Cash</option>
                      <option value="momo">Mobile Money</option>
                      <option value="card">Bank / Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xxs font-bold text-gray-600 mb-1">Payment Notes / Remarks</label>
                  <input
                    type="text"
                    value={newCustNotes}
                    onChange={e => setNewCustNotes(e.target.value)}
                    placeholder="e.g. Paid physical cash at shop counter"
                    className="w-full border border-gray-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCustomerPlan}
                  className="w-2/3 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  {creatingCustomerPlan ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Create Customer Plan & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-8">
            <button
              onClick={() => { setShowAddProductModal(false); resetProdForm(); }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Box className="w-5 h-5 text-yellow-500" /> {editingProductId ? 'Edit Layaway Product' : 'Add Layaway Product'}
            </h3>
            <p className="text-xs text-gray-500 mb-6">Create or modify products available for installment plans.</p>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product Name *</label>
                  <input
                    type="text"
                    required
                    value={prodName}
                    onChange={e => setProdName(e.target.value)}
                    placeholder="e.g. iPhone 15 Pro"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Price (GHS) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={prodPrice}
                    onChange={e => setProdPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Category *</label>
                  <select
                    required
                    value={prodCategoryId}
                    onChange={e => setProdCategoryId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-yellow-500 focus:outline-none bg-white"
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map(c => (
                      <option key={c.id || c.uuid} value={c.id || c.uuid}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Total Boxes / Steps *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={prodLayawayBoxes}
                    onChange={e => setProdLayawayBoxes(e.target.value)}
                    placeholder="10"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={prodStock}
                    onChange={e => setProdStock(e.target.value)}
                    placeholder="10"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Product Image</label>
                  <input
                    type="file"
                    ref={prodFileInputRef}
                    onChange={handleProdImageSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => prodFileInputRef.current?.click()}
                    className="w-full border border-dashed border-gray-300 hover:border-yellow-500 rounded-lg p-2 flex items-center justify-center gap-2 text-gray-600 hover:text-yellow-600 transition-colors bg-gray-50/50"
                  >
                    <Upload className="w-4 h-4" /> {prodImageFile ? 'Change Image' : 'Upload Image'}
                  </button>
                </div>
              </div>

              {prodImagePreview && (
                <div className="mt-2 relative w-20 h-20 rounded-lg border overflow-hidden">
                  <img src={prodImagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Description</label>
                <textarea
                  rows={3}
                  value={prodDescription}
                  onChange={e => setProdDescription(e.target.value)}
                  placeholder="Enter product details..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-yellow-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowAddProductModal(false); resetProdForm(); }}
                  className="w-1/3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProduct}
                  className="w-2/3 bg-yellow-500 hover:bg-yellow-600 text-white py-2.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-md"
                >
                  {savingProduct ? <RefreshCw className="w-5 h-5 animate-spin" /> : (editingProductId ? 'Update Layaway Product' : 'Create Layaway Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayaway;
