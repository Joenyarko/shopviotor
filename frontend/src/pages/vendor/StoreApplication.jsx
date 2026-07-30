import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import vendorService from '../../services/vendorService';
import { Store, Upload, AlertCircle, RefreshCw, CheckCircle2, Phone, MapPin, X, ArrowRight } from 'lucide-react';

const StoreApplication = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [existingStore, setExistingStore] = useState(null);
  const [checkingStore, setCheckingStore] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    phone: '',
    whatsapp: '',
    location: '',
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerFiles, setBannerFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    vendorService.getMyStore()
      .then(res => {
        const storeData = res?.data?.data || res?.data || (res && res.uuid ? res : null);
        if (storeData) {
          setExistingStore(storeData);
          if (storeData.status === 'active' && user && user.role !== 'vendor' && user.role !== 'admin' && user.role !== 'super_admin') {
            updateUser({ ...user, role: 'vendor' });
          }
        }
      })
      .catch((err) => console.error("Error fetching my store:", err))
      .finally(() => setCheckingStore(false));
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleBannerChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setBannerFiles((prev) => [...prev, ...files]);
    }
  };

  const removeBanner = (index) => {
    setBannerFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setErrorMsg('Store name is required.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([k, v]) => v && data.append(k, v));
      if (logo) data.append('logo', logo);
      bannerFiles.forEach((file) => {
        data.append('banners[]', file);
      });

      await vendorService.applyForStore(data);
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStore) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <RefreshCw className="w-10 h-10 animate-spin text-primary-500 mx-auto" />
        <p className="text-secondary-500 dark:text-secondary-400 mt-4 font-semibold">Checking store status...</p>
      </div>
    );
  }

  if (existingStore) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-8 animate-in fade-in duration-500">
        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mx-auto shadow-2xl border ${
          existingStore.status === 'active' ? 'bg-primary-500/20 border-primary-400/30 text-primary-500' : 'bg-amber-500/20 border-amber-400/30 text-amber-500'
        }`}>
          <Store className="w-12 h-12" />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-100 dark:bg-secondary-800 text-xs font-black tracking-wider uppercase text-secondary-700 dark:text-secondary-300">
            {existingStore.status === 'active' ? '🎉 Approved Vendor Store' : '⏳ Application Under Review'}
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-secondary-900 dark:text-white">{existingStore.name}</h1>
          <p className="text-secondary-600 dark:text-secondary-400 max-w-lg mx-auto text-base leading-relaxed">
            {existingStore.status === 'active' 
              ? 'Congratulations! Your store is approved and active on Shop Viotor. You can now access your dedicated Vendor Hub to start listing and managing your products.'
              : 'You have already submitted an application for this store. Our admin team is currently reviewing your application. You will be able to access your Vendor Hub as soon as it is approved.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center pt-4">
          {existingStore.status === 'active' ? (
            <>
              <Link 
                to="/vendor" 
                className="px-8 py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-extrabold text-base flex items-center gap-2 shadow-xl hover:shadow-primary-500/20 transition-all active:scale-95"
              >
                <Store className="w-5 h-5" /> Go to Vendor Hub
              </Link>
              <a 
                href={`/shops/${existingStore.slug}`} 
                target="_blank" 
                rel="noreferrer"
                className="px-8 py-4 rounded-2xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-900 dark:text-white font-extrabold text-base flex items-center gap-2 transition-colors"
              >
                View Public Storefront
              </a>
            </>
          ) : (
            <>
              <button 
                onClick={() => window.location.reload()} 
                className="px-8 py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 text-secondary-900 font-extrabold text-base flex items-center gap-2 shadow-lg transition-all"
              >
                <RefreshCw className="w-5 h-5" /> Refresh Status
              </button>
              <Link 
                to="/dashboard" 
                className="px-8 py-4 rounded-2xl bg-secondary-100 dark:bg-secondary-800 hover:bg-secondary-200 dark:hover:bg-secondary-700 text-secondary-900 dark:text-white font-extrabold text-base transition-colors"
              >
                Back to Dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-primary-100 dark:bg-primary-950/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-primary-500" />
        </div>
        <h2 className="text-3xl font-black text-secondary-900 dark:text-white">Application Submitted! 🎉</h2>
        <p className="text-secondary-500 dark:text-secondary-400 max-w-md mx-auto text-lg">
          We've received your store application and will review it shortly. Once approved, you'll be able to start posting products!
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/dashboard" className="premium-button-primary px-6 py-2.5 rounded-xl text-sm font-bold">Go to Dashboard</Link>
          <Link to="/products" className="premium-button-secondary px-6 py-2.5 rounded-xl text-sm font-bold">Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 to-primary-700 text-secondary-900 p-10 md:p-12 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 backdrop-blur-sm w-fit">
            <Store className="w-4 h-4 text-secondary-900" />
            <span className="text-xs font-bold tracking-wider uppercase text-secondary-900">Become a Vendor</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black">Open Your Store on Viotor</h1>
          <p className="text-secondary-800 font-medium text-lg leading-relaxed max-w-xl">
            Reach thousands of customers. List your products, manage orders, and grow your business — all from one powerful dashboard.
          </p>
        </div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-white rounded-full blur-[120px] opacity-40" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
            <h2 className="text-xl font-bold text-secondary-900 dark:text-white">Store Application Form</h2>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 rounded-lg flex gap-2.5 text-sm border border-red-200/50">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Store Name */}
              <div>
                <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-1.5">Store Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John's Gadgets Hub"
                  className="w-full p-3 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-xl text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-1.5">Store Description</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell customers what you sell and what makes your store unique..."
                  className="w-full p-3 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-xl text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-1.5">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+233 XX XXX XXXX"
                    className="w-full p-3 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-xl text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-1.5">WhatsApp (optional)</label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="+233 XX XXX XXXX"
                    className="w-full p-3 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-xl text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-1.5">Store Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Accra, East Legon"
                  className="w-full p-3 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-xl text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
              </div>

              {/* Logo */}
              <div>
                <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">Store Logo</label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-secondary-200 dark:border-secondary-700">
                      <img src={logoPreview} alt="logo" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setLogo(null); setLogoPreview(null); }} className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-20 h-20 rounded-xl border-2 border-dashed border-secondary-300 dark:border-secondary-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:text-primary-500 text-secondary-400 transition-colors">
                      <Upload className="w-5 h-5" />
                      <span className="text-xxs mt-1">Logo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                    </label>
                  )}
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 max-w-[200px]">Square image recommended. Max 2MB.</p>
                </div>
              </div>

              {/* Banners */}
              <div>
                <label className="block text-sm font-bold text-secondary-700 dark:text-secondary-300 mb-2">Store Banners (Max 5)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {bannerFiles.map((file, index) => (
                    <div key={index} className="relative rounded-xl overflow-hidden border border-secondary-200 dark:border-secondary-700 h-32 group">
                      <img src={URL.createObjectURL(file)} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeBanner(index)} className="absolute top-2 right-2 bg-red-500/90 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center h-32 rounded-xl border-2 border-dashed border-secondary-300 dark:border-secondary-700 cursor-pointer hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950/10 text-secondary-400 hover:text-primary-500 transition-colors">
                    <Upload className="w-6 h-6 mb-2" />
                    <span className="text-sm font-medium">Add Banner</span>
                    <span className="text-xs mt-0.5 text-center px-2">Wide image (e.g. 1920×400). Max 4MB.</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleBannerChange} />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="premium-button-primary w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 transition-colors"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Submit Store Application'}
              </button>
            </form>
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white space-y-4">
            <h3 className="font-bold text-lg">Why Sell on Viotor?</h3>
            {[
              { emoji: '🌍', title: 'Wide Reach', desc: 'Access thousands of daily visitors across Ghana.' },
              { emoji: '📊', title: 'Vendor Dashboard', desc: 'Manage products, track orders and revenue in one place.' },
              { emoji: '💼', title: 'Free to Apply', desc: 'Zero subscription fees to get started. Just apply and get approved.' },
              { emoji: '🔒', title: 'Secure Payments', desc: 'All transactions handled securely through the platform.' },
            ].map(({ emoji, title, desc }) => (
              <div key={title} className="flex gap-3">
                <span className="text-xl">{emoji}</span>
                <div>
                  <p className="font-bold text-sm text-secondary-900">{title}</p>
                  <p className="text-secondary-800 text-xs mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-secondary-900 dark:text-white">What happens next?</h3>
            <ol className="space-y-2 text-sm text-secondary-600 dark:text-secondary-400">
              <li className="flex gap-2"><span className="font-bold text-primary-600">1.</span> Submit your application above.</li>
              <li className="flex gap-2"><span className="font-bold text-primary-600">2.</span> Our team reviews your store within 24-48 hours.</li>
              <li className="flex gap-2"><span className="font-bold text-primary-600">3.</span> Once approved, your vendor dashboard unlocks.</li>
              <li className="flex gap-2"><span className="font-bold text-primary-600">4.</span> Start listing and selling your products!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoreApplication;
export { StoreApplication };
