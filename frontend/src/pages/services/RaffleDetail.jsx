import Swal from 'sweetalert2';
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import raffleService from '../../services/raffleService';
import { useAuth } from '../../contexts/AuthContext';
import {
  Ticket, ArrowLeft, Users, RefreshCw, Trophy,
  CheckCircle, AlertCircle, Phone, Tag, CreditCard, Gift, Percent, Shield
} from 'lucide-react';

function useCountdown(targetDate) {
  const calc = () => {
    const diff = new Date(targetDate) - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0, expired: true };
    return { d: Math.floor(diff / 86400000), h: Math.floor((diff % 86400000) / 3600000), m: Math.floor((diff % 3600000) / 60000), s: Math.floor((diff % 60000) / 1000), expired: false };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [targetDate]);
  return time;
}

const QUICK_QUANTITIES = [1, 3, 5, 10];
const PAYMENT_METHODS = [
  { id: 'momo', label: 'Mobile Money', desc: 'MTN, Vodafone, AirtelTigo', icon: '📱' },
  { id: 'paystack', label: 'Card / Paystack', desc: 'Visa, Mastercard', icon: '💳' },
];

const RaffleDetail = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [raffle, setRaffle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Purchase form states
  const [quantity, setQuantity] = useState(1);
  const [customQty, setCustomQty] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [buyerName, setBuyerName] = useState('');
  const [phone, setPhone] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await raffleService.getRaffle(uuid);
        setRaffle(res.data?.data || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [uuid]);

  useEffect(() => {
    if (user) {
      setBuyerName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleQuickQty = (q) => {
    setQuantity(q);
    setCustomQty('');
  };

  const effectiveQty = customQty ? parseInt(customQty) || 1 : quantity;
  const ticketPrice = raffle?.ticket_price ? parseFloat(raffle.ticket_price) : 0;
  const totalPrice = effectiveQty * ticketPrice;

  const handleBuy = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      Swal.fire({ icon: 'info', text: 'Please sign in to buy tickets.', confirmButtonColor: '#3b82f6' });
      navigate('/login');
      return;
    }
    setPurchasing(true);
    setPurchaseError('');

    try {
      const payload = {
        raffle_id: raffle.id,
        quantity: effectiveQty,
        payment_method: paymentMethod,
        phone,
      };
      
      const res = await raffleService.buyTickets(uuid, payload);
      if (res?.payment?.authorization_url || res.data?.authorization_url || res.authorization_url) {
        window.location.href = res?.payment?.authorization_url || res.data?.authorization_url || res.authorization_url;
      } else {
        setPurchaseSuccess(true);
        // refresh stats
        const updated = await raffleService.getRaffle(uuid);
        setRaffle(updated.data?.data || updated.data);
      }
    } catch (err) {
      const errorMsg = err.message || err.response?.data?.message || 'Failed to initialize payment.';
      setPurchaseError(errorMsg);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: errorMsg,
      });
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!raffle) {
    return (
      <div className="text-center py-24 bg-secondary-50 dark:bg-secondary-950 min-h-screen">
        <p className="text-secondary-400">Raffle not found.</p>
        <Link to="/raffles" className="text-primary-500 font-semibold hover:underline mt-4 inline-block">← Back to Raffles</Link>
      </div>
    );
  }

  const progress = raffle.max_tickets ? Math.min(((raffle.tickets_sold || 0) / raffle.max_tickets) * 100, 100) : 0;
  const isFull = progress >= 100;

  return (
    <div className="bg-secondary-50 dark:bg-secondary-950 min-h-screen text-secondary-800 dark:text-secondary-200">
      <div className="max-w-[1200px] mx-auto px-4 py-8 space-y-6">
        
        {/* Breadcrumb / Top Bar */}
        <div className="flex items-center text-xs font-semibold text-secondary-500 dark:text-secondary-400 uppercase tracking-widest">
          <Link to="/raffles" className="flex items-center gap-1 hover:text-secondary-900 dark:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Raffles
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* ── LEFT COLUMN ── */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Image Box */}
            <div className="bg-white p-4 flex items-center justify-center relative h-64 md:h-80 shadow-xl overflow-hidden">
              <div className="absolute top-4 left-4 z-10 bg-amber-400 text-amber-950 text-xs font-extrabold px-3 py-1.5 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> Sponsored
              </div>
              <img
                src={raffle.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60'}
                alt={raffle.title}
                className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60'; }}
              />
            </div>

            {/* Title & Badge */}
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-secondary-900 dark:text-white leading-snug">{raffle.title}</h1>
              {raffle.category && (
                <div className="inline-flex items-center gap-1 mt-2 bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 text-xs font-bold px-2.5 py-1 rounded-md">
                  {raffle.category}
                </div>
              )}
            </div>

            {/* Grand Prize Box */}
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl p-4 flex items-center gap-4">
              <div className="bg-primary-500/20 text-primary-500 p-3 rounded-lg border border-primary-500/30">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-secondary-400 dark:text-secondary-500 tracking-wider">Grand Prize</p>
                <p className="text-sm font-semibold text-secondary-800 dark:text-secondary-200 leading-tight">
                  {raffle.title}
                </p>
                {raffle.prize_value && (
                  <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">Worth GHS {parseFloat(raffle.prize_value).toLocaleString()}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-secondary-900 dark:text-white mb-3">About This Raffle</h2>
              <p className="text-sm text-secondary-500 dark:text-secondary-400 leading-relaxed whitespace-pre-line">
                {raffle.description || "Enter now for a chance to win this amazing prize! Grab your tickets before they run out."}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <div className="bg-white rounded-xl p-4 text-center text-slate-900 shadow-md">
                <Ticket className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                <p className="text-2xl font-extrabold">{raffle.tickets_sold || 0}</p>
                <p className="text-xs font-bold text-secondary-400 dark:text-secondary-500 uppercase tracking-wide">Tickets Sold</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center text-slate-900 shadow-md">
                <Trophy className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                <p className="text-2xl font-extrabold">{raffle.winner ? '1' : '0'}</p>
                <p className="text-xs font-bold text-secondary-400 dark:text-secondary-500 uppercase tracking-wide">Winner</p>
              </div>
              <div className="bg-white rounded-xl p-4 text-center text-slate-900 shadow-md">
                <Percent className="w-6 h-6 text-primary-500 mx-auto mb-2" />
                <p className="text-2xl font-extrabold">{progress.toFixed(0)}%</p>
                <p className="text-xs font-bold text-secondary-400 dark:text-secondary-500 uppercase tracking-wide">Sold</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-4 space-y-3">
              <div className="flex justify-between text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                <span>Tickets Remaining</span>
                <span>{raffle.max_tickets ? raffle.max_tickets - (raffle.tickets_sold || 0) : 'Unlimited'}</span>
              </div>
              <div className="w-full bg-secondary-100 dark:bg-secondary-800 h-3.5 overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-400 shadow-[0_0_10px_rgba(255,184,0,0.5)] transition-all duration-1000"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              {/* Dates */}
              <div className="flex justify-between items-center text-xs text-secondary-500 dark:text-secondary-400 mt-2">
                {raffle.drawn_at && <span><strong>Draw:</strong> {new Date(raffle.drawn_at).toLocaleDateString()}</span>}
                {raffle.ends_at && <span><strong>Ends:</strong> {new Date(raffle.ends_at).toLocaleDateString()}</span>}
              </div>
            </div>



          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="lg:col-span-4">
            <div className="sticky top-6">
              {purchaseSuccess ? (
                <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-8 text-center space-y-4">
                  <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto text-primary-500 border border-primary-500/30">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-extrabold text-secondary-900 dark:text-white">Tickets Purchased! 🎉</h3>
                  <p className="text-secondary-500 dark:text-secondary-400 text-sm">Your {effectiveQty} ticket{effectiveQty > 1 ? 's are' : ' is'} secured. Good luck!</p>
                  <Link to="/my-tickets" className="block w-full bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold py-3.5 rounded-xl transition-colors text-sm">
                    View My Tickets
                  </Link>
                  <button onClick={() => { setPurchaseSuccess(false); setQuantity(1); setCustomQty(''); }}
                    className="block w-full text-secondary-400 dark:text-secondary-500 text-sm hover:text-secondary-900 dark:text-white transition-colors">
                    Buy More Tickets
                  </button>
                </div>
              ) : raffle.status === 'completed' ? (
                <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-8 text-center shadow-xl flex flex-col items-center">
                  <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4 border border-amber-500/30">
                    <Trophy className="w-8 h-8 text-amber-500" />
                  </div>
                  <h3 className="text-xl font-extrabold text-secondary-900 dark:text-white mb-2">Winner Selected! 🎉</h3>
                  {raffle.winner ? (
                    <>
                      <p className="text-secondary-500 dark:text-secondary-400 text-sm mb-2 leading-relaxed">
                        Congratulations to our lucky winner!
                      </p>
                      <div className="bg-secondary-50 dark:bg-secondary-950 px-6 py-4 rounded-xl border border-secondary-200 dark:border-secondary-800 text-left w-full mt-2">
                         <p className="text-xs font-bold text-secondary-400 uppercase mb-1 tracking-wider">Winner Name</p>
                         <p className="text-lg font-bold text-secondary-900 dark:text-white mb-3">{raffle.winner.user_name}</p>
                         <p className="text-xs font-bold text-secondary-400 uppercase mb-1 tracking-wider">Winning Ticket</p>
                         <p className="text-md font-mono text-secondary-700 dark:text-secondary-300">{raffle.winner.ticket_number}</p>
                      </div>
                    </>
                  ) : (
                    <p className="text-secondary-500 dark:text-secondary-400 text-sm mb-6 leading-relaxed">
                      A winner has been successfully drawn for this raffle.
                    </p>
                  )}
                </div>
              ) : raffle.status === 'closed' ? (
                <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-8 text-center shadow-xl flex flex-col items-center">
                  <div className="w-16 h-16 bg-[#ff0050]/10 rounded-full flex items-center justify-center mb-4 border border-[#ff0050]/20">
                    <svg className="w-8 h-8 text-[#ff0050]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 15.71a6.34 6.34 0 0 0 6.3 6.29 6.37 6.37 0 0 0 6.36-6.17V9.75a8.27 8.27 0 0 0 4.29 1.25V7.55a4.77 4.77 0 0 1-2.36-.86z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-extrabold text-secondary-900 dark:text-white mb-2">Raffle Closed</h3>
                  <p className="text-secondary-500 dark:text-secondary-400 text-sm mb-6 leading-relaxed">
                    Ticket sales have ended! The live draw is happening on our official TikTok page.
                  </p>
                  <a href="https://tiktok.com/@shopviotor" target="_blank" rel="noopener noreferrer" className="block w-full bg-[#000000] dark:bg-white text-white dark:text-black hover:bg-[#222] dark:hover:bg-slate-200 font-bold py-3.5 rounded-xl transition-colors text-sm shadow-[4px_4px_0_0_#ff0050]">
                    Find winner on live TikTok
                  </a>
                </div>
              ) : (
                <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-2xl">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-primary-600 to-primary-400 p-5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-secondary-900 dark:text-white font-extrabold text-lg tracking-wide">
                      <Ticket className="w-5 h-5" /> Buy Tickets
                    </div>
                    {/* Simulated Payment Logos in Header */}
                    <div className="flex gap-1">
                       <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px] font-bold text-secondary-900 dark:text-white border border-white/30 backdrop-blur-sm">GHS</span>
                       <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px] font-bold text-secondary-900 dark:text-white border border-white/30 backdrop-blur-sm">MOMO</span>
                       <span className="bg-white/20 px-1.5 py-0.5 rounded text-[9px] font-bold text-secondary-900 dark:text-white border border-white/30 backdrop-blur-sm">VISA</span>
                    </div>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleBuy} className="p-5 space-y-4">
                    {purchaseError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg flex items-start gap-2 text-xs">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{purchaseError}</span>
                      </div>
                    )}

                    {/* Quantity Row */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[10px] font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-widest">Quick Select</label>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {QUICK_QUANTITIES.map(q => (
                          <button
                            key={q} type="button" onClick={() => handleQuickQty(q)}
                            className={`py-2 rounded-lg text-sm font-bold border transition-colors ${!customQty && quantity === q ? 'bg-secondary-100 dark:bg-secondary-800 border-primary-500 text-primary-600 dark:text-primary-400' : 'bg-transparent border-secondary-300 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 hover:border-slate-500'}`}
                          >{q}</button>
                        ))}
                      </div>
                      <label className="block text-[10px] font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-widest mb-1.5">Ticket Quantity</label>
                      <input
                        type="number" min="1" max="500" placeholder="Custom quantity"
                        value={customQty} onChange={(e) => setCustomQty(e.target.value)}
                        className="w-full p-2.5 bg-secondary-50 dark:bg-secondary-950 border border-secondary-300 dark:border-secondary-700 rounded-lg text-sm text-secondary-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none"
                      />
                    </div>

                    {/* Promo Code */}
                    <div>
                      <label className="block text-[10px] font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-widest mb-1.5">Promo Code (Optional)</label>
                      <input
                        type="text" placeholder="Enter code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full p-2.5 bg-secondary-50 dark:bg-secondary-950 border border-secondary-300 dark:border-secondary-700 rounded-lg text-sm text-secondary-900 dark:text-white focus:border-primary-500 outline-none"
                      />
                    </div>

                    {/* Name */}
                    <div>
                      <label className="block text-[10px] font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-widest mb-1.5">Your Name</label>
                      <input
                        type="text" required placeholder="John Doe" value={buyerName} onChange={(e) => setBuyerName(e.target.value)}
                        className="w-full p-2.5 bg-secondary-50 dark:bg-secondary-950 border border-secondary-300 dark:border-secondary-700 rounded-lg text-sm text-secondary-900 dark:text-white focus:border-primary-500 outline-none"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="block text-[10px] font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                      <input
                        type="tel" required placeholder="055XXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-2.5 bg-secondary-50 dark:bg-secondary-950 border border-secondary-300 dark:border-secondary-700 rounded-lg text-sm text-secondary-900 dark:text-white focus:border-primary-500 outline-none"
                      />
                    </div>

                    {/* Summary */}
                    <div className="border-t border-secondary-200 dark:border-secondary-800 pt-3 space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-secondary-500 dark:text-secondary-400">
                        <span>Base Price</span>
                        <span>GHS {totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-extrabold text-secondary-900 dark:text-white text-lg pt-1">
                        <span>Total</span>
                        <span className="text-primary-600 dark:text-primary-400">GHS {totalPrice.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div>
                       <label className="block text-[10px] font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-widest mb-2 mt-2">Choose Payment Method</label>
                       <div className="grid grid-cols-1 gap-2">
                         <div 
                           onClick={() => setPaymentMethod('paystack')} 
                           className={`cursor-pointer border rounded-lg p-2.5 flex items-center justify-between transition-colors ${paymentMethod === 'paystack' ? 'border-primary-500 bg-primary-500/10 text-primary-600 dark:text-primary-400' : 'border-secondary-300 dark:border-secondary-700 text-secondary-500 dark:text-secondary-400 hover:border-slate-500'}`}
                         >
                           <span className="text-xs font-bold uppercase tracking-wider">Card / Mobile Money (via Paystack)</span>
                           {paymentMethod === 'paystack' && <CheckCircle className="w-4 h-4" />}
                         </div>
                       </div>
                    </div>

                    {/* Pay Button */}
                    <button
                      type="submit" disabled={purchasing || isFull}
                      className="w-full bg-gradient-to-r from-primary-500 to-primary-400 hover:from-primary-400 hover:to-primary-300 text-secondary-950 font-extrabold text-sm py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,184,0,0.3)] disabled:opacity-60 disabled:shadow-none transition-all mt-2"
                    >
                      {purchasing ? <RefreshCw className="w-5 h-5 animate-spin" /> : isFull ? 'Raffle Full' : <>Pay via Paystack</>}
                    </button>
                    <p className="text-center text-[10px] text-secondary-400 dark:text-secondary-500 font-semibold flex items-center justify-center gap-1 mt-3">
                       <Shield className="w-3 h-3" /> Secure and Encrypted Checkout
                    </p>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaffleDetail;
export { RaffleDetail };
