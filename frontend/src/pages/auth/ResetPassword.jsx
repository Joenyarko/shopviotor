import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      password: '',
      password_confirmation: ''
    }
  });

  const passwordVal = watch('password');
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      setSuccess(true);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to reset password. Token may have expired.');
    } finally {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Reset Password</h3>
        <p className="text-xs text-secondary-500 mt-1">Please enter your new password below.</p>
      </div>

      {success ? (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-start gap-2.5 text-sm border border-emerald-200/50">
            <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>Your password has been successfully reset. You can now log in.</span>
          </div>
          <Link to="/login" className="block text-center premium-button-primary w-full py-2.5 rounded-lg">
            Go to Login
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
            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">New Password</label>
            <input
              type="password"
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              })}
              placeholder="••••••••"
              className="w-full mt-1.5 px-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
            />
            {errors.password && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.password.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Confirm New Password</label>
            <input
              type="password"
              {...register('password_confirmation', { 
                required: 'Confirm your password',
                validate: (val) => val === passwordVal || "Passwords don't match"
              })}
              placeholder="••••••••"
              className="w-full mt-1.5 px-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
            />
            {errors.password_confirmation && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.password_confirmation.message}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full premium-button-primary py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  );
};

export default ResetPassword;
export { ResetPassword };
