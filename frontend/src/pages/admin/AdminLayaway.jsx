import React, { useState, useEffect } from 'react';
import layawayService from '../../services/layawayService';
import { Package, RefreshCw, LayoutDashboard, Users, CreditCard, Box, Settings, Search, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import LayawayBoxTracker from '../../components/LayawayBoxTracker';
import { toast } from 'react-toastify';

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

  // Loaders
  const loadDashboard = async () => {
    setLoadingDashboard(true);
    try {
      const res = await layawayService.adminGetDashboard();
      setDashboard(res.data?.data || res.data);
    } catch (e) { console.error(e); }
    finally { setLoadingDashboard(false); }
  };

  const loadCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const res = await layawayService.adminGetLayaways({ page: customerPage, search: customerSearch, per_page: 9 });
      setCustomers(res.data?.data || []);
      setCustomersMeta(res.data?.meta || null);
    } catch (e) { console.error(e); }
    finally { setLoadingCustomers(false); }
  };

  const loadSales = async () => {
    setLoadingSales(true);
    try {
      const res = await layawayService.adminGetSales({ page: salesPage, per_page: 15 });
      setSales(res.data?.data || []);
      setSalesMeta(res.data?.meta || null);
    } catch (e) { console.error(e); }
    finally { setLoadingSales(false); }
  };

  const loadInventory = async () => {
    setLoadingInventory(true);
    try {
      const res = await layawayService.adminGetInventory({ page: inventoryPage, search: inventorySearch, per_page: 15 });
      setInventory(res.data?.data || []);
      setInventoryMeta(res.data?.meta || null);
    } catch (e) { console.error(e); }
    finally { setLoadingInventory(false); }
  };

  const loadTerms = async () => {
    setLoadingTerms(true);
    try {
      const res = await layawayService.adminGetTerms();
      setTermsText(res.data?.data?.layaway_terms || '');
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
      setSelectedCardDetails(res.data?.data || res.data);
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
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'customers', label: 'Customers', icon: <Users className="w-5 h-5" /> },
    { id: 'sales', label: 'Sales', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'inventory', label: 'Inventory', icon: <Box className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#111111] text-gray-200">
      
      {/* Sidebar */}
      <div className="w-64 bg-[#1a1a1a] border-r border-gray-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
            <Package className="w-6 h-6" /> Layaway Hub
          </h2>
          <p className="text-xs text-gray-400 mt-1">Contribution Manager</p>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <p className="px-6 text-xs font-bold text-gray-500 mb-4 tracking-wider">OVERVIEW</p>
          <nav className="space-y-1 px-3">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' 
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Nav (Fallback) */}
      <div className="md:hidden flex overflow-x-auto bg-[#1a1a1a] border-b border-gray-800 w-full fixed top-0 z-10 pt-16">
         {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === item.id ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-400'
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 mt-12 md:mt-0">
        
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>
            {loadingDashboard ? (
              <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 text-yellow-500 animate-spin" /></div>
            ) : dashboard ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 text-sm font-bold tracking-wider">TOTAL REVENUE</h3>
                    <CreditCard className="text-yellow-500 w-6 h-6" />
                  </div>
                  <p className="text-3xl font-bold text-white">GHS{dashboard.total_revenue?.toFixed(2)}</p>
                </div>
                <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 text-sm font-bold tracking-wider">TOTAL CUSTOMERS</h3>
                    <Users className="text-blue-400 w-6 h-6" />
                  </div>
                  <p className="text-3xl font-bold text-white">{dashboard.total_customers}</p>
                </div>
                <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 text-sm font-bold tracking-wider">IN PROGRESS</h3>
                    <RefreshCw className="text-orange-400 w-6 h-6" />
                  </div>
                  <p className="text-3xl font-bold text-white">{dashboard.active_plans}</p>
                </div>
                <div className="bg-[#1a1a1a] p-6 rounded-xl border border-gray-800 shadow-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-400 text-sm font-bold tracking-wider">COMPLETED</h3>
                    <CheckCircle className="text-green-500 w-6 h-6" />
                  </div>
                  <p className="text-3xl font-bold text-white">{dashboard.completed_plans}</p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === 'customers' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-3xl font-bold text-yellow-500">Customer Management</h1>
              <form onSubmit={handleCustomerSearch} className="flex gap-2 w-full md:w-auto">
                <input 
                  type="text" 
                  value={customerSearch}
                  onChange={e => setCustomerSearch(e.target.value)}
                  placeholder="Search name, phone, or city..."
                  className="bg-[#1a1a1a] border border-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-yellow-500 w-full md:w-64"
                />
                <button type="submit" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {loadingCustomers ? (
              <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 text-yellow-500 animate-spin" /></div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {customers.map(c => {
                    const progress = c.total_boxes > 0 ? ((c.boxes_checked / c.total_boxes) * 100).toFixed(2) : 0;
                    return (
                      <div key={c.uuid} className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden shadow-lg flex flex-col">
                        <div className="p-5 flex-1">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-white truncate">{c.customer_name}</h3>
                            <span className="px-2 py-1 bg-gray-800 text-gray-300 text-xs font-bold rounded">
                              {c.status}
                            </span>
                          </div>
                          
                          <div className="space-y-2 text-sm text-gray-400 mb-6">
                            <p className="flex items-center gap-2">
                              <span className="text-yellow-500">??</span> {c.customer_phone || 'N/A'}
                            </p>
                            <p className="flex items-center gap-2">
                              <span className="text-pink-500">??</span> {c.customer_city || 'N/A'}
                            </p>
                            <p className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-blue-400" /> {c.product_name}
                            </p>
                          </div>

                          <div className="bg-[#262626] rounded-lg p-4 border border-gray-800">
                            <div className="flex justify-between text-xs font-medium text-gray-300 mb-2">
                              <span>Progress: {c.boxes_checked}/{c.total_boxes} boxes</span>
                              <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden mb-4">
                              <div 
                                className="bg-gradient-to-r from-yellow-600 to-yellow-400 h-3 rounded-full" 
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-yellow-500">Paid: GHS{c.amount_paid.toFixed(2)}</span>
                              <span className="text-gray-400">Bal: GHS{c.amount_remaining.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-[#151515] border-t border-gray-800">
                          <button 
                            onClick={() => handleSelectLayaway(c.uuid)}
                            className="w-full py-2 bg-[#262626] hover:bg-yellow-500 hover:text-black text-white font-bold rounded-lg transition-colors border border-gray-700 hover:border-yellow-500"
                          >
                            View / Edit
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Pagination */}
                {customersMeta && customersMeta.last_page > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                     <button 
                        disabled={customerPage === 1}
                        onClick={() => setCustomerPage(1)}
                        className="px-3 py-1 bg-[#1a1a1a] text-gray-400 rounded disabled:opacity-50"
                     >First</button>
                     <button 
                        disabled={customerPage === 1}
                        onClick={() => setCustomerPage(prev => prev - 1)}
                        className="px-3 py-1 bg-[#1a1a1a] text-gray-400 rounded disabled:opacity-50"
                     >Previous</button>
                     <span className="text-sm text-gray-400 px-4">Page {customerPage} of {customersMeta.last_page}</span>
                     <button 
                        disabled={customerPage === customersMeta.last_page}
                        onClick={() => setCustomerPage(prev => prev + 1)}
                        className="px-3 py-1 bg-[#1a1a1a] text-gray-400 rounded disabled:opacity-50"
                     >Next</button>
                     <button 
                        disabled={customerPage === customersMeta.last_page}
                        onClick={() => setCustomerPage(customersMeta.last_page)}
                        className="px-3 py-1 bg-[#1a1a1a] text-gray-400 rounded disabled:opacity-50"
                     >Last</button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* SALES TAB */}
        {activeTab === 'sales' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-yellow-500">Sales & Payments</h1>
            
            {loadingSales ? (
              <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 text-yellow-500 animate-spin" /></div>
            ) : (
              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-[#151515] text-gray-500 border-b border-gray-800 uppercase tracking-wider text-xs">
                      <tr>
                        <th className="p-4">Date</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Product</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Boxes</th>
                        <th className="p-4">Method</th>
                        <th className="p-4">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {sales.length === 0 ? (
                        <tr><td colSpan="7" className="p-8 text-center text-gray-500">No payments found.</td></tr>
                      ) : (
                        sales.map(s => (
                          <tr key={s.uuid} className="hover:bg-gray-800/50">
                            <td className="p-4 whitespace-nowrap">{new Date(s.created_at).toLocaleDateString()}</td>
                            <td className="p-4 font-bold">{s.customer_name}</td>
                            <td className="p-4">{s.product_name}</td>
                            <td className="p-4 font-bold text-yellow-500">GHS{s.amount.toFixed(2)}</td>
                            <td className="p-4"><span className="bg-gray-800 px-2 py-1 rounded">{s.boxes_covered}</span></td>
                            <td className="p-4">{s.payment_method}</td>
                            <td className="p-4 text-xs text-gray-500 font-mono">{s.reference}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {salesMeta && salesMeta.last_page > 1 && (
                  <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-800">
                     <button 
                        disabled={salesPage === 1}
                        onClick={() => setSalesPage(prev => prev - 1)}
                        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded disabled:opacity-50"
                     >Prev</button>
                     <span className="text-sm text-gray-400 px-4">Page {salesPage} of {salesMeta.last_page}</span>
                     <button 
                        disabled={salesPage === salesMeta.last_page}
                        onClick={() => setSalesPage(prev => prev + 1)}
                        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded disabled:opacity-50"
                     >Next</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <h1 className="text-3xl font-bold text-yellow-500">Layaway Products</h1>
              <form onSubmit={handleInventorySearch} className="flex gap-2 w-full md:w-auto">
                <input 
                  type="text" 
                  value={inventorySearch}
                  onChange={e => setInventorySearch(e.target.value)}
                  placeholder="Search products..."
                  className="bg-[#1a1a1a] border border-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-yellow-500 w-full md:w-64"
                />
                <button type="submit" className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </div>

            {loadingInventory ? (
              <div className="flex justify-center py-20"><RefreshCw className="w-8 h-8 text-yellow-500 animate-spin" /></div>
            ) : (
              <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-[#151515] text-gray-500 border-b border-gray-800 uppercase tracking-wider text-xs">
                      <tr>
                        <th className="p-4">Product Name</th>
                        <th className="p-4">Price (GHS)</th>
                        <th className="p-4">Stock</th>
                        <th className="p-4 text-center">Layaway Eligible</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {inventory.length === 0 ? (
                        <tr><td colSpan="4" className="p-8 text-center text-gray-500">No products found.</td></tr>
                      ) : (
                        inventory.map(prod => (
                          <tr key={prod.uuid} className="hover:bg-gray-800/50">
                            <td className="p-4 font-bold text-white">{prod.name}</td>
                            <td className="p-4 text-yellow-500">GHS{prod.price.toFixed(2)}</td>
                            <td className="p-4">{prod.stock}</td>
                            <td className="p-4 text-center">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="sr-only peer"
                                  checked={prod.is_layaway}
                                  onChange={() => toggleProductLayaway(prod.uuid)}
                                />
                                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
                              </label>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {inventoryMeta && inventoryMeta.last_page > 1 && (
                  <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-800">
                     <button 
                        disabled={inventoryPage === 1}
                        onClick={() => setInventoryPage(prev => prev - 1)}
                        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded disabled:opacity-50"
                     >Prev</button>
                     <span className="text-sm text-gray-400 px-4">Page {inventoryPage} of {inventoryMeta.last_page}</span>
                     <button 
                        disabled={inventoryPage === inventoryMeta.last_page}
                        onClick={() => setInventoryPage(prev => prev + 1)}
                        className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded disabled:opacity-50"
                     >Next</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-yellow-500 mb-8">Settings</h1>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 shadow-lg max-w-4xl">
              <h2 className="text-lg font-bold text-white mb-4">Layaway Terms & Conditions</h2>
              <p className="text-gray-400 text-sm mb-6">These terms will be displayed to customers when registering for a layaway plan.</p>
              
              {loadingTerms ? (
                <div className="flex justify-center py-12"><RefreshCw className="w-6 h-6 text-yellow-500 animate-spin" /></div>
              ) : (
                <div className="space-y-6">
                  <textarea 
                    value={termsText}
                    onChange={e => setTermsText(e.target.value)}
                    className="w-full bg-[#262626] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-yellow-500 min-h-[300px]"
                    placeholder="Enter your global layaway terms and conditions here..."
                  />
                  <button 
                    onClick={saveTerms} 
                    disabled={savingTerms}
                    className="px-8 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {savingTerms ? 'Saving...' : 'Save Terms'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminLayaway;
