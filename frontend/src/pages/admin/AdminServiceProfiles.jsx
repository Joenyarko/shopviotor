import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Trash2, RotateCcw, Eye, EyeOff, ChevronLeft, ChevronRight, Briefcase, MapPin } from 'lucide-react';
import apiClient from '../../api/client';
import { toast } from 'react-toastify';

const AdminServiceProfiles = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, per_page: 20 };
      if (search) params.search = search;
      if (status) params.status = status;
      const res = await apiClient.get('/admin/service-profiles', { params });
      
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res)
            ? res
            : [];

      const paginationMeta = res?.meta || res?.data?.meta || {
        current_page: 1,
        last_page: 1,
        total: list.length,
      };

      setProfiles(list);
      setMeta(paginationMeta);
    } catch (err) {
      toast.error('Failed to load service profiles.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleDelete = async (uuid) => {
    try {
      await apiClient.delete(`/admin/service-profiles/${uuid}`);
      toast.success('Service profile deleted. The owner can re-create it anytime.');
      setConfirmDelete(null);
      fetchProfiles();
    } catch (err) {
      toast.error('Failed to delete service profile.');
    }
  };

  const handleRestore = async (uuid) => {
    try {
      await apiClient.post(`/admin/service-profiles/${uuid}/restore`);
      toast.success('Service profile restored successfully!');
      fetchProfiles();
    } catch (err) {
      toast.error('Failed to restore service profile.');
    }
  };

  const handleToggleStatus = async (uuid) => {
    try {
      const res = await apiClient.post(`/admin/service-profiles/${uuid}/toggle-status`);
      toast.success(res?.message || res?.data?.message || 'Status updated.');
      fetchProfiles();
    } catch (err) {
      toast.error('Failed to toggle status.');
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-secondary-900 dark:text-white">Buy ATU Members</h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
            View and manage all service profiles. Deleting a profile does not remove the customer&apos;s account — they can re-register anytime.
          </p>
        </div>
        <button onClick={fetchProfiles} className="flex items-center gap-2 text-sm font-semibold text-secondary-600 dark:text-secondary-400 hover:text-primary-600 transition-colors">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
          <input
            type="text"
            placeholder="Search by name, category, or owner..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2.5 border border-secondary-300 dark:border-secondary-700 rounded-xl bg-white dark:bg-secondary-900 text-sm text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={status}
          onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-4 py-2.5 border border-secondary-300 dark:border-secondary-700 rounded-xl bg-white dark:bg-secondary-900 text-sm text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">All Profiles</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      {/* Stats Banner */}
      <div className="bg-primary-500 text-secondary-900 rounded-2xl px-6 py-4 flex items-center gap-3">
        <Briefcase className="w-6 h-6 flex-shrink-0" />
        <div>
          <p className="text-lg font-extrabold">{meta.total} Total Service Profiles</p>
          <p className="text-sm font-semibold opacity-80">Across all Buy ATU members on the platform</p>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl">
          <Briefcase className="w-12 h-12 mx-auto text-secondary-300 mb-3" />
          <p className="font-semibold text-secondary-500">No service profiles found.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-x-auto shadow-sm">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead>
              <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 dark:text-secondary-400 font-bold uppercase tracking-wider text-xs">
                <th className="p-4">Service / Business</th>
                <th className="p-4">Owner</th>
                <th className="p-4">Category</th>
                <th className="p-4">Location</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
              {profiles.map(profile => (
                <tr key={profile.uuid} className={`hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30 transition-colors ${profile.deleted_at ? 'opacity-60' : ''}`}>
                  <td className="p-4">
                    <div>
                      <p className="font-bold text-secondary-900 dark:text-white">{profile.business_name}</p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">{profile.images_count} image{profile.images_count !== 1 ? 's' : ''}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary-500 text-secondary-900 flex items-center justify-center font-black text-xs flex-shrink-0">
                        {profile.owner?.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900 dark:text-white text-xs">{profile.owner?.name || 'Unknown'}</p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">{profile.owner?.email || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 px-2 py-1 rounded-lg font-semibold">
                      {profile.category || '—'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-xs text-secondary-500 dark:text-secondary-400">
                      <MapPin className="w-3 h-3 flex-shrink-0" />
                      <span>{[profile.city, profile.location].filter(Boolean).join(', ') || '—'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {profile.deleted_at ? (
                      <span className="text-xs bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 px-2 py-1 rounded-full font-bold uppercase">Deleted</span>
                    ) : profile.is_active ? (
                      <span className="text-xs bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-full font-bold uppercase">Active</span>
                    ) : (
                      <span className="text-xs bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 px-2 py-1 rounded-full font-bold uppercase">Inactive</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      {profile.deleted_at ? (
                        <button
                          onClick={() => handleRestore(profile.uuid)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Restore
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => handleToggleStatus(profile.uuid)}
                            className="p-1.5 rounded-lg border border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
                            title={profile.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {profile.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => setConfirmDelete(profile)}
                            className="p-1.5 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                            title="Delete service profile"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-secondary-100 dark:border-secondary-800">
              <p className="text-xs text-secondary-500">Page {meta.current_page} of {meta.last_page} — {meta.total} total</p>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg border border-secondary-200 dark:border-secondary-700 disabled:opacity-40 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button disabled={page >= meta.last_page} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg border border-secondary-200 dark:border-secondary-700 disabled:opacity-40 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-xl border border-secondary-200 dark:border-secondary-800 max-w-md w-full p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-extrabold text-secondary-900 dark:text-white text-center">Delete Service Profile?</h3>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 text-center mt-2">
              You are about to delete <strong className="text-secondary-900 dark:text-white">&ldquo;{confirmDelete.business_name}&rdquo;</strong> owned by <strong>{confirmDelete.owner?.name}</strong>.
              <br /><br />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ The customer&apos;s account will NOT be affected.</span>
              <br />They can create a new service profile at any time.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 text-sm font-semibold text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.uuid)}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors"
              >
                Yes, Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminServiceProfiles;
