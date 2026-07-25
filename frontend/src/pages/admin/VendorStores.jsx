import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import vendorService from '../../services/vendorService';
import { Store, RefreshCw, Eye, Check, Ban, RotateCcw, Edit2 } from 'lucide-react';
import DotPagination from '../../components/DotPagination';

const VendorStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [processing, setProcessing] = useState(false);
  const [commissionInput, setCommissionInput] = useState('');
  const [editingCommission, setEditingCommission] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(stores.length / itemsPerPage);
  const paginatedStores = stores.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const loadStores = async () => {
    setLoading(true);
    try {
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const res = await vendorService.adminGetStores(params);
      setStores(res.data?.data || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadStores(); }, [activeTab]);

  const handleApprove = async (uuid) => {
    const __confirmResult = await Swal.fire({ title: 'Are you sure?', text: 'Approve this store and grant vendor role to the owner?', icon: 'warning', showCancelButton: true });
    if (!__confirmResult.isConfirmed) return;
    setProcessing(true);
    try {
      await vendorService.adminApproveStore(uuid);
      setSelectedStore(null);
      loadStores();
    } catch (e) { Swal.fire({ text: String(e.message || 'Failed.') }); }
    finally { setProcessing(false); }
  };

  const handleSuspend = async (uuid) => {
    const __confirmResult = await Swal.fire({ title: 'Are you sure?', text: 'Suspend this store?', icon: 'warning', showCancelButton: true });
    if (!__confirmResult.isConfirmed) return;
    setProcessing(true);
    try {
      await vendorService.adminSuspendStore(uuid);
      setSelectedStore(null);
      loadStores();
    } catch (e) { Swal.fire({ text: String(e.message || 'Failed.') }); }
    finally { setProcessing(false); }
  };

  const handleRestore = async (uuid) => {
    setProcessing(true);
    try {
      await vendorService.adminRestoreStore(uuid);
      setSelectedStore(null);
      loadStores();
    } catch (e) { Swal.fire({ text: String(e.message || 'Failed.') }); }
    finally { setProcessing(false); }
  };

  const handleSaveCommission = async (uuid) => {
    if (!commissionInput) return;
    setProcessing(true);
    try {
      await vendorService.adminUpdateCommission(uuid, parseFloat(commissionInput));
      setEditingCommission(false);
      loadStores();
    } catch (e) { Swal.fire({ text: String(e.message || 'Failed.') }); }
    finally { setProcessing(false); }
  };

  const statusBadge = (status) => {
    const map = {
      pending:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400',
      active:    'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
      suspended: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
    };
    return map[status] || 'bg-secondary-100 text-secondary-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
          <Store className="w-6 h-6 text-primary-500" /> Vendor Stores
        </h2>
        <p className="text-sm text-secondary-500 mt-1">Manage vendor applications, active stores, and commission rates.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-secondary-200 dark:border-secondary-800 gap-1">
        {['all', 'pending', 'active', 'suspended'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 font-semibold text-sm capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-secondary-500 hover:text-secondary-700 dark:text-secondary-400'}`}
          >
            {tab === 'all' ? 'All Stores' : tab}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Table */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center py-16"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
          ) : stores.length === 0 ? (
            <div className="py-12 text-center bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl text-secondary-500">
              No stores found.
            </div>
          ) : (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase tracking-wider text-xxs">
                    <th className="p-4 text-left">Store</th>
                    <th className="p-4 text-left">Owner</th>
                    <th className="p-4 text-left">Products</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                  {paginatedStores.map(store => (
                    <tr key={store.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                      <td className="p-4">
                        <p className="font-bold text-secondary-900 dark:text-white">{store.name}</p>
                        <p className="text-xs text-secondary-500">{store.location || '—'}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-secondary-900 dark:text-secondary-300">{store.owner?.name}</p>
                        <p className="text-xs text-secondary-500">{store.owner?.email}</p>
                      </td>
                      <td className="p-4 font-semibold text-secondary-900 dark:text-white">{store.products_count}</td>
                      <td className="p-4">
                        <span className={`text-xxs font-bold px-2.5 py-0.5 rounded-full ${statusBadge(store.status)}`}>
                          {store.status}
                        </span>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        {store.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(store.uuid)}
                            disabled={processing}
                            className="p-1.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded-lg"
                            title="Approve Store"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => { setSelectedStore(store); setCommissionInput(store.commission_rate); setEditingCommission(false); }} className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <DotPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>

        {/* Detail Panel */}
        <div>
          {selectedStore ? (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 shadow-sm space-y-5">
              {/* Logo & Name */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-secondary-200 dark:border-secondary-700 bg-secondary-100 flex-shrink-0">
                  {selectedStore.logo_url ? (
                    <img src={selectedStore.logo_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-primary-600 flex items-center justify-center">
                      <Store className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-secondary-900 dark:text-white">{selectedStore.name}</h3>
                  <span className={`text-xxs font-bold px-2 py-0.5 rounded-full ${statusBadge(selectedStore.status)}`}>{selectedStore.status}</span>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="block text-xxs text-secondary-500 uppercase font-bold tracking-wider">Owner</span>
                  <span className="font-semibold text-secondary-900 dark:text-white">{selectedStore.owner?.name}</span>
                  <p className="text-xs text-secondary-500">{selectedStore.owner?.email}</p>
                  <p className="text-xs text-secondary-500">{selectedStore.owner?.phone}</p>
                </div>
                <div>
                  <span className="block text-xxs text-secondary-500 uppercase font-bold tracking-wider">Description</span>
                  <p className="text-secondary-700 dark:text-secondary-300 text-xs leading-relaxed">{selectedStore.description || 'No description.'}</p>
                </div>
                <div>
                  <span className="block text-xxs text-secondary-500 uppercase font-bold tracking-wider">Applied On</span>
                  <span className="font-semibold text-secondary-900 dark:text-white text-xs">
                    {new Date(selectedStore.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Commission Rate */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xxs text-secondary-500 uppercase font-bold tracking-wider">Commission Rate</span>
                    <button onClick={() => setEditingCommission(v => !v)} className="text-primary-600 hover:text-primary-700">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {editingCommission ? (
                    <div className="flex gap-2">
                      <input
                        type="number" min={0} max={100} step={0.5}
                        value={commissionInput}
                        onChange={e => setCommissionInput(e.target.value)}
                        className="flex-1 p-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-sm"
                      />
                      <button onClick={() => handleSaveCommission(selectedStore.uuid)} disabled={processing} className="premium-button-primary px-3 py-2 rounded-lg text-xs font-bold">
                        Save
                      </button>
                    </div>
                  ) : (
                    <span className="font-bold text-secondary-900 dark:text-white">{selectedStore.commission_rate}%</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-secondary-100 dark:border-secondary-800">
                {selectedStore.status === 'pending' && (
                  <button
                    onClick={() => handleApprove(selectedStore.uuid)}
                    disabled={processing}
                    className="premium-button-primary w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Approve Store
                  </button>
                )}
                {selectedStore.status === 'active' && (
                  <button
                    onClick={() => handleSuspend(selectedStore.uuid)}
                    disabled={processing}
                    className="w-full py-2.5 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Ban className="w-4 h-4" /> Suspend Store
                  </button>
                )}
                {selectedStore.status === 'suspended' && (
                  <button
                    onClick={() => handleRestore(selectedStore.uuid)}
                    disabled={processing}
                    className="w-full py-2.5 bg-green-50 dark:bg-green-950/20 hover:bg-green-100 text-green-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" /> Restore Store
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-secondary-900 border border-dashed border-secondary-200 dark:border-secondary-800 rounded-2xl p-8 text-center text-xs text-secondary-500 dark:text-secondary-400">
              Select a store to view details and take action.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorStores;
export { VendorStores };
