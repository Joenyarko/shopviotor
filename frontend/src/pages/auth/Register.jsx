import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, RefreshCw } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register: signup, verifyRegistration } = useAuth();
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: ''
    }
  });

  const passwordVal = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await signup(data);
      if (res && res.requires_verification) {
        setRegisteredEmail(data.email);
        setSuccessMsg(res.message || 'Please check your email for the verification code.');
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyOtp = async (e) => {
    e.preventDefault();
    const otp = e.target.otp.value;
    if (!otp || otp.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit code.');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    try {
      await verifyRegistration({ email: registeredEmail, otp });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Verification failed. Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-secondary-900 dark:text-white">
          {step === 1 ? 'Create a New Account' : 'Verify Your Email'}
        </h3>
        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">
          {step === 1 ? 'Start selling, trading, and buying today.' : `We sent a code to ${registeredEmail}`}
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 rounded-lg flex items-start gap-2.5 text-sm border border-accent-200/50">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && step === 2 && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-start gap-2.5 text-sm border border-emerald-200/50">
          <span>{successMsg}</span>
        </div>
      )}

      {step === 1 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">First Name</label>
              <input
                type="text"
                {...register('first_name', { required: 'First name is required' })}
                placeholder="John"
                className="w-full mt-1.5 px-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
              />
              {errors.first_name && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.first_name.message}</span>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Last Name</label>
              <input
                type="text"
                {...register('last_name', { required: 'Last name is required' })}
                placeholder="Doe"
                className="w-full mt-1.5 px-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
              />
              {errors.last_name && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.last_name.message}</span>}
            </div>
          </div>

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
              placeholder="john@example.com"
              className="w-full mt-1.5 px-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
            />
            {errors.email && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.email.message}</span>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Phone (optional)</label>
            <input
              type="text"
              {...register('phone')}
              placeholder="+233240000000"
              className="w-full mt-1.5 px-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Password</label>
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
            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Confirm Password</label>
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
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Register'}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-secondary-300 dark:border-secondary-700"></div>
            <span className="flex-shrink-0 mx-4 text-secondary-500 dark:text-secondary-400 text-xs font-semibold">OR</span>
            <div className="flex-grow border-t border-secondary-300 dark:border-secondary-700"></div>
          </div>

          <a
            href={`${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/auth/google`}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg font-semibold border border-secondary-300 dark:border-secondary-700 bg-white dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-700 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </a>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={onVerifyOtp} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300 text-center mb-4">
              Enter 6-digit Code
            </label>
            <input
              type="text"
              name="otp"
              maxLength={6}
              placeholder="123456"
              className="w-full text-center text-3xl tracking-[0.5em] mt-1.5 px-4 py-3 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors uppercase font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full premium-button-primary py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Verify & Create Account'}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full py-2 text-sm text-secondary-500 hover:text-secondary-700 dark:hover:text-secondary-300 font-medium"
          >
            &larr; Back to registration
          </button>
        </form>
      )}

      {step === 1 && (
        <div className="text-center text-sm text-secondary-500 dark:text-secondary-400">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign In</Link>
        </div>
      )}
    </div>
  );
};

export default Register;
export { Register };
