import Swal from 'sweetalert2';
import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import addressService from '../../services/addressService';
import orderService from '../../services/orderService';
import apiClient from '../../api/client';
import {
  MapPin, CreditCard, Package, ChevronRight, RefreshCw,
  CheckCircle, Plus, AlertCircle, Phone, Building2, Truck, ShoppingBag, Trash2, Copy, Check, Lock
} from 'lucide-react';
import { openPaystack } from '../../utils/paystack';

const STEPS = ['Address', 'Review', 'Payment'];


const Checkout = () => {
  const { cart, cartSubtotal, clearCart, removeFromCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0); // 0=Address, 1=Review, 2=Payment
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('paystack');
  const [phone, setPhone] = useState('');
  const [provider, setProvider] = useState('mtn');
  const [addingAddress, setAddingAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    label: '', full_name: user?.first_name ? `${user.first_name} ${user.last_name}` : '', phone: user?.phone || '', address_line_1: '', city: '', region: '', country: 'Ghana', is_default: false
  });

  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [copiedNum, setCopiedNum] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  
  const [taxRate, setTaxRate] = useState(0.05); // Default 5% until fetched
  const [defaultShipping, setDefaultShipping] = useState(30.00);
  const [recipientInfo, setRecipientInfo] = useState(null);

  // Detect if any cart items belong to a vendor store
  const vendorStore = cart.find(item => item.store && (item.store.momo_number || item.store.name))?.store || null;
  const momoRecipient = vendorStore ? {
    isVendor: true,
    storeName: vendorStore.name || 'Vendor Store',
    accountName: vendorStore.momo_account_name || vendorStore.name,
    number: vendorStore.momo_number || vendorStore.phone || '715041',
    network: vendorStore.momo_network || 'MTN / Telecel / AT',
    whatsapp: vendorStore.whatsapp || vendorStore.phone || vendorStore.momo_number || '0508208803',
  } : {
    isVendor: false,
    storeName: 'Shop Viotor Ventures',
    accountName: 'Shop Viotor Ventures',
    number: '715041',
    network: 'MoMo Merchant ID',
    whatsapp: '0508208803',
  };

  // Fees (default missing shipping_type to 'default' to match backend OrderService)
  const shippingFee = cart.reduce((total, item) => {
    const p = item.product || item;
    const shipType = p.shipping_type || 'default';
    if (shipType === 'free') return total;
    if (shipType === 'custom') return total + (parseFloat(p.custom_shipping_fee || 0) * item.quantity);
    if (shipType === 'default') return total + (defaultShipping * item.quantity);
    return total;
  }, 0);
  
  const taxFee = cartSubtotal * taxRate;
  const orderTotal = cartSubtotal + shippingFee + taxFee;

  const fetchCheckoutData = useCallback(async () => {
    setLoadingAddresses(true);
    try {
      // Fetch public settings for tax/shipping
      apiClient.get('/settings/public').then(res => {
        const data = res?.data || res;
        setTaxRate((parseFloat(data.tax_rate) || 0) / 100);
        setDefaultShipping(data.default_shipping_fee !== undefined ? parseFloat(data.default_shipping_fee) : 30.00);
      }).catch(console.error);

      // Fetch addresses
      const res = await addressService.getAddresses();
      const data = res.data || res;
      setAddresses(Array.isArray(data) ? data : data.data || []);
      const def = data.find?.(a => a.is_default) || data?.[0];
      if (def) setSelectedAddressId(String(def.id));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  useEffect(() => { fetchCheckoutData(); }, [fetchCheckoutData]);

  const [editingAddressId, setEditingAddressId] = useState(null);

  const handleAddAddress = async () => {
    if (!newAddress.address_line_1.trim() || !newAddress.city.trim() || !newAddress.region.trim() || !newAddress.phone.trim() || !newAddress.full_name.trim()) {
      setErrorMsg('Please fill in all mandatory address fields (Name, Phone, Address, City, Region).');
      return;
    }
    
    setSubmitting(true);
    setErrorMsg('');
    try {
      let res;
      if (editingAddressId) {
        res = await addressService.updateAddress(editingAddressId, newAddress);
      } else {
        res = await addressService.createAddress(newAddress);
      }
      await fetchCheckoutData();
      setSelectedAddressId(String(editingAddressId || res.data?.id || res.id));
      setAddingAddress(false);
      setEditingAddressId(null);
      setNewAddress({ label: '', full_name: user?.first_name ? `${user.first_name} ${user.last_name}` : '', phone: user?.phone || '', address_line_1: '', city: '', region: '', country: 'Ghana', is_default: false });
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Failed to save address.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    const __confirmResult = await Swal.fire({ title: 'Delete Address?', text: 'Are you sure you want to delete this address?', icon: 'warning', showCancelButton: true });
    if (!__confirmResult.isConfirmed) return;
    try {
      await addressService.deleteAddress(id);
      await fetchCheckoutData();
      if (selectedAddressId === String(id)) setSelectedAddressId('');
      Swal.fire({ icon: 'success', title: 'Deleted!', text: 'Address removed.', toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 });
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to delete address.', toast: true, position: 'top-end', showConfirmButton: false, timer: 2500 });
    }
  };

  const startEditAddress = (e, addr) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingAddressId(addr.id);
    setNewAddress({
      label: addr.label || '',
      full_name: addr.full_name || '',
      phone: addr.phone || '',
      address_line_1: addr.address_line_1 || '',
      city: addr.city || '',
      region: addr.region || '',
      country: addr.country || 'Ghana',
      is_default: addr.is_default || false
    });
    setAddingAddress(true);
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) { setErrorMsg('Please select a shipping address.'); return; }
    setSubmitting(true);
    setErrorMsg('');

    const idempotencyKey = `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    try {
      const items = cart.map(item => ({ product_id: item.product_id || item.id, quantity: item.quantity }));
      const payload = {
        items,
        address_id: selectedAddressId,
        payment_method: paymentMethod,
        shipping_amount: shippingFee,
        tax_amount: taxFee,
        ...(paymentMethod === 'mobile_money' ? { payment_phone: phone, payment_provider: provider } : {}),
      };

      const res = await orderService.checkout(payload, idempotencyKey);

      if (paymentMethod === 'paystack' && res?.payment?.reference) {
        const serverTotal = parseFloat(res?.order?.total || res?.data?.order?.total || res?.data?.total || orderTotal);
        // Popup flow
        openPaystack({
          email: user.email,
          amountGHS: serverTotal,
          reference: res.payment.reference,
          access_code: res.payment.access_code || res.payment.data?.access_code,
          onSuccess: async (response) => {
            try {
              await orderService.verifyPayment(response.reference);
            } catch {}
            clearCart();
            setOrderSuccess(res.order || res.data?.order);
          },
          onClose: () => {
            setErrorMsg('Payment window closed. Your order was created — you can pay later from your Orders page or transfer via MoMo to Merchant ID 715041 (Shop Viotor Ventures).');
            setSubmitting(false);
          },
        });
        return;
      }

      if (paymentMethod === 'paystack' && res?.payment?.authorization_url) {
        // Redirect flow (fallback)
        window.location.href = res.payment.authorization_url;
        return;
      }

      setRecipientInfo(momoRecipient);
      clearCart();
      setOrderSuccess(res?.order || res.data?.order);
    } catch (err) {
      const data = err.response?.data;
      const firstError = data?.errors ? Object.values(data.errors)[0][0] : null;
      setErrorMsg(firstError || data?.message || err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Success Screen ───────────────────────────────────────────────────────────
  if (orderSuccess) {
    const activeMomo = recipientInfo || momoRecipient;
    const cleanPhone = (activeMomo.whatsapp || activeMomo.number || '0508208803').replace(/\D/g, '');
    const waTarget = cleanPhone.startsWith('0') ? '233' + cleanPhone.slice(1) : (cleanPhone.startsWith('233') ? cleanPhone : '233' + cleanPhone);

    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-once">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Order Placed! 🎉</h1>
        <p className="text-secondary-500 dark:text-secondary-400 mb-2">Your order <span className="font-bold text-secondary-800 dark:text-white">#{orderSuccess.order_number}</span> has been created.</p>
        
        {paymentMethod === 'mobile_money' && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 p-5 rounded-2xl text-left text-xs space-y-3 mb-6 mt-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-sm">
                <Phone className="w-4 h-4 text-emerald-600" /> Send Mobile Money (MoMo) Payment
              </p>
              <span className="text-xxs font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                Awaiting Transfer
              </span>
            </div>

            {activeMomo.isVendor && (
              <div className="px-3 py-1.5 rounded-lg bg-amber-100/70 dark:bg-amber-950/40 border border-amber-300/50 dark:border-amber-800/40 text-[11px] font-bold text-amber-900 dark:text-amber-300">
                Vendor Store Order: {activeMomo.storeName}
              </div>
            )}

            <p className="text-secondary-600 dark:text-secondary-300 leading-relaxed">
              Please transfer <strong className="text-secondary-900 dark:text-white">GHS {parseFloat(orderSuccess.total || orderTotal).toFixed(2)}</strong> to {activeMomo.isVendor ? activeMomo.storeName : 'Shop Viotor'} using your Order Reference below:
            </p>

            <div className="bg-white dark:bg-secondary-900 p-4 rounded-xl border border-emerald-200/70 dark:border-emerald-800/40 space-y-2.5">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-secondary-500 block text-xxs font-bold uppercase">MoMo Number:</span>
                  <span className="font-mono font-black text-primary-600 dark:text-primary-400 text-base">{activeMomo.number}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(activeMomo.number);
                    setCopiedNum(true);
                    setTimeout(() => setCopiedNum(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xxs font-bold bg-secondary-100 dark:bg-secondary-800 text-secondary-800 dark:text-white flex items-center gap-1 hover:bg-secondary-200"
                >
                  {copiedNum ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  {copiedNum ? 'Copied' : 'Copy'}
                </button>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-secondary-100 dark:border-secondary-800">
                <span className="text-secondary-500 text-xxs font-bold uppercase">Account Name:</span>
                <span className="font-bold text-secondary-900 dark:text-white">{activeMomo.accountName}</span>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-secondary-100 dark:border-secondary-800">
                <span className="text-secondary-500 text-xxs font-bold uppercase">Network:</span>
                <span className="font-semibold text-secondary-800 dark:text-secondary-200">{activeMomo.network}</span>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-secondary-100 dark:border-secondary-800">
                <div>
                  <span className="text-secondary-500 block text-xxs font-bold uppercase">Payment Reference:</span>
                  <span className="font-mono font-extrabold text-amber-600 dark:text-amber-400 text-sm">{orderSuccess.order_number}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(orderSuccess.order_number);
                    setCopiedRef(true);
                    setTimeout(() => setCopiedRef(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xxs font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 flex items-center gap-1 hover:bg-amber-200"
                >
                  {copiedRef ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  {copiedRef ? 'Copied' : 'Copy Ref'}
                </button>
              </div>
            </div>

            <div className="pt-1">
              <a
                href={`https://wa.me/${waTarget}?text=${encodeURIComponent(`Hello ${activeMomo.storeName}, I have placed Order #${orderSuccess.order_number} for GHS ${parseFloat(orderSuccess.total || orderTotal).toFixed(2)} and will send payment to ${activeMomo.number}. Please confirm receipt.`)}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                Notify {activeMomo.isVendor ? activeMomo.storeName : ''} on WhatsApp ({activeMomo.whatsapp || activeMomo.number})
              </a>
            </div>
          </div>
        )}

        <p className="text-secondary-400 text-sm mb-8">You can track your order status anytime from your Orders page.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/orders" className="premium-button-primary px-8 py-3 rounded-xl font-bold">Track My Order</Link>
          <Link to="/products" className="px-8 py-3 rounded-xl font-bold border border-secondary-300 dark:border-secondary-700 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  // ─── Empty cart ───────────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 dark:text-white space-y-4">
        <ShoppingBag className="w-16 h-16 mx-auto text-secondary-300" />
        <h2 className="text-2xl font-bold">Your Cart is Empty</h2>
        <p className="text-secondary-500 dark:text-secondary-400">Add some products before checking out.</p>
        <Link to="/products" className="inline-block premium-button-primary px-8 py-3 rounded-xl font-bold">Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* ─── Stepper ─── */}
      <div className="flex items-center justify-center mb-10">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                i === step ? 'text-primary-600 dark:text-primary-400' :
                i < step ? 'text-emerald-600 dark:text-emerald-400 cursor-pointer' :
                'text-secondary-400 cursor-not-allowed'
              }`}
            >
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                i === step ? 'bg-primary-500 border-primary-500 text-white' :
                i < step ? 'bg-emerald-500 border-emerald-500 text-white' :
                'border-secondary-300 dark:border-secondary-700 text-secondary-400'
              }`}>
                {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
              </span>
              <span className="hidden sm:block">{label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight className="w-4 h-4 mx-3 text-secondary-300 dark:text-secondary-700" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* ─── Left: Step Content ─── */}
        <div className="lg:w-2/3 space-y-4">

          {/* Error Message */}
          {errorMsg && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{errorMsg}</p>
            </div>
          )}

          {/* ─── Step 0: Address ─── */}
          {step === 0 && (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><MapPin className="w-5 h-5 text-primary-500" /> Shipping Address</h2>

              {loadingAddresses ? (
                <div className="flex justify-center py-8"><RefreshCw className="w-6 h-6 animate-spin text-primary-500" /></div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(addr => (
                    <label key={addr.id} className={`flex items-start justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAddressId === String(addr.id)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                        : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-400'
                    }`}>
                      <div className="flex items-start gap-3">
                        <input type="radio" name="address" value={addr.id}
                          checked={selectedAddressId === String(addr.id)}
                          onChange={() => setSelectedAddressId(String(addr.id))}
                          className="mt-1 accent-primary-500"
                        />
                        <div>
                          <p className="font-semibold text-sm">{addr.label || 'Address'} {addr.is_default && <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded ml-1">Default</span>}</p>
                          <p className="text-secondary-500 dark:text-secondary-400 text-sm mt-0.5">{addr.address_line_1}, {addr.city}, {addr.region}, {addr.country}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button" 
                          onClick={(e) => startEditAddress(e, addr)}
                          className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline px-2 py-1"
                        >
                          Edit
                        </button>
                        <button 
                          type="button" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteAddress(addr.id);
                          }}
                          className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline px-2 py-1"
                        >
                          Delete
                        </button>
                      </div>
                    </label>
                  ))}

                  {/* Add new address inline */}
                  {addingAddress ? (
                    <div className="border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-xl p-5 space-y-3">
                      <h3 className="font-semibold text-sm">{editingAddressId ? 'Edit Address' : 'New Address'}</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'label', placeholder: 'Label (e.g. Home)', full: true },
                          { key: 'full_name', placeholder: 'Full Name', full: true },
                          { key: 'phone', placeholder: 'Phone Number', full: true },
                          { key: 'address_line_1', placeholder: 'Street address', full: true },
                          { key: 'city', placeholder: 'City' },
                          { key: 'region', placeholder: 'Region' },
                        ].map(f => (
                          <input key={f.key} type="text"
                            className={`${f.full ? 'col-span-2' : ''} p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg text-sm bg-secondary-50 dark:bg-secondary-800 focus:ring-2 focus:ring-primary-500 focus:outline-none`}
                            placeholder={f.placeholder}
                            value={newAddress[f.key]}
                            onChange={e => setNewAddress(p => ({ ...p, [f.key]: e.target.value }))}
                          />
                        ))}
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={handleAddAddress} disabled={submitting}
                          className="premium-button-primary px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5">
                          {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Save Address'}
                        </button>
                        <button onClick={() => { setAddingAddress(false); setEditingAddressId(null); setNewAddress({ label: '', full_name: user?.first_name ? `${user.first_name} ${user.last_name}` : '', phone: user?.phone || '', address_line_1: '', city: '', region: '', country: 'Ghana', is_default: false }); }} className="px-5 py-2 rounded-lg text-sm font-semibold border border-secondary-300 dark:border-secondary-700">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setAddingAddress(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-secondary-300 dark:border-secondary-700 rounded-xl text-secondary-500 dark:text-secondary-400 hover:border-primary-400 hover:text-primary-500 transition-all text-sm font-semibold">
                      <Plus className="w-4 h-4" /> Add New Address
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={() => { if (!selectedAddressId) { setErrorMsg('Select an address first.'); return; } setErrorMsg(''); setStep(1); }}
                className="w-full premium-button-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 mt-4"
              >
                Continue to Review <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* ─── Step 1: Review ─── */}
          {step === 1 && (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><Package className="w-5 h-5 text-primary-500" /> Review Your Order</h2>
              <div className="divide-y divide-secondary-100 dark:divide-secondary-800">
                {cart.map(item => (
                  <div key={item.product_id || item.id} className="flex items-center gap-4 py-4">
                    <img src={item.primary_image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop'}
                      alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-secondary-100"
                      onError={e => e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=120&auto=format&fit=crop'} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                      <p className="text-secondary-500 dark:text-secondary-400 text-xs mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-bold text-sm">GHS {(item.price * item.quantity).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(0)} className="flex-1 py-3.5 rounded-xl font-bold border border-secondary-300 dark:border-secondary-700 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors">Back</button>
                <button onClick={() => { setErrorMsg(''); setStep(2); }} className="flex-1 premium-button-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2">
                  Continue to Payment <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          {/* ─── Step 2: Payment ─── */}
          {step === 2 && (
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-lg font-bold flex items-center gap-2"><CreditCard className="w-5 h-5 text-primary-500" /> Payment Method</h2>

              <div className="space-y-3">
                {[
                  { value: 'paystack', label: 'Paystack (Online Card & Mobile Money)', icon: <CreditCard className="w-5 h-5" />, desc: 'Pay securely in full with Visa, Mastercard, or Mobile Money via Paystack', disabled: false },
                  { value: 'mobile_money', label: momoRecipient.isVendor ? `Direct Mobile Money (${momoRecipient.storeName})` : 'Direct Mobile Money (Merchant ID 715041)', icon: <Phone className="w-5 h-5" />, desc: momoRecipient.isVendor ? `Pay directly to ${momoRecipient.storeName}'s Mobile Money number` : 'Direct transfer to Merchant ID 715041 (Shop Viotor Ventures)', disabled: false },
                ].map(pm => (
                  <div
                    key={pm.value}
                    onClick={() => {
                      if (!pm.disabled) setPaymentMethod(pm.value);
                    }}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                      pm.disabled
                        ? 'opacity-60 bg-secondary-50 dark:bg-secondary-800/40 border-secondary-200 dark:border-secondary-800 cursor-not-allowed select-none'
                        : paymentMethod === pm.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20 cursor-pointer'
                          : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-400 cursor-pointer'
                    }`}
                  >
                    <input type="radio" name="payment" value={pm.value}
                      disabled={pm.disabled}
                      checked={paymentMethod === pm.value}
                      onChange={() => !pm.disabled && setPaymentMethod(pm.value)}
                      className="accent-primary-500 disabled:opacity-40"
                    />
                    <div className={`p-2 rounded-lg ${pm.disabled ? 'bg-secondary-200 dark:bg-secondary-700 text-secondary-500' : paymentMethod === pm.value ? 'bg-primary-500 text-white' : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400'}`}>
                      {pm.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-semibold text-sm ${pm.disabled ? 'text-secondary-500 dark:text-secondary-400' : ''}`}>{pm.label}</p>
                        {pm.disabled && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Offline
                          </span>
                        )}
                      </div>
                      <p className="text-secondary-400 text-xs">{pm.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {paymentMethod === 'mobile_money' && (
                <div className="space-y-3.5 p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>Direct Mobile Money (MoMo) Details</span>
                    </div>
                    {momoRecipient.isVendor && (
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                        Vendor: {momoRecipient.storeName}
                      </span>
                    )}
                  </div>

                  <div className="bg-white dark:bg-secondary-900 p-3.5 rounded-xl border border-emerald-200/70 dark:border-emerald-800/40 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-secondary-500">{momoRecipient.isVendor ? 'Account Name:' : 'Merchant Name:'}</span>
                      <span className="font-bold text-secondary-900 dark:text-white">{momoRecipient.accountName}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-secondary-500">{momoRecipient.isVendor ? 'MoMo Number:' : 'Merchant ID:'}</span>
                      <span className="font-black text-sm text-primary-600 dark:text-primary-400 tracking-wider">{momoRecipient.number}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-secondary-500">Network:</span>
                      <span className="font-semibold text-secondary-800 dark:text-secondary-200">{momoRecipient.network}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-secondary-500">Payment Reference:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-[11px]">
                        Generated when you click "Place Order" below
                      </span>
                    </div>
                  </div>

                  {/* Step by step guide */}
                  <div className="p-3 bg-white/70 dark:bg-secondary-900/60 rounded-xl border border-emerald-200/50 dark:border-emerald-800/30 space-y-1.5 text-xs text-secondary-700 dark:text-secondary-300">
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">1</span>
                      <span>Click <strong>Place Order</strong> below to generate your unique Order Number.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">2</span>
                      <span>Transfer <strong>GHS {orderTotal.toFixed(2)}</strong> to <strong>{momoRecipient.number}</strong> ({momoRecipient.accountName}) using that Order Number as the MoMo reference.</span>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'bank_transfer' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl text-sm space-y-1">
                  <p className="font-bold text-blue-800 dark:text-blue-300">Bank Transfer Details</p>
                  <p className="text-blue-700 dark:text-blue-400">Bank: <span className="font-semibold">GCB Bank Ghana</span></p>
                  <p className="text-blue-700 dark:text-blue-400">Account: <span className="font-semibold">1234567890</span></p>
                  <p className="text-blue-700 dark:text-blue-400">Name: <span className="font-semibold">VIOTOR MARKETPLACE LTD</span></p>
                  <p className="text-xs text-blue-500 mt-2">Use your order number as reference. Order will be confirmed after payment verification.</p>
                </div>
              )}

              <div className="p-3 bg-secondary-50 dark:bg-secondary-800/60 border border-secondary-200 dark:border-secondary-700/60 rounded-xl text-xs text-secondary-600 dark:text-secondary-400 text-center">
                By placing your order, you agree to ShopViotor&apos;s{' '}
                <Link to="/terms" target="_blank" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" target="_blank" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
                  Privacy Policy
                </Link>.
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-xl font-bold border border-secondary-300 dark:border-secondary-700 text-secondary-700 dark:text-secondary-200 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors">Back</button>
                <button onClick={handlePlaceOrder} disabled={submitting}
                  className="flex-1 premium-button-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2">
                  {submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <><Truck className="w-5 h-5" /> Place Order — GHS {orderTotal.toFixed(2)}</>}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Right: Order Summary (Sticky) ─── */}
        <div className="lg:w-1/3">
          <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-6 sticky top-24 shadow-sm">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              {cart.map(item => (
                <div key={item.product_id || item.id} className="flex justify-between items-center text-secondary-600 dark:text-secondary-400">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => removeFromCart(item.product_id || item.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="truncate max-w-[140px]">{item.name} × {item.quantity}</span>
                  </div>
                  <span className="font-medium text-secondary-900 dark:text-white ml-2">GHS {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-secondary-200 dark:border-secondary-800 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-secondary-500 dark:text-secondary-400">
                <span>Subtotal</span>
                <span>GHS {cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-secondary-500 dark:text-secondary-400">
                <span>Shipping</span>
                <span>GHS {shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-secondary-500 dark:text-secondary-400">
                <span>Tax ({taxRate * 100}%)</span>
                <span>GHS {taxFee.toFixed(2)}</span>
              </div>
            </div>
            <div className="border-t border-secondary-200 dark:border-secondary-800 mt-4 pt-4 flex justify-between font-extrabold text-lg">
              <span>Total</span>
              <span className="text-primary-600 dark:text-primary-400">GHS {orderTotal.toFixed(2)}</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-secondary-400">
              <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              Secure 256-bit SSL encrypted checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
