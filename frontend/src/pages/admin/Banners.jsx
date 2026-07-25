import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Image as ImageIcon, Link as LinkIcon, Check, X } from 'lucide-react';
import bannerService from '../../services/bannerService';
import DotPagination from '../../components/DotPagination';

const POSITIONS = [
  { id: 'layaway_hero', label: 'Layaway Hero' },
  { id: 'preorder_hero', label: 'Pre-Order Hero' },
  { id: 'hire_purchase_hero', label: 'Hire Purchase Hero' },
  { id: 'raffle_hero', label: 'Raffles Hero' },
  { id: 'trade_hero', label: 'Trade & Sell Hero' },
  { id: 'storefront_top_ad', label: 'Storefront Top (Ad Board)' },
  { id: 'storefront_middle', label: 'Storefront Middle (Ad Board)' }
];

const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(banners.length / itemsPerPage);
  const paginatedBanners = banners.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    position: 'storefront_middle',
    link: '',
    is_active: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await bannerService.adminGetBanners();
      setBanners(res.data || res || []);
    } catch (error) {
      console.error('Failed to load banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        position: banner.position || 'storefront_middle',
        link: banner.link || '',
        is_active: banner.is_active,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        title: '',
        subtitle: '',
        position: 'storefront_middle',
        link: '',
        is_active: true,
      });
    }
    setImageFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      const payload = new FormData();
      if (formData.title) { payload.append('title', formData.title); } else { payload.append('title', ''); }
      if (formData.subtitle) { payload.append('subtitle', formData.subtitle); } else { payload.append('subtitle', ''); }
      if (formData.link) { payload.append('link', formData.link); } else { payload.append('link', ''); }
      payload.append('position', formData.position);
      payload.append('is_active', formData.is_active ? '1' : '0');
      
      if (imageFile) {
        payload.append('image', imageFile);
      }

      if (editingBanner) {
        await bannerService.adminUpdateBanner(editingBanner.id, payload);
      } else {
        if (!imageFile) {
          Swal.fire({ text: String('Image is required for new banners.') });
          return;
        }
        await bannerService.adminCreateBanner(payload);
      }
      
      setShowModal(false);
      fetchBanners();
    } catch (error) {
      console.error('Submit failed:', error);
      Swal.fire({ text: String('Failed to save banner. Check console for details.') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    const __confirmResult = await Swal.fire({ title: 'Are you sure?', text: 'Are you sure you want to delete this banner?', icon: 'warning', showCancelButton: true });
    if (__confirmResult.isConfirmed) {
      try {
        await bannerService.adminDeleteBanner(id);
        fetchBanners();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const getPositionLabel = (posId) => {
    return POSITIONS.find(p => p.id === posId)?.label || posId;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Banners & Ads</h1>
          <p className="text-sm text-secondary-500">Manage hero images and advertising banners.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Add Banner
        </button>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-secondary-200 dark:bg-secondary-800 rounded-xl" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800">
          <ImageIcon className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
          <p className="text-secondary-500 font-medium">No banners uploaded yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedBanners.map(banner => (
            <div key={banner.id} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="relative aspect-[21/9] bg-secondary-100 dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-800">
                <img src={banner.image_url} alt="Banner" className="w-full h-full object-cover" />
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold ${banner.is_active ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {banner.is_active ? 'ACTIVE' : 'INACTIVE'}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col space-y-3">
                <div className="flex-1">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider block mb-1">
                    {getPositionLabel(banner.position)}
                  </span>
                  {banner.title && <h3 className="font-bold text-secondary-900 dark:text-white line-clamp-1">{banner.title}</h3>}
                  {banner.subtitle && <p className="text-sm text-secondary-500 line-clamp-1">{banner.subtitle}</p>}
                  
                  {banner.link && (
                    <a href={banner.link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 hover:underline">
                      <LinkIcon className="w-3 h-3" /> {banner.link}
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-secondary-100 dark:border-secondary-800">
                  <button
                    onClick={() => handleOpenModal(banner)}
                    className="flex-1 px-3 py-1.5 text-sm font-semibold text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 inline-block mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="flex-1 px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 inline-block mr-1" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          </div>
          <DotPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-secondary-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-secondary-200 dark:border-secondary-800 flex justify-between items-center">
              <h2 className="text-lg font-bold text-secondary-900 dark:text-white">
                {editingBanner ? 'Edit Banner' : 'Upload Banner'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-secondary-400 hover:text-secondary-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              <form id="bannerForm" onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-1">Image (Recommended ratio: wide / 16:9)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => setImageFile(e.target.files[0])}
                    className="w-full text-sm text-secondary-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                  />
                  {editingBanner && !imageFile && (
                    <p className="text-xs text-secondary-500 mt-2">Leave blank to keep current image.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-1">Position</label>
                  <select
                    value={formData.position}
                    onChange={e => setFormData({...formData, position: e.target.value})}
                    className="w-full p-2.5 bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm"
                    required
                  >
                    {POSITIONS.map(p => (
                      <option key={p.id} value={p.id}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-1">Title (Optional)</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full p-2.5 bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm"
                    placeholder="E.g. Summer Sale!"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-1">Subtitle (Optional)</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={e => setFormData({...formData, subtitle: e.target.value})}
                    className="w-full p-2.5 bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm"
                    placeholder="E.g. Up to 50% off on all items"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-1">Link URL (Optional)</label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={e => setFormData({...formData, link: e.target.value})}
                    className="w-full p-2.5 bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                    className="w-4 h-4 text-primary-600 rounded border-secondary-300 focus:ring-primary-500"
                  />
                  <label htmlFor="is_active" className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                    Active (visible on site)
                  </label>
                </div>

              </form>
            </div>
            
            <div className="p-5 border-t border-secondary-200 dark:border-secondary-800 flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="bannerForm"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Save Banner'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Banners;
