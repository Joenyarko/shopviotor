import React, { useState, useEffect } from 'react';
import { User, Image as ImageIcon, CheckCircle, AlertCircle, Save } from 'lucide-react';
import apiClient from '../../api/client';

const ManageServiceProfile = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [formData, setFormData] = useState({
    business_name: '',
    category: '',
    location: '',
    city: '',
    region: '',
    contact_number: '',
    whatsapp_number: '',
    bio: ''
  });

  const [existingImages, setExistingImages] = useState([]);
  const [deleteImages, setDeleteImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await apiClient.get('/services/categories');
      setCategories(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/services/my-profile');
      if (res.data?.data) {
        const profile = res.data.data;
        const cat = profile.category || '';
        // If we have categories loaded, check if the profile category is in the predefined list
        // Wait, fetchCategories runs parallel. We will just set it, and in the render decide if it's 'Other'
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
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setNewImages([...newImages, ...files].slice(0, 5)); // max 5 images
  };

  const toggleDeleteImage = (id) => {
    if (deleteImages.includes(id)) {
      setDeleteImages(deleteImages.filter(imgId => imgId !== id));
    } else {
      setDeleteImages([...deleteImages, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key]);
      });
      
      newImages.forEach(img => {
        data.append('images[]', img);
      });

      deleteImages.forEach(id => {
        data.append('delete_images[]', id);
      });

      await apiClient.post('/services/my-profile', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessMsg('Profile updated successfully!');
      setNewImages([]);
      setDeleteImages([]);
      fetchProfile();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Update failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-secondary-500">Loading profile...</div>;

  const inputClass = "w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";
  const labelClass = "block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wide mb-1.5";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-6 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2 mb-2">
          <User className="text-primary-500 w-6 h-6" /> My Service Profile
        </h2>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-6">
          Offer your professional services to the community. Fill out your details below to appear in the Hire Professionals directory.
        </p>

        {errorMsg && (
          <div className="mb-6 p-4 bg-accent-50 text-accent-700 rounded-lg flex gap-3 text-sm border border-accent-200">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{errorMsg}</p>
          </div>
        )}
        
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg flex gap-3 text-sm border border-emerald-200">
            <CheckCircle className="w-5 h-5 shrink-0" />
            <p>{successMsg}</p>
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
                  if (e.target.value === 'Other') {
                    setIsCustomCategory(true);
                    setFormData({ ...formData, category: '' });
                  } else {
                    setIsCustomCategory(false);
                    setFormData({ ...formData, category: e.target.value });
                  }
                }} 
                className={inputClass}
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="Other">Other (Specify)</option>
              </select>

              {(isCustomCategory || (formData.category && !categories.includes(formData.category) && categories.length > 0)) && (
                <div className="mt-3">
                  <input 
                    type="text" 
                    name="category" 
                    required 
                    value={formData.category} 
                    onChange={handleChange} 
                    className={inputClass} 
                    placeholder="Enter custom category" 
                  />
                </div>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>Bio / Description</label>
            <textarea name="bio" rows="4" value={formData.bio} onChange={handleChange} className={inputClass} placeholder="Describe your services, experience, and what makes you unique..."></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelClass}>Location (Address)</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className={inputClass} placeholder="e.g. Adenta" />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} placeholder="e.g. Accra" />
            </div>
            <div>
              <label className={labelClass}>Region</label>
              <input type="text" name="region" value={formData.region} onChange={handleChange} className={inputClass} placeholder="e.g. Greater Accra" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Contact Number</label>
              <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} className={inputClass} placeholder="e.g. 0244123456" />
            </div>
            <div>
              <label className={labelClass}>WhatsApp Number</label>
              <input type="text" name="whatsapp_number" value={formData.whatsapp_number} onChange={handleChange} className={inputClass} placeholder="e.g. 233244123456" />
              <p className="text-xxs text-secondary-500 mt-1">Include country code for WhatsApp (e.g. 233...)</p>
            </div>
          </div>

          <div className="border-t border-secondary-200 dark:border-secondary-800 pt-6">
            <label className={labelClass}>Portfolio Images</label>
            <p className="text-xs text-secondary-500 mb-4">Showcase your best work. Upload up to 5 images.</p>
            
            {existingImages.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                {existingImages.map(img => (
                  <div key={img.id} className="relative group rounded-lg overflow-hidden border border-secondary-200">
                    <img src={`${import.meta.env.VITE_STORAGE_URL}/${img.path}`} alt="Portfolio" className={`w-full h-24 object-cover ${deleteImages.includes(img.id) ? 'opacity-30' : ''}`} />
                    <button type="button" onClick={() => toggleDeleteImage(img.id)} className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-bold">
                      {deleteImages.includes(img.id) ? 'Keep' : 'Delete'}
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <input type="file" multiple accept="image/*" onChange={handleImageSelect} className={inputClass} />
            {newImages.length > 0 && (
              <p className="text-xs text-emerald-600 font-bold mt-2">{newImages.length} new image(s) selected</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" disabled={submitting} className="premium-button-primary px-8 py-3 rounded-xl font-bold flex items-center gap-2">
              {submitting ? 'Saving...' : <><Save className="w-4 h-4" /> Save Profile</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManageServiceProfile;
