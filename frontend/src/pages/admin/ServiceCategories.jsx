import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, XCircle, Search } from 'lucide-react';
import apiClient from '../../api/client';
import Swal from 'sweetalert2';

const ServiceCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ id: null, name: '', is_active: true });
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredCategories = categories.filter(c => 
    (c.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/admin/service-categories');
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (formData.id) {
        await apiClient.put(`/admin/service-categories/${formData.id}`, formData);
        Swal.fire({ icon: 'success', title: 'Updated', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      } else {
        await apiClient.post('/admin/service-categories', formData);
        Swal.fire({ icon: 'success', title: 'Created', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Something went wrong.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await apiClient.delete(`/admin/service-categories/${id}`);
        Swal.fire('Deleted!', 'Category has been deleted.', 'success');
        fetchCategories();
      } catch (err) {
        Swal.fire('Error', 'Could not delete category.', 'error');
      }
    }
  };

  const openModal = (category = null) => {
    if (category) {
      setFormData({ id: category.id, name: category.name, is_active: category.is_active });
    } else {
      setFormData({ id: null, name: '', is_active: true });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white tracking-tight">Service Categories</h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Manage categories for Hire Professionals.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-secondary-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white placeholder-secondary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => openModal()} 
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl font-bold flex items-center justify-center gap-2 text-sm transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-sm border border-secondary-200 dark:border-secondary-800 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <table className="w-full min-w-[500px] text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary-50 dark:bg-secondary-800 text-secondary-500 dark:text-secondary-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-200 dark:divide-secondary-800">
              {loading ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-secondary-500">Loading categories...</td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-8 text-center text-secondary-500">No categories found.</td>
                </tr>
              ) : (
                filteredCategories.map(category => (
                  <tr key={category.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-800/50">
                    <td className="px-6 py-4 font-medium text-secondary-900 dark:text-white">
                      {category.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${category.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-secondary-100 text-secondary-800 dark:bg-secondary-800 dark:text-secondary-400'}`}>
                        {category.is_active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => openModal(category)} className="text-secondary-400 hover:text-primary-500 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(category.id)} className="text-secondary-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-secondary-900 rounded-3xl p-6 w-full max-w-md shadow-2xl relative animate-scale-in">
            <h3 className="text-xl font-bold mb-6 text-secondary-900 dark:text-white">{formData.id ? 'Edit Category' : 'New Category'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wide mb-1.5">Category Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                  className="w-full p-3 border border-secondary-300 dark:border-secondary-700 rounded-xl bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="e.g. Plumbing"
                />
              </div>

              <div className="flex items-center gap-3 py-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                  className="w-5 h-5 rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-secondary-700 dark:text-secondary-300">Active (Visible to public)</label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-secondary-200 dark:border-secondary-800">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-secondary-600 hover:bg-secondary-100 dark:text-secondary-300 dark:hover:bg-secondary-800 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-600/20 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceCategories;
