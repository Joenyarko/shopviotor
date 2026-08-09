import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import raffleService from '../../services/raffleService';
import { Trophy, ArrowLeft, RefreshCw, Gift } from 'lucide-react';

const gradients = [
  'from-teal-500 to-orange-400',
  'from-emerald-500 to-teal-700',
  'from-blue-500 to-purple-600',
  'from-pink-500 to-orange-400',
  'from-violet-500 to-indigo-600',
  'from-amber-400 to-rose-500',
  'from-cyan-500 to-blue-600',
  'from-fuchsia-500 to-pink-600',
];



const RaffleWinners = () => {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchWinners = async (p = 1) => {
    if (p === 1) setLoading(true);
    try {
      const res = await raffleService.getWinners({ page: p, per_page: 12 });
      const data = res.data?.data || res.data || [];
      if (p === 1) {
        setWinners(data);
      } else {
        setWinners(prev => [...prev, ...data]);
      }
      setHasMore(data.length === 12);
    } catch {
      if (p === 1) setWinners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWinners(1); }, []);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchWinners(next);
  };

  return (
    <div className="-mx-4 md:-mx-8 -mt-6 pb-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-secondary-950 via-[#0a1628] to-secondary-900 px-6 py-14 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <span className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase px-4 py-1.5 rounded-full mb-4">
            🏆 Hall of Fame
          </span>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-3">
            Our Lucky <span className="text-primary-400">Winners</span>
          </h1>
          <p className="text-secondary-400 text-sm md:text-base max-w-xl mx-auto">
            Real people, real prizes, real joy. These are the champions who played their tickets and won big. You could be next!
          </p>
          <div className="flex justify-center gap-6 mt-8">
            {[
              { val: winners.length, label: 'Total Winners' },
              { val: 'GHS 5+', label: 'Lowest Ticket' },
              { val: 'Weekly', label: 'Draw Frequency' },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-extrabold text-white">{val}</p>
                <p className="text-secondary-500 dark:text-secondary-400 text-xs">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Winners Grid */}
      <div className="px-6 py-10 bg-secondary-950">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">All Winners</h2>
            <Link to="/raffles" className="flex items-center gap-1.5 text-secondary-400 hover:text-primary-400 text-sm font-semibold transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Raffles
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                <div key={i} className="animate-pulse bg-secondary-800 rounded-2xl aspect-[3/4]" />
              ))}
            </div>
          ) : winners.length === 0 ? (
            <div className="text-center py-20 text-secondary-400">
              <Gift className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-semibold">No winners yet. Play your first ticket!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {winners.map((winner, i) => {
                const grad = gradients[i % gradients.length];
                return (
                  <div key={winner.id || i} className="relative rounded-2xl overflow-hidden group">
                    {/* Gradient background */}
                    <div className={`bg-gradient-to-br ${grad} aspect-[3/4] flex flex-col items-center justify-center`}>
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-2">
                        <Trophy className="w-8 h-8 text-white/80" />
                      </div>
                    </div>
                    {/* Winner badge */}
                    <span className="absolute top-3 left-3 bg-primary-500 text-secondary-900 text-xxs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      🏆 Winner
                    </span>
                    {/* Info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4">
                      <p className="text-white font-bold text-sm truncate">{winner.user_name || winner.user?.name}</p>
                      <p className="text-secondary-300 text-xs line-clamp-1 mt-0.5">Won {winner.raffle_title || winner.raffle?.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-primary-400 font-extrabold text-sm">
                          GHS {parseFloat(winner.ticket_price || winner.prize_value || 0).toLocaleString()}
                        </span>
                      </div>
                      {winner.draw_date && (
                        <p className="text-white/80 font-medium text-xxs mt-1">
                          📅 {new Date(winner.draw_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {hasMore && !loading && (
            <div className="mt-10 text-center">
              <button onClick={loadMore} className="border border-white/20 text-white hover:bg-white/10 font-semibold px-8 py-3 rounded-xl transition-colors text-sm inline-flex items-center gap-2">
                Load More Winners <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 px-6 py-12 text-center">
        <h2 className="text-2xl font-extrabold text-secondary-900 mb-2">You Could Be Next! 🎉</h2>
        <p className="text-secondary-800 dark:text-secondary-100 text-sm mb-6">Join thousands of players. Buy your ticket for as low as GHS 5!</p>
        <Link to="/raffles" className="inline-flex items-center gap-2 bg-secondary-900 text-white hover:bg-secondary-800 font-bold px-8 py-3.5 rounded-2xl transition-colors text-sm">
          Browse Active Raffles
        </Link>
      </div>
    </div>
  );
};

export default RaffleWinners;
export { RaffleWinners };
