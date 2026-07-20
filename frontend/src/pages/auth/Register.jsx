import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, RefreshCw } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const { register: signup } = useAuth();
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

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
      await signup(data);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-secondary-900 dark:text-white">Create a New Account</h3>
        <p className="text-xs text-secondary-500 dark:text-secondary-400 mt-1">Start selling, trading, and buying today.</p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-accent-50 dark:bg-accent-950/20 text-accent-600 dark:text-accent-400 rounded-lg flex items-start gap-2.5 text-sm border border-accent-200/50">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

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
      </form>

      <div className="text-center text-sm text-secondary-500 dark:text-secondary-400">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign In</Link>
      </div>
    </div>
  );
};

export default Register;
export { Register };
