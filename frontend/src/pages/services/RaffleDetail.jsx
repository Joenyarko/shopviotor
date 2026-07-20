import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import raffleService from '../../services/raffleService';
import { useAuth } from '../../contexts/AuthContext';
import {
  Ticket, ArrowLeft, Users, Clock, RefreshCw, Trophy,
  ChevronLeft, ChevronRight, Shield, Zap, CheckCircle,
  AlertCircle, Sparkles, Phone, Tag
} from 'lucide-react';

// Countdown hook
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
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [phone, setPhone] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [useWallet, setUseWallet] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await raffleService.getRaffle(uuid);
        setRaffle(res.data?.data || res.data);
      } catch (e) {
        console.error(e);
        // Fallback mock
        setRaffle({
          uuid, title: 'iPhone 17 Pro Max Raffle',
          description: 'Win the incredible iPhone 17 Pro Max. TechFortune Ghana Giveaway! 🎉 Are you ready to elevate your smartphone game? TechFortune Ghana presents an exciting chance to win the powerful iPhone 17 Pro Max, valued at GHS 25,000. 🔥',
          image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60',
          ticket_price: 5, tickets_sold: 153, max_tickets: 1000,
          draw_date: new Date(Date.now() + 4 * 86400000).toISOString(),
          category: 'Smartphones', prize_value: 25000,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uuid]);

  const countdown = useCountdown(raffle?.draw_date);
  const progress = raffle?.max_tickets
    ? Math.min(((raffle.tickets_sold || 0) / raffle.max_tickets) * 100, 100)
    : 0;

  const effectiveQty = customQty ? parseInt(customQty) || 1 : quantity;
  const ticketPrice = parseFloat(raffle?.ticket_price || 0);
  const totalAmount = effectiveQty * ticketPrice;

  const handleQuickQty = (q) => {
    setQuantity(q);
    setCustomQty('');
  };

  const handleBuy = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/raffles/${uuid}` } });
      return;
    }
    if (paymentMethod === 'momo' && !phone.trim()) {
      setPurchaseError('Please enter your mobile money phone number.');
      return;
    }
    setPurchasing(true);
    setPurchaseError('');
    try {
      const res = await raffleService.buyTickets(uuid, {
        quantity: effectiveQty,
        payment_method: paymentMethod,
        phone: phone.trim() || undefined,
        promo_code: promoCode.trim() || undefined,
        use_wallet: useWallet,
      });
      const data = res.data || res;
      if (data?.payment?.authorization_url) {
        window.location.href = data.payment.authorization_url;
      } else {
        setPurchaseSuccess(true);
      }
    } catch (err) {
      setPurchaseError(err.response?.data?.message || err.message || 'Failed to purchase tickets.');
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
      <div className="text-center py-24">
        <p className="text-secondary-500 dark:text-secondary-400">Raffle not found.</p>
        <Link to="/raffles" className="text-primary-600 font-semibold hover:underline mt-4 inline-block">← Back to Raffles</Link>
      </div>
    );
  }

  const isFull = progress >= 100;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-secondary-500 dark:text-secondary-400">
        <Link to="/raffles" className="flex items-center gap-1 hover:text-primary-600 font-medium">
          <ArrowLeft className="w-4 h-4" /> All Raffles
        </Link>
        <span>/</span>
        <span className="text-secondary-900 dark:text-white truncate max-w-xs">{raffle.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* ── LEFT COLUMN ── */}
        <div className="lg:col-span-3 space-y-6">
          {/* Prize Image */}
          <div className="rounded-2xl overflow-hidden aspect-video bg-secondary-100 dark:bg-secondary-900 shadow-lg">
            <img
              src={raffle.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60'}
              alt={raffle.title}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=60'; }}
            />
          </div>

          {/* Info card */}
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 space-y-5">
            {raffle.category && (
              <span className="inline-flex items-center gap-1.5 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-xs font-bold px-3 py-1 rounded-full border border-primary-200/50 dark:border-primary-700/30">
                <Sparkles className="w-3.5 h-3.5" /> {raffle.category}
              </span>
            )}
            <h1 className="text-2xl md:text-3xl font-extrabold text-secondary-900 dark:text-white leading-tight">{raffle.title}</h1>
            {raffle.prize_value && (
              <div className="inline-flex items-center gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50 rounded-xl px-4 py-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-xxs text-amber-600 font-semibold uppercase">Prize Value</p>
                  <p className="text-amber-700 dark:text-amber-400 font-extrabold text-lg">GHS {parseFloat(raffle.prize_value).toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: Ticket, label: 'Tickets Sold', val: raffle.tickets_sold || 0 },
                { icon: Users, label: 'Total Tickets', val: raffle.max_tickets || '∞' },
                { icon: Clock, label: 'Draw Date', val: raffle.draw_date ? new Date(raffle.draw_date).toLocaleDateString() : 'TBD' },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="text-center bg-secondary-50 dark:bg-secondary-800/50 rounded-xl p-3">
                  <Icon className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-secondary-900 dark:text-white">{val}</p>
                  <p className="text-xxs text-secondary-500 dark:text-secondary-400 mt-0.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-secondary-600 dark:text-secondary-400">
                <span>{raffle.tickets_sold || 0} tickets sold</span>
                <span>{progress.toFixed(1)}% filled</span>
              </div>
              <div className="w-full bg-secondary-100 dark:bg-secondary-800 h-3 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${isFull ? 'bg-accent-500' : 'bg-gradient-to-r from-primary-400 to-primary-600'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Countdown */}
            {raffle.draw_date && !countdown.expired && (
              <div>
                <p className="text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase mb-2 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Draw Countdown</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { val: countdown.d, label: 'Days' },
                    { val: countdown.h, label: 'Hours' },
                    { val: countdown.m, label: 'Minutes' },
                    { val: countdown.s, label: 'Seconds' },
                  ].map(({ val, label }) => (
                    <div key={label} className="bg-secondary-900 dark:bg-secondary-800 rounded-xl p-3 text-center">
                      <div className="text-2xl font-extrabold text-primary-400 tabular-nums">{String(val).padStart(2, '0')}</div>
                      <div className="text-secondary-500 dark:text-secondary-400 text-xxs mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {raffle.description && (
              <div className="border-t border-secondary-100 dark:border-secondary-800 pt-4">
                <p className="text-sm text-secondary-600 dark:text-secondary-300 leading-relaxed whitespace-pre-line">{raffle.description}</p>
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Shield, label: 'Secure & Verified', color: 'text-emerald-500' },
              { icon: Zap, label: 'Instant Confirmation', color: 'text-primary-500' },
              { icon: Trophy, label: 'Fair Random Draw', color: 'text-amber-500' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-xl p-3 text-center">
                <Icon className={`w-6 h-6 ${color} mx-auto mb-1.5`} />
                <p className="text-xs font-semibold text-secondary-700 dark:text-secondary-300">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT COLUMN: Purchase Card ── */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            {purchaseSuccess ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-extrabold text-secondary-900 dark:text-white">Tickets Purchased! 🎉</h3>
                <p className="text-secondary-600 dark:text-secondary-400 text-sm">Your {effectiveQty} ticket{effectiveQty > 1 ? 's are' : ' is'} secured. Good luck!</p>
                <Link to="/my-tickets" className="block bg-emerald-500 text-white font-bold py-3 rounded-xl hover:bg-emerald-600 transition-colors text-sm">
                  View My Tickets
                </Link>
                <button onClick={() => { setPurchaseSuccess(false); setQuantity(1); setCustomQty(''); }}
                  className="block w-full text-secondary-500 dark:text-secondary-400 text-sm hover:text-primary-600 transition-colors">
                  Buy More Tickets
                </button>
              </div>
            ) : (
              <form onSubmit={handleBuy} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
                {/* Card header */}
                <div className="bg-secondary-950 p-5">
                  <p className="text-secondary-400 text-xs uppercase font-bold tracking-wider">Ticket Price</p>
                  <p className="text-primary-400 font-extrabold text-3xl mt-1">GHS {ticketPrice.toFixed(2)}</p>
                  <p className="text-secondary-400 text-xs mt-0.5">per ticket</p>
                </div>

                <div className="p-5 space-y-5">
                  {purchaseError && (
                    <div className="p-3 bg-accent-50 dark:bg-accent-950/20 border border-accent-200/50 text-accent-600 dark:text-accent-400 rounded-xl flex items-start gap-2 text-xs">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{purchaseError}</span>
                    </div>
                  )}

                  {/* Quantity */}
                  <div>
                    <label className="block text-xs font-bold text-secondary-600 dark:text-secondary-400 uppercase tracking-wider mb-2">Number of Tickets</label>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      {QUICK_QUANTITIES.map(q => (
                        <button
                          key={q} type="button" onClick={() => handleQuickQty(q)}
                          className={`py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${!customQty && quantity === q ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 hover:border-primary-400'}`}
                        >{q}</button>
                      ))}
                    </div>
                    <input
                      type="number" min="1" max="100" placeholder="Or enter custom amount"
                      value={customQty} onChange={(e) => setCustomQty(e.target.value)}
                      className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-xl bg-secondary-50 dark:bg-secondary-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-secondary-600 dark:text-secondary-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" /> Phone Number
                    </label>
                    <input
                      type="tel" placeholder="0XX XXX XXXX" value={phone} onChange={(e) => setPhone(e.target.value)}
                      className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-xl bg-secondary-50 dark:bg-secondary-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Payment method */}
                  <div>
                    <label className="block text-xs font-bold text-secondary-600 dark:text-secondary-400 uppercase tracking-wider mb-2">Payment Method</label>
                    <div className="space-y-2">
                      {PAYMENT_METHODS.map(m => (
                        <button
                          key={m.id} type="button" onClick={() => setPaymentMethod(m.id)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${paymentMethod === m.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-secondary-200 dark:border-secondary-700 hover:border-primary-300'}`}
                        >
                          <span className="text-2xl">{m.icon}</span>
                          <div>
                            <p className="text-sm font-bold text-secondary-900 dark:text-white">{m.label}</p>
                            <p className="text-xxs text-secondary-500 dark:text-secondary-400">{m.desc}</p>
                          </div>
                          {paymentMethod === m.id && <CheckCircle className="w-5 h-5 text-primary-500 ml-auto flex-shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Promo code */}
                  <div>
                    <label className="block text-xs font-bold text-secondary-600 dark:text-secondary-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Promo Code (optional)
                    </label>
                    <input
                      type="text" placeholder="Enter promo code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-xl bg-secondary-50 dark:bg-secondary-800 text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* Price total */}
                  <div className="border-t border-secondary-100 dark:border-secondary-800 pt-4 space-y-2">
                    <div className="flex justify-between text-sm text-secondary-600 dark:text-secondary-400">
                      <span>{effectiveQty} ticket{effectiveQty > 1 ? 's' : ''} × GHS {ticketPrice.toFixed(2)}</span>
                      <span>GHS {totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-extrabold text-secondary-900 dark:text-white">
                      <span>Total</span>
                      <span className="text-primary-500">GHS {totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit" disabled={purchasing || isFull}
                    className="w-full premium-button-primary py-4 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 disabled:opacity-60"
                  >
                    {purchasing ? <RefreshCw className="w-5 h-5 animate-spin" /> : isFull ? 'Raffle Full — Draw Pending' : <><Ticket className="w-5 h-5" /> Buy {effectiveQty} Ticket{effectiveQty > 1 ? 's' : ''} — GHS {totalAmount.toFixed(2)}</>}
                  </button>

                  {!isAuthenticated && (
                    <p className="text-center text-xs text-secondary-500 dark:text-secondary-400">
                      <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link> to purchase tickets
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaffleDetail;
export { RaffleDetail };
