import Swal from 'sweetalert2';

/**
 * Ensures Paystack Inline V2 script is loaded dynamically on demand.
 * V2 supports resumeTransaction(access_code), which guarantees Paystack uses
 * the exact backend-initialized reference, amount, currency, and subaccount.
 */
const loadPaystackScript = () => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      return resolve(window.PaystackPop);
    }
    const existing = document.querySelector('script[src="https://js.paystack.co/v2/inline.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.PaystackPop));
      existing.addEventListener('error', () => reject(new Error('Failed to load Paystack')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v2/inline.js';
    script.async = true;
    script.onload = () => resolve(window.PaystackPop);
    script.onerror = () => reject(new Error('Failed to load Paystack'));
    document.head.appendChild(script);
  });
};

/**
 * Opens the Paystack Inline V2 checkout popup.
 *
 * @param {Object} options
 * @param {string} options.email - The customer's email
 * @param {number} options.amountGHS - The amount in GHS (converted to pesewas)
 * @param {string} options.reference - Backend payment reference (VTR-...)
 * @param {string} [options.accessCode] - Backend Paystack access_code from /transaction/initialize
 * @param {string} [options.access_code] - Alias for accessCode
 * @param {Function} options.onSuccess - Callback when payment succeeds
 * @param {Function} options.onClose - Callback when customer closes/cancels popup
 */
export const openPaystack = async ({ email, amountGHS, reference, accessCode, access_code, onSuccess, onClose }) => {
  try {
    await loadPaystackScript();
  } catch (err) {
    Swal.fire({
      icon: 'error',
      text: 'Paystack payment gateway could not be loaded. Please check your internet connection and try again.'
    });
    return;
  }

  if (!window.PaystackPop) {
    Swal.fire({
      icon: 'error',
      text: 'Paystack payment gateway is unavailable. Please try again.'
    });
    return;
  }

  const activeAccessCode = accessCode || access_code;
  const paystackKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  if (!activeAccessCode && !paystackKey) {
    Swal.fire({
      icon: 'error',
      title: 'Payment Configuration Error',
      text: 'Paystack public key is not configured. Please use Direct Mobile Money or contact support.'
    });
    return;
  }

  try {
    const popup = new window.PaystackPop();

    // Preferred: resume the exact backend-initialized transaction (preserves VTR-... reference & subaccount split)
    if (activeAccessCode && typeof popup.resumeTransaction === 'function') {
      popup.resumeTransaction(activeAccessCode, {
        onSuccess: (transaction) => {
          if (onSuccess) onSuccess(transaction);
        },
        onCancel: () => {
          if (onClose) onClose();
        },
        onError: (err) => {
          console.error('Paystack transaction error:', err);
          Swal.fire({
            icon: 'error',
            title: 'Payment Error',
            text: err?.message || 'Could not complete Paystack payment. Please try again.'
          });
          if (onClose) onClose();
        },
      });
      return;
    }

    // Fallback when no access_code is provided
    if (typeof popup.newTransaction === 'function') {
      popup.newTransaction({
        key: paystackKey,
        email,
        amount: Math.round(amountGHS * 100),
        currency: 'GHS',
        reference,
        metadata: {
          custom_fields: [
            { display_name: 'Platform', variable_name: 'platform', value: 'VIOTOR' }
          ]
        },
        onSuccess: (transaction) => {
          if (onSuccess) onSuccess(transaction);
        },
        onCancel: () => {
          if (onClose) onClose();
        },
      });
      return;
    }

    // Legacy V1 fallback if needed
    const handler = window.PaystackPop.setup({
      key: paystackKey,
      email,
      amount: Math.round(amountGHS * 100),
      currency: 'GHS',
      ref: reference,
      callback: (response) => onSuccess && onSuccess(response),
      onClose: () => onClose && onClose(),
    });
    handler.openIframe();
  } catch (e) {
    console.error('Failed to open Paystack popup:', e);
    Swal.fire({
      icon: 'error',
      title: 'Payment Gateway Error',
      text: 'Could not initialize payment with Paystack. Please try paying via Mobile Money or contact support.'
    });
  }
};
