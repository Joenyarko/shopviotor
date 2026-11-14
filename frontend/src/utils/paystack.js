import Swal from 'sweetalert2';

/**
 * Ensures Paystack inline script is loaded dynamically on demand.
 */
const loadPaystackScript = () => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      return resolve(window.PaystackPop);
    }
    const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.PaystackPop));
      existing.addEventListener('error', () => reject(new Error('Failed to load Paystack')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(window.PaystackPop);
    script.onerror = () => reject(new Error('Failed to load Paystack'));
    document.head.appendChild(script);
  });
};

/**
 * Initializes the Paystack inline popup.
 *
 * @param {Object} options
 * @param {string} options.email - The customer's email
 * @param {number} options.amountGHS - The amount in GHS (will be converted to pesewas)
 * @param {string} options.reference - The transaction reference from the backend
 * @param {Function} options.onSuccess - Callback for successful payment
 * @param {Function} options.onClose - Callback for when the user closes the popup
 */
export const openPaystack = async ({ email, amountGHS, reference, onSuccess, onClose }) => {
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
  
  const handler = window.PaystackPop.setup({
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || 'pk_test_REPLACE_WITH_YOUR_KEY',
    email,
    amount: Math.round(amountGHS * 100), // convert GHS to pesewas
    currency: 'GHS',
    ref: reference,
    metadata: {
      custom_fields: [
        { display_name: 'Platform', variable_name: 'platform', value: 'VIOTOR' }
      ]
    },
    callback: (response) => {
      if (onSuccess) onSuccess(response);
    },
    onClose: () => {
      if (onClose) onClose();
    },
  });
  
  handler.openIframe();
};
