import React, { useEffect, useState } from 'react';
import raffleService from '../../services/raffleService';
import {
  Plus, Edit2, Trash2, RefreshCw, X, Play, Trophy,
  Ticket, Users, Eye, AlertCircle, Image as ImageIcon,
  Calendar, ChevronDown, CheckCircle
} from 'lucide-react';

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

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');
  const [maxTickets, setMaxTickets] = useState('');
  const [drawDate, setDrawDate] = useState('');
  const [status, setStatus] = useState('active');
  const [prizeValue, setPrizeValue] = useState('');
  const [maxPerUser, setMaxPerUser] = useState('');
  const [isSponsored, setIsSponsored] = useState(false);
  const [allowMultiple, setAllowMultiple] = useState(true);

  const loadRaffles = async () => {
    setLoading(true);
    try {
      const res = await raffleService.adminGetRaffles();
      setRaffles(res.data?.data || res.data || MOCK_RAFFLES);
    } catch { setRaffles(MOCK_RAFFLES); } finally { setLoading(false); }
  };

  const loadWinners = async () => {
    setLoadingWinners(true);
    try {
      const res = await raffleService.adminGetWinners();
      setWinners(res.data?.data || res.data || MOCK_WINNERS);
    } catch { setWinners(MOCK_WINNERS); } finally { setLoadingWinners(false); }
  };

  useEffect(() => { loadRaffles(); }, []);
  useEffect(() => { if (tab === 'winners') loadWinners(); }, [tab]);

  const resetForm = () => {
    setTitle(''); setDescription(''); setImageUrl(''); setCategory('');
    setTicketPrice(''); setMaxTickets(''); setDrawDate(''); setStatus('active');
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
    setTitle(r.title || '');
    setDescription(r.description || '');
    setImageUrl(r.image || '');
    setCategory(r.category || '');
    setTicketPrice(r.ticket_price || '');
    setMaxTickets(r.max_tickets || '');
    setDrawDate(r.draw_date ? r.draw_date.slice(0, 16) : '');
    setStatus(r.status || 'active');
    setPrizeValue(r.prize_value || '');
    setMaxPerUser(r.max_per_user || '');
    setIsSponsored(!!r.is_sponsored);
    setAllowMultiple(r.allow_multiple !== false);
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleDelete = async (uuid) => {
    if (!window.confirm('Delete this raffle? This will also remove all associated tickets.')) return;
    try {
      await raffleService.adminDeleteRaffle(uuid);
      setRaffles(prev => prev.filter(r => r.uuid !== uuid));
    } catch (e) { alert(e.message || 'Failed to delete.'); }
  };

  const handleDraw = async (uuid) => {
    if (!window.confirm('Execute draw now? A winner will be selected randomly from ticket holders.')) return;
    setDrawing(uuid);
    try {
      await raffleService.adminDrawWinner(uuid);
      alert('🏆 Winner drawn successfully!');
      loadRaffles();
      if (tab === 'winners') loadWinners();
    } catch (e) { alert(e.message || 'Draw failed.'); } finally { setDrawing(null); }
  };

  const handleViewHolders = async (raffle) => {
    setHoldersRaffle(raffle);
    setHolders([]);
    try {
      const res = await raffleService.adminGetTicketHolders(raffle.uuid);
      setHolders(res.data?.data || res.data || []);
    } catch { setHolders([]); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    const payload = {
      title, description, image: imageUrl, category,
      ticket_price: ticketPrice, max_tickets: maxTickets,
      draw_date: drawDate, status, prize_value: prizeValue,
      max_per_user: maxPerUser || null,
      is_sponsored: isSponsored, allow_multiple: allowMultiple,
    };
    try {
      if (editingRaffle) {
        await raffleService.adminUpdateRaffle(editingRaffle.uuid, payload);
      } else {
        await raffleService.adminCreateRaffle(payload);
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white">Raffles Management</h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Create, configure, and draw prize raffles.</p>
        </div>
        <button onClick={handleOpenCreate} className="premium-button-primary px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow">
          <Plus className="w-4 h-4" /> Create Raffle
        </button>
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
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 dark:text-secondary-400 font-bold uppercase tracking-wider text-xs">
                    <th className="p-4">Raffle</th>
                    <th className="p-4 hidden sm:table-cell">Ticket Price</th>
                    <th className="p-4 hidden md:table-cell">Tickets</th>
                    <th className="p-4 hidden lg:table-cell">Draw Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                  {raffles.map((r) => {
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
                        <td className="p-4 text-secondary-600 dark:text-secondary-300 hidden lg:table-cell">
                          {r.draw_date ? new Date(r.draw_date).toLocaleDateString() : '—'}
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
            </div>
          </div>
        )
      )}

      {/* ── WINNERS TABLE ── */}
      {tab === 'winners' && (
        loadingWinners ? (
          <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
        ) : (
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 dark:text-secondary-400 font-bold uppercase tracking-wider text-xs">
                  <th className="p-4">Winner</th>
                  <th className="p-4 hidden sm:table-cell">Raffle</th>
                  <th className="p-4 hidden md:table-cell">Ticket #</th>
                  <th className="p-4 hidden lg:table-cell">Prize Value</th>
                  <th className="p-4">Draw Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
                {winners.map((w, i) => (
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
                <label className={labelClass}>Raffle Title *</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className={inputClass} placeholder="e.g. iPhone 17 Pro Max Raffle" />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} className={inputClass} placeholder="Tell participants about the prize..." />
              </div>
              <div>
                <label className={labelClass}>Prize Image URL</label>
                <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} className={inputClass} placeholder="https://..." />
                {imageUrl && <img src={imageUrl} alt="Preview" className="mt-2 h-24 object-cover rounded-lg" onError={(e) => e.target.style.display = 'none'} />}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Category</label>
                  <input type="text" value={category} onChange={e => setCategory(e.target.value)} className={inputClass} placeholder="e.g. Smartphones" />
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
