import Swal from 'sweetalert2';
import React, { useEffect, useState } from 'react';
import productService from '../../services/productService';
import { Plus, Edit2, Trash2, RefreshCw, X, AlertCircle, Tag } from 'lucide-react';
import DotPagination from '../../components/DotPagination';

const ICON_OPTIONS = [
  '🛒','📱','💻','👗','🏠','🚗','🐾','📚','⚽','🎮',
  '🔧','💄','🏋️','🍎','🎵','✈️','📷','🪑','💡','🧴',
  '🎁','🏪','🔑','💰','🌿','👶','🩺','🎓','📊','🧩'
];

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const paginatedCategories = categories.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const [editingCat, setEditingCat] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('🛒');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      // Use admin endpoint which returns a flat list
      const res = await productService.adminGetCategories();
      setCategories(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const toSlug = (str) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const handleOpenCreate = () => {
    setEditingCat(null);
    setName(''); setSlug(''); setIcon('🛒'); setDescription(''); setParentId('');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setName(cat.name || '');
    setSlug(cat.slug || '');
    setIcon(cat.icon || '🛒');
    setDescription(cat.description || '');
    setParentId(cat.parent_id || '');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    const __confirmResult = await Swal.fire({ title: 'Are you sure?', text: 'Delete this category? Products in this category may be affected.', icon: 'warning', showCancelButton: true });
    if (!__confirmResult.isConfirmed) return;
    try {
      await productService.adminDeleteCategory(id);
      loadCategories();
    } catch (e) {
      Swal.fire({ text: String(e.message || 'Failed to delete.') });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    const payload = { name, slug: slug || toSlug(name), icon, description, parent_id: parentId || null };
    try {
      if (editingCat) {
        await productService.adminUpdateCategory(editingCat.id || editingCat.uuid, payload);
      } else {
        await productService.adminCreateCategory(payload);
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save category.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Category Management</h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Manage the categories that appear on the storefront.</p>
        </div>
        <button onClick={handleOpenCreate} className="premium-button-primary px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : (
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
          {categories.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center text-secondary-400">
              <Tag className="w-12 h-12 mb-3 opacity-40" />
              <p className="font-semibold">No categories yet. Add one to get started.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 dark:text-secondary-400 font-bold uppercase tracking-wider text-xs">
                  <th className="p-4">Icon</th>
                  <th className="p-4">Name</th>
                  <th className="p-4 hidden sm:table-cell">Slug</th>
                  <th className="p-4 hidden md:table-cell">Description</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                {paginatedCategories.map((cat) => (
                  <tr key={cat.id || cat.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                    <td className="p-4 text-2xl">{cat.icon || '🛒'}</td>
                    <td className="p-4 font-semibold text-secondary-900 dark:text-white">{cat.name}</td>
                    <td className="p-4 text-secondary-500 dark:text-secondary-400 hidden sm:table-cell font-mono text-xs">{cat.slug}</td>
                    <td className="p-4 text-secondary-500 dark:text-secondary-400 hidden md:table-cell truncate max-w-xs">{cat.description || '—'}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenEdit(cat)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(cat.id || cat.uuid)} className="p-1.5 text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <DotPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-secondary-200 dark:border-secondary-800 flex justify-between items-center bg-secondary-50 dark:bg-secondary-900/50">
              <h3 className="font-bold text-secondary-900 dark:text-white text-lg">{editingCat ? 'Edit Category' : 'Create New Category'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded-md hover:bg-secondary-200 dark:hover:bg-secondary-800 text-secondary-500 dark:text-secondary-400"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 rounded-lg flex items-start gap-2 text-sm border border-accent-200/50">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /><span>{errorMsg}</span>
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase mb-1.5">Category Name</label>
                <input type="text" required value={name}
                  onChange={(e) => { setName(e.target.value); if (!editingCat) setSlug(toSlug(e.target.value)); }}
                  className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Electronics"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase mb-1.5">Slug (URL-friendly)</label>
                <input type="text" required value={slug} onChange={(e) => setSlug(e.target.value)}
                  className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. electronics"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase mb-1.5">Icon — Selected: <span className="text-xl">{icon}</span></label>
                <div className="grid grid-cols-10 gap-1 p-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 max-h-28 overflow-y-auto">
                  {ICON_OPTIONS.map((em) => (
                    <button type="button" key={em} onClick={() => setIcon(em)}
                      className={`text-xl rounded p-1 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors ${icon === em ? 'bg-primary-100 dark:bg-primary-900/30 ring-2 ring-primary-500' : ''}`}
                    >{em}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase mb-1.5">Parent Category (Optional)</label>
                <select 
                  value={parentId} 
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">-- None (Top Level Category) --</option>
                  {categories.map(c => (
                    // Don't let a category be its own parent
                    (!editingCat || c.id !== editingCat.id) && (
                      <option key={c.id || c.uuid} value={c.id}>
                        {c.name} {c.parent_id ? '(Subcategory)' : ''}
                      </option>
                    )
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase mb-1.5">Description (optional)</label>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Short description..."
                />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full premium-button-primary py-2.5 rounded-lg font-bold flex items-center justify-center gap-2">
                {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : (editingCat ? 'Save Changes' : 'Create Category')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
