import Swal from 'sweetalert2';

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
export const openPaystack = ({ email, amountGHS, reference, onSuccess, onClose }) => {
  if (!window.PaystackPop) {
    Swal.fire({
      icon: 'error',
      text: 'Paystack could not be loaded. Please check your internet connection and try again.'
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
