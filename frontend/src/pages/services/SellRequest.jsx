import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import sellRequestService from '../../services/sellRequestService';
import productService from '../../services/productService';
import { Upload, X, AlertCircle, RefreshCw, CheckCircle2, Package, Search, Eye, Send, Phone, Edit, Trash2 } from 'lucide-react';

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
  const [messages, setMessages] = useState([]);
  const [chatStatus, setChatStatus] = useState('open');
  const [msgBody, setMsgBody] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatEndRef = useRef(null);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm({
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
        alert('Request updated successfully!');
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
    setMessages([]);
    setChatStatus('open');
    try {
      const res = await sellRequestService.getMessages(req.id || req.uuid);
      setMessages(res.data?.data || []);
      setChatStatus(res.data?.chat_status || 'open');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!msgBody.trim() || !selectedRequest) return;
    setSendingMsg(true);
    try {
      const res = await sellRequestService.sendMessage(selectedRequest.id || selectedRequest.uuid, msgBody);
      setMessages(prev => [...prev, res.data?.data || res.data]);
      setMsgBody('');
    } catch (e) {
      alert('Failed to send message.');
    } finally {
      setSendingMsg(false);
    }
  };

  const handleDelete = async (uuid) => {
    if (!window.confirm('Are you sure you want to delete this pending request?')) return;
    try {
      await sellRequestService.deleteSell(uuid);
      setSelectedRequest(null);
      loadMyRequests();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to delete request.');
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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      <div>
        <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white">Sell to Viotor</h1>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Request a corporate buyout for your devices.</p>
      </div>

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
                  <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Category</label>
                  <select
                    {...register('category_id', { required: 'Category is required' })}
                    className="w-full mt-1.5 p-2.5 border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-lg text-sm"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id || cat.uuid} value={cat.id || cat.uuid}>{cat.name}</option>
                    ))}
                  </select>
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
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase text-xxs">
                  <th className="p-4">Item Name</th>
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
                          <img src={req.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg" />
                        ) : (
                          <div className="w-10 h-10 bg-secondary-100 rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-secondary-400" /></div>
                        )}
                        {req.item_name}
                      </div>
                    </td>
                    <td className="p-4 text-secondary-600 dark:text-secondary-400">{new Date(req.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}</td>
                    <td className="p-4">
                      <span className={`text-xxs px-2 py-0.5 rounded-full font-bold uppercase ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-primary-100 text-primary-800'}`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {req.offered_price ? `GHS ${parseFloat(req.offered_price).toLocaleString()}` : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => openRequest(req)} className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Detail & Chat Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl">
            
            {/* Left side: Request Details */}
            <div className="w-full md:w-1/2 flex flex-col border-r border-secondary-200 dark:border-secondary-800 bg-secondary-50 dark:bg-secondary-850/50">
              <div className="p-4 border-b border-secondary-200 dark:border-secondary-800 flex justify-between items-center bg-white dark:bg-secondary-900">
                <h3 className="font-bold text-lg text-secondary-900 dark:text-white">Request Details</h3>
                <button onClick={() => setSelectedRequest(null)} className="p-1 text-secondary-400 hover:text-secondary-600 md:hidden"><X className="w-5 h-5" /></button>
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
              </div>
            </div>

            {/* Right side: Chat */}
            <div className="w-full md:w-1/2 flex flex-col h-[60vh] md:h-auto bg-white dark:bg-secondary-900 relative">
              <button onClick={() => setSelectedRequest(null)} className="absolute top-4 right-4 p-1 text-secondary-400 hover:text-secondary-600 hidden md:block z-10 bg-white dark:bg-secondary-900 rounded-full shadow-sm"><X className="w-5 h-5" /></button>
              
              <div className="p-4 border-b border-secondary-200 dark:border-secondary-800 flex items-center justify-between bg-white dark:bg-secondary-900">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${chatStatus === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-secondary-300'}`}></span>
                  <h3 className="font-bold text-secondary-900 dark:text-white">Admin Chat & Feedback</h3>
                </div>
                {chatStatus === 'closed' && (
                  <span className="text-xs px-2 py-1 bg-secondary-100 dark:bg-secondary-800 text-secondary-500 rounded font-semibold uppercase">Chat Closed</span>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary-50/50 dark:bg-secondary-900/50">
                {messages.length === 0 ? (
                  <div className="text-center text-secondary-400 text-sm mt-10">
                    No messages yet. Ask a question or wait for an admin to review your item.
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.is_admin ? 'items-start' : 'items-end'}`}>
                      <div className="text-xxs text-secondary-400 mb-1 px-1">{msg.is_admin ? 'Viotor Support' : 'You'}</div>
                      <div className={`px-4 py-2 rounded-2xl max-w-[85%] text-sm ${msg.is_admin ? 'bg-secondary-200 dark:bg-secondary-800 text-secondary-900 dark:text-white rounded-tl-sm' : 'bg-primary-500 text-white rounded-tr-sm'}`}>
                        {msg.body}
                      </div>
                      <div className="text-[10px] text-secondary-400 mt-1 px-1">{new Date(msg.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
              
              <form onSubmit={handleSendMessage} className="p-3 border-t border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={msgBody}
                    onChange={(e) => setMsgBody(e.target.value)}
                    placeholder={chatStatus === 'closed' ? "This chat has been closed by an admin" : "Type a message..."}
                    disabled={chatStatus === 'closed'}
                    className="flex-1 p-2.5 bg-secondary-100 dark:bg-secondary-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none dark:text-white disabled:opacity-50"
                  />
                  <button type="submit" disabled={sendingMsg || !msgBody.trim() || chatStatus === 'closed'} className="p-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl disabled:opacity-50 transition-colors">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default SellRequest;
