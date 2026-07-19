import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import addressService from '../../services/addressService';
import orderService from '../../services/orderService';
import {
  MapPin, CreditCard, Package, ChevronRight, RefreshCw,
  CheckCircle, Plus, AlertCircle, Phone, Building2, Truck, ShoppingBag
} from 'lucide-react';

const STEPS = ['Address', 'Review', 'Payment'];

// ─── Paystack popup initialiser ────────────────────────────────────────────────
const openPaystack = ({ email, amountGHS, reference, onSuccess, onClose }) => {
  if (!window.PaystackPop) {
    alert('Paystack could not be loaded. Please check your internet connection and try again.');
    return;
  }
  const handler = window.PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_REPLACE_WITH_YOUR_KEY',
    email,
    amount: Math.round(amountGHS * 100), // convert GHS to pesewas
    currency: 'GHS',
    ref: reference,
    metadata: { custom_fields: [{ display_name: 'Platform', variable_name: 'platform', value: 'VIOTOR' }] },
    callback: (response) => onSuccess(response),
    onClose,
  });
  handler.openIframe();
};

const Checkout = () => {
  const { cart, cartSubtotal, clearCart } = useCart();
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
    label: '', street: '', city: '', region: '', country: 'Ghana', is_default: false
  });

  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Fees
  const shippingFee = cart.length > 0 ? 30.00 : 0.00;
  const taxRate = 0.05;
  const taxFee = cartSubtotal * taxRate;
  const orderTotal = cartSubtotal + shippingFee + taxFee;

  const fetchAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    try {
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

  useEffect(() => { fetchAddresses(); }, [fetchAddresses]);

  const handleAddAddress = async () => {
    setSubmitting(true);
    try {
      const res = await addressService.createAddress(newAddress);
      await fetchAddresses();
      setSelectedAddressId(String(res.data?.id || res.id));
      setAddingAddress(false);
      setNewAddress({ label: '', street: '', city: '', region: '', country: 'Ghana', is_default: false });
    } catch (e) {
      setErrorMsg(e.response?.data?.message || 'Failed to save address.');
    } finally {
      setSubmitting(false);
    }
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

      if (paymentMethod === 'paystack' && res.data?.payment?.authorization_url) {
        // Redirect flow (fallback)
        window.location.href = res.data.payment.authorization_url;
        return;
      }

      if (paymentMethod === 'paystack' && res.data?.payment?.reference) {
        // Popup flow
        openPaystack({
          email: user.email,
          amountGHS: orderTotal,
          reference: res.data.payment.reference,
          onSuccess: async (response) => {
            try {
              await orderService.verifyPayment(response.reference);
            } catch {}
            clearCart();
            setOrderSuccess(res.data?.order);
          },
          onClose: () => {
            setErrorMsg('Payment window closed. Your order was created — you can pay later from your Orders page.');
            setSubmitting(false);
          },
        });
        return;
      }

      clearCart();
      setOrderSuccess(res.data?.order);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Success Screen ───────────────────────────────────────────────────────────
  if (orderSuccess) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-once">
          <CheckCircle className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-extrabold mb-2">Order Placed! 🎉</h1>
        <p className="text-secondary-500 mb-2">Your order <span className="font-bold text-secondary-800 dark:text-white">#{orderSuccess.order_number}</span> has been confirmed.</p>
        <p className="text-secondary-400 text-sm mb-8">You'll receive a confirmation email shortly.</p>
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
        <p className="text-secondary-500">Add some products before checking out.</p>
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
                    <label key={addr.id} className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedAddressId === String(addr.id)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                        : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-400'
                    }`}>
                      <input type="radio" name="address" value={addr.id}
                        checked={selectedAddressId === String(addr.id)}
                        onChange={() => setSelectedAddressId(String(addr.id))}
                        className="mt-1 accent-primary-500"
                      />
                      <div>
                        <p className="font-semibold text-sm">{addr.label || 'Address'} {addr.is_default && <span className="text-xs bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded ml-1">Default</span>}</p>
                        <p className="text-secondary-500 text-sm mt-0.5">{addr.street}, {addr.city}, {addr.region}, {addr.country}</p>
                      </div>
                    </label>
                  ))}

                  {/* Add new address inline */}
                  {addingAddress ? (
                    <div className="border-2 border-dashed border-primary-300 dark:border-primary-700 rounded-xl p-5 space-y-3">
                      <h3 className="font-semibold text-sm">New Address</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'label', placeholder: 'Label (e.g. Home)', full: true },
                          { key: 'street', placeholder: 'Street address', full: true },
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
                        <button onClick={() => setAddingAddress(false)} className="px-5 py-2 rounded-lg text-sm font-semibold border border-secondary-300 dark:border-secondary-700">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setAddingAddress(true)}
                      className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-secondary-300 dark:border-secondary-700 rounded-xl text-secondary-500 hover:border-primary-400 hover:text-primary-500 transition-all text-sm font-semibold">
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
                      <p className="text-secondary-500 text-xs mt-0.5">Qty: {item.quantity}</p>
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
                  { value: 'paystack', label: 'Card / Paystack', icon: <CreditCard className="w-5 h-5" />, desc: 'Pay securely with debit/credit card' },
                  { value: 'mobile_money', label: 'Mobile Money', icon: <Phone className="w-5 h-5" />, desc: 'MTN, Vodafone, or AirtelTigo' },
                  { value: 'bank_transfer', label: 'Bank Transfer', icon: <Building2 className="w-5 h-5" />, desc: 'Pay via direct bank transfer' },
                ].map(pm => (
                  <label key={pm.value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    paymentMethod === pm.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/20'
                      : 'border-secondary-200 dark:border-secondary-700 hover:border-secondary-400'
                  }`}>
                    <input type="radio" name="payment" value={pm.value}
                      checked={paymentMethod === pm.value}
                      onChange={() => setPaymentMethod(pm.value)}
                      className="accent-primary-500"
                    />
                    <div className={`p-2 rounded-lg ${paymentMethod === pm.value ? 'bg-primary-500 text-white' : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400'}`}>
                      {pm.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{pm.label}</p>
                      <p className="text-secondary-400 text-xs">{pm.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {paymentMethod === 'mobile_money' && (
                <div className="space-y-3 p-4 bg-secondary-50 dark:bg-secondary-800/50 rounded-xl border border-secondary-200 dark:border-secondary-700">
                  <div>
                    <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Mobile Money Provider</label>
                    <select value={provider} onChange={e => setProvider(e.target.value)}
                      className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none">
                      <option value="mtn">MTN Mobile Money</option>
                      <option value="vodafone">Vodafone Cash</option>
                      <option value="tigo">AirtelTigo Money</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary-500 uppercase mb-1.5">Mobile Money Number</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                      placeholder="0XX XXX XXXX"
                      className="w-full p-2.5 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-white dark:bg-secondary-800 text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    />
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
                <div key={item.product_id || item.id} className="flex justify-between text-secondary-600 dark:text-secondary-400">
                  <span className="truncate max-w-[160px]">{item.name} × {item.quantity}</span>
                  <span className="font-medium text-secondary-900 dark:text-white ml-2">GHS {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-secondary-200 dark:border-secondary-800 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-secondary-500">
                <span>Subtotal</span>
                <span>GHS {cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-secondary-500">
                <span>Shipping</span>
                <span>GHS {shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-secondary-500">
                <span>Tax (5%)</span>
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
