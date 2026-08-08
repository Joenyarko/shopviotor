import Swal from 'sweetalert2';
import React, { useEffect, useState, useRef } from 'react';
import raffleService from '../../services/raffleService';
import productService from '../../services/productService';
import {
  Plus, Edit2, Trash2, RefreshCw, X, Play, Trophy,
  Ticket, Users, Eye, AlertCircle, Image as ImageIcon,
  Calendar, ChevronDown, CheckCircle, Upload, Search
} from 'lucide-react';
import DotPagination from '../../components/DotPagination';

const STATUS_OPTIONS = ['active', 'draft', 'closed', 'completed'];

const AdminRaffles = () => {
  const [tab, setTab] = useState('raffles'); // 'raffles' | 'winners'
  const [raffles, setRaffles] = useState([]);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingWinners, setLoadingWinners] = useState(false);
  const [drawing, setDrawing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRaffle, setEditingRaffle] = useState(null);
  const [holdersRaffle, setHoldersRaffle] = useState(null);
  const [holders, setHolders] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [winPage, setWinPage] = useState(1);
  const itemsPerPage = 8;
  
  const filteredRaffles = raffles.filter(r => 
    (r.title?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredRaffles.length / itemsPerPage);
  const paginatedRaffles = filteredRaffles.slice((page - 1) * itemsPerPage, page * itemsPerPage);
  const totalWinPages = Math.ceil(winners.length / itemsPerPage);
  const paginatedWinners = winners.slice((winPage - 1) * itemsPerPage, winPage * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const fileInputRef = useRef(null);

  // Form states
  const [productId, setProductId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [category, setCategory] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [maxTickets, setMaxTickets] = useState('');
  const [drawDate, setDrawDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('active');
  const [prizeValue, setPrizeValue] = useState('');
  const [maxPerUser, setMaxPerUser] = useState('');
  const [isSponsored, setIsSponsored] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(true);

  const [imageUrl, setImageUrl] = useState('');

  const loadRaffles = async () => {
    setLoading(true);
    try {
      const res = await raffleService.adminGetRaffles();
      setRaffles(res.data?.data?.data || res.data?.data || res.data || MOCK_RAFFLES);
    } catch { setRaffles(MOCK_RAFFLES); } finally { setLoading(false); }
  };

  const loadWinners = async () => {
    setLoadingWinners(true);
    try {
      const res = await raffleService.adminGetWinners();
      setWinners(res.data?.data?.data || res.data?.data || res.data || MOCK_WINNERS);
    } catch { setWinners(MOCK_WINNERS); } finally { setLoadingWinners(false); }
  };

  const loadProducts = async () => {
    try {
      const res = await productService.adminGetProducts();
      setProducts(res.data?.data?.data || res.data?.data || res.data || []);
      const catRes = await productService.getCategories();
      setCategories(catRes.data?.data?.data || catRes.data?.data || catRes.data || []);
    } catch (e) {
      console.error('Failed to load products or categories', e);
    }
  };

  useEffect(() => { loadRaffles(); loadProducts(); }, []);
  useEffect(() => { if (tab === 'winners') loadWinners(); }, [tab]);

  const handleProductChange = (e) => {
    const selectedId = e.target.value;
    setProductId(selectedId);
    if (selectedId) {
      const product = products.find(p => p.id === parseInt(selectedId) || p.id === selectedId);
      if (product) {
        setPrizeValue(product.price || product.base_price || '');
        const pImage = (product.images && product.images[0]?.url) || product.image_url || product.image;
        if (pImage) {
          setImageUrl(pImage);
          setImagePreview(pImage);
        }
      }
    }
  };

  const resetForm = () => {
    setProductId(''); setTitle(''); setDescription(''); setCategory('');
    setImageFile(null); setImagePreview(null); setImageUrl('');
    setTicketPrice(''); setMaxTickets(''); setDrawDate(''); setEndDate(''); setStatus('active');
    setPrizeValue(''); setMaxPerUser(''); setIsSponsored(false); setAllowMultiple(true);
    setErrorMsg('');
  };

  const handleOpenCreate = () => {
    setEditingRaffle(null);
    resetForm();
    setModalOpen(true);
  };

  const handleOpenEdit = (r) => {
    setEditingRaffle(r);
    setProductId(r.product_id || '');
    setTitle(r.title || '');
    setDescription(r.description || '');
    setImagePreview(r.image || null);
    setImageUrl(r.image || '');
    setImageFile(null);
    setCategory(r.category || '');
    setTicketPrice(r.ticket_price || '');
    setMaxTickets(r.max_tickets || '');
    setDrawDate(r.drawn_at ? r.drawn_at.slice(0, 16) : '');
    setEndDate(r.ends_at ? r.ends_at.slice(0, 16) : '');
    setStatus(r.status || 'active');
    setPrizeValue(r.prize_value || '');
    setMaxPerUser(r.max_per_user || '');
    setIsSponsored(!!r.is_sponsored);
    setAllowMultiple(r.allow_multiple !== false);
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleDelete = async (uuid) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Delete this raffle? This will also remove all associated tickets.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#3b82f6',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!result.isConfirmed) return;
    try {
      await raffleService.adminDeleteRaffle(uuid);
      setRaffles(prev => prev.filter(r => r.uuid !== uuid));
      Swal.fire('Deleted!', 'Raffle has been deleted.', 'success');
    } catch (e) { Swal.fire('Error', e.response?.data?.message || e.message || 'Failed to delete.', 'error'); }
  };

  const handleDraw = async (uuid) => {
    const result = await Swal.fire({
      title: 'Execute Draw?',
      text: "A winner will be selected randomly from ticket holders.",
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Draw Winner'
    });
    if (!result.isConfirmed) return;
    setDrawing(uuid);
    try {
      const res = await raffleService.adminDrawWinner(uuid);
      Swal.fire('Winner Drawn!', res.data?.message || 'A winner has been successfully drawn.', 'success');
      loadRaffles();
      if (tab === 'winners') loadWinners();
    } catch (e) { Swal.fire('Draw Failed', e.response?.data?.message || e.message || 'Draw failed.', 'error'); } finally { setDrawing(null); }
  };

  const handleViewHolders = async (raffle) => {
    setHoldersRaffle(raffle);
    setHolders([]);
    try {
      const res = await raffleService.adminGetTicketHolders(raffle.uuid);
      setHolders(res.data?.data || res.data || []);
    } catch { setHolders([]); }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageUrl(''); // Reset imageUrl since we have a new file
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    const payload = new FormData();
    if (productId) payload.append('product_id', productId);
    payload.append('title', title);
    if (description) payload.append('description', description);
    if (category) payload.append('category', category);
    payload.append('ticket_price', ticketPrice);
    if (maxTickets) payload.append('max_tickets', maxTickets);
    if (drawDate) payload.append('drawn_at', drawDate);
    if (endDate) payload.append('ends_at', endDate);
    payload.append('status', status);
    if (prizeValue) payload.append('prize_value', prizeValue);
    if (maxPerUser) payload.append('max_per_user', maxPerUser);
    payload.append('is_sponsored', isSponsored ? '1' : '0');
    payload.append('allow_multiple', allowMultiple ? '1' : '0');
    if (imageFile) {
      payload.append('image', imageFile);
    } else if (imageUrl) {
      payload.append('image', imageUrl);
    }

    try {
      if (editingRaffle) {
        await raffleService.adminUpdateRaffle(editingRaffle.uuid, payload);
        Swal.fire({ icon: 'success', title: 'Updated!', text: 'Raffle has been updated successfully.', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      } else {
        await raffleService.adminCreateRaffle(payload);
        Swal.fire({ icon: 'success', title: 'Created!', text: 'Raffle has been created successfully.', toast: true, position: 'top-end', showConfirmButton: false, timer: 3000 });
      }
      setModalOpen(false);
      resetForm();
      loadRaffles();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to save raffle.');
    } finally { setSubmitting(false); }
  };

  const inputClass = "w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";
  const labelClass = "block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wide mb-1.5";

  const getStatusColor = (s) => {
    switch (s) {
      case 'active': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400';
      case 'draft': return 'bg-secondary-100 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-400';
      case 'closed': return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400';
      case 'completed': return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400';
      default: return 'bg-secondary-100 text-secondary-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Raffles Management</h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Create, configure, and draw prize raffles.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {tab === 'raffles' && (
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-secondary-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white placeholder-secondary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                placeholder="Search raffles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          <button onClick={handleOpenCreate} className="premium-button-primary px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow whitespace-nowrap">
            <Plus className="w-4 h-4" /> Create Raffle
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-secondary-200 dark:border-secondary-800">
        {[
          { key: 'raffles', label: 'All Raffles', icon: Ticket },
          { key: 'winners', label: 'Winners History', icon: Trophy },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key} onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === key ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-secondary-500 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300'}`}
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>

      {/* ── RAFFLES TABLE ── */}
      {tab === 'raffles' && (
        loading ? (
          <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
        ) : (
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-x-auto shadow-sm [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 dark:text-secondary-400 font-bold uppercase tracking-wider text-xs">
                  <th className="p-4">Raffle</th>
                  <th className="p-4">Ticket Price</th>
                  <th className="p-4">Tickets</th>
                  <th className="p-4">Draw Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                  {paginatedRaffles.map((r) => {
                    const progress = r.max_tickets ? Math.min(((r.tickets_sold || 0) / r.max_tickets) * 100, 100) : 0;
                    return (
                      <tr key={r.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary-100 dark:bg-secondary-800 flex-shrink-0">
                              {r.image
                                ? <img src={r.image} alt={r.title} className="w-full h-full object-cover" />
                                : <ImageIcon className="w-6 h-6 text-secondary-400 m-3" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-secondary-900 dark:text-white line-clamp-1">{r.title}</p>
                              {r.category && <p className="text-xxs text-secondary-500 dark:text-secondary-400 mt-0.5">{r.category}</p>}
                              {/* Mini progress */}
                              <div className="w-24 h-1.5 bg-secondary-200 dark:bg-secondary-700 rounded-full mt-1.5 overflow-hidden">
                                <div className="h-full bg-primary-500 rounded-full" style={{ width: `${progress}%` }} />
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-secondary-900 dark:text-white hidden sm:table-cell">GHS {parseFloat(r.ticket_price || 0).toFixed(2)}</td>
                        <td className="p-4 text-secondary-600 dark:text-secondary-300 hidden md:table-cell">{r.tickets_sold || 0} / {r.max_tickets || '∞'}</td>
                        <td className="p-4 text-secondary-500 dark:text-secondary-400 hidden lg:table-cell">
                          {r.drawn_at ? new Date(r.drawn_at).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-4">
                          <span className={`text-xxs px-2.5 py-0.5 rounded-full font-bold uppercase ${getStatusColor(r.status)}`}>{r.status}</span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5 flex-wrap">
                            <button onClick={() => handleViewHolders(r)} title="View ticket holders" className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-lg">
                              <Users className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleOpenEdit(r)} className="p-1.5 text-secondary-600 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {(r.status === 'closed' || r.status === 'active') && r.tickets_sold > 0 && (
                              <button
                                onClick={() => handleDraw(r.uuid)}
                                disabled={drawing === r.uuid}
                                title="Draw winner"
                                className="p-1.5 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg"
                              >
                                {drawing === r.uuid ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                              </button>
                            )}
                            <button onClick={() => handleDelete(r.uuid)} className="p-1.5 text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-950/20 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <DotPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
        )
      )}

      {/* ── WINNERS TABLE ── */}
      {tab === 'winners' && (
        loadingWinners ? (
          <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
        ) : (
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-x-auto shadow-sm [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead>
                <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 dark:text-secondary-400 font-bold uppercase tracking-wider text-xs">
                  <th className="p-4">Winner</th>
                  <th className="p-4">Raffle</th>
                  <th className="p-4">Ticket #</th>
                  <th className="p-4">Prize Value</th>
                  <th className="p-4">Draw Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                {paginatedWinners.map((w, i) => (
                  <tr key={w.id || i} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-amber-500 flex items-center justify-center flex-shrink-0">
                          <Trophy className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-semibold text-secondary-900 dark:text-white">{w.user_name || w.user?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-secondary-600 dark:text-secondary-300 hidden sm:table-cell line-clamp-1">{w.raffle_title || w.raffle?.title || '—'}</td>
                    <td className="p-4 font-mono text-xxs text-secondary-500 dark:text-secondary-400 hidden md:table-cell">{w.ticket_number || '—'}</td>
                    <td className="p-4 font-bold text-secondary-900 dark:text-white hidden lg:table-cell">
                      {w.prize_value ? `GHS ${parseFloat(w.prize_value).toLocaleString()}` : '—'}
                    </td>
                    <td className="p-4 text-secondary-600 dark:text-secondary-300">
                      {w.draw_date ? new Date(w.draw_date).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <DotPagination currentPage={winPage} totalPages={totalWinPages} onPageChange={setWinPage} />
          </div>
        )
      )}

      {/* ── CREATE/EDIT MODAL ── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-10 bg-secondary-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl w-full max-w-2xl shadow-2xl">
            <div className="p-5 border-b border-secondary-200 dark:border-secondary-800 flex justify-between items-center sticky top-0 bg-white dark:bg-secondary-900 z-10 rounded-t-2xl">
              <h3 className="font-bold text-secondary-900 dark:text-white text-lg">{editingRaffle ? 'Edit Raffle' : 'Create New Raffle'}</h3>
              <button onClick={() => { setModalOpen(false); resetForm(); }} className="p-1 rounded-md hover:bg-secondary-200 dark:hover:bg-secondary-800 text-secondary-500 dark:text-secondary-400"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 rounded-lg flex items-start gap-2 text-sm border border-accent-200/50">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" /><span>{errorMsg}</span>
                </div>
              )}

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wide">Link Product (Optional)</label>
                    </div>
                    <select 
                      value={productId} 
                      onChange={handleProductChange} 
                      className={inputClass}
                    >
                      <option value="">-- No Product Linked --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                <div>
                  <label className={labelClass}>Raffle Title *</label>
                  <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className={inputClass} placeholder="e.g. iPhone 17 Pro Max Raffle" />
                </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className={inputClass} placeholder="Tell participants about the prize..." />
              </div>
              <div>
                <label className={labelClass}>Prize Image</label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-secondary-200">
                      <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="absolute top-1 right-1 bg-accent-500 text-white rounded-full p-1 shadow hover:bg-accent-600"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-lg border-2 border-dashed border-secondary-300 dark:border-secondary-700 flex flex-col items-center justify-center text-secondary-400 hover:border-primary-500 hover:text-primary-500 transition-colors">
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-xs font-medium">Upload</span>
                    </button>
                  )}
                  <p className="text-xs text-secondary-500 max-w-[200px]">Upload a clear photo of the prize.</p>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id || c.uuid} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Prize Value (GHS)</label>
                  <input type="number" min="0" step="0.01" value={prizeValue} onChange={e => setPrizeValue(e.target.value)} className={inputClass} placeholder="e.g. 25000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Ticket Price (GHS) *</label>
                  <input type="number" required min="0.01" step="0.01" value={ticketPrice} onChange={e => setTicketPrice(e.target.value)} className={inputClass} placeholder="e.g. 5.00" />
                </div>
                <div>
                  <label className={labelClass}>Max Tickets *</label>
                  <input type="number" required min="1" value={maxTickets} onChange={e => setMaxTickets(e.target.value)} className={inputClass} placeholder="e.g. 1000" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Draw Date & Time *</label>
                  <input type="datetime-local" required value={drawDate} onChange={e => setDrawDate(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>End Date & Time</label>
                  <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className={inputClass}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Max Tickets Per User</label>
                  <input type="number" min="1" value={maxPerUser} onChange={e => setMaxPerUser(e.target.value)} className={inputClass} placeholder="Unlimited" />
                </div>
                <div className="flex flex-col gap-3 pt-5">
                  {[
                    { label: 'Allow Multiple Tickets', val: allowMultiple, set: setAllowMultiple },
                    { label: 'Sponsored Raffle', val: isSponsored, set: setIsSponsored },
                  ].map(({ label, val, set }) => (
                    <label key={label} className="flex items-center gap-2 text-sm text-secondary-700 dark:text-secondary-200 cursor-pointer">
                      <div onClick={() => set(!val)} className={`w-10 h-5 rounded-full transition-colors flex items-center ${val ? 'bg-primary-500' : 'bg-secondary-300 dark:bg-secondary-700'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${val ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </div>
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setModalOpen(false); resetForm(); }} className="flex-1 py-2.5 border border-secondary-300 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 rounded-xl font-semibold text-sm hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="flex-[2] premium-button-primary py-2.5 rounded-xl font-bold flex items-center justify-center gap-2">
                  {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : (editingRaffle ? '💾 Save Changes' : '🎫 Create Raffle')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TICKET HOLDERS PANEL ── */}
      {holdersRaffle && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-secondary-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-secondary-900 border-l border-secondary-200 dark:border-secondary-800 w-full max-w-md h-full overflow-y-auto shadow-2xl">
            <div className="p-5 border-b border-secondary-200 dark:border-secondary-800 flex justify-between items-center sticky top-0 bg-white dark:bg-secondary-900 z-10">
              <div>
                <h3 className="font-bold text-secondary-900 dark:text-white">Ticket Holders</h3>
                <p className="text-xs text-secondary-500 dark:text-secondary-400 line-clamp-1">{holdersRaffle.title}</p>
              </div>
              <button onClick={() => setHoldersRaffle(null)} className="p-1 rounded-md hover:bg-secondary-200 dark:hover:bg-secondary-800 text-secondary-500 dark:text-secondary-400"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-3">
              {holders.length === 0 ? (
                <p className="text-center text-secondary-400 text-sm py-8">No ticket holders yet.</p>
              ) : (
                holders.map((h, i) => (
                  <div key={h.id || i} className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800 rounded-xl">
                    <div>
                      <p className="font-semibold text-secondary-900 dark:text-white text-sm">{h.user_name || h.user?.name || 'Anonymous'}</p>
                      <p className="text-xxs font-mono text-secondary-400">{h.ticket_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-secondary-900 dark:text-white">{h.quantity}× ticket{h.quantity > 1 ? 's' : ''}</p>
                      <p className="text-xxs text-secondary-500 dark:text-secondary-400">GHS {parseFloat(h.amount_paid || 0).toFixed(2)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock data fallback
const MOCK_RAFFLES = [
  { uuid: 'raf1', title: 'iPhone 17 Pro Max Raffle', category: 'Smartphones', ticket_price: 10, tickets_sold: 153, max_tickets: 1000, draw_date: new Date(Date.now() + 4 * 86400000).toISOString(), status: 'active', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=120&auto=format&fit=crop&q=60' },
  { uuid: 'raf2', title: 'MacBook Pro M4 Raffle', category: 'Laptops', ticket_price: 25, tickets_sold: 200, max_tickets: 200, draw_date: new Date(Date.now() - 86400000).toISOString(), status: 'closed', image: null },
];

const MOCK_WINNERS = [
  { id: 1, user_name: 'Anthony Adjege', raffle_title: 'iPhone 17 Pro Max', ticket_number: 'TKT-0042', prize_value: 25000, draw_date: '2025-02-28' },
  { id: 2, user_name: 'appalling843', raffle_title: 'Samsung / TCL 55" Smart TV', ticket_number: 'TKT-0017', prize_value: 8000, draw_date: '2025-06-14' },
];

export default AdminRaffles;
export { AdminRaffles };
