import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import paymentService from '../../services/paymentService';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';

const PaymentCallback = () => {
  const { gateway } = useParams();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, failed
  const [errorMsg, setErrorMsg] = useState('');

  const reference = searchParams.get('reference') || searchParams.get('trxref');

  useEffect(() => {
    const verify = async () => {
      if (!reference) {
        setStatus('failed');
        setErrorMsg('Payment reference is missing.');
        return;
      }

      try {
        const response = await paymentService.verifyPayment(reference);
        if (response.data?.status === 'completed' || response.status === 'completed' || response.data?.status === 'success') {
          setStatus('success');
        } else {
          setStatus('failed');
          setErrorMsg('Payment verification returned incomplete status.');
        }
      } catch (e) {
        console.error(e);
        // Fallback check: if paystack mock environment returns errors but reference exists, 
        // we can allow simulated success for demonstration, or show clean error
        setStatus('failed');
        setErrorMsg(e.message || 'Failed to verify transaction with bank gateway.');
      }
    };

    verify();
  }, [reference, gateway]);

  return (
    <div className="max-w-md mx-auto text-center py-20 dark:text-white space-y-6">
      
      {status === 'verifying' && (
        <div className="space-y-4">
          <RefreshCw className="w-16 h-16 text-primary-500 mx-auto animate-spin" />
          <h2 className="text-xl font-bold">Verifying Payment...</h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">Communicating with {gateway} payment gateway.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-4">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
          <h2 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Payment Successful!</h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">Thank you for your trade. Your order is confirmed.</p>
          <div className="pt-4 flex gap-4 justify-center">
            <Link to="/orders" className="premium-button-primary px-6 rounded-lg text-sm">View My Orders</Link>
            <Link to="/" className="premium-button-secondary px-6 rounded-lg text-sm">Return Home</Link>
          </div>
        </div>
      )}

      {status === 'failed' && (
        <div className="space-y-4">
          <XCircle className="w-16 h-16 text-accent-500 mx-auto" />
          <h2 className="text-2xl font-bold text-accent-600 dark:text-accent-400">Payment Verification Failed</h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">{errorMsg}</p>
          <div className="pt-4 flex gap-4 justify-center">
            <Link to="/checkout" className="premium-button-primary px-6 rounded-lg text-sm">Retry Checkout</Link>
            <Link to="/" className="premium-button-secondary px-6 rounded-lg text-sm">Return Home</Link>
          </div>
        </div>
      )}

    </div>
  );
};

export default PaymentCallback;
export { PaymentCallback };
