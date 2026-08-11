import Swal from 'sweetalert2';
import React, { useEffect, useState, useRef } from 'react';
import sellRequestService from '../../services/sellRequestService';
import { Truck, X, RefreshCw, Eye, Send, Phone, MessageCircle, Search } from 'lucide-react';
import DotPagination from '../../components/DotPagination';

const SellRequests = () => {
  const [sells, setSells] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedSell, setSelectedSell] = useState(null);
  const [offeredPrice, setOfferedPrice] = useState('');
  const [processing, setProcessing] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 8;
  
  const filteredSells = sells.filter(s => 
    (s.user?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (s.item_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredSells.length / itemsPerPage);
  const paginatedSells = filteredSells.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const loadSells = async () => {
    setLoading(true);
    try {
      const response = await sellRequestService.adminGetSells();
      setSells(response.data?.data || response.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSells();
  }, []);

  const handleOpenApprove = async (sell) => {
    setSelectedSell(sell);
    setOfferedPrice(sell.asking_price || '');
    setShowDetailModal(true);
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSell) return;

    setProcessing(true);
    try {
      await sellRequestService.adminApproveSell(selectedSell.id || selectedSell.uuid, offeredPrice);
      Swal.fire({ text: String('Sell request approved with buyout offer.') });
      
      const updatedSells = sells.map(s => 
        (s.id || s.uuid) === (selectedSell.id || selectedSell.uuid) 
        ? { ...s, status: { value: 'approved' }, offered_price: offeredPrice } 
        : s
      );
      setSells(updatedSells);
      setSelectedSell(prev => ({ ...prev, status: 'approved', offered_price: offeredPrice }));
      
    } catch (err) {
      console.error(err);
      Swal.fire({ text: String(err.message || 'Failed to approve request.') });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSell) return;
    const reason = window.prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      await sellRequestService.adminRejectSell(selectedSell.id || selectedSell.uuid, reason);
      const updatedSells = sells.map(s => 
        (s.id || s.uuid) === (selectedSell.id || selectedSell.uuid) 
        ? { ...s, status: { value: 'rejected' } } 
        : s
      );
      setSells(updatedSells);
      setSelectedSell(prev => ({ ...prev, status: 'rejected' }));
    } catch (e) {
      Swal.fire({ text: String(e.message || 'Failed to reject request.') });
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary-500" /> Corporate Buyout Requests
          </h2>
          <p className="text-sm text-secondary-500 mt-1">Review items submitted by customers for Shop Viotor direct acquisition.</p>
        </div>
        <div className="relative w-full sm:w-auto max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-secondary-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-2 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm bg-white dark:bg-secondary-900 text-secondary-900 dark:text-white placeholder-secondary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="Search by customer or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-x-auto shadow-sm">
        {loading ? (
          <div className="flex justify-center py-12"><RefreshCw className="w-8 h-8 text-primary-500 animate-spin" /></div>
        ) : sells.length === 0 ? (
          <div className="p-8 text-center text-secondary-500 font-semibold">No buyout requests found.</div>
        ) : (
          <table className="w-full min-w-[650px] text-left border-collapse text-sm">
            <thead>
              <tr className="bg-secondary-50 dark:bg-secondary-850 border-b border-secondary-200 dark:border-secondary-800 text-secondary-500 font-bold uppercase tracking-wider text-xxs">
                <th className="p-4">Customer</th>
                <th className="p-4">Item Name</th>
                <th className="p-4">Asking Price</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800">
              {paginatedSells.map((s) => (
                <tr key={s.id || s.uuid} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/30">
                  <td className="p-4 font-semibold text-secondary-900 dark:text-white">{s.user?.name || 'Customer'}</td>
                  <td className="p-4 text-secondary-700 dark:text-secondary-300">{s.item_name}</td>
                  <td className="p-4 font-bold text-secondary-900 dark:text-white">GHS {parseFloat(s.asking_price || 0).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`text-xxs px-2.5 py-0.5 rounded-full font-bold uppercase ${s.status === 'pending' || s.status?.value === 'pending' ? 'bg-yellow-100 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-450' : 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400'}`}>
                      {s.status?.value || s.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleOpenApprove(s)} className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-lg"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <DotPagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showDetailModal && selectedSell && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-secondary-900 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Request Details & Action */}
            <div className="w-full h-full flex flex-col bg-white dark:bg-secondary-900 overflow-hidden">
              <div className="p-4 border-b border-secondary-200 dark:border-secondary-800 flex justify-between items-center bg-secondary-50 dark:bg-secondary-850/50 flex-shrink-0">
                <h3 className="font-bold text-lg text-secondary-900 dark:text-white">Review Request</h3>
                <button onClick={() => setShowDetailModal(false)} className="p-1 text-secondary-400 hover:text-secondary-600"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                
                {/* Customer Details */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xl font-bold text-secondary-900 dark:text-white">{selectedSell.item_name}</h4>
                    <div className="text-sm text-secondary-500 mt-1">Submitted by: <span className="font-semibold text-secondary-900 dark:text-white">{selectedSell.user?.name || 'Customer'}</span></div>
                    {selectedSell.contact_number && (
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-1.5 text-sm text-secondary-500">
                          <Phone className="w-3.5 h-3.5" /> {selectedSell.contact_number}
                        </div>
                        <a 
                          href={`https://wa.me/${selectedSell.contact_number.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hi ${selectedSell.user?.name || 'there'}, I'm contacting you regarding your Sell Request for the ${selectedSell.item_name} on Shop Viotor.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-full transition-colors"
                        >
                          <MessageCircle className="w-3.5 h-3.5" /> Chat on WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                  <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 font-bold uppercase">{selectedSell.status?.value || selectedSell.status}</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl">
                    <span className="text-xs text-secondary-500 uppercase font-bold block mb-1">Customer Asking Price</span>
                    <div className="text-lg font-extrabold text-secondary-900 dark:text-white">GHS {parseFloat(selectedSell.asking_price).toLocaleString()}</div>
                  </div>
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 rounded-xl">
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 uppercase font-bold block mb-1">Our Buyout Offer</span>
                    <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                      {selectedSell.offered_price ? `GHS ${parseFloat(selectedSell.offered_price).toLocaleString()}` : '-'}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-xs text-secondary-500 uppercase font-bold block mb-1">Description & Condition</span>
                  <p className="text-sm text-secondary-700 dark:text-secondary-300 leading-relaxed bg-secondary-50 dark:bg-secondary-800 p-3 rounded-lg">
                    {selectedSell.description}
                  </p>
                </div>

                {selectedSell.images && selectedSell.images.length > 0 && (
                  <div>
                    <span className="text-xs text-secondary-500 uppercase font-bold block mb-2">Attached Images</span>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedSell.images.map((img, idx) => {
                        const imgUrl = img.startsWith('http') ? img : `${import.meta.env.VITE_STORAGE_URL}/${img}`;
                        return (
                          <a key={idx} href={imgUrl} target="_blank" rel="noreferrer" className="block aspect-square rounded-lg overflow-hidden border border-secondary-200">
                            <img src={imgUrl} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Admin Actions */}
                {(selectedSell.status === 'pending' || selectedSell.status?.value === 'pending') && (
                  <div className="pt-4 border-t border-secondary-200 dark:border-secondary-800 space-y-4">
                    <h4 className="font-bold text-secondary-900 dark:text-white">Decide & Make Offer</h4>
                    <form onSubmit={handleApproveSubmit} className="flex gap-2">
                      <input
                        type="number"
                        required
                        placeholder="Offer Amount (GHS)"
                        value={offeredPrice}
                        onChange={(e) => setOfferedPrice(e.target.value)}
                        className="flex-1 p-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                      />
                      <button type="submit" disabled={processing} className="premium-button-primary px-4 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 whitespace-nowrap">
                        {processing ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Approve & Offer'}
                      </button>
                    </form>
                    <button onClick={handleReject} className="w-full py-2 bg-accent-100 hover:bg-accent-200 text-accent-700 font-bold rounded-lg transition-colors">
                      Reject Request
                    </button>
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

export default SellRequests;
export { SellRequests };
