import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import vendorService from '../../services/vendorService';
import { Store, Upload, Save, RefreshCw, MapPin, Phone, MessageSquare, ShieldCheck, CheckCircle2, Lock, Percent, FileText } from 'lucide-react';

const VendorSettings = () => {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    whatsapp: '',
    location: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [bannerPreview, setBannerPreview] = useState('');

  const logoInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const loadStore = async () => {
    setLoading(true);
    try {
      const res = await vendorService.getMyStore();
      const storeData = res?.data?.data || res?.data || (res && res.uuid ? res : null);
      if (storeData) {
        setStore(storeData);
        setFormData({
          name: storeData.name || '',
          description: storeData.description || '',
          phone: storeData.phone || '',
          whatsapp: storeData.whatsapp || '',
          location: storeData.location || '',
        });
        setLogoPreview(storeData.logo_url || '');
        setBannerPreview(storeData.banner_url || '');
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error Loading Settings',
        text: 'Failed to fetch store configuration.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStore();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key] || '');
      });
      if (logoFile) payload.append('logo', logoFile);
      if (bannerFile) payload.append('banner', bannerFile);

      await vendorService.updateMyStore(payload);
      Swal.fire({
        icon: 'success',
        title: 'Settings Saved',
        text: 'Your store configuration has been updated successfully.',
        timer: 2000,
        showConfirmButton: false,
      });
      loadStore();
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: err.response?.data?.message || 'Failed to save store settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="w-12 h-12 text-primary-500 animate-spin mb-4" />
        <p className="text-secondary-500 font-bold">Loading store settings...</p>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-20 bg-white dark:bg-secondary-900 rounded-3xl border border-secondary-200 dark:border-secondary-800 shadow-xl space-y-4">
        <Store className="w-16 h-16 text-secondary-400 mx-auto" />
        <h3 className="text-2xl font-black text-secondary-900 dark:text-white">Store Not Found</h3>
        <p className="text-secondary-500 max-w-sm mx-auto text-sm">
          We couldn't load your active store settings. Please ensure your vendor account is active.
        </p>
      </div>
    );
  }

  const permissions = store.permissions || {};
  const commissionRate = store.commission_rate ?? 5;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-secondary-900 dark:text-white flex items-center gap-3">
          <Store className="w-8 h-8 text-primary-500" /> Store Settings
        </h1>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
          Customize your storefront identity, manage contact details, and review your marketplace model permissions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Branding (Banner & Logo) */}
        <div className="bg-white dark:bg-secondary-900 rounded-3xl shadow-xl border border-secondary-200 dark:border-secondary-800 overflow-hidden">
          <div className="p-6 border-b border-secondary-200 dark:border-secondary-800">
            <h3 className="text-lg font-black text-secondary-900 dark:text-white">Store Branding</h3>
            <p className="text-xs text-secondary-500 mt-0.5">Upload a clean banner and brand logo for your public storefront.</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Banner Upload */}
            <div>
              <label className="block text-xs font-black text-secondary-700 dark:text-secondary-300 uppercase tracking-wider mb-2">
                Store Banner Image (Recommended: 1200x400)
              </label>
              <div 
                onClick={() => bannerInputRef.current?.click()}
                className="relative h-48 w-full rounded-2xl border-2 border-dashed border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800/50 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors overflow-hidden flex flex-col items-center justify-center cursor-pointer group"
              >
                {bannerPreview ? (
                  <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="text-center space-y-2 p-4">
                    <Upload className="w-8 h-8 text-secondary-400 mx-auto group-hover:text-primary-500 transition-colors" />
                    <p className="text-xs font-bold text-secondary-600 dark:text-secondary-400">Click to browse or upload banner</p>
                  </div>
                )}
                <input ref={bannerInputRef} type="file" accept="image/*" onChange={handleBannerChange} className="hidden" />
              </div>
            </div>

            {/* Logo Upload */}
            <div className="flex items-center gap-6">
              <div 
                onClick={() => logoInputRef.current?.click()}
                className="w-24 h-24 rounded-2xl border-2 border-dashed border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800/50 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors overflow-hidden flex items-center justify-center cursor-pointer shrink-0 relative group"
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="w-6 h-6 text-secondary-400 group-hover:text-primary-500 transition-colors" />
                )}
                <input ref={logoInputRef} type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </div>
              <div>
                <h4 className="text-sm font-black text-secondary-900 dark:text-white">Brand Logo</h4>
                <p className="text-xs text-secondary-500 max-w-sm mt-1">
                  Upload a square PNG or JPG (min 200x200px) representing your business icon or emblem.
                </p>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 text-xs font-bold text-secondary-800 dark:text-white transition-colors inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" /> Change Logo
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white dark:bg-secondary-900 rounded-3xl shadow-xl border border-secondary-200 dark:border-secondary-800 overflow-hidden">
          <div className="p-6 border-b border-secondary-200 dark:border-secondary-800">
            <h3 className="text-lg font-black text-secondary-900 dark:text-white">Store Identity & Contact</h3>
            <p className="text-xs text-secondary-500 mt-0.5">This information will be displayed to customers on your product pages.</p>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-secondary-700 dark:text-secondary-300 mb-1.5">
                Store Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Joejoe Electronics Hub"
                className="w-full px-4 py-3 rounded-xl bg-secondary-50 dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-700 dark:text-secondary-300 mb-1.5">
                Location / City *
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="text"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Accra, Ghana"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary-50 dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-700 dark:text-secondary-300 mb-1.5">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+233 24 123 4567"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary-50 dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-700 dark:text-secondary-300 mb-1.5">
                WhatsApp Contact (Optional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="+233 24 123 4567"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-secondary-50 dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-secondary-700 dark:text-secondary-300 mb-1.5">
                Store Description *
              </label>
              <textarea
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your products, warranty policies, and specialty offerings..."
                className="w-full px-4 py-3 rounded-xl bg-secondary-50 dark:bg-secondary-800 border border-secondary-300 dark:border-secondary-700 text-secondary-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-primary-500 transition-all resize-none"
              />
            </div>
          </div>
        </div>

        {/* Permissions & Commission Overview */}
        <div className="bg-gradient-to-br from-secondary-900 to-secondary-950 text-white rounded-3xl p-6 md:p-8 shadow-2xl border border-secondary-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-secondary-800 pb-6">
            <div>
              <span className="text-xs font-black text-primary-400 uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Marketplace Model Permissions
              </span>
              <h3 className="text-xl font-black text-white mt-1">Authorized Commerce Channels</h3>
              <p className="text-xs text-secondary-400 mt-1">
                These feature flags are controlled by the Shop Viotor administrator for your account.
              </p>
            </div>

            <div className="bg-secondary-800/60 px-5 py-3 rounded-2xl border border-secondary-700 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 text-primary-400 flex items-center justify-center">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-secondary-400">Store Commission</div>
                <div className="text-lg font-black text-white">{commissionRate}% <span className="text-xs font-normal text-secondary-400">per sale</span></div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className={`p-4 rounded-2xl border ${permissions.allow_layaway ? 'bg-primary-500/10 border-primary-500/30 text-primary-300' : 'bg-secondary-800/40 border-secondary-800 text-secondary-500'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider">Layaway</span>
                {permissions.allow_layaway ? <CheckCircle2 className="w-4 h-4 text-primary-400" /> : <Lock className="w-4 h-4" />}
              </div>
              <div className="text-sm font-bold">{permissions.allow_layaway ? 'Enabled' : 'Disabled'}</div>
            </div>

            <div className={`p-4 rounded-2xl border ${permissions.allow_hire_purchase ? 'bg-primary-500/10 border-primary-500/30 text-primary-300' : 'bg-secondary-800/40 border-secondary-800 text-secondary-500'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider">Hire Purchase</span>
                {permissions.allow_hire_purchase ? <CheckCircle2 className="w-4 h-4 text-primary-400" /> : <Lock className="w-4 h-4" />}
              </div>
              <div className="text-sm font-bold">{permissions.allow_hire_purchase ? 'Enabled' : 'Disabled'}</div>
            </div>

            <div className={`p-4 rounded-2xl border ${permissions.allow_barter ? 'bg-primary-500/10 border-primary-500/30 text-primary-300' : 'bg-secondary-800/40 border-secondary-800 text-secondary-500'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider">Barter Trade</span>
                {permissions.allow_barter ? <CheckCircle2 className="w-4 h-4 text-primary-400" /> : <Lock className="w-4 h-4" />}
              </div>
              <div className="text-sm font-bold">{permissions.allow_barter ? 'Enabled' : 'Disabled'}</div>
            </div>

            <div className={`p-4 rounded-2xl border ${permissions.allow_raffles ? 'bg-primary-500/10 border-primary-500/30 text-primary-300' : 'bg-secondary-800/40 border-secondary-800 text-secondary-500'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black uppercase tracking-wider">Raffles</span>
                {permissions.allow_raffles ? <CheckCircle2 className="w-4 h-4 text-primary-400" /> : <Lock className="w-4 h-4" />}
              </div>
              <div className="text-sm font-bold">{permissions.allow_raffles ? 'Enabled' : 'Disabled'}</div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-base shadow-xl shadow-primary-500/20 transition-all disabled:opacity-50 active:scale-95"
          >
            {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Store Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default VendorSettings;
