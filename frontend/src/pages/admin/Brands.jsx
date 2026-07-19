import React, { useEffect, useState } from 'react';
import apiClient from '../../api/client';
import { Plus, Edit2, Trash2, RefreshCw, X, AlertCircle, Layers, Image as ImageIcon } from 'lucide-react';

const AdminBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState('');

  const loadBrands = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/brands');
      setBrands(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBrands(); }, []);

  const handleOpenCreate = () => {
    setEditingBrand(null);
    setName(''); setDescription(''); setLogo('');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (brand) => {
    setEditingBrand(brand);
    setName(brand.name || '');
    setDescription(brand.description || '');
    setLogo(brand.logo || '');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleDelete = async (uuid) => {
    if (!window.confirm('Delete this brand? Products associated with this brand may be affected.')) return;
    try {
      await apiClient.delete(`/admin/brands/${uuid}`);
      loadBrands();
    } catch (e) {
      alert(e.response?.data?.message || e.message || 'Failed to delete.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    const payload = { name, description, logo };
    try {
      if (editingBrand) {
        await apiClient.put(`/admin/brands/${editingBrand.uuid}`, payload);
      } else {
        await apiClient.post('/admin/brands', payload);
      }
      setModalOpen(false);
      loadBrands();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save brand.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Brand Management</h1>
          <p className="text-sm text-secondary-500 mt-1">Manage product brands to allow filtering by brand.</p>
        </div>
        <button onClick={handleOpenCreate} className="premium-button-primary px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow">
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : (
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
          {brands.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center text-secondary-400">
              <Layers className="w-12 h-12 mb-3 opacity-40" />
              <p className="font-semibold">No brands yet. Add one to get started.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase tracking-wider text-xs">
                  <th className="p-4 w-16">Logo</th>
                  <th className="p-4">Name</th>
                  <th className="p-4 hidden md:table-cell">Description</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                {brands.map((brand) => (
                  <tr key={brand.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                    <td className="p-4">
                      {brand.logo ? (
                        <div className="w-8 h-8 rounded bg-secondary-100 dark:bg-secondary-800 overflow-hidden flex items-center justify-center">
                          <img src={brand.logo} alt={brand.name} className="max-w-full max-h-full object-contain" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded bg-secondary-100 dark:bg-secondary-800 text-secondary-400 flex items-center justify-center">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </td>
                    <td className="p-4 font-semibold text-secondary-900 dark:text-white">{brand.name}</td>
                    <td className="p-4 text-secondary-500 hidden md:table-cell truncate max-w-xs">{brand.description || '—'}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(brand)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(brand.uuid)} className="p-1.5 text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-secondary-200 dark:border-secondary-800 flex justify-between items-center bg-secondary-50 dark:bg-secondary-900/50">
              <h3 className="font-bold text-secondary-900 dark:text-white text-lg">{editingBrand ? 'Edit Brand' : 'Create New Brand'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-md hover:bg-secondary-200 dark:hover:bg-secondary-800 text-secondary-500"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 rounded-lg flex items-start gap-2 text-sm border border-accent-200/50">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /><span>{errorMsg}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Brand Name</label>
                <input type="text" required value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Apple, Samsung"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Logo URL (optional)</label>
                <input type="text" value={logo} onChange={(e) => setLogo(e.target.value)}
                  className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Description (optional)</label>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Short description..."
                />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full premium-button-primary py-2.5 rounded-lg font-bold flex items-center justify-center gap-2">
                {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : (editingBrand ? 'Save Changes' : 'Create Brand')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBrands;
