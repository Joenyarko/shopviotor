import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import apiClient from '../../api/client';
import { Plus, Edit2, Trash2, RefreshCw, X, Image as ImageIcon } from 'lucide-react';
import DotPagination from '../../components/DotPagination';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(campaigns.length / itemsPerPage);
  const paginatedCampaigns = campaigns.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  
  const [title, setTitle] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [displayLocation, setDisplayLocation] = useState('homepage_popup');
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/marketing/campaigns');
      setCampaigns(res?.data?.data || res?.data || (Array.isArray(res) ? res : []));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  const handleOpenEdit = (campaign = null) => {
    if (campaign) {
      setEditing(campaign);
      setTitle(campaign.title);
      setTargetUrl(campaign.target_url || '');
      setStartDate(campaign.start_date ? new Date(campaign.start_date).toISOString().split('T')[0] : '');
      setEndDate(campaign.end_date ? new Date(campaign.end_date).toISOString().split('T')[0] : '');
      setIsActive(campaign.is_active);
      setDisplayLocation(campaign.display_location);
    } else {
      setEditing(null);
      setTitle(''); setTargetUrl(''); setStartDate(''); setEndDate(''); setIsActive(true); setDisplayLocation('homepage_popup');
    }
    setImageFile(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const fd = new FormData();
    fd.append('title', title);
    fd.append('display_location', displayLocation);
    if (targetUrl) fd.append('target_url', targetUrl);
    if (startDate) fd.append('start_date', startDate);
    if (endDate) fd.append('end_date', endDate);
    fd.append('is_active', isActive ? '1' : '0');
    if (imageFile) fd.append('image', imageFile);

    try {
      if (editing) {
        fd.append('_method', 'PUT');
        await apiClient.post(`/admin/marketing/campaigns/${editing.uuid}`, fd);
      } else {
        await apiClient.post('/admin/marketing/campaigns', fd);
      }
      setModalOpen(false);
      fetchCampaigns();
    } catch (err) {
      if (err.status === 422 && err.errors) {
        const messages = Object.values(err.errors).flat().join('\n');
        Swal.fire({ text: String('Validation Error:\n' + messages) });
      } else {
        Swal.fire({ text: String(err.message || 'An error occurred') });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (uuid) => {
    const __confirmResult = await Swal.fire({ title: 'Are you sure?', text: 'Delete this popup campaign?', icon: 'warning', showCancelButton: true });
    if (!__confirmResult.isConfirmed) return;
    try {
      await apiClient.delete(`/admin/marketing/campaigns/${uuid}`);
      fetchCampaigns();
    } catch (err) { Swal.fire({ text: String('Failed to delete') }); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Promo Popups & Campaigns</h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">Manage popups and banners.</p>
        </div>
        <button onClick={() => handleOpenEdit()} className="premium-button-primary px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow">
          <Plus className="w-4 h-4" /> Create Popup
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCampaigns.map(c => (
            <div key={c.uuid} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="aspect-video relative bg-secondary-100 dark:bg-secondary-800">
                {c.image_path ? (
                  <img src={c.image_path} alt={c.title} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-10 h-10 m-auto mt-16 text-secondary-300" />
                )}
                <div className={`absolute top-3 left-3 px-2 py-1 text-xs font-bold uppercase rounded shadow ${c.is_active ? 'bg-emerald-500 text-white' : 'bg-secondary-500 text-white'}`}>
                  {c.is_active ? 'Active' : 'Draft'}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{c.title}</h3>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-4">{c.display_location}</p>
                <div className="flex justify-between items-center border-t border-secondary-100 dark:border-secondary-800 pt-3">
                  <div className="text-xs text-secondary-400">
                    {c.start_date ? new Date(c.start_date).toLocaleDateString() : 'Always'} - {c.end_date ? new Date(c.end_date).toLocaleDateString() : 'Forever'}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenEdit(c)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(c.uuid)} className="p-1.5 text-accent-600 hover:bg-accent-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          </div>
          <DotPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl w-full max-w-lg shadow-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">{editing ? 'Edit Campaign' : 'Create Campaign'}</h3>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5 text-secondary-500 dark:text-secondary-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 mb-1">Title</label>
                <input required type="text" value={title} onChange={e=>setTitle(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800" />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 mb-1">Image {editing ? '(Leave blank to keep)' : '*'}</label>
                <input type="file" required={!editing} accept="image/*" onChange={e=>setImageFile(e.target.files[0])} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 mb-1">Target URL (Optional - Where users go when clicked)</label>
                <input type="text" value={targetUrl} onChange={e=>setTargetUrl(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800" placeholder="e.g. /products?category=1" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 mb-1">Start Date (Optional)</label>
                  <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 mb-1">End Date (Optional)</label>
                  <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)} className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold pt-2 cursor-pointer">
                <input type="checkbox" checked={isActive} onChange={e=>setIsActive(e.target.checked)} className="w-4 h-4 text-primary-600 rounded border-secondary-300" />
                Is Active
              </label>
              <button disabled={submitting} type="submit" className="w-full premium-button-primary py-3 rounded-xl font-bold mt-4">
                {submitting ? 'Saving...' : 'Save Campaign'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
