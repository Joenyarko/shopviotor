import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const error = searchParams.get('error');
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Authenticating...');

  useEffect(() => {
    if (error) {
      toast.error('Google authentication failed.');
      navigate('/login');
      return;
    }

    if (token) {
      setStatus('Logging you in...');
      loginWithToken(token);
      
      toast.success('Successfully logged in with Google!');
      // Navigate to dashboard after a short delay to allow profile fetch
      setTimeout(() => {
        navigate('/customer/dashboard'); // Ensure correct dashboard route based on user
      }, 1000);
    } else {
      toast.error('No token received from Google.');
      navigate('/login');
    }
  }, [token, error, navigate, loginWithToken]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary-50 dark:bg-secondary-900">
      <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-secondary-800 rounded-2xl shadow-sm border border-secondary-100 dark:border-secondary-700">
        <RefreshCw className="w-8 h-8 text-primary-500 animate-spin" />
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
          {status}
        </h2>
        <p className="text-sm text-secondary-500 dark:text-secondary-400">
          Please wait while we securely log you in.
        </p>
      </div>
    </div>
  );
};

export default GoogleCallback;
