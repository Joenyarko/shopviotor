import React, { useState, useEffect, useRef } from "react";
import promoPopupService from "../../services/promoPopupService";
import bannerService from "../../services/bannerService";
import { Plus, Trash2, Edit, RefreshCw, Upload, X, Link as LinkIcon, Image as ImageIcon, Folder, Calendar, ArrowLeft, Search } from "lucide-react";
import Swal from "sweetalert2";

const TARGET_PAGES = [
    { value: "all", label: "Everywhere (All Pages)" },
    { value: "home", label: "Home Page" },
    { value: "raffle", label: "Raffles" },
    { value: "hire_purchase", label: "Hire Purchase" },
    { value: "layaway", label: "Layaway" },
    { value: "preorder", label: "Pre-Orders" },
    { value: "marketplace", label: "Marketplace" }
];

const AdminPopups = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [selectedTarget, setSelectedTarget] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredCampaigns = campaigns.filter(c =>
        (c.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    const [showCampaignModal, setShowCampaignModal] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);
    const [campaignForm, setCampaignForm] = useState({ name: "", starts_at: "", ends_at: "", is_active: true });

    const [showModal, setShowModal] = useState(false);
    const [editingPopup, setEditingPopup] = useState(null);
    const [processing, setProcessing] = useState(false);

    // Form states
    const [targetPage, setTargetPage] = useState("all");
    const [linkUrl, setLinkUrl] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

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
                if (!updated) setSelectedTarget(null);
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
            setProcessing(true);
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
            setProcessing(false);
        }
    };

    const handleCampaignDelete = async (id) => {
        const __confirmResult = await Swal.fire({ title: "Delete Campaign?", text: "This will delete all banners and popups inside it.", icon: "warning", showCancelButton: true });
        if (__confirmResult.isConfirmed) {
            await bannerService.adminDeleteCampaign(id);
            if (selectedCampaign && selectedCampaign.id === id) setSelectedCampaign(null);
            fetchCampaigns();
        }
    };

    // --- Popup Handlers ---
    const resetForm = () => {
        setTargetPage(selectedTarget ? selectedTarget.value : "all");
        setLinkUrl("");
        setIsActive(true);
        setImageFile(null);
        setImagePreview(null);
        setEditingPopup(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleOpenModal = (popup = null) => {
        resetForm();
        if (popup) {
            setEditingPopup(popup);
            setTargetPage(popup.target_page || "all");
            setLinkUrl(popup.link_url || "");
            setIsActive(!!popup.is_active);
            setImagePreview(popup.image_url);
        }
        setShowModal(true);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editingPopup && !imageFile) {
            return Swal.fire({ text: "Please select an image for the popup" });
        }

        const formData = new FormData();
        formData.append("target_page", targetPage);
        if (linkUrl) formData.append("link_url", linkUrl);
        formData.append("is_active", isActive ? "1" : "0");
        formData.append("banner_campaign_id", selectedCampaign.id);
        if (imageFile) formData.append("image", imageFile);

        try {
            setProcessing(true);
            if (editingPopup) {
                await promoPopupService.updatePopup(editingPopup.uuid, formData);
            } else {
                await promoPopupService.createPopup(formData);
            }
            setShowModal(false);
            fetchCampaigns();
        } catch (e) {
            Swal.fire({ text: e.response?.data?.message || "Failed to save popup" });
        } finally {
            setProcessing(false);
        }
    };

    const handleDelete = (uuid) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This will permanently delete this promo popup.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await promoPopupService.deletePopup(uuid);
                    fetchCampaigns();
                } catch (e) {
                    Swal.fire({ text: "Failed to delete popup" });
                }
            }
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Promo Popups</h1>
                    <p className="text-sm text-secondary-500">Manage sleek image-only promotional popups in your campaigns.</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchCampaigns} className="p-2 border border-secondary-200 dark:border-secondary-700 rounded-lg hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors text-secondary-600 dark:text-secondary-400">
                        <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
                    </button>
                    {!selectedCampaign ? (
                        <button onClick={() => handleOpenCampaignModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold text-sm">
                            <Plus className="w-4 h-4" /> New Campaign
                        </button>
                    ) : !selectedTarget ? (
                        <button onClick={() => setSelectedCampaign(null)} className="flex items-center gap-2 px-4 py-2 bg-secondary-100 text-secondary-700 rounded-lg hover:bg-secondary-200 font-semibold text-sm">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                    ) : (
                        <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold text-sm">
                            <Plus className="w-4 h-4" /> Add Popup
                        </button>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="h-32 bg-secondary-200 dark:bg-secondary-800 rounded-xl animate-pulse" />
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
                                    <span>{camp.promo_popups?.length || 0} Popups</span>
                                    <div className="flex gap-2">
                                        <button onClick={(e) => { e.stopPropagation(); handleOpenCampaignModal(camp); }} className="hover:text-primary-600"><Edit className="w-4 h-4" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleCampaignDelete(camp.id); }} className="hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {campaigns.length === 0 && <div className="col-span-full text-center py-20 text-secondary-500">No campaigns found.</div>}
                    </div>
                </>
            ) : !selectedTarget ? (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-white dark:bg-secondary-900 p-4 rounded-2xl border border-secondary-200 dark:border-secondary-800">
                        <button onClick={() => setSelectedCampaign(null)} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
                        <div>
                            <h2 className="font-bold text-lg dark:text-white">{selectedCampaign.name}</h2>
                            <p className="text-xs text-secondary-500">{selectedCampaign.promo_popups?.length || 0} total popups inside</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {TARGET_PAGES.map(page => {
                            const popupsInPage = (selectedCampaign.promo_popups || []).filter(p => p.target_page === page.value);
                            return (
                                <div key={page.value} onClick={() => setSelectedTarget(page)} className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                            <Folder className="w-6 h-6" />
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg text-secondary-900 dark:text-white">{page.label}</h3>
                                    <div className="mt-4 pt-4 border-t border-secondary-100 dark:border-secondary-800 flex justify-between text-sm text-secondary-500">
                                        <span>{popupsInPage.length} Popup(s)</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex items-center gap-4 bg-white dark:bg-secondary-900 p-4 rounded-2xl border border-secondary-200 dark:border-secondary-800">
                        <button onClick={() => setSelectedTarget(null)} className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg"><ArrowLeft className="w-5 h-5" /></button>
                        <div>
                            <h2 className="font-bold text-lg dark:text-white">{selectedCampaign.name} &gt; {selectedTarget.label}</h2>
                            <p className="text-xs text-secondary-500">Manage popups for this page</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {(selectedCampaign.promo_popups || []).filter(p => p.target_page === selectedTarget.value).map(popup => (
                            <div key={popup.uuid} className="bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800 overflow-hidden group hover:shadow-md transition-shadow relative">
                                <div className="aspect-[4/5] bg-secondary-100 dark:bg-secondary-800 relative">
                                    <img src={popup.image_url} alt="Popup" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                        <button onClick={() => handleOpenModal(popup)} className="p-2 bg-white rounded-full text-primary-600 hover:scale-110 transition-transform">
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDelete(popup.uuid)} className="p-2 bg-red-500 rounded-full text-white hover:scale-110 transition-transform">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-secondary-500 uppercase">Target</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${popup.is_active ? "bg-emerald-100 text-emerald-700" : "bg-secondary-100 text-secondary-600"}`}>
                                            {popup.is_active ? "ACTIVE" : "INACTIVE"}
                                        </span>
                                    </div>
                                    <p className="text-sm font-semibold text-secondary-900 dark:text-white capitalize">
                                        {popup.target_page.replace("_", " ")}
                                    </p>
                                    {popup.link_url && (
                                        <a href={popup.link_url} target="_blank" rel="noreferrer" className="text-xs text-primary-500 hover:underline flex items-center gap-1 truncate">
                                            <LinkIcon className="w-3 h-3" /> {popup.link_url}
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                        {(selectedCampaign.promo_popups || []).filter(p => p.target_page === selectedTarget.value).length === 0 && (
                            <div className="col-span-full text-center py-20 bg-white dark:bg-secondary-900 rounded-2xl border border-secondary-200 dark:border-secondary-800">
                                <ImageIcon className="w-12 h-12 text-secondary-400 mx-auto mb-3" />
                                <h3 className="text-lg font-bold text-secondary-900 dark:text-white">No Popups Found</h3>
                                <p className="text-secondary-500">Create your first promo popup for this page.</p>
                            </div>
                        )}
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
                            <button disabled={processing} className="w-full py-2.5 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700 disabled:opacity-50">Save Campaign</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Popup Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-secondary-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white dark:bg-secondary-900 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-secondary-100 dark:border-secondary-800">
                            <h3 className="text-lg font-bold text-secondary-900 dark:text-white">
                                {editingPopup ? "Edit Promo Popup" : "Create Promo Popup"}
                            </h3>
                            <button onClick={() => setShowModal(false)} className="p-2 text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6 overflow-y-auto">
                            <form id="popupForm" onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">Popup Image (Sleek Square/Rectangle) *</label>
                                    <div
                                        className="border-2 border-dashed border-secondary-300 dark:border-secondary-700 rounded-xl p-4 text-center cursor-pointer hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors relative aspect-[4/5] sm:aspect-square flex flex-col items-center justify-center overflow-hidden"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {imagePreview ? (
                                            <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 text-secondary-400 mb-2" />
                                                <p className="text-sm text-secondary-500 font-medium">Click to upload image</p>
                                                <p className="text-xs text-secondary-400 mt-1">Recommended: 800x800px or 800x1000px</p>
                                            </>
                                        )}
                                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">Target Page</label>
                                    <select value={targetPage} onChange={e => setTargetPage(e.target.value)} className="w-full p-2.5 bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm text-secondary-900 dark:text-white outline-none focus:border-primary-500">
                                        {TARGET_PAGES.map(page => (
                                            <option key={page.value} value={page.value}>{page.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">Link URL (Optional)</label>
                                    <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://example.com/promo" className="w-full p-2.5 bg-secondary-50 dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm text-secondary-900 dark:text-white outline-none focus:border-primary-500" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 text-primary-600 rounded border-secondary-300 focus:ring-primary-500" />
                                    <label htmlFor="isActive" className="text-sm text-secondary-700 dark:text-secondary-300 cursor-pointer">Active / Visible</label>
                                </div>
                                <button type="submit" disabled={processing} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-50">
                                    {processing ? "Saving..." : editingPopup ? "Update Popup" : "Create Popup"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPopups;

