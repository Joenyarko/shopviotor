import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import raffleService from '../../services/raffleService';
import { Ticket, RefreshCw, Trophy, Clock, CheckCircle, XCircle, ArrowRight } from 'lucide-react';

const statusConfig = {
  active: { label: 'Active', icon: Clock, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-950/20 border-blue-200/50' },
  won: { label: 'Won! 🏆', icon: Trophy, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-950/20 border-amber-200/50' },
  lost: { label: 'Not won', icon: XCircle, color: 'text-secondary-500 dark:text-secondary-400', bg: 'bg-secondary-100 dark:bg-secondary-800 border-secondary-200 dark:border-secondary-700' },
  drawn: { label: 'Draw Complete', icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-950/20 border-emerald-200/50' },
};

const MOCK_TICKETS = [
  { id: 1, ticket_number: 'TKT-0042', raffle: { title: 'Samsung Galaxy A16', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=60', uuid: 'mock-1', draw_date: new Date(Date.now() + 4 * 86400000).toISOString() }, quantity: 3, amount_paid: 15, status: 'active', purchased_at: new Date().toISOString() },
  { id: 2, ticket_number: 'TKT-0028', raffle: { title: 'iPhone 17 Pro Max', image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&auto=format&fit=crop&q=60', uuid: 'mock-2', draw_date: '2025-12-01' }, quantity: 1, amount_paid: 10, status: 'lost', purchased_at: '2025-12-01T10:00:00Z' },
  { id: 3, ticket_number: 'TKT-0015', raffle: { title: 'TCL 55" Smart TV', image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=300&auto=format&fit=crop&q=60', uuid: 'mock-3', draw_date: '2026-06-14' }, quantity: 5, amount_paid: 25, status: 'won', purchased_at: '2026-06-01T08:00:00Z' },
];

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await raffleService.getMyTickets({ _t: Date.now() });
        window.__debug_raw_res = res;
        console.log("MyTickets fetch res:", res);
        let rawData = res.data?.data || res.data || res || [];
        console.log("MyTickets rawData:", rawData);
        
        // Group tickets by raffle
        const grouped = rawData.reduce((acc, ticket) => {
          const rId = ticket.raffle_id || ticket.raffle?.id;
          if (!acc[rId]) {
            acc[rId] = {
              ...ticket,
              quantity: 1,
              amount_paid: parseFloat(ticket.amount_paid || 0),
            };
          } else {
            acc[rId].quantity += 1;
            acc[rId].amount_paid += parseFloat(ticket.amount_paid || 0);
            if (ticket.is_winner) acc[rId].is_winner = true;
          }
          return acc;
        }, {});

        // Compute status for real data
        const processedData = Object.values(grouped).map(t => {
          let status = 'active';
          const rStatus = t.raffle?.status;
          if (rStatus === 'completed' || rStatus === 'closed') {
            status = t.is_winner ? 'won' : 'lost';
          }
          return { ...t, status };
        });

        setTickets(processedData);
      } catch (e) {
        console.error(e);
        window.__debug_error = e.message || e.toString();
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  const counts = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    acc.all = (acc.all || 0) + 1;
    return acc;
  }, { all: 0 });

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-primary-500" />
            </div>
            My Tickets
          </h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Track all your raffle ticket purchases.</p>
        </div>
        <Link to="/raffles" className="text-sm font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1 hover:underline">
          Browse Raffles <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { key: 'all', label: 'Total Tickets', color: 'bg-secondary-100 dark:bg-secondary-800' },
          { key: 'active', label: 'Active', color: 'bg-blue-50 dark:bg-blue-950/20' },
          { key: 'won', label: 'Won', color: 'bg-amber-50 dark:bg-amber-950/20' },
          { key: 'lost', label: 'Not Won', color: 'bg-secondary-100 dark:bg-secondary-800' },
        ].map(({ key, label, color }) => (
          <div key={key} className={`${color} rounded-xl p-4 text-center border border-secondary-200/50 dark:border-secondary-700/50`}>
            <p className="text-2xl font-extrabold text-secondary-900 dark:text-white">{counts[key] || 0}</p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {['all', 'active', 'won', 'lost'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all ${filter === f ? 'bg-primary-500 text-secondary-900' : 'bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 text-secondary-600 dark:text-secondary-400 hover:border-primary-400'}`}
          >{f === 'all' ? 'All Tickets' : f}</button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-white dark:bg-secondary-900 rounded-2xl h-28 border border-secondary-200 dark:border-secondary-800" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl">
          <Ticket className="w-12 h-12 mx-auto mb-3 text-secondary-300 opacity-60" />
          <p className="font-semibold text-secondary-600 dark:text-secondary-400">No {filter !== 'all' ? filter : ''} tickets found.</p>
          {window.__debug_error && (
            <p className="text-red-500 mt-4 text-xs font-mono">{window.__debug_error}</p>
          )}
          {window.__debug_raw_res && (
             <p className="text-blue-500 mt-2 text-xs font-mono">{JSON.stringify(window.__debug_raw_res).substring(0, 200)}</p>
          )}
          <Link to="/raffles" className="inline-flex items-center gap-2 mt-4 bg-primary-500 text-secondary-900 font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-primary-600 transition-colors">
            Buy Your First Ticket
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(ticket => {
            const cfg = statusConfig[ticket.status] || statusConfig.active;
            const StatusIcon = cfg.icon;
            const drawDate = ticket.raffle?.drawn_at ? new Date(ticket.raffle.drawn_at) : null;

            return (
              <div key={ticket.id} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4 p-4">
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-secondary-100 dark:bg-secondary-800 flex-shrink-0">
                    {ticket.raffle?.image ? (
                      <img src={ticket.raffle.image} alt={ticket.raffle.title} className="w-full h-full object-cover" />
                    ) : (
                      <Ticket className="w-8 h-8 text-secondary-300 m-auto mt-6" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-secondary-900 dark:text-white text-sm line-clamp-1">
                          {ticket.raffle?.title || 'Raffle Prize'}
                        </p>
                        <p className="text-xxs font-mono text-secondary-400 mt-0.5">{ticket.ticket_number}</p>
                      </div>
                      <span className={`flex-shrink-0 inline-flex items-center gap-1 text-xxs font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3" />{cfg.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                      <span className="text-xs text-secondary-500 dark:text-secondary-400">
                        <span className="font-semibold text-secondary-900 dark:text-white">{ticket.quantity}</span> ticket{ticket.quantity > 1 ? 's' : ''}
                      </span>
                      <span className="text-xs text-secondary-500 dark:text-secondary-400">
                        Paid: <span className="font-semibold text-secondary-900 dark:text-white">GHS {parseFloat(ticket.amount_paid || 0).toFixed(2)}</span>
                      </span>
                      {drawDate && (
                        <span className="text-xs text-secondary-400">
                          Draw: {drawDate.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Won banner */}
                {ticket.status === 'won' && (
                  <div className="bg-gradient-to-r from-amber-400 to-primary-500 px-4 py-2 flex items-center justify-between">
                    <span className="font-bold text-secondary-900 text-xs flex items-center gap-1.5">🏆 You won this raffle! Congratulations!</span>
                    <Link to="/messages" className="text-secondary-900 text-xxs font-bold underline">Contact Us</Link>
                  </div>
                )}

                {/* View raffle link */}
                {ticket.raffle?.uuid && ticket.status === 'active' && (
                  <div className="border-t border-secondary-100 dark:border-secondary-800 px-4 py-2.5 flex justify-end">
                    <Link to={`/raffles/${ticket.raffle.uuid}`} className="text-xs text-primary-600 dark:text-primary-400 font-semibold flex items-center gap-1 hover:underline">
                      View Raffle <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTickets;
export { MyTickets };
