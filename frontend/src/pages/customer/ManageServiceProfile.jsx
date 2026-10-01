import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon, CheckCircle, AlertCircle, Save,
  Plus, Trash2, Edit2, X, Briefcase, MapPin
} from 'lucide-react';
import apiClient from '../../api/client';

const emptyForm = {
  business_name: '',
  category: '',
  location: '',
  city: '',
  region: '',
  contact_number: '',
  whatsapp_number: '',
  bio: ''
};

const ManageServiceProfile = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [formData, setFormData] = useState(emptyForm);
  const [existingImages, setExistingImages] = useState([]);
  const [deleteImages, setDeleteImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  useEffect(() => {
    fetchProfiles();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/services/categories');
      setCategories(res.data?.data || res.data || []);
    } catch { /* non-critical */ }
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/services/my-profiles');
      const list = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res)
            ? res
            : [];
      setProfiles(list);
    } catch {
      try {
        const res = await apiClient.get('/services/my-profile');
        const single = res?.data?.data || res?.data || (res?.id ? res : null);
        if (single && single.id) {
          setProfiles([single]);
        } else {
          setProfiles([]);
        }
      } catch {
        setProfiles([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const openCreateForm = () => {
    setEditingProfile(null);
    setFormData(emptyForm);
    setExistingImages([]);
    setDeleteImages([]);
    setNewImages([]);
    setIsCustomCategory(false);
    setErrorMsg('');
    setSuccessMsg('');
    setShowForm(true);
  };

  const openEditForm = (profile) => {
    setEditingProfile(profile.uuid);
    const cat = profile.category || '';
    const predefined = categories.includes(cat);
    setFormData({
      business_name: profile.business_name || '',
      category: cat,
      location: profile.location || '',
      city: profile.city || '',
      region: profile.region || '',
      contact_number: profile.contact_number || '',
      whatsapp_number: profile.whatsapp_number || '',
      bio: profile.bio || ''
    });
    setExistingImages(profile.images || []);
    setDeleteImages([]);
    setNewImages([]);
    setIsCustomCategory(!predefined && !!cat);
    setErrorMsg('');
    setSuccessMsg('');
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProfile(null);
    setFormData(emptyForm);
    setExistingImages([]);
    setDeleteImages([]);
    setNewImages([]);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files].slice(0, 5));
  };

  const toggleDeleteImage = (id) => {
    setDeleteImages(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => data.append(key, formData[key]));
      newImages.forEach(img => data.append('images[]', img));
      deleteImages.forEach(id => data.append('delete_images[]', id));
      const headers = { 'Content-Type': 'multipart/form-data' };
      if (editingProfile) {
        await apiClient.post(`/services/${editingProfile}`, data, { headers });
        setSuccessMsg('Service profile updated successfully!');
      } else {
        await apiClient.post('/services', data, { headers });
        setSuccessMsg('New service profile created successfully!');
      }
      setNewImages([]);
      setDeleteImages([]);
      await fetchProfiles();
      setTimeout(() => closeForm(), 1200);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (uuid) => {
    setDeleting(uuid);
    try {
      await apiClient.delete(`/services/${uuid}`);
      setConfirmDelete(null);
      await fetchProfiles();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete profile.');
    } finally {
      setDeleting(null);
    }
  };

  const inputClass = "w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";
  const labelClass = "block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wide mb-1.5";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            <Briefcase className="text-primary-500 w-6 h-6" /> My Service Profiles
          </h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
            You can create multiple service profiles for different services you offer.
          </p>
        </div>
        {!showForm && (
          <button onClick={openCreateForm} className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-secondary-900 rounded-xl font-bold text-sm hover:bg-primary-400 transition-colors shadow">
            <Plus className="w-4 h-4" /> Add New Service
          </button>
        )}
      </div>

      {!showForm && (
        <>
          {loading ? (
            <div className="p-8 text-center text-secondary-500">Loading profiles...</div>
          ) : profiles.length === 0 ? (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto text-secondary-300 mb-3" />
              <p className="font-bold text-secondary-700 dark:text-secondary-300 mb-1">No service profiles yet</p>
              <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-4">Create your first service profile to appear in the Buy ATU directory.</p>
              <button onClick={openCreateForm} className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-secondary-900 rounded-xl font-bold text-sm hover:bg-primary-400 transition-colors mx-auto">
                <Plus className="w-4 h-4" /> Create Service Profile
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {profiles.map(profile => (
                <div key={profile.uuid} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                      {profile.images?.length > 0 ? (
                        <img
                          src={profile.images[0].path.startsWith('http') ? profile.images[0].path : `${import.meta.env.VITE_STORAGE_URL}/${profile.images[0].path}`}
                          alt={profile.business_name}
                          className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border border-secondary-200 dark:border-secondary-700"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center flex-shrink-0">
                          <ImageIcon className="w-6 h-6 text-secondary-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-secondary-900 dark:text-white text-base truncate">{profile.business_name}</p>
                        <span className="text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full font-semibold">{profile.category}</span>
                        {profile.city && (
                          <div className="flex items-center gap-1 text-xs text-secondary-500 dark:text-secondary-400 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{[profile.city, profile.region].filter(Boolean).join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase ${profile.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400' : 'bg-secondary-100 text-secondary-500 dark:bg-secondary-800'}`}>
                        {profile.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <button onClick={() => openEditForm(profile)} className="p-2 rounded-lg border border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDelete(profile)} className="p-2 rounded-lg border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {profile.bio && <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-3 line-clamp-2">{profile.bio}</p>}
                  <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-2">{profile.images?.length || 0} portfolio image(s)</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-extrabold text-secondary-900 dark:text-white flex items-center gap-2">
              {editingProfile ? <Edit2 className="w-5 h-5 text-primary-500" /> : <Plus className="w-5 h-5 text-primary-500" />}
              {editingProfile ? 'Edit Service Profile' : 'Create New Service Profile'}
            </h3>
            <button onClick={closeForm} className="p-2 rounded-lg text-secondary-500 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-accent-50 text-accent-700 rounded-lg flex gap-3 text-sm border border-accent-200">
              <AlertCircle className="w-5 h-5 shrink-0" /><p>{errorMsg}</p>
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg flex gap-3 text-sm border border-emerald-200">
              <CheckCircle className="w-5 h-5 shrink-0" /><p>{successMsg}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Business / Professional Name *</label>
                <input type="text" name="business_name" required value={formData.business_name} onChange={handleChange} className={inputClass} placeholder="e.g. John's Carpentry" />
              </div>
              <div>
                <label className={labelClass}>Category *</label>
                <select
                  name="category"
                  required={!isCustomCategory}
                  value={isCustomCategory ? 'Other' : (categories.includes(formData.category) ? formData.category : (formData.category ? 'Other' : ''))}
                  onChange={(e) => {
                    if (e.target.value === 'Other') { setIsCustomCategory(true); setFormData({ ...formData, category: '' }); }
                    else { setIsCustomCategory(false); setFormData({ ...formData, category: e.target.value }); }
                  }}
                  className={inputClass}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  <option value="Other">Other (Specify)</option>
                </select>
                {(isCustomCategory || (formData.category && !categories.includes(formData.category) && categories.length > 0)) && (
                  <div className="mt-3">
                    <input type="text" name="category" required value={formData.category} onChange={handleChange} className={inputClass} placeholder="Enter custom category" />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>Bio / Description</label>
              <textarea name="bio" rows="4" value={formData.bio} onChange={handleChange} className={inputClass} placeholder="Describe your services, experience, and what makes you unique..." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div><label className={labelClass}>Location (Address)</label><input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} placeholder="e.g. Adenta" /></div>
              <div><label className={labelClass}>City</label><input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} placeholder="e.g. Accra" /></div>
              <div><label className={labelClass}>Region</label><input type="text" name="region" value={formData.region} onChange={handleChange} className={inputClass} placeholder="e.g. Greater Accra" /></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className={labelClass}>Contact Number</label><input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} className={inputClass} placeholder="e.g. 0244123456" /></div>
              <div>
                <label className={labelClass}>WhatsApp Number</label>
                <input type="text" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} className={inputClass} placeholder="e.g. 233244123456" />
                <p className="text-xxs text-secondary-500 mt-1">Include country code (e.g. 233...)</p>
              </div>
            </div>

            <div className="border-t border-secondary-200 dark:border-secondary-800 pt-6">
              <label className={labelClass}>Portfolio Images</label>
              <p className="text-xs text-secondary-500 mb-4">Showcase your best work. Upload up to 5 images.</p>
              {existingImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                  {existingImages.map(img => (
                    <div key={img.id} className="relative group">
                      <img src={img.path.startsWith('http') ? img.path : `${import.meta.env.VITE_STORAGE_URL}/${img.path}`} alt="Portfolio" className={`w-full h-24 object-cover rounded-lg border border-secondary-200 dark:border-secondary-700 ${deleteImages.includes(img.id) ? 'opacity-30' : ''}`} />
                      <button type="button" onClick={() => toggleDeleteImage(img.id)} className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold rounded-lg">
                        {deleteImages.includes(img.id) ? 'Keep' : 'Remove'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input type="file" multiple accept="image/*" onChange={handleImageSelect} className={inputClass} />
              {newImages.length > 0 && <p className="text-xs text-emerald-600 font-bold mt-2">{newImages.length} new image(s) selected</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={closeForm} className="px-6 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 text-sm font-semibold text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors">Cancel</button>
              <button type="submit" disabled={submitting} className="premium-button-primary px-8 py-2.5 rounded-xl font-bold flex items-center gap-2">
                {submitting ? 'Saving...' : <><Save className="w-4 h-4" />{editingProfile ? 'Update Profile' : 'Create Profile'}</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-secondary-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl shadow-xl border border-secondary-200 dark:border-secondary-800 max-w-sm w-full p-6">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-extrabold text-secondary-900 dark:text-white text-center">Delete Profile?</h3>
            <p className="text-sm text-secondary-500 dark:text-secondary-400 text-center mt-2">
              Are you sure you want to delete <strong className="text-secondary-900 dark:text-white">"{confirmDelete.business_name}"</strong>?
              <br />You can always create it again later.
            </p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 text-sm font-semibold text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete.uuid)} disabled={deleting === confirmDelete.uuid} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-60">
                {deleting === confirmDelete.uuid ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageServiceProfile;
