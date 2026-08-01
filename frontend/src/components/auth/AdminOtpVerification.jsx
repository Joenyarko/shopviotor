import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, RefreshCw, Mail, ArrowRight } from 'lucide-react';
import apiClient from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';

const AdminOtpVerification = ({ onVerified }) => {
  const { user } = useAuth();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sentMessage, setSentMessage] = useState('');
  const [timer, setTimer] = useState(60);

  const sendOtp = async () => {
    setSending(true);
    setError('');
    try {
      const res = await apiClient.post('/admin/otp/send');
      setSentMessage(res.data?.message || 'Verification code sent to your email.');
      setTimer(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
    sendOtp();
  }, []);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`admin-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`admin-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await apiClient.post('/admin/otp/verify', { code: fullCode });
      sessionStorage.setItem('admin_2fa_verified', 'true');
      if (onVerified) onVerified();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-secondary-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
        <div className="w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="text-center space-y-2 mb-6">
          <h2 className="text-2xl font-extrabold text-secondary-900 dark:text-white">Admin Verification</h2>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            For security, please enter the 6-digit verification code sent to <strong className="text-secondary-900 dark:text-white">{user?.email}</strong>.
          </p>
        </div>

        {sentMessage && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4 shrink-0" />
            <span>{sentMessage}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-accent-50 dark:bg-accent-950/30 border border-accent-200 dark:border-accent-800 text-accent-700 dark:text-accent-400 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-2">
            {code.map((digit, idx) => (
              <input
                key={idx}
                id={`admin-otp-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className="w-11 h-12 text-center text-xl font-bold rounded-xl border border-secondary-300 dark:border-secondary-700 bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading || code.join('').length !== 6}
            className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-secondary-900 font-extrabold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <>Verify & Access Admin <ArrowRight className="w-4 h-4" /></>}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={sendOtp}
            disabled={sending || timer > 0}
            className="text-xs font-semibold text-secondary-500 hover:text-primary-500 dark:text-secondary-400 disabled:opacity-50 transition-colors"
          >
            {sending ? 'Sending...' : timer > 0 ? `Resend code in ${timer}s` : "Didn't receive code? Resend"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOtpVerification;
