import Swal from "sweetalert2";
import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon, Link as LinkIcon, Check, X, Folder, Calendar, ArrowLeft, Search } from "lucide-react";
import bannerService from "../../services/bannerService";
import DotPagination from "../../components/DotPagination";

const POSITIONS = [
  { id: "layaway_hero", label: "Layaway Hero" },
  { id: "preorder_hero", label: "Pre-Order Hero" },
  { id: "hire_purchase_hero", label: "Hire Purchase Hero" },
  { id: "raffle_hero", label: "Raffles Hero" },
  { id: "trade_hero", label: "Trade & Sell Hero" },
  { id: "vendor_hero", label: "Become a Vendor Hero" },
  { id: "atu_hero", label: "Buy ATU Hero" },
  { id: "storefront_top_ad", label: "Storefront Top (Ad Board)" },
  { id: "storefront_middle", label: "Storefront Middle (Ad Board)" }
];

const Banners = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredCampaigns = campaigns.filter(c => 
    (c.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );
  
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [campaignForm, setCampaignForm] = useState({ name: "", starts_at: "", ends_at: "", is_active: true });

  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [bannerForm, setBannerForm] = useState({ title: "", subtitle: "", position: "storefront_middle", link: "", sort_order: "", is_active: true });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await bannerService.adminGetCampaigns();
      setCampaigns(res.data?.data || res.data || []);
      if (selectedCampaign) {
        const updated = (res.data?.data || res.data || []).find(c => c.id === selectedCampaign.id);
        setSelectedCampaign(updated || null);
        if (!updated) setSelectedPosition(null);
      }
    } catch (error) {
      console.error("Failed to load campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Campaign Handlers ---
  const handleOpenCampaignModal = (campaign = null) => {
    if (campaign) {
      setEditingCampaign(campaign);
      setCampaignForm({
        name: campaign.name || "",
        starts_at: campaign.starts_at ? campaign.starts_at.split("T")[0] : "",
        ends_at: campaign.ends_at ? campaign.ends_at.split("T")[0] : "",
        is_active: campaign.is_active,
      });
    } else {
      setEditingCampaign(null);
      setCampaignForm({ name: "", starts_at: "", ends_at: "", is_active: true });
    }
    setShowCampaignModal(true);
  };

  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (editingCampaign) {
        await bannerService.adminUpdateCampaign(editingCampaign.id, campaignForm);
      } else {
        await bannerService.adminCreateCampaign(campaignForm);
      }
      setShowCampaignModal(false);
      fetchCampaigns();
    } catch (error) {
      Swal.fire({ text: "Failed to save campaign." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCampaignDelete = async (id) => {
    const __confirmResult = await Swal.fire({ title: "Delete Campaign?", text: "This will delete all banners inside it.", icon: "warning", showCancelButton: true });
    if (__confirmResult.isConfirmed) {
      await bannerService.adminDeleteCampaign(id);
      if (selectedCampaign && selectedCampaign.id === id) setSelectedCampaign(null);
      fetchCampaigns();
    }
  };

  // --- Banner Handlers ---
  const handleOpenBannerModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setBannerForm({ title: banner.title || "", subtitle: banner.subtitle || "", position: banner.position || "storefront_middle", link: banner.link || "", sort_order: banner.sort_order ?? "", is_active: banner.is_active });
    } else {
      setEditingBanner(null);
      setBannerForm({ title: "", subtitle: "", position: selectedPosition ? selectedPosition.id : "storefront_middle", link: "", sort_order: "", is_active: true });
    }
    setImageFile(null);
    setShowBannerModal(true);
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = new FormData();
      payload.append("title", bannerForm.title || "");
      payload.append("subtitle", bannerForm.subtitle || "");
      payload.append("link", bannerForm.link || "");
      payload.append("position", bannerForm.position);
      const sortValue = bannerForm.sort_order !== "" && bannerForm.sort_order !== null && bannerForm.sort_order !== undefined ? String(bannerForm.sort_order) : "0";
      payload.append("sort_order", sortValue);
      payload.append("is_active", bannerForm.is_active ? "1" : "0");
      payload.append("banner_campaign_id", selectedCampaign.id);
      
      if (imageFile) payload.append("image", imageFile);

      if (editingBanner) {
        await bannerService.adminUpdateBanner(editingBanner.id, payload);
      } else {
        if (!imageFile) { Swal.fire({ text: "Image required." }); setIsSubmitting(false); return; }
        await bannerService.adminCreateBanner(payload);
      }
      setShowBannerModal(false);
      fetchCampaigns();
    } catch (error) {
      Swal.fire({ text: "Failed to save banner." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBannerDelete = async (id) => {
    const __confirmResult = await Swal.fire({ title: "Delete banner?", icon: "warning", showCancelButton: true });
    if (__confirmResult.isConfirmed) {
      await bannerService.adminDeleteBanner(id);
      fetchCampaigns();
    }
  };

  const getPositionLabel = (posId) => POSITIONS.find(p => p.id === posId)?.label || posId;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Banners & Ads</h1>
          <p className="text-sm text-secondary-500">Manage your marketing campaigns and hero banners.</p>
        </div>
        {!selectedCampaign ? (
          <button onClick={() => handleOpenCampaignModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold text-sm">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        ) : !selectedPosition ? (
          <button onClick={() => setSelectedCampaign(null)} className="flex items-center gap-2 px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        ) : (
          <button onClick={() => handleOpenBannerModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold text-sm">
            <Plus className="w-4 h-4" /> Add Banner
          </button>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-secondary-200 dark:bg-secondary-800 rounded-xl" />
        </div>
      ) : !selectedCampaign ? (
        <>
          <div className="relative mb-6 w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-secondary-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-9 pr-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white placeholder-secondary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map(camp => (
            <div key={camp.id} className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col" onClick={() => setSelectedCampaign(camp)}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center">
                  <Folder className="w-6 h-6" />
                </div>
                <div className={`px-2 py-1 rounded-md text-xs font-bold ${camp.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {camp.is_active ? "ACTIVE" : "INACTIVE"}
                </div>
              </div>
              <h3 className="font-bold text-lg text-secondary-900 dark:text-white">{camp.name}</h3>
              <p className="text-sm text-secondary-500 flex items-center gap-1 mt-1">
                <Calendar className="w-4 h-4" /> 
                {camp.starts_at ? new Date(camp.starts_at).toLocaleDateString() : "Anytime"} - {camp.ends_at ? new Date(camp.ends_at).toLocaleDateString() : "Forever"}
              </p>
              <div className="mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-800 flex justify-between text-sm text-secondary-500">
                <span>{camp.banners?.length || 0} Banners</span>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); handleOpenCampaignModal(camp); }} className="hover:text-primary-600"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); handleCampaignDelete(camp.id); }} className="hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
          {campaigns.length === 0 && <div className="col-span-full text-center py-20 text-secondary-500">No campaigns found. Create one to get started!</div>}
        </div>
        </>
      ) : !selectedPosition ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-white dark:bg-secondary-900 p-4 rounded-2xl border border-secondary-200 dark:border-secondary-800">
            <button onClick={() => setSelectedCampaign(null)} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
            <div>
              <h2 className="font-bold text-lg dark:text-white">{selectedCampaign.name}</h2>
              <p className="text-xs text-secondary-500">{selectedCampaign.banners?.length || 0} total banners inside</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {POSITIONS.map(pos => {
              const bannersInPos = (selectedCampaign.banners || []).filter(b => b.position === pos.id);
              return (
                <div key={pos.id} onClick={() => setSelectedPosition(pos)} className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                      <Folder className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="font-bold text-lg text-secondary-900 dark:text-white">{pos.label}</h3>
                  <div className="mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-800 flex justify-between text-sm text-secondary-500">
                    <span>{bannersInPos.length} Banner(s)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-white dark:bg-secondary-900 p-4 rounded-2xl border border-secondary-200 dark:border-secondary-800">
            <button onClick={() => setSelectedPosition(null)} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
            <div>
              <h2 className="font-bold text-lg dark:text-white">{selectedCampaign.name} &gt; {selectedPosition.label}</h2>
              <p className="text-xs text-secondary-500">Manage banners for this specific slot</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(selectedCampaign.banners || []).filter(b => b.position === selectedPosition.id).map(banner => (
              <div key={banner.id} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                <div className="relative aspect-[21/9] bg-secondary-100 border-b border-secondary-200">
                  <img src={banner.image_url} alt="Banner" className="w-full h-full object-cover" />
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-md text-xs font-bold ${banner.is_active ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>{banner.is_active ? "ACTIVE" : "INACTIVE"}</div>
                </div>
                <div className="p-5 flex-1 flex flex-col space-y-3">
                  <div className="flex-1">
                    <span className="text-xs font-bold text-primary-600 block mb-1">{getPositionLabel(banner.position)}</span>
                    {banner.title && <h3 className="font-bold line-clamp-1 dark:text-white">{banner.title}</h3>}
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-secondary-100 dark:border-secondary-800">
                    <button onClick={() => handleOpenBannerModal(banner)} className="flex-1 px-3 py-1.5 text-sm font-semibold text-secondary-700 bg-secondary-100 rounded-lg hover:bg-secondary-200"><Edit2 className="w-4 h-4 inline mr-1" /> Edit</button>
                    <button onClick={() => handleBannerDelete(banner.id)} className="flex-1 px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><Trash2 className="w-4 h-4 inline mr-1" /> Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {(selectedCampaign.banners || []).filter(b => b.position === selectedPosition.id).length === 0 && <div className="col-span-full text-center py-20 text-secondary-500">No banners uploaded for this slot yet.</div>}
          </div>
        </div>
      )}

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-secondary-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
            <div className="p-5 border-b border-secondary-200 dark:border-secondary-800 flex justify-between"><h2 className="font-bold dark:text-white">{editingCampaign ? "Edit Campaign" : "New Campaign"}</h2><button onClick={() => setShowCampaignModal(false)}><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleCampaignSubmit} className="p-5 space-y-4">
              <div><label className="block text-sm font-semibold mb-1 dark:text-white">Name</label><input type="text" value={campaignForm.name} onChange={e => setCampaignForm({...campaignForm, name: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-secondary-800 dark:text-white" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-semibold mb-1 dark:text-white">Start Date</label><input type="date" value={campaignForm.starts_at} onChange={e => setCampaignForm({...campaignForm, starts_at: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-secondary-800 dark:text-white" /></div>
                <div><label className="block text-sm font-semibold mb-1 dark:text-white">End Date</label><input type="date" value={campaignForm.ends_at} onChange={e => setCampaignForm({...campaignForm, ends_at: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-secondary-800 dark:text-white" /></div>
              </div>
              <div className="flex items-center gap-2"><input type="checkbox" checked={campaignForm.is_active} onChange={e => setCampaignForm({...campaignForm, is_active: e.target.checked})} className="w-4 h-4 rounded" /><span className="dark:text-white">Is Active?</span></div>
              <button disabled={isSubmitting} className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 disabled:opacity-50">Save Campaign</button>
            </form>
          </div>
        </div>
      )}

      {/* Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-secondary-900 w-full max-w-lg rounded-2xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-secondary-200 dark:border-secondary-800 flex justify-between"><h2 className="font-bold dark:text-white">{editingBanner ? "Edit Banner" : "Upload Banner"}</h2><button onClick={() => setShowBannerModal(false)}><X className="w-5 h-5" /></button></div>
            <form onSubmit={handleBannerSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-white">Banner Image</label>
                {editingBanner && !imageFile && (
                  <div className="mb-3 rounded-lg overflow-hidden border border-secondary-200 dark:border-secondary-700 max-w-[200px]">
                    <img src={editingBanner.image_url || editingBanner.image} alt="Current" className="w-full h-auto object-cover" />
                    <div className="bg-secondary-100 dark:bg-secondary-800 p-1 text-center text-xs text-secondary-600 dark:text-secondary-400">Current Image</div>
                  </div>
                )}
                {imageFile && (
                  <div className="mb-2 text-sm text-primary-600 dark:text-primary-400 font-medium">New image selected: {imageFile.name}</div>
                )}
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full text-sm dark:text-secondary-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-400" />
                {!editingBanner && <p className="text-xs text-secondary-500 mt-1">Image is required for new banners.</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1 dark:text-white">Position</label>
                <select value={bannerForm.position} onChange={e => setBannerForm({...bannerForm, position: e.target.value})} className="w-full p-2.5 border rounded-lg dark:bg-secondary-800 dark:text-white" required>
                  {POSITIONS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-semibold mb-1 dark:text-white">Link (URL)</label><input type="url" value={bannerForm.link} onChange={e => setBannerForm({...bannerForm, link: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-secondary-800 dark:text-white" /></div>
              <div><label className="block text-sm font-semibold mb-1 dark:text-white">Display Order (optional)</label><input type="number" placeholder="1 = First, 2 = Second..." value={bannerForm.sort_order} onChange={e => setBannerForm({...bannerForm, sort_order: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-secondary-800 dark:text-white" /></div>
              <div className="flex items-center gap-2"><input type="checkbox" checked={bannerForm.is_active} onChange={e => setBannerForm({...bannerForm, is_active: e.target.checked})} className="w-4 h-4" /><span className="dark:text-white">Active</span></div>
              <button disabled={isSubmitting} className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 disabled:opacity-50">Save Banner</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default Banners;

