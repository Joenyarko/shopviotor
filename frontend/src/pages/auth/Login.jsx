import React, { useState } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, EyeOff, AlertCircle, RefreshCw } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login, verify2Fa } = useAuth();
  
  const [step, setStep] = useState(1); // 1 = Login, 2 = 2FA
  const [userId, setUserId] = useState(null);
  const [code, setCode] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Support both ?redirect= query param and React Router location state
  const redirectTo = searchParams.get('redirect') || location.state?.from?.pathname || '/dashboard';

  const onSubmit = async (data) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await login(data);
      if (response.requires_2fa) {
        setUserId(response.user_id);
        setStep(2);
        return;
      }
      
      const user = response;
      if (user.role === 'admin' || user.role === 'super_admin') {
        navigate('/admin');
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'These credentials do not match our records.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2Fa = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setErrorMsg('Please enter a valid 6-digit code.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const user = await verify2Fa({ user_id: userId, code });
      if (user.role === 'admin' || user.role === 'super_admin') {
        navigate('/admin');
      } else {
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Invalid verification code.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 2) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Two-Factor Verification</h3>
          <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">We've sent a 6-digit code to your email.</p>
        </div>

        {errorMsg && (
          <div className="p-3 bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 rounded-lg flex items-start gap-2.5 text-sm border border-accent-200/50">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify2Fa} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Verification Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className="w-full mt-1.5 px-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors tracking-widest text-center text-xl font-bold"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-primary-500 hover:bg-primary-600 text-secondary-900 font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Verify & Sign In'}
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full text-sm text-secondary-500 hover:text-secondary-900 dark:hover:text-white transition-colors"
          >
            Back to login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Sign In to Your Account</h3>
        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">Access your deals, barter, and orders.</p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 rounded-lg flex items-start gap-2.5 text-sm border border-accent-200/50">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

        <div>
          <div className="flex justify-between items-center">
            <label className="block text-sm font-semibold text-secondary-700 dark:text-secondary-300">Password</label>
            <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">Forgot password?</Link>
          </div>
          <div className="relative mt-1.5">
            <input
              type={showPassword ? 'text' : 'password'}
              {...register('password', { 
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              })}
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-secondary-300 dark:border-secondary-700 rounded-lg bg-secondary-50 dark:bg-secondary-800 text-secondary-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:outline-none transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-secondary-500 dark:text-secondary-400"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && <span className="text-xs text-accent-600 dark:text-accent-400 mt-1 block">{errors.password.message}</span>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full premium-button-primary py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Sign In'}
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
          Sign in with Google
        </a>
      </form>

      <div className="text-center text-sm text-secondary-500 dark:text-secondary-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-600 font-semibold hover:underline">Create Account</Link>
      </div>
    </div>
  );
};

export default Login;
export { Login };
