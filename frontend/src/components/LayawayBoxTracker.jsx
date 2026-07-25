import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import layawayService from '../services/layawayService';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  Package, CheckCircle, ArrowLeft, HelpCircle
} from 'lucide-react';

export default function LayawayBoxTracker({ card, onPaymentSuccess, onBack, isAdmin = false }) {
  const [payAmount, setPayAmount] = useState('');
  const [payBoxes, setPayBoxes] = useState('');
  const [payMethod, setPayMethod] = useState(isAdmin ? 'Cash' : 'Paystack');
  const [payNotes, setPayNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Constants
  const totalBoxes = card.total_boxes;
  const boxesChecked = card.boxes_checked;
  const boxesRemaining = card.boxes_remaining;
  const boxPrice = card.box_price;
  const completionPercentage = card.completion_percentage;

  // Box grid rendering
  // The backend returns an array of payments. Each payment has a 'color_code' and 'boxes_covered'.
  // We need to map boxes 1 to totalBoxes to their respective color code.
  
  const boxColors = [];
  let currentBoxIndex = 0;
  
  if (card.payments && card.payments.length > 0) {
    card.payments.forEach(payment => {
      for (let i = 0; i < payment.boxes_covered; i++) {
        boxColors[currentBoxIndex] = payment.color_code || '#eab308'; // fallback yellow
        currentBoxIndex++;
      }
    });
  }

  const handleAmountChange = (e) => {
    const amt = e.target.value;
    setPayAmount(amt);
    if (amt && boxPrice > 0) {
      const calcBoxes = Math.floor(parseFloat(amt) / boxPrice);
      setPayBoxes(calcBoxes > 0 ? calcBoxes.toString() : '');
    } else {
      setPayBoxes('');
    }
  };

  const handleBoxesChange = (e) => {
    const bxs = e.target.value;
    setPayBoxes(bxs);
    if (bxs && boxPrice > 0) {
      const calcAmt = parseInt(bxs, 10) * boxPrice;
      setPayAmount(calcAmt > 0 ? calcAmt.toFixed(2) : '');
    } else {
      setPayAmount('');
    }
  };

  const handleReversePayment = async (paymentUuid) => {
    const __confirmResult = await Swal.fire({ title: 'Are you sure?', text: "Are you sure you want to reverse this payment? This action cannot be undone.", icon: 'warning', showCancelButton: true });
    if (!__confirmResult.isConfirmed) return;
    try {
      await layawayService.adminReversePayment(card.uuid, paymentUuid);
      toast.success('Payment reversed successfully');
      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to reverse payment');
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        amount_paid: payAmount ? parseFloat(payAmount) : null,
        number_of_boxes: payBoxes ? parseInt(payBoxes, 10) : null,
        payment_method: payMethod,
        notes: payNotes,
      };

      let endpoint = '';
      if (isAdmin) {
        endpoint = `/admin/layaways/${card.uuid}/payments`;
      } else {
        // For customer online payment via Paystack, they'd use Paystack checkout first.
        // For simplicity right now, assuming they submit the form and it mocks Paystack reference.
        payload.amount = parseFloat(payAmount);
        payload.reference = 'MOCK-PAYSTACK-' + Date.now();
        endpoint = `/layaways/${card.uuid}/pay`;
      }

      const res = await apiClient.post(endpoint, payload);
      toast.success(res.data?.message || 'Payment recorded successfully!');
      
      // Reset form
      setPayAmount('');
      setPayBoxes('');
      setPayNotes('');

      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#111111] text-gray-200 min-h-screen p-4 md:p-8 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-[#111111] px-4 py-2 rounded transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Management
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-yellow-500 flex items-center gap-2">
            <Package className="w-8 h-8" /> Box Payment Tracking
          </h1>
        </div>
      </div>

      {/* Top Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6">
        
        {/* Customer Info Card */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 md:col-span-5 flex flex-col justify-between border border-gray-800 shadow-xl">
          <div>
            <h2 className="text-3xl font-bold text-white mb-4">{card.customer_name}</h2>
            <div className="space-y-2 text-gray-400">
              <p className="flex items-center gap-2 text-yellow-400">
                <span className="text-sm">📞</span> {card.customer_phone}
              </p>
              <p className="flex items-center gap-2 text-pink-400">
                <span className="text-sm">📍</span> {card.customer_city}
              </p>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
             <div className="flex items-center gap-3 bg-[#262626] rounded-full pl-2 pr-6 py-1">
                {card.product_image ? (
                  <img src={card.product_image} alt={card.product_name} className="w-10 h-10 rounded-full object-cover border border-gray-600" />
                ) : (
                  <Package className="w-10 h-10 p-2 bg-gray-700 rounded-full" />
                )}
                <span className="font-semibold text-white">{card.product_name}</span>
             </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="md:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-4">
           {/* Total Boxes */}
           <div className="bg-[#1a1a1a] rounded-xl p-4 flex flex-col justify-center items-center border border-gray-800 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-gray-600"></div>
             <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Total Boxes</p>
             <p className="text-3xl font-bold text-white">{totalBoxes}</p>
           </div>
           
           {/* Boxes Checked */}
           <div className="bg-[#1a1a1a] rounded-xl p-4 flex flex-col justify-center items-center border border-gray-800 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>
             <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Boxes Checked</p>
             <p className="text-3xl font-bold text-white">{boxesChecked}</p>
           </div>

           {/* Amount Paid */}
           <div className="bg-[#1a1a1a] rounded-xl p-4 flex flex-col justify-center items-center border border-gray-800 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
             <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Amount Paid</p>
             <p className="text-2xl font-bold text-white">GHS{card.amount_paid?.toFixed(2)}</p>
           </div>

           {/* Amount Remaining */}
           <div className="bg-[#1a1a1a] rounded-xl p-4 flex flex-col justify-center items-center border border-gray-800 shadow-lg relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
             <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider">Remaining</p>
             <p className="text-2xl font-bold text-white">GHS{card.amount_remaining?.toFixed(2)}</p>
           </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-[#1a1a1a] rounded-xl p-4 mb-8 border border-gray-800 shadow-lg">
         <div className="flex justify-between items-end mb-2">
           <span className="text-sm font-medium text-gray-300">Completion: {completionPercentage}%</span>
         </div>
         <div className="w-full bg-gray-800 rounded-full h-4 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400 h-4 rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)] transition-all duration-1000" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
         </div>
      </div>

      {/* Main Bottom Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Payment Form (Left Column) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span>💰</span> Record Payment
            </h3>
            
            <form onSubmit={handleRecordPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Amount Paid (GHS)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  value={payAmount}
                  onChange={handleAmountChange}
                  className="w-full bg-[#262626] border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="e.g., 20.00"
                />
              </div>

              <div className="text-center text-sm font-bold text-gray-500">OR</div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Number of Boxes</label>
                <input 
                  type="number" 
                  min="1"
                  value={payBoxes}
                  onChange={handleBoxesChange}
                  className="w-full bg-[#262626] border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="e.g., 2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Payment Method</label>
                {isAdmin ? (
                  <select 
                    value={payMethod} 
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full bg-[#262626] border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Momo">Momo</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                ) : (
                  <select 
                    value={payMethod} 
                    onChange={(e) => setPayMethod(e.target.value)}
                    className="w-full bg-[#262626] border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  >
                    <option value="Paystack">Paystack (Online)</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Notes (Optional)</label>
                <textarea 
                  rows="3"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full bg-[#262626] border border-gray-700 rounded p-3 text-white focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="Add any notes"
                ></textarea>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting || (!payAmount && !payBoxes)}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-[#111111] font-bold py-3 px-6 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Recording...' : 'Record Payment'}
              </button>
            </form>
          </div>

          {/* Payment History Table */}
          <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 shadow-lg flex-1">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span>📄</span> Payment History
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="text-xs uppercase text-yellow-500 border-b border-gray-800 pb-2 block mb-2">
                  <tr className="grid grid-cols-12 gap-2">
                    <th className="col-span-3 font-medium">Date</th>
                    <th className="col-span-2 font-medium">Boxes</th>
                    <th className="col-span-3 font-medium">Amount</th>
                    <th className="col-span-2 font-medium">Method</th>
                    {isAdmin && <th className="col-span-2 font-medium text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="block max-h-64 overflow-y-auto space-y-2">
                  {card.payments && card.payments.length > 0 ? (
                    card.payments.map((payment) => (
                      <tr key={payment.uuid} className="grid grid-cols-12 gap-2 items-center bg-[#222222] p-2 rounded">
                        <td className="col-span-3 text-xs">{new Date(payment.created_at).toLocaleDateString()}</td>
                        <td className="col-span-2">
                          <span className="bg-gray-800 px-2 py-1 rounded text-white font-bold">{payment.boxes_covered}</span>
                        </td>
                        <td className="col-span-3 text-white font-bold">GHS {payment.amount}</td>
                        <td className="col-span-2">{payment.payment_method}</td>
                        {isAdmin && (
                          <td className="col-span-2 text-right">
                            <button 
                              onClick={() => handleReversePayment(payment.uuid)}
                              className="text-xs text-red-500 hover:text-red-400 font-bold border border-red-500/30 hover:bg-red-500/10 px-2 py-1 rounded"
                            >
                              Reverse
                            </button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-4">No payments recorded yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Box Template (Right Column) */}
        <div className="lg:col-span-8 bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 shadow-lg">
           <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <span>📄</span> Box Template ({totalBoxes} boxes @ GHS{boxPrice} each)
            </h3>
            
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 gap-2">
              {Array.from({ length: totalBoxes }).map((_, index) => {
                const boxNumber = index + 1;
                const isChecked = index < boxesChecked;
                const boxColor = isChecked ? boxColors[index] : '#262626';
                
                return (
                  <div 
                    key={index}
                    className={`
                      aspect-square rounded flex items-center justify-center font-bold text-sm
                      transition-all duration-300 shadow-sm
                      ${!isChecked ? 'text-gray-500 hover:bg-gray-700' : 'text-white border border-gray-700/30'}
                    `}
                    style={{ backgroundColor: boxColor }}
                  >
                    {boxNumber}
                  </div>
                );
              })}
            </div>
        </div>

      </div>

    </div>
  );
}
