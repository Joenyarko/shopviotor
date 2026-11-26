import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import hpService from '../../services/hpService';
import {
  Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Copy, Check, Phone, ArrowRight, RefreshCw, Calendar, Wallet, Layers
} from 'lucide-react';

const SCHEDULE_LABELS = {
  monthly: { title: 'Monthly', unit: 'Month' },
  weekly: { title: 'Weekly', unit: 'Week' },
  daily: { title: 'Daily', unit: 'Day' },
};

const STATUS_BADGE = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
  active: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  defaulted: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-800',
  cancelled: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-300 border-secondary-200 dark:border-secondary-700',
};

const formatGHS = (val) => `GHS ${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return String(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const MyHirePurchases = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [filterMap, setFilterMap] = useState({});
  const [copiedKey, setCopiedKey] = useState('');

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await hpService.getAgreements({ per_page: 50 });
      const list = res.data?.data?.data || res.data?.data || res.data || [];
      const arr = Array.isArray(list) ? list : [];
      setPlans(arr);
      if (arr.length > 0 && !expandedId) {
        setExpandedId(arr[0].id || arr[0].uuid);
      }
    } catch (e) {
      console.error('Failed to load hire purchase plans:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  const totalPaidAll = plans.reduce((acc, p) => acc + Number(p.amount_paid || 0), 0);
  const totalRemainingAll = plans.reduce((acc, p) => acc + Number(p.balance_remaining || 0), 0);
  const activeCount = plans.filter((p) => ['pending', 'active'].includes(p.status)).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            <Clock className="w-3.5 h-3.5" /> Hire Purchase Tracker
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-secondary-900 dark:text-white mt-1">
            My Hire Purchase Plans
          </h1>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">
            Track your deposit, installments paid, and remaining balance across your chosen schedule.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchPlans}
            className="p-2.5 rounded-xl border border-secondary-200 dark:border-secondary-700 text-secondary-600 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
            title="Refresh plans"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/hire-purchase"
            className="premium-button-primary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 shadow-sm"
          >
            Browse HP Items <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Summary Stats */}
      {!loading && plans.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-secondary-500">Active / Pending</p>
              <p className="text-2xl font-extrabold text-secondary-900 dark:text-white mt-1">{activeCount}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-950/30 text-primary-600">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-secondary-500">Total Paid So Far</p>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{formatGHS(totalPaidAll)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-secondary-500">Total Balance Left</p>
              <p className="text-2xl font-extrabold text-secondary-900 dark:text-white mt-1">{formatGHS(totalRemainingAll)}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* Plans List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
          <p className="text-sm font-medium text-secondary-500">Loading your hire purchase plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl p-10 text-center space-y-4">
          <Clock className="w-12 h-12 text-secondary-300 dark:text-secondary-700 mx-auto" />
          <h2 className="text-xl font-bold text-secondary-900 dark:text-white">No Hire Purchase Plans Yet</h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400 max-w-md mx-auto">
            Configure a flexible daily, weekly, or monthly hire purchase plan on any eligible product and track every payment right here.
          </p>
          <Link
            to="/hire-purchase"
            className="premium-button-primary px-6 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2"
          >
            Explore Hire Purchase Items <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-5">
          {plans.map((plan) => {
            const planId = plan.id || plan.uuid;
            const isExpanded = expandedId === planId;
            const scheduleKey = (plan.payment_schedule || 'monthly').toLowerCase();
            const scheduleMeta = SCHEDULE_LABELS[scheduleKey] || SCHEDULE_LABELS.monthly;
            const installments = Array.isArray(plan.installments) ? plan.installments : [];
            const paidInstallments = installments.filter((i) => i.status === 'paid');
            const pendingInstallments = installments.filter((i) => i.status !== 'paid');
            const nextPending = pendingInstallments[0] || null;
            const activeTab = filterMap[planId] || 'all';

            const filteredInstallments = installments.filter((inst) => {
              if (activeTab === 'paid') return inst.status === 'paid';
              if (activeTab === 'pending') return inst.status !== 'paid';
              return true;
            });

            const productImg =
              plan.product?.primary_image ||
              plan.product?.images?.[0]?.url ||
              'https://via.placeholder.com/120?text=HP';

            const progress = Math.min(100, Math.max(0, Number(plan.payment_progress || 0)));
            const badgeClass = STATUS_BADGE[plan.status] || STATUS_BADGE.pending;
            const refCode = plan.deposit_reference || planId?.slice(0, 8)?.toUpperCase();

            return (
              <div
                key={planId}
                className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Plan Header Summary */}
                <div className="p-4 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div className="flex items-start gap-3.5 min-w-0">
                      <img
                        src={productImg}
                        alt={plan.product?.name || 'Product'}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-contain bg-secondary-50 dark:bg-secondary-800 p-1.5 border border-secondary-100 dark:border-secondary-700 shrink-0"
                      />
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                            {plan.status_label || plan.status}
                          </span>
                          <span className="text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300">
                            {scheduleMeta.title} Plan &bull; {plan.duration_months} mo
                          </span>
                        </div>
                        <h3 className="text-base sm:text-lg font-extrabold text-secondary-900 dark:text-white truncate">
                          {plan.product?.name || 'Hire Purchase Agreement'}
                        </h3>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">
                          Ref: <span className="font-mono font-bold text-secondary-700 dark:text-secondary-200">{refCode}</span>
                          {' '}&bull; Started {formatDate(plan.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-secondary-100 dark:border-secondary-800">
                      <span className="text-[11px] uppercase font-bold text-secondary-400">Balance Left</span>
                      <span className="text-xl sm:text-2xl font-black text-secondary-900 dark:text-white">
                        {formatGHS(plan.balance_remaining)}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar + Paid / Total Metrics */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Paid: {formatGHS(plan.amount_paid)} ({progress.toFixed(1)}%)
                      </span>
                      <span className="text-secondary-500 dark:text-secondary-400">
                        Total Financed: {formatGHS(plan.total_amount)}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Breakdown Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="bg-secondary-50 dark:bg-secondary-800/60 rounded-xl p-2.5 border border-secondary-100 dark:border-secondary-800">
                      <span className="text-[10px] uppercase font-bold text-secondary-400 block">Deposit</span>
                      <span className="font-bold text-secondary-900 dark:text-white">
                        {formatGHS(plan.deposit_amount)}
                      </span>
                      <span className={`block text-[10px] font-bold mt-0.5 ${plan.deposit_paid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {Number(plan.deposit_amount || 0) === 0 ? 'Zero deposit' : (plan.deposit_paid ? 'Confirmed' : 'Pending confirmation')}
                      </span>
                    </div>

                    <div className="bg-secondary-50 dark:bg-secondary-800/60 rounded-xl p-2.5 border border-secondary-100 dark:border-secondary-800">
                      <span className="text-[10px] uppercase font-bold text-secondary-400 block">Installments Paid</span>
                      <span className="font-bold text-secondary-900 dark:text-white">
                        {paidInstallments.length} / {installments.length}
                      </span>
                      <span className="block text-[10px] text-secondary-500 mt-0.5">
                        {pendingInstallments.length} left
                      </span>
                    </div>

                    <div className="bg-secondary-50 dark:bg-secondary-800/60 rounded-xl p-2.5 border border-secondary-100 dark:border-secondary-800">
                      <span className="text-[10px] uppercase font-bold text-secondary-400 block">Per {scheduleMeta.unit}</span>
                      <span className="font-bold text-secondary-900 dark:text-white">
                        {formatGHS(nextPending?.amount_due || installments[0]?.amount_due || plan.monthly_installment)}
                      </span>
                      <span className="block text-[10px] text-secondary-500 mt-0.5 capitalize">{scheduleMeta.title}</span>
                    </div>

                    <div className="bg-secondary-50 dark:bg-secondary-800/60 rounded-xl p-2.5 border border-secondary-100 dark:border-secondary-800">
                      <span className="text-[10px] uppercase font-bold text-secondary-400 block">Next Due Date</span>
                      <span className="font-bold text-secondary-900 dark:text-white flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-primary-500 shrink-0" />
                        {nextPending ? formatDate(nextPending.due_date) : 'Paid Off'}
                      </span>
                      <span className="block text-[10px] text-secondary-500 mt-0.5">
                        {nextPending ? `${scheduleMeta.unit} #${nextPending.installment_number}` : 'Completed'}
                      </span>
                    </div>
                  </div>

                  {/* Toggle Schedule Button */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : planId)}
                    className="w-full py-2.5 px-4 rounded-xl bg-secondary-50 dark:bg-secondary-800/80 hover:bg-secondary-100 dark:hover:bg-secondary-800 text-xs font-bold text-secondary-700 dark:text-secondary-200 flex items-center justify-center gap-2 transition-colors border border-secondary-200/70 dark:border-secondary-700"
                  >
                    {isExpanded ? (
                      <>Hide {scheduleMeta.title} Payment Schedule <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>View {scheduleMeta.title} Payment Schedule ({installments.length} periods) <ChevronDown className="w-4 h-4" /></>
                    )}
                  </button>
                </div>

                {/* Expanded Payment Schedule & MoMo Instructions */}
                {isExpanded && (
                  <div className="border-t border-secondary-200 dark:border-secondary-800 bg-secondary-50/50 dark:bg-secondary-950/40 p-4 sm:p-6 space-y-5">
                    {/* Direct MoMo Payment Box (if not completed) */}
                    {plan.status !== 'completed' && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                              Make Your Next Payment via Mobile Money
                            </h4>
                            <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                              Send to Merchant ID <strong>715041</strong> (<strong>Shop Viotor Ventures</strong>) using your reference below. Admin confirms and updates your tracker.
                            </p>
                          </div>
                          <a
                            href={`https://wa.me/233508208803?text=${encodeURIComponent(
                              `Hello Shop Viotor Ventures, I have made a Hire Purchase payment for Ref: ${refCode} (${plan.product?.name || 'HP Plan'}).`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 shadow-sm"
                          >
                            <Phone className="w-3.5 h-3.5" /> Send Receipt on WhatsApp
                          </a>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy('715041', `momo-${planId}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-secondary-900 border border-amber-200 dark:border-amber-800 text-xs font-bold text-secondary-800 dark:text-secondary-200 hover:bg-amber-100/60"
                          >
                            Merchant ID: <span className="font-mono text-primary-600 dark:text-primary-400">715041</span>
                            {copiedKey === `momo-${planId}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-secondary-400" />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopy(refCode, `ref-${planId}`)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-secondary-900 border border-amber-200 dark:border-amber-800 text-xs font-bold text-secondary-800 dark:text-secondary-200 hover:bg-amber-100/60"
                          >
                            Ref: <span className="font-mono text-primary-600 dark:text-primary-400">{refCode}</span>
                            {copiedKey === `ref-${planId}` ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-secondary-400" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Filter Tabs */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="text-sm font-extrabold text-secondary-900 dark:text-white">
                        {scheduleMeta.title} Installment Tracker
                      </h4>
                      <div className="inline-flex items-center gap-1 bg-white dark:bg-secondary-900 p-1 rounded-xl border border-secondary-200 dark:border-secondary-800 text-xs font-bold">
                        {[
                          { id: 'all', label: `All (${installments.length})` },
                          { id: 'pending', label: `Remaining (${pendingInstallments.length})` },
                          { id: 'paid', label: `Paid (${paidInstallments.length})` },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFilterMap((prev) => ({ ...prev, [planId]: tab.id }))}
                            className={`px-3 py-1 rounded-lg transition-colors ${
                              activeTab === tab.id
                                ? 'bg-primary-500 text-secondary-950'
                                : 'text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Installment Period Grid (responsive, zero horizontal overflow) */}
                    {filteredInstallments.length === 0 ? (
                      <p className="text-xs text-secondary-500 text-center py-6">No installments in this filter.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
                        {filteredInstallments.map((inst) => {
                          const isPaid = inst.status === 'paid';
                          const isOverdue = !isPaid && inst.is_overdue;
                          return (
                            <div
                              key={inst.id || inst.installment_number}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-colors ${
                                isPaid
                                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50'
                                  : isOverdue
                                  ? 'bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                                  : 'bg-white dark:bg-secondary-900 border-secondary-200 dark:border-secondary-800'
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  {isPaid ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  ) : isOverdue ? (
                                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                                  ) : (
                                    <Clock className="w-4 h-4 text-secondary-400 shrink-0" />
                                  )}
                                  <span className="text-xs font-extrabold text-secondary-900 dark:text-white">
                                    {scheduleMeta.unit} {inst.installment_number}
                                  </span>
                                </div>
                                <p className="text-[11px] text-secondary-500 dark:text-secondary-400 mt-0.5">
                                  {isPaid
                                    ? `Paid ${formatDate(inst.paid_at)}`
                                    : `Due ${formatDate(inst.due_date)}`}
                                </p>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="text-xs font-extrabold text-secondary-900 dark:text-white block">
                                  {formatGHS(isPaid ? (inst.amount_paid || inst.amount_due) : inst.amount_due)}
                                </span>
                                <span
                                  className={`text-[10px] font-bold uppercase ${
                                    isPaid
                                      ? 'text-emerald-600 dark:text-emerald-400'
                                      : isOverdue
                                      ? 'text-red-600 dark:text-red-400'
                                      : 'text-amber-600 dark:text-amber-400'
                                  }`}
                                >
                                  {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Pending'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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

export default MyHirePurchases;
export { MyHirePurchases };
