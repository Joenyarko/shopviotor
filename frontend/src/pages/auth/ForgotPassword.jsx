import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import authService from '../../services/authService';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const ForgotPassword = () => {
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await authService.login({ email: data.email, action: 'forgot_password' });
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || 'We could not process password reset for this email.');
    } finally {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Recover Password</h3>
        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">We will email you a secure link to reset password.</p>
      </div>

      {success ? (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-start gap-2.5 text-sm border border-emerald-200/50">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>If an account exists, a reset link has been dispatched to your email inbox.</span>
          </div>
          <Link to="/login" className="block text-center premium-button-secondary w-full py-2.5 rounded-lg">
            Back to Login
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 rounded-lg flex items-start gap-2.5 text-sm border border-accent-200/50">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Email Address</label>
            <input
              type="email"
              {...register('email', { 
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address'
                }
              })}
              placeholder="name@domain.com"
              className="w-full mt-1.5 px-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
            />
            {errors.email && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.email.message}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full premium-button-primary py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
          </button>
          
          <div className="text-center text-sm">
            <Link to="/login" className="text-secondary-500 dark:text-secondary-400 hover:underline">Back to Login</Link>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
export { ForgotPassword };
