import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import raffleService from '../../services/raffleService';
import {
  Ticket, Sparkles, RefreshCw, Trophy, ChevronRight,
  Zap, Star, Clock, Users, ArrowRight, Gift
} from 'lucide-react';
import HeroBanner from '../../components/marketing/HeroBanner';
import DotPagination from '../../components/DotPagination';

// ──────────────────────────────────────────────
// Countdown Timer hook
// ──────────────────────────────────────────────
function useCountdown(targetDate) {
  const calc = () => {
    const diff = new Date(targetDate) - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [targetDate]);
  return time;
}

// ──────────────────────────────────────────────
// Raffle Card
// ──────────────────────────────────────────────
function RaffleCard({ raffle }) {
  const maxLimit = raffle.max_tickets || raffle.max_participants;
  const progress = maxLimit
    ? Math.min(((raffle.tickets_sold || 0) / maxLimit) * 100, 100)
    : 0;
  const isFull = progress >= 100;

  return (
    <Link
      to={`/raffles/${raffle.uuid || raffle.id}`}
      className="group flex flex-col bg-white border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      {/* Image Container (White Background) */}
      <div className="relative h-48 sm:h-56 bg-white flex items-center justify-center p-6">
        <img
          src={raffle.image ? (raffle.image.startsWith('http') ? raffle.image : `${import.meta.env.VITE_STORAGE_URL}/${raffle.image}`) : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=60'}
          alt={raffle.title}
          className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=60'; }}
        />
        {/* Share Icon Placeholder */}
        <div className="absolute top-3 right-3 bg-slate-100 rounded-full p-2 text-secondary-500 dark:text-secondary-400 hover:text-slate-600 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
        </div>
      </div>

      {/* Body (Dark Navy Background) */}
      <div className="flex-1 flex flex-col bg-white dark:bg-secondary-900 p-5">
        {/* Category Badge */}
        {raffle.category && (
          <div className="inline-flex items-center gap-1.5 bg-primary-500/10 text-primary-600 dark:text-primary-400 border border-primary-500/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md w-fit mb-3">
            <span className="w-2.5 h-2.5 bg-primary-500 rounded-sm"></span> {raffle.category}
          </div>
        )}
        
        <h3 className="font-extrabold text-secondary-900 dark:text-white text-sm leading-snug line-clamp-2 group-hover:text-primary-600 dark:text-primary-400 transition-colors mb-2">{raffle.title}</h3>
        
        {raffle.description && (
          <p className="text-secondary-500 dark:text-secondary-400 text-xs line-clamp-2 leading-relaxed mb-4">{raffle.description}</p>
        )}

        <div className="mt-auto space-y-2">
          <div className="flex justify-between text-[11px] font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider mb-2">
            <span>Tickets Sold</span>
            <span>{raffle.tickets_sold || 0}/{maxLimit || '∞'}</span>
          </div>
          <div className="w-full bg-secondary-100 dark:bg-secondary-800 h-1.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-700 ${isFull ? 'bg-primary-500' : 'bg-gradient-to-r from-primary-600 to-primary-400'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {raffle.ends_at && (
            <div className="mt-2 text-[10px] font-bold text-secondary-400 uppercase">
              Ends: {new Date(raffle.ends_at).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-secondary-50 dark:bg-secondary-950 px-5 py-4 border-t border-secondary-200 dark:border-secondary-800 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-secondary-400 dark:text-secondary-500 font-bold uppercase tracking-widest mb-0.5">Ticket Price</p>
          <p className="text-amber-500 dark:text-amber-400 font-extrabold text-lg leading-none">GHS {parseFloat(raffle.ticket_price || 0).toFixed(2)}</p>
        </div>
        <div className="bg-primary-500 hover:bg-primary-600 text-secondary-900 font-extrabold text-xs px-4 py-2 rounded-lg transition-colors shadow-sm">
          Buy Ticket
        </div>
      </div>
    </Link>
  );
}

// ──────────────────────────────────────────────
// Winner Card (gradient style like TechFortune)
// ──────────────────────────────────────────────
const gradients = [
  'from-teal-500 to-orange-400',
  'from-emerald-500 to-teal-700',
  'from-blue-500 to-purple-600',
  'from-pink-500 to-orange-400',
  'from-violet-500 to-indigo-600',
  'from-amber-400 to-rose-500',
];

function WinnerCard({ winner, index }) {
  const grad = gradients[index % gradients.length];
  return (
    <div className="relative rounded-2xl overflow-hidden flex-shrink-0 w-56">
      <div className={`bg-gradient-to-br ${grad} aspect-[3/4] flex flex-col items-center justify-center`}>
        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3">
          <Trophy className="w-8 h-8 text-secondary-900 dark:text-white/80" />
        </div>
        <span className="absolute top-3 left-3 bg-primary-500 text-secondary-900 text-xxs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
          🏆 Winner
        </span>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
        <p className="text-secondary-900 dark:text-white font-bold text-sm truncate">{winner.user_name || winner.user?.name || 'Lucky Winner'}</p>
        <p className="text-secondary-300 text-xs line-clamp-1">Won {winner.raffle_title || winner.raffle?.title || 'a prize'}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-primary-400 font-bold text-sm">GHS {parseFloat(winner.ticket_price || winner.amount_paid || 0).toFixed(2)}</span>
          {winner.draw_date && (
            <span className="text-secondary-400 text-xxs">📅 {new Date(winner.draw_date).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// MAIN PAGE
// ──────────────────────────────────────────────
const Raffles = () => {
  const [raffles, setRaffles] = useState([]);
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, winners: 0, minPrice: 0 });
  
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 9;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [raffleRes, winnerRes] = await Promise.allSettled([
          raffleService.getRaffles({ status: 'active' }),
          raffleService.getWinners({ limit: 8 }),
        ]);
        const raffleData = raffleRes.status === 'fulfilled'
          ? (raffleRes.value.data?.data || raffleRes.value.data || [])
          : [];
        const winnerData = winnerRes.status === 'fulfilled'
          ? (winnerRes.value.data?.data || winnerRes.value.data || [])
          : [];

        setRaffles(raffleData);
        setWinners(winnerData);
        const prices = raffleData.map(r => parseFloat(r.ticket_price || 0)).filter(p => p > 0);
        setStats({
          active: raffleData.length,
          winners: winnerData.length,
          minPrice: prices.length ? Math.min(...prices) : 0,
        });
      } catch (e) {
        console.error(e);
        setRaffles([]);
        setWinners([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="-mx-4 md:-mx-8 -mt-6">
      {/* ── HERO BANNER ── */}
      <HeroBanner position="raffle_hero" fallbackContent={
        <div className="relative bg-gradient-to-br from-secondary-950 via-[#0a1628] to-secondary-900 px-6 py-16 md:py-24 overflow-hidden">
          {/* decorative orbs */}
          <div className="absolute top-10 left-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-4xl mx-auto text-center space-y-6">
            <span className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-500/30 text-primary-400 text-xs font-bold uppercase px-4 py-1.5 rounded-full tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Live Raffles — Play & Win
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-secondary-900 dark:text-white leading-tight">
              Win <span className="text-primary-400">Premium</span> Prizes<br />
              for Just a Few Cedis!
            </h1>
            <p className="text-secondary-400 text-base md:text-lg max-w-xl mx-auto">
              Buy low-cost tickets and stand a chance to win high-value tech gadgets, appliances, and more every week.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-2">
              <button onClick={() => document.getElementById('active-raffles')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold px-8 py-3.5 rounded-2xl transition-colors flex items-center gap-2 text-sm shadow-lg shadow-primary-500/30">
                <Ticket className="w-5 h-5" /> Browse Active Raffles
              </button>
              <Link to="/raffles/winners" className="border border-white/20 text-secondary-900 dark:text-white hover:bg-white/10 font-semibold px-6 py-3.5 rounded-2xl transition-colors flex items-center gap-2 text-sm">
                <Trophy className="w-5 h-5" /> View All Winners
              </Link>
            </div>

            {/* Stats strip */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {[
                { icon: Zap, label: 'Active Raffles', val: stats.active },
                { icon: Trophy, label: 'Total Winners', val: stats.winners },
                { icon: Star, label: 'Tickets From', val: `GHS ${stats.minPrice.toFixed(2)}` },
              ].map(({ icon: Icon, label, val }) => (
                <div key={label} className="text-center">
                  <div className="flex items-center justify-center gap-1.5 text-primary-400 mb-1">
                    <Icon className="w-4 h-4" />
                    <span className="text-2xl font-extrabold text-secondary-900 dark:text-white">{val}</span>
                  </div>
                  <p className="text-secondary-500 dark:text-secondary-400 text-xs">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      } />

      {/* ── HOW IT WORKS ── */}
      <div className="bg-white dark:bg-secondary-950 px-6 py-14">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold text-secondary-900 dark:text-secondary-900 dark:text-white">How It Works</h2>
            <p className="text-secondary-500 dark:text-secondary-400 mt-2 text-sm">Simple, transparent, and secure. Three steps to your dream prize.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: '01', icon: Ticket, color: 'bg-emerald-500', title: 'Choose Your Raffle', desc: 'Browse active raffles and select the prize you want to win.' },
              { num: '02', icon: Zap, color: 'bg-orange-500', title: 'Buy Tickets', desc: 'Purchase tickets using Mobile Money (MTN, Vodafone, AirtelTigo) or Paystack.' },
              { num: '03', icon: Trophy, color: 'bg-primary-500', title: 'Win Prizes', desc: 'Wait for the draw and get notified if you win. Collect your prize!' },
            ].map(({ num, icon: Icon, color, title, desc }) => (
              <div key={num} className="relative bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-md`}>
                  <Icon className="w-7 h-7 text-secondary-900 dark:text-white" />
                </div>
                <span className="absolute top-3 right-4 text-5xl font-extrabold text-secondary-100 dark:text-secondary-800 dark:text-secondary-100 select-none">{num}</span>
                <h3 className="font-bold text-secondary-900 dark:text-secondary-900 dark:text-white">{title}</h3>
                <p className="text-secondary-500 dark:text-secondary-400 text-xs mt-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ACTIVE RAFFLES ── */}
      <div id="active-raffles" className="bg-secondary-950 px-6 py-14">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-secondary-900 dark:text-white">Active Raffles</h2>
              <p className="text-secondary-400 text-sm mt-1">Exclusive raffles — bigger prizes, better chances!</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-secondary-900 rounded-2xl h-96 border border-white/5" />
              ))}
            </div>
          ) : raffles.length === 0 ? (
            <div className="text-center py-20 border border-white/10 rounded-2xl text-secondary-400">
              <Gift className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-semibold">No active raffles at the moment. Check back soon!</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {raffles.slice((currentPage - 1) * limit, currentPage * limit).map(raffle => (
                  <RaffleCard key={raffle.uuid || raffle.id} raffle={raffle} />
                ))}
              </div>
              <div className="mt-10 flex justify-center">
                <DotPagination
                  totalPages={Math.ceil(raffles.length / limit)}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── RECENT WINNERS ── */}
      {winners.length > 0 && (
        <div className="bg-secondary-900 px-6 py-14">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">Recent Winners</h2>
              <p className="text-secondary-400 text-sm mt-2 max-w-lg mx-auto">
                Real people, real prizes, real joy. See who's been lucky recently and get inspired to play your next winning ticket.
              </p>
              <Link to="/raffles/winners" className="inline-block mt-4 text-primary-500 hover:text-primary-400 font-bold hover:underline transition-colors">
                View Complete Winner History →
              </Link>
            </div>

            {/* Horizontal scroll strip */}
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
              {winners.map((winner, i) => (
                <WinnerCard key={winner.id || i} winner={winner} index={i} />
              ))}
            </div>

            <div className="text-center mt-8">
              <Link to="/raffles/winners" className="inline-flex items-center gap-2 border border-white/20 text-secondary-900 dark:text-white hover:bg-white/10 font-semibold px-6 py-3 rounded-xl transition-colors text-sm">
                View All Winners <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-6 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-extrabold text-secondary-900 mb-3">Ready to Win Your Next Prize?</h2>
          <p className="text-secondary-800 dark:text-secondary-100 text-sm mb-6">Join thousands of winners. Every ticket is your chance to change your story.</p>
          <Link to="#active-raffles" className="inline-flex items-center gap-2 bg-secondary-900 text-secondary-900 dark:text-white hover:bg-secondary-800 font-bold px-8 py-3.5 rounded-2xl transition-colors text-sm">
            <Ticket className="w-5 h-5" /> Buy Tickets Now
          </Link>
        </div>
      </div>
    </div>
  );
};



export default Raffles;
export { Raffles };
