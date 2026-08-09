import Swal from 'sweetalert2';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import orderService from '../../services/orderService';
import tradeService from '../../services/tradeService';
import sellRequestService from '../../services/sellRequestService';
import authService from '../../services/authService';
import vendorService from '../../services/vendorService';
import { ShoppingBag, Scale, Truck, User, Key, CheckCircle, RefreshCw, Store } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [trades, setTrades] = useState([]);
  const [sells, setSells] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [submittingStudentId, setSubmittingStudentId] = useState(false);

  useEffect(() => {
    const fetchPortalData = async () => {
      try {
        const [ordersRes, tradesRes, sellsRes, storeRes] = await Promise.all([
          orderService.getOrders({ per_page: 5 }),
          tradeService.getTrades({ per_page: 5 }),
          sellRequestService.getSells({ per_page: 5 }),
          vendorService.getMyStore().catch(() => null),
        ]);

        setOrders(ordersRes.data?.data || ordersRes.data || []);
        setTrades(tradesRes.data?.data || tradesRes.data || []);
        setSells(sellsRes.data?.data || sellsRes.data || []);

        const myStoreData = storeRes?.data?.data || storeRes?.data || (storeRes && storeRes.uuid ? storeRes : null);
        if (myStoreData) {
          setStore(myStoreData);
          if (myStoreData.status === 'active' && user && user.role !== 'vendor' && user.role !== 'admin' && user.role !== 'super_admin') {
            updateUser({ ...user, role: 'vendor' });
          }
        }
      } catch (e) {
        console.error('Failed to load user portal overview:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchPortalData();
  }, []);

  const handleStudentIdSubmit = async (e) => {
    e.preventDefault();
    if (!studentIdInput.trim()) return;
    setSubmittingStudentId(true);
    try {
      const res = await authService.submitStudentVerification({ student_id: studentIdInput });
      updateUser(res.data.user);
      Swal.fire({
        icon: 'success',
        title: 'Submitted!',
        text: res.data.message || 'Your Student ID has been submitted and is pending approval.',
        confirmButtonColor: '#0ea5e9'
      });
      setStudentIdInput('');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: err.response?.data?.message || err.message || 'An error occurred.',
        confirmButtonColor: '#0ea5e9'
      });
    } finally {
      setSubmittingStudentId(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-secondary-900 dark:text-white">Customer Dashboard</h1>
        <p className="text-sm text-secondary-500 dark:text-secondary-400 mt-1">Hello, {user?.first_name}! View and manage your deals and swaps here.</p>
      </div>

      {/* Vendor Store Status Card */}
      {store && (
        <div className={`p-6 md:p-8 rounded-3xl border shadow-xl flex flex-col lg:flex-row items-center justify-between gap-6 transition-all ${
          store.status === 'active' 
            ? 'bg-gradient-to-r from-emerald-900 via-teal-900 to-cyan-900 border-emerald-500/30 text-white' 
            : 'bg-gradient-to-r from-amber-900/90 via-yellow-950 to-amber-900/90 border-amber-500/30 text-white'
        }`}>
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border ${
              store.status === 'active' ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-300' : 'bg-amber-500/20 border-amber-400/30 text-amber-300'
            }`}>
              <Store className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-2xl font-black tracking-tight">{store.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm ${
                  store.status === 'active' ? 'bg-emerald-400 text-emerald-950' : 'bg-amber-400 text-amber-950'
                }`}>
                  {store.status === 'active' ? '🎉 Approved Vendor' : '⏳ Pending Review'}
                </span>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed max-w-xl">
                {store.status === 'active' 
                  ? 'Your store is active and approved! Enter your dedicated Vendor Hub to add products, configure selling models, and track your store orders.'
                  : 'Your store application has been submitted and is currently waiting for admin approval. You will be able to access your Vendor Hub once activated.'}
              </p>
            </div>
          </div>
          {store.status === 'active' && (
            <div className="flex flex-wrap items-center gap-3 shrink-0 w-full lg:w-auto">
              <Link 
                to="/vendor" 
                className="flex-1 lg:flex-none px-6 py-3.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-400/20 transition-all active:scale-95"
              >
                <Store className="w-4 h-4" /> Go to Vendor Hub
              </Link>
              <a 
                href={`/shops/${store.slug}`} 
                target="_blank" 
                rel="noreferrer"
                className="flex-1 lg:flex-none px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-black text-sm flex items-center justify-center gap-2 transition-colors"
              >
                View Public Store
              </a>
            </div>
          )}
        </div>
      )}

      {/* Grid of stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">My Orders</span>
            <span className="block text-3xl font-extrabold text-secondary-900 dark:text-white mt-1">
              {loading ? '...' : orders.length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-950/20 text-primary-600">
            <ShoppingBag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Swaps / Trades</span>
            <span className="block text-3xl font-extrabold text-secondary-900 dark:text-white mt-1">
              {loading ? '...' : trades.length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 text-purple-600">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-6 rounded-2xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-xs font-bold text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">Sell Requests</span>
            <span className="block text-3xl font-extrabold text-secondary-900 dark:text-white mt-1">
              {loading ? '...' : sells.length}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/20 text-blue-600">
            <Truck className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Profile Card details */}
        <section className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 transition-colors">
          <h2 className="text-lg font-bold text-secondary-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-500" /> Account Profile
          </h2>
          <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs text-secondary-450">Full Name</span>
                  <span className="font-semibold text-secondary-900 dark:text-white">{user?.first_name} {user?.last_name}</span>
                </div>
                <div>
                  <span className="block text-xs text-secondary-450">Email Address</span>
                  <span className="font-semibold text-secondary-900 dark:text-white">{user?.email}</span>
                </div>
                <div>
                  <span className="block text-xs text-secondary-450">Phone Helpline</span>
                  <span className="font-semibold text-secondary-900 dark:text-white">{user?.phone || 'Not provided'}</span>
                </div>
                <div>
                  <span className="block text-xs text-secondary-450">User Role</span>
                  <span className="font-semibold text-secondary-900 dark:text-white capitalize">{user?.role}</span>
                </div>

                {/* Student Verification Details */}
                <div className="col-span-2 pt-4 border-t border-secondary-100 dark:border-secondary-800">
                  <span className="block text-xs font-bold text-secondary-500 uppercase tracking-wider mb-2">Student Verification Status</span>
                  {user?.student_verification_status === 'approved' ? (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5" />
                      <div>
                        <p className="font-bold text-sm">Verified Student</p>
                        <p className="text-xs">ID: {user?.student_id}</p>
                      </div>
                    </div>
                  ) : user?.student_verification_status === 'pending' ? (
                    <div className="flex items-center gap-2 text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <div>
                        <p className="font-bold text-sm">Verification Pending</p>
                        <p className="text-xs">Your ID ({user?.student_id}) is currently being reviewed.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
                      <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">You must verify your student ID to use Layaway, Hire Purchase, and Raffles.</p>
                      <form onSubmit={handleStudentIdSubmit} className="flex gap-2">
                        <input 
                          type="text" 
                          value={studentIdInput}
                          onChange={(e) => setStudentIdInput(e.target.value)}
                          placeholder="Enter Student ID" 
                          className="flex-1 px-3 py-2 bg-white dark:bg-secondary-950 border border-secondary-200 dark:border-secondary-700 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                          required
                        />
                        <button 
                          type="submit" 
                          disabled={submittingStudentId}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
                        >
                          {submittingStudentId ? 'Submitting...' : 'Verify'}
                        </button>
                      </form>
                      {user?.student_verification_status === 'rejected' && (
                        <p className="text-xs text-red-500 mt-2">Your previous submission was rejected. Please try again.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
          </div>
        </section>

        {/* Latest Activity logs / list */}
        <section className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 transition-colors">
          <h2 className="text-lg font-bold text-secondary-900 dark:text-white mb-4">Latest Transactions</h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-10 bg-secondary-100 dark:bg-secondary-800 rounded-lg" />
              <div className="h-10 bg-secondary-100 dark:bg-secondary-800 rounded-lg" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-xs text-secondary-500 dark:text-secondary-400">No recent transactions recorded.</p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {orders.map(order => (
                <div key={order.id || order.uuid} className="flex justify-between items-center text-sm p-3 border border-secondary-100 dark:border-secondary-800 rounded-lg">
                  <div>
                    <span className="font-bold text-secondary-900 dark:text-white">Order {order.order_number}</span>
                    <span className="block text-xxs text-secondary-500 dark:text-secondary-400">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <span className="font-semibold capitalize text-primary-600">{order.status}</span>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default Dashboard;
export { Dashboard };
