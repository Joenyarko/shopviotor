import Swal from 'sweetalert2';
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import sellRequestService from '../../services/sellRequestService';
import productService from '../../services/productService';
import { Upload, X, AlertCircle, RefreshCw, CheckCircle2, Package, Search, Eye, Send, Phone, Edit, Trash2 } from 'lucide-react';
import CategorySelector from '../../components/CategorySelector';
import HeroBanner from '../../components/marketing/HeroBanner';

const SellRequest = () => {
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' or 'my-requests'
  const [myRequests, setMyRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Submit Form State
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Detail/Edit Modal State
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm({
    defaultValues: {
      item_name: '',
      category_id: '',
      brand_id: '',
      contact_number: '',
      condition: '',
      asking_price: '',
      description: ''
    }
  });

  useEffect(() => {
    const fetchFormOptions = async () => {
      try {
        const [brandsRes, catsRes] = await Promise.all([
          productService.getBrands(),
          productService.getCategories()
        ]);
        setBrands(brandsRes.data || []);
        setCategories(catsRes.data?.data || catsRes.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchFormOptions();
  }, []);

  const loadMyRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await sellRequestService.getSells();
      setMyRequests(res.data?.data || res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'my-requests') {
      loadMyRequests();
    }
  }, [activeTab]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files].slice(0, 5));
  };

  const handleRemoveImage = (index) => {
    setImages(prev => prev.filter((_, idx) => idx !== index));
  };

  const onSubmit = async (data) => {
    if (!isEditing && images.length === 0) {
      setErrorMsg('Please upload at least one image of your item.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, val]) => {
        if (val) formData.append(key, val);
      });
      images.forEach((file) => formData.append('images[]', file));

      if (isEditing) {
        formData.append('_method', 'PUT'); // Laravel form method spoofing
        await sellRequestService.updateSell(selectedRequest.id || selectedRequest.uuid, formData);
        Swal.fire({ text: String('Request updated successfully!') });
        setIsEditing(false);
        setSelectedRequest(null);
        loadMyRequests();
      } else {
        await sellRequestService.submitSell(formData);
        setSuccess(true);
        reset();
        setImages([]);
      }
    } catch (e) {
      console.error(e);
      if (e.response?.status === 422) {
        const errs = e.response.data.errors;
        const msg = Object.values(errs).flat().join('\n');
        setErrorMsg('Validation Error:\n' + msg);
      } else {
        setErrorMsg(e.response?.data?.message || e.message || 'Failed to submit request.');
      }
    } finally {
      setLoading(false);
    }
  };

  const openRequest = async (req) => {
    setSelectedRequest(req);
  };

  const handleAccept = async (req) => {
    const __confirmResult = await Swal.fire({ title: 'Proceed to WhatsApp?', text: 'You are being directed to WhatsApp to proceed with the deal. Proceed?', icon: 'info', showCancelButton: true });
    if (!__confirmResult.isConfirmed) return;
    try {
      await sellRequestService.acceptOffer(req.id || req.uuid);
      setSelectedRequest(prev => ({ ...prev, status: 'accepted' }));
      loadMyRequests();
      
      const adminWhatsApp = '+233541234567'; // Placeholder, replace with actual
      const message = `Hi, I accept your buyout offer of GHS ${req.offered_price} for my ${req.item_name}. Let's proceed.`;
      window.open(`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`, '_blank');
    } catch (e) {
      Swal.fire({ text: 'Failed to accept offer.' });
    }
  };

  const handleReject = async (req) => {
    const __confirmResult = await Swal.fire({ title: 'Are you sure?', text: 'Are you sure you want to reject this offer? The deal will be closed.', icon: 'warning', showCancelButton: true });
    if (!__confirmResult.isConfirmed) return;
    try {
      await sellRequestService.rejectOffer(req.id || req.uuid);
      setSelectedRequest(prev => ({ ...prev, status: 'rejected' }));
      loadMyRequests();
      Swal.fire({ text: 'Offer rejected.', icon: 'success' });
    } catch (e) {
      Swal.fire({ text: 'Failed to reject offer.' });
    }
  };

  const handleCounter = async (req) => {
    const __confirmResult = await Swal.fire({ title: 'Proceed to WhatsApp?', text: 'You are being directed to WhatsApp to proceed with the deal. Proceed?', icon: 'info', showCancelButton: true });
    if (!__confirmResult.isConfirmed) return;
    const adminWhatsApp = '+233541234567'; // Placeholder, replace with actual
    const message = `Hi, regarding your buyout offer of GHS ${req.offered_price} for my ${req.item_name}, I would like to counter with...`;
    window.open(`https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleDelete = async (uuid) => {
    const __confirmResult = await Swal.fire({ title: 'Are you sure?', text: 'Are you sure you want to delete this pending request?', icon: 'warning', showCancelButton: true });
    if (!__confirmResult.isConfirmed) return;
    try {
      await sellRequestService.deleteSell(uuid);
      setSelectedRequest(null);
      loadMyRequests();
    } catch (e) {
      Swal.fire({ text: String(e.response?.data?.message || 'Failed to delete request.') });
    }
  };

  const startEdit = (req) => {
    reset({
      item_name: req.item_name,
      category_id: req.category?.id || '',
      brand_id: req.brand?.id || '',
      contact_number: req.contact_number || '',
      condition: req.condition,
      asking_price: req.asking_price,
      description: req.description
    });
    setImages([]);
    setIsEditing(true);
    setSelectedRequest(req);
    setActiveTab('submit');
  };



  const category_id = watch('category_id');

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      <HeroBanner position="trade_hero" fallbackContent={
        <div>
          <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white">Sell to Viotor</h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Request a corporate buyout for your devices.</p>
        </div>
      } />

      <div className="flex border-b border-secondary-200 dark:border-secondary-800 gap-6">
        <button
          onClick={() => { setActiveTab('submit'); setIsEditing(false); reset(); }}
          className={`pb-3 font-semibold text-sm transition-colors ${activeTab === 'submit' && !isEditing ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300'}`}
        >
          Submit New Item
        </button>
        <button
          onClick={() => setActiveTab('my-requests')}
          className={`pb-3 font-semibold text-sm transition-colors ${activeTab === 'my-requests' ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-400' : 'text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300'}`}
        >
          My Requests
        </button>
      </div>

      {activeTab === 'submit' && (
        <>
          {success && !isEditing ? (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-8 text-center space-y-4 shadow-sm">
              <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Request Submitted!</h2>
              <p className="text-sm text-secondary-500 dark:text-secondary-400 max-w-sm mx-auto">
                Our team will inspect your submission and offer a quote shortly. Check "My Requests" for updates.
              </p>
              <button onClick={() => setSuccess(false)} className="premium-button-primary px-6 rounded-lg text-sm">
                Submit Another Item
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
              
              <h2 className="text-xl font-bold text-secondary-900 dark:text-white mb-2">
                {isEditing ? 'Edit Pending Request' : 'Item Details'}
              </h2>

              {errorMsg && (
                <div className="p-3 bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 rounded-lg flex items-start gap-2.5 text-sm border border-accent-200/50">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span className="whitespace-pre-line">{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Item Name</label>
                  <input
                    type="text"
                    {...register('item_name', { required: 'Item name is required' })}
                    placeholder="e.g. iPhone 15 Pro Max"
                    className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
                  />
                  {errors.item_name && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.item_name.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Contact Number</label>
                  <input
                    type="text"
                    {...register('contact_number', { required: 'Contact number is required' })}
                    placeholder="e.g. 0541234567"
                    className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
                  />
                  {errors.contact_number && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.contact_number.message}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 mb-1.5">Category</label>
                  <CategorySelector 
                    categories={categories}
                    value={category_id}
                    onChange={(v) => setValue('category_id', v, { shouldValidate: true })}
                    required={true}
                  />
                  {/* Hidden input for react-hook-form validation to hook into */}
                  <input type="hidden" {...register('category_id', { required: 'Category is required' })} />
                  {errors.category_id && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.category_id.message}</span>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Brand (optional)</label>
                  <select
                    {...register('brand_id')}
                    className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
                  >
                    <option value="">Select Brand</option>
                    {brands.map(b => (
                      <option key={b.id || b.uuid} value={b.id || b.uuid}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Condition</label>
                  <select
                    {...register('condition', { required: 'Condition is required' })}
                    className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
                  >
                    <option value="">Select Condition</option>
                    <option value="new">New / Boxed</option>
                    <option value="used">Used / Minimal Scratches</option>
                    <option value="refurbished">Refurbished</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Asking Price (GHS)</label>
                  <input
                    type="number"
                    {...register('asking_price', { required: 'Asking price is required' })}
                    placeholder="2500"
                    className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Item Description</label>
                <textarea
                  rows={3}
                  {...register('description', { required: 'Description is required' })}
                  placeholder="Detail your item's defects, accessories included..."
                  className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                  {isEditing ? 'Upload New Pictures (Leave empty to keep existing)' : 'Item Pictures (Max 5)'}
                </label>
                <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square border rounded-xl overflow-hidden bg-secondary-50">
                      <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <label className="aspect-square border border-dashed border-secondary-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-secondary-50/50">
                      <Upload className="w-6 h-6 text-secondary-400" />
                      <span className="text-xxs text-secondary-500 mt-1.5">Upload</span>
                      <input type="file" multiple accept="image/*" onChange={handleImageChange} className="sr-only" />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <button type="submit" disabled={loading} className="flex-1 premium-button-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : (isEditing ? 'Save Changes' : 'Submit Item')}
                </button>
                {isEditing && (
                  <button type="button" onClick={() => { setIsEditing(false); reset(); }} className="px-6 py-3 border border-secondary-300 rounded-xl font-bold text-secondary-700 hover:bg-secondary-50">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          )}
        </>
      )}

      {activeTab === 'my-requests' && (
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl shadow-sm overflow-hidden">
          {loadingRequests ? (
            <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
          ) : myRequests.length === 0 ? (
            <div className="p-12 text-center text-secondary-500 font-semibold">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
              You haven't submitted any items yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[650px]">
                <thead>
                  <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase text-xxs whitespace-nowrap">
                    <th className="p-4 min-w-[250px]">Item Name</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Offer</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                  {myRequests.map((req) => (
                    <tr key={req.id || req.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                      <td className="p-4 font-semibold text-secondary-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          {req.images && req.images.length > 0 ? (
                            <img src={req.images[0]} alt="" className="w-10 h-10 min-w-[40px] object-cover rounded-lg" />
                          ) : (
                            <div className="w-10 h-10 min-w-[40px] bg-secondary-100 rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-secondary-400" /></div>
                          )}
                          <span className="line-clamp-2">{req.item_name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-secondary-600 dark:text-secondary-400 whitespace-nowrap">{new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
                      <td className="p-4 whitespace-nowrap">
                        <span className={`text-xxs px-2 py-0.5 rounded-full font-bold uppercase ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-primary-100 text-primary-800'}`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {req.offered_price ? `GHS ${parseFloat(req.offered_price).toLocaleString()}` : '-'}
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-1 whitespace-nowrap">
                        <button onClick={() => openRequest(req)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg" title="View details"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(req.id || req.uuid)} className="p-1.5 text-accent-600 hover:bg-accent-50 rounded-lg" title="Delete request"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Detail & Chat Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl relative">
            <button onClick={() => setSelectedRequest(null)} className="absolute top-4 right-4 p-2 text-secondary-400 hover:text-secondary-600 z-10 bg-secondary-100 dark:bg-secondary-800 rounded-full shadow-sm hover:bg-secondary-200"><X className="w-5 h-5" /></button>
            
            <div className="w-full flex flex-col bg-secondary-50 dark:bg-secondary-850/50">
              <div className="p-4 border-b border-secondary-200 dark:border-secondary-800 flex justify-between items-center bg-white dark:bg-secondary-900 pr-12">
                <h3 className="font-bold text-lg text-secondary-900 dark:text-white">Request Details</h3>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-secondary-900 dark:text-white">{selectedRequest.item_name}</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded bg-secondary-200 dark:bg-secondary-700 font-semibold">{selectedRequest.condition}</span>
                    <span className="text-xs px-2 py-1 rounded bg-secondary-200 dark:bg-secondary-700 font-semibold">{selectedRequest.category?.name}</span>
                    <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 font-bold uppercase">{selectedRequest.status}</span>
                  </div>
                </div>

                {selectedRequest.contact_number && (
                  <div className="flex items-center gap-2 text-sm text-secondary-700 dark:text-secondary-300">
                    <Phone className="w-4 h-4 text-primary-500" /> {selectedRequest.contact_number}
                  </div>
                )}

                <div>
                  <span className="text-xs text-secondary-500 uppercase font-bold">Asking Price</span>
                  <div className="text-lg font-extrabold text-secondary-900 dark:text-white">GHS {parseFloat(selectedRequest.asking_price).toLocaleString()}</div>
                </div>

                {selectedRequest.offered_price && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 rounded-xl">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-bold">Viotor Buyout Offer</span>
                    <div className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">GHS {parseFloat(selectedRequest.offered_price).toLocaleString()}</div>
                  </div>
                )}

                <div>
                  <span className="text-xs text-secondary-500 uppercase font-bold block mb-1">Description</span>
                  <p className="text-sm text-secondary-700 dark:text-secondary-300 leading-relaxed">{selectedRequest.description}</p>
                </div>

                {selectedRequest.images && selectedRequest.images.length > 0 && (
                  <div>
                    <span className="text-xs text-secondary-500 uppercase font-bold block mb-2">Images</span>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedRequest.images.map((img, idx) => (
                        <a key={idx} href={img} target="_blank" rel="noreferrer" className="block aspect-square rounded-lg overflow-hidden border border-secondary-200">
                          <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {selectedRequest.status === 'pending' && (
                  <div className="flex gap-2 pt-4 border-t border-secondary-200 dark:border-secondary-800">
                    <button onClick={() => startEdit(selectedRequest)} className="flex-1 py-2 bg-secondary-200 dark:bg-secondary-800 text-secondary-800 dark:text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => handleDelete(selectedRequest.id || selectedRequest.uuid)} className="flex-1 py-2 bg-accent-100 text-accent-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-accent-200">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                )}
                {selectedRequest.status === 'approved' && (
                  <div className="pt-6 mt-4 border-t border-secondary-200 dark:border-secondary-800">
                    <h4 className="font-bold text-secondary-900 dark:text-white mb-3">Decision</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button onClick={() => handleAccept(selectedRequest)} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold transition-colors">
                        Accept Offer
                      </button>
                      <button onClick={() => handleCounter(selectedRequest)} className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-bold transition-colors">
                        Counter Offer
                      </button>
                      <button onClick={() => handleReject(selectedRequest)} className="flex-1 py-3 bg-accent-100 text-accent-700 hover:bg-accent-200 rounded-lg font-bold transition-colors">
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default SellRequest;
